import { loggerService as logger } from './loggerService'

interface EmailPayload {
  to: string
  subject: string
  body: string
  html?: string
}

interface EmailResult {
  sent: boolean
  provider: string
  id?: string
}

async function sendWithResend(payload: EmailPayload, apiKey: string, from: string): Promise<EmailResult> {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html || payload.body.replace(/\n/g, '<br>'),
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    logger.error('resend email failed', { status: response.status, error })
    return { sent: false, provider: 'resend' }
  }

  const data = await response.json() as { id: string }
  return { sent: true, provider: 'resend', id: data.id }
}

export const emailService = {
  async send(payload: EmailPayload): Promise<EmailResult> {
    const provider = process.env.EMAIL_PROVIDER
    const apiKey = process.env.EMAIL_API_KEY
    const from = process.env.EMAIL_FROM || 'noreply@syntraq.io'

    // production: send via configured provider
    if (provider === 'resend' && apiKey) {
      return sendWithResend(payload, apiKey, from)
    }

    // development: log to console
    logger.debug('email sent (console)', { to: payload.to, subject: payload.subject })
    return { sent: true, provider: 'console' }
  },

  async sendWelcome(email: string, name: string, companyName: string) {
    return this.send({
      to: email,
      subject: `welcome to syntraq, ${name}`,
      body: `hi ${name},\n\nwelcome to syntraq! your company "${companyName}" has been created.\n\nget started by exploring the dashboard and setting up your first roster.\n\n— the syntraq team`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #333;">
          <h2 style="color: #1a1a2e;">welcome to syntraq, ${name}</h2>
          <p>your company <strong>${companyName}</strong> has been created.</p>
          <p>get started by exploring the dashboard and setting up your first roster.</p>
          <p style="margin-top: 24px; color: #888;">— the syntraq team</p>
        </div>
      `,
    })
  },

  async sendInvite(email: string, inviterName: string, companyName: string) {
    return this.send({
      to: email,
      subject: `${inviterName} invited you to ${companyName} on syntraq`,
      body: `hi,\n\n${inviterName} has invited you to join ${companyName} on syntraq.\n\nclick the link below to create your account and get started.\n\n— the syntraq team`,
    })
  },

  async sendShiftReminder(email: string, name: string, date: string, time: string) {
    return this.send({
      to: email,
      subject: `shift reminder: ${date} at ${time}`,
      body: `hi ${name},\n\nthis is a reminder that you have a shift scheduled for ${date} starting at ${time}.\n\n— syntraq`,
    })
  },

  async sendSubscriptionConfirmation(email: string, name: string, planName: string) {
    return this.send({
      to: email,
      subject: `subscription confirmed: ${planName} plan`,
      body: `hi ${name},\n\nyour syntraq subscription has been updated to the ${planName} plan.\n\nyou now have access to all ${planName} features. visit your settings to see your updated limits.\n\n— the syntraq team`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; color: #333;">
          <h2 style="color: #1a1a2e;">subscription confirmed</h2>
          <p>hi ${name},</p>
          <p>your syntraq subscription has been updated to the <strong>${planName}</strong> plan.</p>
          <p>you now have access to all ${planName} features. visit your settings to see your updated limits.</p>
          <p style="margin-top: 24px; color: #888;">— the syntraq team</p>
        </div>
      `,
    })
  },
}
