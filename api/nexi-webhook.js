// Vercel serverless function — POST /api/nexi-webhook (Nexi "urlpost", form-encoded).
// Trusted only if the MAC matches (NEXI_MAC_KEY), esito = OK and the amount equals the stored order.
// Sends the same buyer + owner emails as stripe-webhook.js. Must answer HTTP 200.
const NX = require('./_nexi');

async function readStored(orderId) {
  const { list } = require('@vercel/blob');
  const { blobs } = await list({ prefix: `nexi-orders/${orderId}` });
  const json = blobs.find((b) => b.pathname.endsWith('.json'));
  const sent = blobs.some((b) => b.pathname.endsWith('.sent'));
  if (!json) return { stored: null, sent };
  const r = await fetch(json.url, { cache: 'no-store' });
  return { stored: r.ok ? await r.json() : null, sent };
}

module.exports = async (req, res) => {
  const p = NX.parseParams(req);
  const orderId = p.codTrans;
  console.log('Nexi notification', 'order', orderId || 'NONE', 'esito', p.esito || '?', 'importo', p.importo || '?', 'codAut', p.codAut || '-');
  if (!NX.validCod(orderId)) { res.status(200).send('OK'); return; }
  if (!NX.responseMacOk(p)) { console.error('Nexi: MAC NON valido per', orderId); res.status(200).send('OK'); return; }
  if (p.esito !== 'OK') { console.log('Nexi: pagamento non riuscito', orderId, p.esito, p.messaggio || ''); res.status(200).send('OK'); return; }

  try {
    const { stored, sent } = await readStored(orderId);
    if (!stored) { console.error('Nexi: no stored order for', orderId); res.status(200).send('OK'); return; }
    if (sent) { console.log('Nexi: emails already sent for', orderId); res.status(200).send('OK'); return; }
    const paidCents = parseInt(p.importo, 10);
    if (paidCents !== stored.amountCents) console.error('Nexi: AMOUNT MISMATCH', orderId, 'paid', paidCents, 'expected', stored.amountCents);

    const W = require('./stripe-webhook');
    const md = stored.md || {};
    const total = paidCents / 100;
    const isCompany = md.inv_type === 'azienda';
    const order = {
      number: W.orderRef({ id: orderId }),
      date: new Date(),
      total,
      customer: {
        name: isCompany ? (md.inv_company || md.inv_name) : (md.inv_name || 'Cliente'),
        isCompany,
        vatNumber: md.inv_vat || undefined, fiscalCode: md.inv_cf || undefined, pec: md.inv_pec || undefined,
        address: md.inv_address || '', cap: md.inv_cap || '', city: md.inv_city || '', province: md.inv_province || '',
        country: md.inv_country || 'IT', sdiCode: md.inv_sdi || '0000000',
        type: md.inv_type || 'privato', company: md.inv_company || '', vat: md.inv_vat || '', cf: md.inv_cf || '', sdi: md.inv_sdi || '',
      },
      lines: stored.lines,
    };
    const buyerEmail = md.inv_email;
    order.email = buyerEmail;
    // Nexi: brand = VISA/MasterCard/Maestro/Amex… (card) or PayPal, MyBank, Satispay…
    const brand = String(p.brand || '').toLowerCase();
    order.payment = { method: /visa|master|maestro|amex|american|diners|jcb|carta|card|vpay/.test(brand) ? 'card' : (p.brand || null), date: new Date() };
    console.log('Order', order.number, 'nexi', orderId, 'buyerEmail:', buyerEmail || 'NONE', '— owner:', W.OWNER_EMAIL);
    const summaryHtml = W.orderEmailHtml(order, total, md);
    if (buyerEmail) {
      try {
        await W.sendEmail({ to: buyerEmail, subject: `Conferma ordine #${order.number} — Tshirt Shop Online`, html: summaryHtml });
        console.log('Buyer confirmation sent to', buyerEmail);
      } catch (e) { console.error('Buyer confirmation FAILED for nexi', orderId, e); }
    }
    let invoice = null, inv = { attachment: null, html: '' };
    try {
      const CI = require('./create-invoice');
      invoice = await CI.prepareInvoiceDraft(order);
      inv = CI.draftEmailParts(invoice);
    } catch (e) { console.error('Invoice draft FAILED for', order.number, e); }
    let ups = { attachment: null, html: '' };
    try { const U = require('./_ups-csv'); ups = U.upsEmailParts(U.buildUpsCsv(order, md, { email: buyerEmail })); }
    catch (e) { console.error('UPS file FAILED for', order.number, e); }
    let ddt = { attachment: null, html: '' };
    try { const D = require('./_ddt'); ddt = D.ddtEmailParts(D.buildDdtHtml(order, md)); }
    catch (e) { console.error('DDT FAILED for', order.number, e); }
    let design = { attachments: [], urls: [] };
    try { design = await W.collectDesignFiles(md.design_ref); } catch (e) { console.error('Design files lookup FAILED', e); }
    try {
      await W.sendEmail({
        to: W.OWNER_EMAIL,
        subject: `Nuovo ordine #${order.number} (Nexi) — € ${total.toFixed(2)}${design.attachments.length ? ` — ${design.attachments.length} file` : ''}${invoice ? ` — bozza fattura ${invoice.invoiceNumber}` : ''}`,
        html: summaryHtml.replace('</body></html>', W.ownerBlockHtml(order, buyerEmail, { metadata: md }, design.attachments.length) + inv.html + ddt.html + ups.html + '</body></html>'),
        attachments: [...design.attachments, inv.attachment, ddt.attachment, ups.attachment].filter(Boolean),
      });
      console.log('Owner notification sent to', W.OWNER_EMAIL, 'with', design.attachments.length, 'file(s)');
      const { put, del } = require('@vercel/blob');
      await put(`nexi-orders/${orderId}.sent`, new Date().toISOString(), { access: 'public', addRandomSuffix: true });
      if (design.urls.length) { try { await del(design.urls); } catch (e) { console.error('Blob delete failed', e); } }
    } catch (e) { console.error('Owner notification FAILED to', W.OWNER_EMAIL, e); }
  } catch (err) {
    console.error('Nexi order processing failed for', orderId, err);
  }
  res.status(200).send('OK');
};
