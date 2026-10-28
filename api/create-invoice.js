// Invoices — draft mode (default) and optional direct send to Aruba.
//
// prepareInvoiceDraft(order): assigns the next invoice number, builds the FatturaPA XML and archives
// it in Vercel Blob under invoices/<year>/. The webhooks attach the XML to the owner email: you
// import it in Aruba (Fatture → Carica/Importa XML), check it and send it yourself.
//
// Numbering (env): INVOICE_YEAR=2026 + INVOICE_LAST_NUMBER=<last number issued by hand that year>.
// The site continues from there (n/year). If either is missing, no number is assigned: the draft is
// marked BOZZA-<order> and you set the number in Aruba.
//
// ARUBA_ENABLED=1 also uploads the XML through the Aruba API — that SENDS it to SDI immediately,
// there is no draft step. Leave it off while invoices are confirmed by hand.

const { buildFatturaPAXml } = require('./_fattura-xml');

const SELLER = {
  name: process.env.SELLER_NAME || '',
  vatNumber: (process.env.SELLER_VAT_NUMBER || '').replace(/^IT/i, ''),
  fiscalCode: process.env.SELLER_FISCAL_CODE || '',
  address: process.env.SELLER_ADDRESS || '',
  cap: process.env.SELLER_CAP || '',
  city: process.env.SELLER_CITY || '',
  province: process.env.SELLER_PROVINCE || '',
  regimeFiscale: process.env.SELLER_REGIME_FISCALE || 'RF01',
};

async function assignNumber(ref, year) {
  const base = String(process.env.INVOICE_YEAR) === String(year) ? parseInt(process.env.INVOICE_LAST_NUMBER, 10) : NaN;
  if (!process.env.BLOB_READ_WRITE_TOKEN || !Number.isFinite(base)) return { n: null, existing: false };
  const { list } = require('@vercel/blob');
  const { blobs } = await list({ prefix: `invoices/${year}/` });
  const parsed = blobs.map((b) => /invoices\/\d+\/(\d{6})-([A-Z0-9]+)/.exec(b.pathname)).filter(Boolean);
  const mine = parsed.find((m) => m[2] === ref);
  if (mine) return { n: parseInt(mine[1], 10), existing: true }; // webhook retry: same number, no new invoice
  const max = parsed.reduce((m, p) => Math.max(m, parseInt(p[1], 10)), base);
  return { n: max + 1, existing: false };
}

// order: { number (order ref), date, total (€), customer, lines }
async function prepareInvoiceDraft(order) {
  const date = order.date || new Date();
  const year = date.getFullYear();
  // Never numbered: the owner assigns the number in Aruba. Archive check only flags duplicate webhooks.
  const n = null;
  let existing = false;
  try {
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const { list } = require('@vercel/blob');
      const { blobs } = await list({ prefix: `invoices/${year}/` });
      existing = blobs.some((b) => b.pathname.includes(order.number));
    }
  } catch (e) { console.error('Invoice archive lookup failed', e); }
  const invoiceNumber = n ? `${n}/${year}` : `BOZZA-${order.number}`;
  const progressivo = n ? ((year % 100) * 100000 + n).toString(36).toUpperCase().padStart(5, '0') : order.number.slice(0, 5);
  const { xml, warnings } = buildFatturaPAXml({
    invoiceNumber, progressivo, ref: order.number, date,
    totalCents: Math.round(order.total * 100), customer: order.customer, lines: order.lines, email: order.email,
  }, SELLER);
  warnings.unshift('Numero fattura da assegnare in Aruba (la bozza non è numerata)');
  // Must be paid by card on the invoice date.
  const pay = order.payment || {};
  const same = (a, b) => a && b && a.toDateString() === b.toDateString();
  if (pay.method !== 'card') warnings.unshift(`Pagamento non con carta di credito (${pay.method || 'metodo sconosciuto'}): verifica prima di emettere`);
  if (!same(pay.date, date)) warnings.unshift('Data pagamento diversa dalla data fattura: verifica prima di emettere');
  if (existing) warnings.unshift('Notifica di pagamento ripetuta: stessa fattura già preparata, non emetterla due volte');
  const filename = `IT${SELLER.vatNumber || '00000000000'}_${progressivo}.xml`;
  if (n && !existing) {
    try {
      const { put } = require('@vercel/blob');
      await put(`invoices/${year}/${String(n).padStart(6, '0')}-${order.number}.xml`, xml, { access: 'public', addRandomSuffix: true, contentType: 'application/xml' });
    } catch (e) { warnings.push('Archivio bozza non riuscito: il numero potrebbe ripetersi al prossimo ordine'); console.error('Invoice archive failed', e); }
  }
  return { invoiceNumber, filename, xml, warnings, existing };
}

async function sendInvoiceToAruba(draft) {
  const { arubaSignIn, arubaUploadInvoice } = require('./_aruba-client');
  const token = await arubaSignIn();
  return arubaUploadInvoice(token, draft.xml);
}

// Shared by both webhooks: email attachment + warning block for the owner email.
function draftEmailParts(draft) {
  if (!draft) return { attachment: null, html: '' };
  const warn = draft.warnings.length
    ? `<ul style="margin:8px 0 0;padding-left:18px;color:#8a1c1c;">${draft.warnings.map((w) => `<li>${String(w).replace(/</g, '&lt;')}</li>`).join('')}</ul>`
    : '<div style="margin-top:6px;color:#2d5a2d;">Nessun problema rilevato nei dati.</div>';
  return {
    attachment: { filename: draft.filename, content: Buffer.from(draft.xml, 'utf8').toString('base64') },
    html: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:0 16px 32px;"><tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:100%;background:#ffffff;border:1px solid #d4d6d9;">
      <tr><td style="padding:22px 32px 24px;font:400 14px/1.5 Arial,sans-serif;color:#1d1f20;">
      <strong>Bozza fattura ${draft.invoiceNumber}</strong> — allegata (${draft.filename}). Importala in Aruba, controllala e inviala.${warn}
      </td></tr></table></td></tr></table>`,
  };
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!process.env.DIAG_TOKEN || req.query.token !== process.env.DIAG_TOKEN) { res.status(401).json({ error: 'Unauthorized' }); return; }
  try {
    const order = req.body || {};
    if (!order.number || !order.customer || !Array.isArray(order.lines) || !order.lines.length) {
      res.status(400).json({ error: 'Dati fattura incompleti' });
      return;
    }
    const draft = await prepareInvoiceDraft({ ...order, date: order.date ? new Date(order.date) : new Date() });
    res.status(200).json({ ok: true, invoiceNumber: draft.invoiceNumber, filename: draft.filename, warnings: draft.warnings, xml: draft.xml });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Errore nella creazione della fattura', detail: String(err.message || err) });
  }
};

module.exports.prepareInvoiceDraft = prepareInvoiceDraft;
module.exports.sendInvoiceToAruba = sendInvoiceToAruba;
module.exports.draftEmailParts = draftEmailParts;
