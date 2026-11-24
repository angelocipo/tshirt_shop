// Vercel serverless function — POST /api/invoice-details
// Passo 2 del checkout: dopo il pagamento il cliente inserisce i dati di fatturazione nella pagina grazie.html.
// Body: { session_id: 'cs_…' } (Stripe) | { session_id: 'TS…', via: 'nexi' } (Nexi) | { paypal: { orderID, lines, total } },
// più { customer: { type, name, email, company, vat, cf, pec, sdi, address, cap, city, province, country } }.
// Verifica che l'ordine sia pagato, prepara la bozza FatturaPA (create-invoice.js) e la manda al titolare
// nell'email «Dati fattura ordine #REF». Nessun dato del cliente viene salvato sul server.

const clip = (v, n = 120) => String(v ?? '').trim().slice(0, n);
const esc = (t) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const NOT_PEC = /@(gmail|googlemail|yahoo|ymail|hotmail|outlook|live|msn|icloud|me|mac|aol|gmx|libero|virgilio|tiscali|alice|tim|fastwebnet|email|inwind|katamail)\.[a-z.]+$/i;

function checkCustomer(c) {
  if (!c.name) return 'Inserisci nome e cognome.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email)) return 'Inserisci un indirizzo email valido.';
  if (!c.address || !c.cap || !c.city) return 'Inserisci un indirizzo di fatturazione completo.';
  if (c.type !== 'estero' && !/^\d{5}$/.test(c.cap)) return 'Il CAP deve avere 5 cifre (es. 00147).';
  if (c.type !== 'estero' && !/^[A-Z]{2}$/.test(c.province)) return 'Inserisci la Provincia (sigla di 2 lettere, es. RM).';
  if (c.type === 'estero' && !/^[A-Z]{2}$/.test(c.country)) return 'Enter the 2-letter country code (e.g. DE).';
  if (c.type === 'privato' && !c.cf) return 'Inserisci il Codice Fiscale.';
  if (c.type === 'azienda' && (!c.company || !c.vat)) return 'Inserisci Ragione Sociale e Partita IVA.';
  if (c.type === 'azienda' && !c.pec && !c.sdi) return 'Inserisci PEC o Codice SDI.';
  if (c.pec && NOT_PEC.test(c.pec)) return 'L\'indirizzo PEC inserito è una normale email: inserisci una PEC (es. nome@pec.it) oppure il Codice SDI.';
  if (c.sdi && !/^[A-Z0-9]{7}$/.test(c.sdi)) return 'Il Codice SDI deve avere 7 caratteri.';
  return null;
}

// Ordine Stripe pagato → righe e importo come addebitati davvero.
async function fromStripe(sid) {
  const Stripe = require('stripe');
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  let s;
  try { s = await stripe.checkout.sessions.retrieve(sid); } catch (e) { return { error: 'Ordine non trovato.', status: 404 }; }
  if (s.payment_status !== 'paid') return { error: 'Ordine non pagato.', status: 404 };
  const li = await stripe.checkout.sessions.listLineItems(sid, { limit: 100 });
  let method = (s.payment_method_types || []).length === 1 ? s.payment_method_types[0] : null;
  try {
    if (s.payment_intent) {
      const pi = await stripe.paymentIntents.retrieve(s.payment_intent, { expand: ['latest_charge'] });
      method = pi.latest_charge?.payment_method_details?.type || method;
    }
  } catch (e) { console.error('invoice-details: payment method lookup failed', e); }
  return {
    id: s.id,
    totalCents: s.amount_total,
    lines: li.data.map((l) => ({ description: l.description, quantity: l.quantity, unitPrice: l.amount_total / 100 / l.quantity, vatRate: 22 })),
    payment: { method, date: new Date(s.created * 1000) },
    label: 'Carta (Stripe)',
  };
}

