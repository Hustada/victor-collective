/**
 * Invoice Template Service
 *
 * Generate branded invoices for The Victor Collective
 */

// Victor Collective brand - clean, professional style
const BRAND = {
  bg: '#f7f7f7',
  surface: '#ffffff',
  text: '#1a1a1a',
  textMuted: '#666666',
  accent: '#D35400',
  border: '#e5e5e5',
  logoUrl: 'https://www.victorcollective.com/favicon-64x64.png',
};

export interface InvoiceLineItem {
  description: string;
  quantity?: number;
  rate?: number;
  amount: number;
}

export interface InvoiceParams {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  items: InvoiceLineItem[];
  notes?: string;
  paid?: boolean;
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
 * Format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

/**
 * Generate clean invoice HTML
 * Professional, readable design following email best practices
 */
export function generateInvoiceHtml(params: InvoiceParams): string {
  const { invoiceNumber, date, dueDate, clientName, clientEmail, items, notes, paid } = params;

  const total = items.reduce((sum, item) => sum + item.amount, 0);

  const itemRows = items
    .map(
      (item) => `
                <tr>
                  <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.border}; color: ${BRAND.text}; font-size: 14px;">
                    ${escapeHtml(item.description)}
                  </td>
                  <td style="padding: 12px 0; border-bottom: 1px solid ${BRAND.border}; color: ${BRAND.text}; font-size: 14px; text-align: right;">
                    ${formatCurrency(item.amount)}
                  </td>
                </tr>`
    )
    .join('');

  const notesHtml = notes
    ? `
              <tr>
                <td style="padding: 24px 0 0 0;">
                  <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${BRAND.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">Notes</p>
                  <p style="margin: 0; font-size: 13px; color: ${BRAND.textMuted}; line-height: 1.5;">${escapeHtml(notes)}</p>
                </td>
              </tr>`
    : '';

  const statusBadge = paid
    ? `<span style="display: inline-block; padding: 4px 10px; background-color: #dcfce7; color: #166534; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 4px;">Paid</span>`
    : `<span style="display: inline-block; padding: 4px 10px; background-color: #fef3c7; color: #92400e; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 4px;">Due ${escapeHtml(dueDate)}</span>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${escapeHtml(invoiceNumber)} - The Victor Collective</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${BRAND.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: ${BRAND.bg};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width: 560px; width: 100%;">

          <!-- Header with logo -->
          <tr>
            <td style="padding: 0 0 24px 0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="vertical-align: middle;">
                    <img src="${BRAND.logoUrl}" alt="The Victor Collective" width="32" height="32" style="display: block; border-radius: 4px;" />
                  </td>
                  <td style="vertical-align: middle; text-align: right;">
                    ${statusBadge}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice card -->
          <tr>
            <td style="padding: 32px; background-color: ${BRAND.surface}; border: 1px solid ${BRAND.border}; border-radius: 8px;">

              <!-- Invoice header -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <p style="margin: 0 0 4px 0; font-size: 12px; color: ${BRAND.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">Invoice</p>
                    <p style="margin: 0; font-size: 24px; font-weight: 600; color: ${BRAND.text};">${escapeHtml(invoiceNumber)}</p>
                    <p style="margin: 8px 0 0 0; font-size: 13px; color: ${BRAND.textMuted};">Issued ${escapeHtml(date)}</p>
                  </td>
                </tr>
              </table>

              <!-- Bill To / From -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 24px;">
                <tr>
                  <td style="vertical-align: top; width: 50%;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${BRAND.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">Bill To</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 500; color: ${BRAND.text};">${escapeHtml(clientName)}</p>
                    ${clientEmail ? `<p style="margin: 2px 0 0 0; font-size: 13px; color: ${BRAND.textMuted};">${escapeHtml(clientEmail)}</p>` : ''}
                  </td>
                  <td style="vertical-align: top; text-align: right; width: 50%;">
                    <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: 600; color: ${BRAND.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">From</p>
                    <p style="margin: 0; font-size: 14px; font-weight: 500; color: ${BRAND.text};">Mark Hustad</p>
                    <p style="margin: 2px 0 0 0; font-size: 13px; color: ${BRAND.textMuted};">The Victor Collective</p>
                  </td>
                </tr>
              </table>

              <!-- Line Items -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 32px;">
                <tr>
                  <td style="padding: 0 0 8px 0; font-size: 11px; font-weight: 600; color: ${BRAND.textMuted}; text-transform: uppercase; letter-spacing: 0.5px;">Description</td>
                  <td style="padding: 0 0 8px 0; font-size: 11px; font-weight: 600; color: ${BRAND.textMuted}; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Amount</td>
                </tr>
                ${itemRows}
              </table>

              <!-- Total -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top: 16px;">
                <tr>
                  <td style="text-align: right; padding: 12px 0;">
                    <span style="font-size: 13px; color: ${BRAND.textMuted};">Total</span>
                    <span style="font-size: 24px; font-weight: 600; color: ${BRAND.text}; margin-left: 16px;">${formatCurrency(total)}</span>
                  </td>
                </tr>
              </table>

              ${notesHtml}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0 0 0; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: ${BRAND.textMuted};">
                <a href="https://victorcollective.com" style="color: ${BRAND.textMuted}; text-decoration: none;">victorcollective.com</a>
              </p>
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
