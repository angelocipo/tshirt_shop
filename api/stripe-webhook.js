// Vercel serverless function — POST /api/stripe-webhook
// Configure this URL in the Stripe Dashboard (Developers → Webhooks) listening for
// checkout.session.completed. On a successful payment, generates and submits the
// FatturaPA invoice to Aruba automatically.
//
// Needs the raw request body for signature verification — see vercel.json config note below.

const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const { createInvoiceForOrder } = require('./create-invoice');
const { sendEmail } = require('./_email-client');

const OWNER_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL || 'info@tshirt-shop.online';

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Stripe signs the EXACT bytes it sent, so we need the raw body. Depending on the runtime
// the body may already have been consumed and parsed — cover every shape we might get.
async function rawBody(req) {
  if (req.rawBody) return Buffer.isBuffer(req.rawBody) ? req.rawBody : Buffer.from(req.rawBody);
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const buf = await buffer(req);
  if (buf.length > 0) return buf;
  if (req.body && typeof req.body === 'object') {
    // Last resort: the runtime parsed and discarded the raw bytes. Re-serialising cannot
    // reproduce them byte-for-byte, so the signature check WILL fail — surface that clearly.
    throw new Error('Raw body non disponibile: il runtime ha già parsato la richiesta. La verifica firma Stripe non è possibile.');
  }
  throw new Error('Body della richiesta vuoto.');
}

// Sequential invoice numbering. Swap for a persistent counter (KV/DB) before going live —
// this in-memory counter resets on every cold start.
let invoiceCounter = 0;
function nextInvoiceNumber() {
  invoiceCounter += 1;
  return String(invoiceCounter).padStart(5, '0');
}

// NOTE: the config assignment lives at the BOTTOM of this file — assigning it before
// `module.exports = handler` would be wiped out by that reassignment.
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  let event;
  try {
    const buf = await rawBody(req);
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    try {
      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
      const total = session.amount_total / 100;
      const md = session.metadata || {};
      const isCompany = md.inv_type === 'azienda';
      const order = {
        number: nextInvoiceNumber(),
        date: new Date(),
        total,
        customer: {
          name: isCompany ? (md.inv_company || md.inv_name) : (md.inv_name || session.customer_details?.name || 'Cliente'),
          isCompany,
          vatNumber: md.inv_vat || undefined,
          fiscalCode: md.inv_cf || undefined,
          pec: md.inv_pec || undefined,
          address: md.inv_address || session.customer_details?.address?.line1 || '',
          cap: md.inv_cap || session.customer_details?.address?.postal_code || '',
          city: md.inv_city || session.customer_details?.address?.city || '',
          province: '',
          country: md.inv_country || session.customer_details?.address?.country || 'IT',
          // No SDI code = "consumatore finale", invoice made available via portal instead of pushed by SDI.
          sdiCode: md.inv_sdi || '0000000',
        },
        lines: lineItems.data.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.amount_total / 100 / li.quantity,
          vatRate: 22, // adjust if any product carries a different aliquota
        })),
      };
      const buyerEmail = md.inv_email || session.customer_details?.email;
      const summaryHtml = orderEmailHtml(order, total);
      try {
        if (buyerEmail) {
          await sendEmail({ to: buyerEmail, subject: `Conferma ordine #${order.number} — Tshirt Shop Online`, html: summaryHtml });
        }
        await sendEmail({
          to: OWNER_EMAIL,
          subject: `Nuovo ordine #${order.number} — € ${total.toFixed(2)}`,
          html: summaryHtml.replace('</body></html>', ownerBlockHtml(order, buyerEmail, session) + '</body></html>'),
        });
      } catch (mailErr) {
        console.error('Confirmation email failed for session', session.id, mailErr);
      }

      // Invoicing runs after the emails and in its own try — an Aruba failure must never
      // suppress the customer's order confirmation.
      try {
        await createInvoiceForOrder(order);
      } catch (invErr) {
        console.error('Invoice creation failed for session', session.id, invErr);
      }

      // Shipping/sender details aren't part of the invoice — they drive the packing slip
      // and courier label. Logged here for now; wire to your fulfillment email/sheet/CRM.
      console.log('Shipping for session', session.id, md.ship_same === '0'
        ? { name: md.ship_name, phone: md.ship_phone, address: md.ship_address, city: md.ship_city, cap: md.ship_cap, notes: md.ship_notes }
        : { sameAsBilling: true, ...order.customer });
      if (md.sender_use === '1') {
        console.log('Custom sender for session', session.id, { company: md.sender_company, phone: md.sender_phone, address: md.sender_address, city: md.sender_city, cap: md.sender_cap });
      }
    } catch (err) {
      // Don't fail the webhook response for Stripe's sake — log and handle/retry separately.
      console.error('Order processing failed for session', session.id, err);
    }
  }

  res.status(200).json({ received: true });
};

