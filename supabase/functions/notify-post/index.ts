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
    const { postId, origin } = await req.json()

    if (!postId) {
      return new Response(
        JSON.stringify({ error: 'Missing postId in request body.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const baseOrigin = origin || 'https://www.creativectrlcollective.org'

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (!supabaseUrl || !supabaseServiceKey || !resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing environment variables.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 1. Fetch Post Details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return new Response(
        JSON.stringify({ error: `Post not found: ${postError?.message || 'Unknown'}` }),
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
      return new Response(
        JSON.stringify({ message: 'No CASL-compliant recipients found.', recipientsCount: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const postUrl = `${baseOrigin}/posts/${post.slug}`
    
    // 3. Dispatch emails in batches of 100 via Resend API
    const batchSize = 100
    let totalSent = 0

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize)
      const emailBatchPayload = batch.map(member => {
        const unsubUrl = `${baseOrigin}/unsubscribe?token=${member.unsubscribe_token}`
        
        // Build email HTML body
        const emailHtml = `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
            ${post.cover_image_url ? `
              <img src="${post.cover_image_url}" alt="${post.title}" style="width: 100%; max-height: 250px; object-fit: cover; border-radius: 4px; margin-bottom: 20px;" />
            ` : ''}
            <h2 style="color: #111111; font-size: 20px; margin-top: 0; line-height: 1.4;">${post.title}</h2>
            ${post.excerpt ? `
              <p style="color: #666666; font-size: 15px; line-height: 1.6; margin-bottom: 20px;">${post.excerpt}</p>
            ` : ''}
            <a href="${postUrl}" style="display: inline-block; background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">
              Read Full Post
            </a>
            <hr style="border:none;border-top:1px solid #eaeaea;margin:24px 0;" />
            <p style="font-size:12px;color:#666666;line-height:16px;">
              This email was sent to ${member.full_name || member.email} by Creative CTRL Collective.<br />
              <strong>Creative CTRL Collective</strong> · Toronto, ON, Canada<br />
              To stop receiving these emails, you can <a href="${unsubUrl}" style="color:#0070f3;text-decoration:underline;">unsubscribe</a> at any time.
            </p>
          </div>
        `

        return {
          from: 'Creative CTRL Collective <updates@creativectrlcollective.org>',
          to: [member.email],
          subject: `Creative CTRL Collective — ${post.title}`,
          html: emailHtml,
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

    return new Response(
      JSON.stringify({ success: true, recipientsCount: totalSent }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error(`Error in notify-post edge function: ${err.message}`)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