// Ordine Nexi: il pagamento è confermato quando nexi-webhook.js ha scritto il file ".sent".
async function fromNexi(codTrans) {
  const { list } = require('@vercel/blob');
  const { blobs } = await list({ prefix: `nexi-orders/${codTrans}` });
  const json = blobs.find((b) => b.pathname.endsWith('.json'));
  const sent = blobs.find((b) => b.pathname.endsWith('.sent'));
  if (!json) return { error: 'Ordine non trovato.', status: 404 };
  if (!sent) return { error: 'Stiamo ancora ricevendo la conferma del pagamento da Nexi. Riprova tra un minuto.', status: 409 };
  const stored = await (await fetch(json.url, { cache: 'no-store' })).json();
  let brand = '';
  try { const t = await (await fetch(sent.url, { cache: 'no-store' })).text(); brand = (JSON.parse(t) || {}).brand || ''; } catch (e) { /* vecchio formato: solo data */ }
  const isCard = /visa|master|maestro|amex|american|diners|jcb|carta|card|vpay/i.test(brand);
  return {
    id: codTrans,
    totalCents: stored.amountCents,
    lines: stored.lines || [],
    payment: { method: isCard ? 'card' : (brand || 'card'), date: new Date(stored.createdAt || Date.now()) },
    label: 'Nexi' + (brand ? ' (' + brand + ')' : ''),
  };
}

