// Vercel serverless function — POST /api/create-nexi-payment
// Same body as /api/create-checkout-session. Prices are recomputed SERVER-SIDE, the order data
// is parked in Vercel Blob, then { url } to the Nexi XPay payment page (Alias + MAC) is returned.
// Env: NEXI_ALIAS, NEXI_MAC_KEY, optional NEXI_ENV=test, BLOB_READ_WRITE_TOKEN.

const crypto = require('crypto');
const { priceCart } = require('./_price-item');
const NX = require('./_nexi');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!process.env.NEXI_ALIAS || !process.env.NEXI_MAC_KEY) { res.status(500).json({ error: 'NEXI_ALIAS / NEXI_MAC_KEY non configurate su Vercel (Environment Variables → Redeploy).' }); return; }
  if (!process.env.BLOB_READ_WRITE_TOKEN) { res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN mancante.' }); return; }

  try {
    const { productId, tierIndex, sizeIndex, formula, deliveryIndex, items, customer, shipping, sender, shippingFee, shippingZone, designRef, designFiles, designLink, customerNote } = req.body || {};
    const cart = Array.isArray(items) && items.length ? items.slice(0, 20) : [{ productId, tierIndex, sizeIndex, formula, deliveryIndex }];
    const priced = priceCart(cart);
    const origin = req.headers.origin || `https://${req.headers.host}`;

    const lines = priced.map((p) => ({ description: p.description, quantity: 1, unitPrice: p.unitAmountCents / 100, vatRate: 22 }));
    const shipFee = shippingZone === 'ue' ? 25 : Math.max(0, Number(shippingFee) || 0);
    if (shipFee > 0) lines.push({ description: shippingZone === 'ue' ? 'Spedizione UE' : 'Spedizione Italia', quantity: 1, unitPrice: shipFee, vatRate: 22 });
    const amountCents = Math.round(lines.reduce((t, l) => t + l.unitPrice * l.quantity, 0) * 100);
    if (amountCents <= 0) { res.status(400).json({ error: 'Importo non valido' }); return; }

    // Same keys as the Stripe metadata, so the confirmation emails are built identically.
    const c = customer || {}, sh = shipping || {}, sn = sender || {};
    const md = {
      inv_type: c.invType || 'privato', inv_name: c.name || '', inv_email: c.email || '', inv_company: c.company || '',
      inv_vat: c.vat || '', inv_cf: c.cf || '', inv_pec: c.pec || '', inv_sdi: c.sdi || '',
      inv_address: c.address || '', inv_city: c.city || '', inv_cap: c.cap || '', inv_country: c.country || 'IT',
      ship_same: sh.sameAsBilling ? '1' : '0',
      sender_use: sn.use ? '1' : '0',
      shipping_fee: String(shipFee), shipping_zone: shippingZone || '',
    };
    if (!sh.sameAsBilling) Object.assign(md, { ship_name: sh.name || '', ship_phone: sh.phone || '', ship_address: sh.address || '', ship_city: sh.city || '', ship_cap: sh.cap || '', ship_notes: (sh.notes || '').slice(0, 490) });
    if (sn.use) Object.assign(md, { sender_company: sn.company || '', sender_phone: sn.phone || '', sender_address: sn.address || '', sender_city: sn.city || '', sender_cap: sn.cap || '' });
    if (designRef) md.design_ref = String(designRef).slice(0, 490);
    if (Array.isArray(designFiles) && designFiles.length) md.design_files = designFiles.join(', ').slice(0, 490);
    if (designLink && /^https?:\/\//i.test(String(designLink))) md.design_link = String(designLink).slice(0, 490);
    if (customerNote) md.customer_note = String(customerNote).slice(0, 490);

    // Max 27 chars, letters/digits only → safe for Nexi and unguessable.
    const orderId = 'TS' + Date.now().toString(36).toUpperCase() + crypto.randomBytes(6).toString('hex').toUpperCase();

    const { put } = require('@vercel/blob');
    await put(`nexi-orders/${orderId}.json`, JSON.stringify({ orderId, amountCents, lines, md, createdAt: new Date().toISOString() }), {
      access: 'public', addRandomSuffix: true, contentType: 'application/json',
    });

    const importo = String(amountCents);
    const p = new URLSearchParams({
      alias: process.env.NEXI_ALIAS,
      importo, divisa: 'EUR', codTrans: orderId,
      url: `${origin}/api/nexi-return`,
      url_back: `${origin}/checkout.html?cart=1&nexi=annullato`,
      urlpost: `${origin}/api/nexi-webhook`,
      languageId: 'ITA',
      descrizione: ('Tshirt Shop Online ordine ' + orderId).slice(0, 2000),
      mac: NX.requestMac(orderId, 'EUR', importo),
    });
    if (md.inv_email) p.set('mail', md.inv_email);

    console.log('Nexi order created', orderId, '€', (amountCents / 100).toFixed(2), 'buyer', md.inv_email || 'NONE');
    res.status(200).json({ url: `${NX.ENDPOINT}?${p.toString()}` });
  } catch (err) {
    console.error('create-nexi-payment', err);
    if (err && err.status) { res.status(err.status).json({ error: err.message }); return; }
    res.status(500).json({ error: 'Errore nella creazione del pagamento Nexi' });
  }
};
