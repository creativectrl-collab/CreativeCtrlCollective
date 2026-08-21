import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { campaignId } = await req.json()
    if (!campaignId) {
      return new Response(
        JSON.stringify({ error: 'Missing campaignId in request body.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase with Service Role key to bypass RLS for campaigns/recipients processing
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch Campaign Details
    const { data: campaign, error: campaignError } = await supabase
      .from('email_campaigns')
      .select('*')
      .eq('id', campaignId)
      .single()

    if (campaignError || !campaign) {
      return new Response(
        JSON.stringify({ error: `Campaign not found: ${campaignError?.message || 'Unknown'}` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 2. Fetch CASL-compliant recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('community_members')
      .select('email, full_name, unsubscribe_token')
      .eq('casl_consent_given', true)
      .eq('is_unsubscribed', false)

    if (recipientsError) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch recipients: ${recipientsError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!recipients || recipients.length === 0) {
      // Update campaign status if no recipients
      await supabase
        .from('email_campaigns')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          recipients_count: 0
        })
        .eq('id', campaignId)

      return new Response(
        JSON.stringify({ message: 'No CASL-compliant recipients found. Campaign marked sent.', recipientsCount: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 3. Dispatch emails in batches of 100 via Resend API
    const batchSize = 100
    let totalSent = 0

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      const emailBatchPayload = batch.map(member => {
        // Construct unique unsubscribe link
        const unsubUrl = `https://www.creativectrlcollective.org/unsubscribe?token=${member.unsubscribe_token}`
        
        // Append physical address and unsubscribe footer for CASL compliance
        const footerHtml = `
          <hr style="border:none;border-top:1px solid #eaeaea;margin:24px 0;" />
          <p style="font-size:12px;color:#666666;line-height:16px;font-family:sans-serif;">
            This email was sent to ${member.full_name || member.email} by Creative CTRL Collective.<br />
            <strong>Creative CTRL Collective</strong> · Toronto, ON, Canada<br />
            To stop receiving these emails, you can <a href="${unsubUrl}" style="color:#0070f3;text-decoration:underline;">unsubscribe</a> at any time.
          </p>
        `
        const fullBodyHtml = `${campaign.body_html || ''}${footerHtml}`

        return {
          from: 'Creative CTRL Collective <updates@creativectrlcollective.org>',
          to: [member.email],
          subject: campaign.subject,
          html: fullBodyHtml,
        }
      })

      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailBatchPayload),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`Resend API batch error: ${errText}`)
        throw new Error(`Resend dispatch failed with status ${res.status}`)
      }

      totalSent += batch.length
    }

    // 4. Audit: Update email campaign status to 'sent'
    const { error: updateError } = await supabase
      .from('email_campaigns')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        recipients_count: totalSent
      })
      .eq('id', campaignId)

    if (updateError) {
      console.error(`Failed to update campaign record: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, recipientsCount: totalSent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
