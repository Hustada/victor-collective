/**
 * Email Send Service
 *
 * Resend integration for sending branded emails from victorhustad@victorcollective.com
 */

import { Resend } from 'resend';
import { logger } from '../lib/logger.js';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'victorhustad@victorcollective.com';

// Victor Collective brand
const BRAND = {
  bg: '#f7f7f7',
  text: '#1a1a1a',
  textMuted: '#666666',
  accent: '#D35400',
  logoUrl: 'https://www.victorcollective.com/favicon-64x64.png',
};

interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  replyTo?: string;
}

interface SendEmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Generate clean HTML email template
 * Follows best practices: single column, system fonts, minimal styling
 */
function generateEmailHtml(body: string): string {
  // Convert plain text body to HTML paragraphs
  const formattedBody = body
    .split('\n\n')
    .map(
      (p) =>
        `<p style="margin: 0 0 16px 0; line-height: 1.6; color: ${BRAND.text};">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Victor Collective</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BRAND.bg};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; width: 100%;">

          <!-- Body -->
          <tr>
            <td style="padding: 0; font-size: 15px; line-height: 1.7; color: ${BRAND.text};">
              ${formattedBody}
            </td>
          </tr>

          <!-- Signature -->
          <tr>
            <td style="padding: 32px 0 0 0;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <img src="${BRAND.logoUrl}" alt="V" width="36" height="36" style="display: block; border-radius: 4px;" />
                  </td>
                  <td style="vertical-align: middle;">
                    <p style="margin: 0; font-size: 14px; font-weight: 600; color: ${BRAND.text};">Mark Hustad</p>
                    <p style="margin: 2px 0 0 0; font-size: 12px; color: ${BRAND.textMuted};">
                      <a href="https://victorcollective.com" style="color: ${BRAND.textMuted}; text-decoration: none;">victorcollective.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim();
}

/**
 * Generate plain text version
 */
function generateEmailText(body: string): string {
  return `${body}

--
Mark Hustad
The Victor Collective
https://victorcollective.com
`.trim();
}

/**
 * Escape HTML entities
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Send a branded email via Resend
 */
export async function sendEmail(params: SendEmailParams): Promise<SendEmailResult> {
  const { to, subject, body, replyTo } = params;

  try {
    const html = generateEmailHtml(body);
    const text = generateEmailText(body);

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
      replyTo: replyTo || FROM_EMAIL,
    });

    if (result.error) {
      logger.error('Failed to send email', { to, subject, error: result.error });
      return { success: false, error: result.error.message };
    }

    logger.info('Email sent', { to, subject, id: result.data?.id });
    return { success: true, id: result.data?.id };
  } catch (error) {
    logger.error('Email send error', { to, subject, error: String(error) });
    return { success: false, error: String(error) };
  }
}

/**
 * Send email with custom HTML (no template)
 */
export async function sendRawEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
}): Promise<SendEmailResult> {
  const { to, subject, html, text, replyTo, attachments } = params;

  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
      replyTo: replyTo || FROM_EMAIL,
      attachments,
    });

    if (result.error) {
      logger.error('Failed to send raw email', { to, subject, error: result.error });
      return { success: false, error: result.error.message };
    }

    logger.info('Raw email sent', { to, subject, id: result.data?.id });
    return { success: true, id: result.data?.id };
  } catch (error) {
    logger.error('Raw email send error', { to, subject, error: String(error) });
    return { success: false, error: String(error) };
  }
}
