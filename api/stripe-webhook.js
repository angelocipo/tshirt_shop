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

const OWNER_EMAIL = process.env.OWNER_NOTIFICATION_EMAIL || 'info@tipografia.online';

module.exports.config = { api: { bodyParser: false } };

function buffer(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Sequential invoice numbering. Swap for a persistent counter (KV/DB) before going live —
// this in-memory counter resets on every cold start.
let invoiceCounter = 0;
function nextInvoiceNumber() {
  invoiceCounter += 1;
  return String(invoiceCounter).padStart(5, '0');
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).end();
    return;
  }

  let event;
  try {
    const buf = await buffer(req);
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
      await createInvoiceForOrder(order);

      const buyerEmail = md.inv_email || session.customer_details?.email;
      const lineRows = order.lines.map((l) => `<tr><td style="padding:4px 8px;border-bottom:1px solid #eee;">${l.description}</td><td style="padding:4px 8px;border-bottom:1px solid #eee;text-align:right;">€ ${l.unitPrice.toFixed(2)}</td></tr>`).join('');
      const summaryHtml = `
        <div style="font-family:sans-serif;color:#1d1f20;max-width:520px;">
          <h2 style="margin:0 0 12px;">Ordine confermato — #${order.number}</h2>
          <p>Grazie per il tuo ordine, ${order.customer.name}.</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0;">${lineRows}</table>
          <p style="font-size:16px;font-weight:700;">Totale pagato: € ${total.toFixed(2)}</p>
          <p style="font-size:13px;color:#666;">Riceverai a breve la fattura elettronica e le informazioni per l'invio del materiale.</p>
        </div>`;
      try {
        if (buyerEmail) {
          await sendEmail({ to: buyerEmail, subject: `Conferma ordine #${order.number} — Tipografia Online`, html: summaryHtml });
        }
        await sendEmail({
          to: OWNER_EMAIL,
          subject: `Nuovo ordine #${order.number} — € ${total.toFixed(2)}`,
          html: `${summaryHtml}<hr><p style="font-size:13px;color:#666;">Cliente: ${order.customer.name}${buyerEmail ? ' · ' + buyerEmail : ''}</p>`,
        });
      } catch (mailErr) {
        console.error('Confirmation email failed for session', session.id, mailErr);
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
      // Don't fail the webhook response for Stripe's sake — log and handle/retry invoicing separately.
      console.error('Invoice creation failed for session', session.id, err);
    }
  }

  res.status(200).json({ received: true });
};