// PayPal: il sito non ha le credenziali API PayPal, quindi non può verificare l'incasso.
// Righe e importo arrivano dal browser del cliente: l'email al titolare lo segnala in evidenza.
function fromPaypal(p) {
  const orderID = clip(p.orderID, 40);
  if (!/^[A-Z0-9]{10,40}$/.test(orderID)) return { error: 'Ordine non valido.', status: 400 };
  const lines = (Array.isArray(p.lines) ? p.lines : []).slice(0, 20).map((l) => ({
    description: clip(l.description || l.name || 'Articolo', 300), quantity: 1, unitPrice: Math.max(0, Number(l.price) || 0), vatRate: 22,
  }));
  const ship = Math.max(0, Number(p.shippingFee) || 0);
  if (ship > 0) lines.push({ description: 'Spedizione', quantity: 1, unitPrice: ship, vatRate: 22 });
  const totalCents = Math.round(lines.reduce((t, l) => t + l.unitPrice, 0) * 100);
  if (!lines.length || totalCents <= 0) return { error: 'Ordine non valido.', status: 400 };
  return { id: orderID, totalCents, lines, payment: { method: 'paypal', date: new Date() }, label: 'PayPal (non verificato dal sito)', unverified: true };
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const b = req.body || {};
    const raw = b.customer || {};
    const type = ['privato', 'azienda', 'estero'].includes(raw.type) ? raw.type : 'privato';
    const c = { type };
    for (const k of ['name', 'email', 'company', 'vat', 'cf', 'sdi', 'pec', 'address', 'cap', 'city', 'province', 'country']) c[k] = clip(raw[k]);
    c.sdi = c.sdi.toUpperCase().replace(/\s+/g, '');
    c.cf = c.cf.toUpperCase().replace(/\s+/g, '');
    c.province = c.province.toUpperCase();
    c.country = type === 'estero' ? c.country.toUpperCase() : 'IT';
    const bad = checkCustomer(c);
    if (bad) { res.status(400).json({ error: bad }); return; }

    const sid = clip(b.session_id, 200);
    let paid;
    if (/^cs_[A-Za-z0-9_]+$/.test(sid)) paid = await fromStripe(sid);
    else if (/^TS[A-Z0-9]{6,26}$/.test(sid)) paid = await fromNexi(sid);
    else if (b.paypal && b.paypal.orderID) paid = fromPaypal(b.paypal);
    else { res.status(400).json({ error: 'Ordine non trovato.' }); return; }
    if (paid.error) { res.status(paid.status || 400).json({ error: paid.error }); return; }

    const W = require('./stripe-webhook');
    const isCompany = type === 'azienda';
    const order = {
      number: paid.unverified ? paid.id : W.orderRef({ id: paid.id }),
      date: new Date(),
      total: paid.totalCents / 100,
      email: c.email,
      payment: paid.payment,
      customer: {
        name: isCompany ? c.company : c.name, isCompany,
        vatNumber: c.vat || undefined, fiscalCode: c.cf || undefined, pec: c.pec || undefined,
        address: c.address, cap: c.cap, city: c.city, province: c.province, country: c.country,
        type, company: c.company, vat: c.vat, cf: c.cf, sdi: c.sdi, sdiCode: c.sdi || '0000000',
      },
      lines: paid.lines,
    };

    const CI = require('./create-invoice');
    let draft = null;
    try { draft = await CI.prepareInvoiceDraft(order); } catch (e) { console.error('invoice-details: bozza non generata', order.number, e); }
    if (draft && paid.unverified) draft.warnings.unshift(`PayPal: il sito non può verificare l'incasso. Controlla su PayPal l'ordine ${paid.id} e l'importo € ${order.total.toFixed(2)} prima di emettere.`);
    const parts = draft ? CI.draftEmailParts(draft) : { attachment: null, html: '<p style="color:#8a1c1c;font-family:sans-serif;">Bozza XML non generata: crea la fattura a mano in Aruba con i dati qui sopra.</p>' };

    const rows = [
      ['Ordine', `#${order.number} · € ${order.total.toFixed(2).replace('.', ',')} · ${paid.label}`],
      ['Tipo', type === 'azienda' ? 'Azienda' : type === 'estero' ? 'Estero' : 'Privato'],
      ['Nome', c.name], ['Email', c.email], ['Ragione sociale', c.company], ['P. IVA', c.vat], ['Codice fiscale', c.cf],
      ['Codice SDI', c.sdi], ['PEC', c.pec],
      ['Indirizzo', [c.address, c.cap, c.city, c.province, c.country !== 'IT' ? c.country : ''].filter(Boolean).join(', ')],
    ].filter(([, v]) => v);
    const html = `<!doctype html><html><body style="margin:0;background:#f2f2f3;font:400 15px/1.5 Helvetica,Arial,sans-serif;color:#1d1f20;">
<div style="max-width:600px;margin:0 auto;padding:24px 16px;"><div style="background:#fff;border:1px solid #dfe4e9;padding:24px 28px;">
<div style="font:600 11px/1 Helvetica,Arial,sans-serif;letter-spacing:.16em;text-transform:uppercase;color:#46433f;">Passo 2 · Dati fattura dal cliente</div>
<h1 style="font-size:24px;margin:10px 0 16px;">Dati fattura ordine #${esc(order.number)}</h1>
<table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">${rows.map(([k, v]) => `<tr><td style="padding:7px 0;border-bottom:1px solid #dfe4e9;font:600 12px/1.4 Helvetica,Arial,sans-serif;text-transform:uppercase;letter-spacing:.06em;color:#6b7378;width:150px;">${k}</td><td style="padding:7px 0;border-bottom:1px solid #dfe4e9;">${esc(v)}</td></tr>`).join('')}</table>
</div></div>${parts.html}</body></html>`;
    await W.sendEmail({
      to: W.OWNER_EMAIL,
      subject: `Dati fattura ordine #${order.number} — ${c.company || c.name}${paid.unverified ? ' — PayPal da verificare' : ''}`,
      html,
      attachments: [parts.attachment].filter(Boolean),
    });
    console.log('invoice-details: dati fattura inviati per ordine', order.number, paid.label);
    res.status(200).json({ ok: true, ref: order.number });
  } catch (err) {
    console.error('invoice-details', err);
    res.status(500).json({ error: 'Invio non riuscito, riprova o scrivici a info@tshirt-shop.online.' });
  }
};