// ---------------------------------------------------------------------------
// Order confirmation email. Table-based and fully inline-styled: email clients
// strip <style> blocks and ignore flexbox. Colours and type follow the site's
// own system — steel accent on a light technical ground, condensed headings.
// ---------------------------------------------------------------------------

const BG = '#f2f2f3';
const INK = '#1d1f20';
const STEEL = '#5980a6';
const STEEL_DARK = '#26333f';
const RULE = '#dfe4e9';
const MUTED = '#6b7378';
const HEAD_FONT = "'Barlow Condensed','Arial Narrow',Helvetica,Arial,sans-serif";
const BODY_FONT = "Barlow,Helvetica,Arial,sans-serif";

function eur(n) {
  return '€ ' + n.toFixed(2).replace('.', ',');
}

function cornerRow() {
  return `<tr>
    <td style="padding:8px 12px;font:400 12px/1 ${BODY_FONT};color:${STEEL};">+</td>
    <td style="padding:8px 12px;font:400 12px/1 ${BODY_FONT};color:${STEEL};text-align:right;">+</td>
  </tr>`;
}

function orderEmailHtml(order, total) {
  const rows = order.lines.map((l) => {
    const lineTotal = l.unitPrice * l.quantity;
    return `<tr>
      <td style="padding:14px 0;border-bottom:1px solid ${RULE};font:400 15px/1.45 ${BODY_FONT};color:${INK};">${l.description}</td>
      <td style="padding:14px 0 14px 16px;border-bottom:1px solid ${RULE};font:400 15px/1.45 ${BODY_FONT};color:${MUTED};text-align:right;white-space:nowrap;">${l.quantity}×</td>
      <td style="padding:14px 0 14px 16px;border-bottom:1px solid ${RULE};font:400 15px/1.45 ${BODY_FONT};color:${INK};text-align:right;white-space:nowrap;">${eur(lineTotal)}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="it"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${BG};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:32px 16px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid ${RULE};">

      <tr><td style="background:${STEEL_DARK};padding:26px 32px;">
        <div style="font:600 11px/1 ${BODY_FONT};letter-spacing:.18em;text-transform:uppercase;color:${STEEL};">Tshirt Shop Online</div>
        <div style="font:600 34px/1.05 ${HEAD_FONT};letter-spacing:.01em;color:#ffffff;padding-top:8px;">Ordine confermato</div>
      </td></tr>

      <tr><td style="padding:0 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cornerRow()}</table>
      </td></tr>

      <tr><td style="padding:8px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          <td style="font:400 16px/1.5 ${BODY_FONT};color:${INK};">Grazie per il tuo ordine, ${order.customer.name}.</td>
          <td style="text-align:right;vertical-align:top;white-space:nowrap;">
            <span style="display:inline-block;border:1px solid ${RULE};padding:5px 10px;font:600 13px/1 ${BODY_FONT};letter-spacing:.08em;color:${STEEL};">#${order.number}</span>
          </td>
        </tr></table>
      </td></tr>

      <tr><td style="padding:26px 32px 0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tr>
            <td style="padding-bottom:8px;border-bottom:2px solid ${INK};font:600 11px/1 ${BODY_FONT};letter-spacing:.14em;text-transform:uppercase;color:${MUTED};">Dettaglio</td>
            <td style="padding-bottom:8px;border-bottom:2px solid ${INK};font:600 11px/1 ${BODY_FONT};letter-spacing:.14em;text-transform:uppercase;color:${MUTED};text-align:right;">Q.tà</td>
            <td style="padding-bottom:8px;border-bottom:2px solid ${INK};font:600 11px/1 ${BODY_FONT};letter-spacing:.14em;text-transform:uppercase;color:${MUTED};text-align:right;">Importo</td>
          </tr>
          ${rows}
          <tr>
            <td colspan="2" style="padding:18px 0 0;font:600 13px/1 ${BODY_FONT};letter-spacing:.1em;text-transform:uppercase;color:${MUTED};">Totale pagato</td>
            <td style="padding:18px 0 0;font:600 30px/1 ${HEAD_FONT};color:${INK};text-align:right;white-space:nowrap;">${eur(total)}</td>
          </tr>
          <tr><td colspan="3" style="padding-top:4px;font:400 12px/1.4 ${BODY_FONT};color:${MUTED};text-align:right;">IVA inclusa</td></tr>
        </table>
      </td></tr>

      <tr><td style="padding:28px 32px 0;">
        <div style="border-top:1px solid ${RULE};padding-top:18px;font:400 14px/1.6 ${BODY_FONT};color:${MUTED};">
          Riceverai a breve la fattura elettronica e le istruzioni per l'invio del materiale da stampare.
        </div>
      </td></tr>

      <tr><td style="padding:0 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${cornerRow()}</table>
      </td></tr>

      <tr><td style="padding:0 32px 28px;">
        <div style="font:400 12px/1.6 ${BODY_FONT};color:${MUTED};">
          Tshirt Shop Online · Roma EUR · <a href="https://tshirt-shop.online" style="color:${STEEL};text-decoration:none;">tshirt-shop.online</a>
        </div>
      </td></tr>

    </table>
  </td></tr>
</table>
</body></html>`;
}

function ownerBlockHtml(order, buyerEmail, session) {
  const md = session.metadata || {};
  const rowsData = [
    ['Cliente', order.customer.name],
    ['Email', buyerEmail || '—'],
    ['Tipo', order.customer.isCompany ? 'Azienda' : 'Privato'],
    ['P. IVA / CF', order.customer.vatNumber || order.customer.fiscalCode || '—'],
    ['Indirizzo', [order.customer.address, order.customer.cap, order.customer.city].filter(Boolean).join(', ') || '—'],
    ['Spedizione', md.ship_same === '0'
      ? [md.ship_name, md.ship_address, md.ship_cap, md.ship_city].filter(Boolean).join(', ')
      : 'Come fatturazione'],
  ];
  const rows = rowsData.map(([k, v]) => `<tr>
    <td style="padding:7px 0;border-bottom:1px solid ${RULE};font:600 12px/1.4 ${BODY_FONT};letter-spacing:.06em;text-transform:uppercase;color:${MUTED};width:150px;">${k}</td>
    <td style="padding:7px 0;border-bottom:1px solid ${RULE};font:400 14px/1.4 ${BODY_FONT};color:${INK};">${v}</td>
  </tr>`).join('');

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};padding:0 16px 32px;">
  <tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid ${RULE};">
      <tr><td style="padding:22px 32px 6px;">
        <div style="font:600 11px/1 ${BODY_FONT};letter-spacing:.16em;text-transform:uppercase;color:${STEEL};">Dati per l'evasione</div>
      </td></tr>
      <tr><td style="padding:8px 32px 26px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">${rows}</table>
      </td></tr>
    </table>
  </td></tr>
</table>`;
}

// Raw body is required for Stripe signature verification. Must be assigned AFTER the
// handler above, otherwise `module.exports = handler` discards it.
module.exports.config = { api: { bodyParser: false } };
