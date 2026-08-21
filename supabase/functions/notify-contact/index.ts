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
    const { name, email, inquiryType, message } = await req.json()

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields (name, email, message).' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing RESEND_API_KEY environment variable.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format the email HTML body
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 5px;">
        <h2 style="color: #111111; border-bottom: 1px solid #eaeaea; padding-bottom: 10px; text-transform: uppercase; font-size: 18px; letter-spacing: 0.05em;">
          New Contact Submission
        </h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 8px 0; font-weight: bold; width: 120px; font-size: 14px; color: #666666; text-transform: uppercase;">Name:</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111111;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; font-size: 14px; color: #666666; text-transform: uppercase;">Email:</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111111;"><a href="mailto:${email}" style="color: #0070f3; text-decoration: underline;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-weight: bold; font-size: 14px; color: #666666; text-transform: uppercase;">Type:</td>
            <td style="padding: 8px 0; font-size: 14px; color: #111111; text-transform: capitalize;">${inquiryType || 'General'}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eaeaea;">
          <p style="font-weight: bold; font-size: 14px; color: #666666; text-transform: uppercase; margin-bottom: 8px;">Message:</p>
          <p style="font-size: 14px; color: #111111; line-height: 1.6; white-space: pre-wrap; background-color: #f9f9f9; padding: 15px; border-radius: 4px; margin: 0;">${message}</p>
        </div>
      </div>
    `

    // Dispatch email to inbound address using Resend API
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Creative CTRL Collective <updates@creativectrlcollective.org>',
        to: ['contact@creativectrlcollective.org'],
        reply_to: email,
        subject: `Creative CTRL Collective — ${name} (${inquiryType || 'general'})`,
        html: emailHtml,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error(`Resend API notify error: ${errText}`)
      throw new Error(`Resend dispatch failed with status ${res.status}`)
    }

    const resData = await res.json()

    return new Response(
      JSON.stringify({ success: true, message: 'Notification email dispatched.', data: resData }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error(`Error in notify-contact edge function: ${err.message}`)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
