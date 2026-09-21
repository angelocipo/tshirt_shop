// Vercel serverless function — POST /api/create-checkout-session
// Body: { productId: string, tierIndex?: number, sizeIndex?: number, formula?: {...} }
// Computes the price SERVER-SIDE from _pricing-data.js (never trusts a client-sent amount),
// creates a Stripe Checkout Session, and returns { url } to redirect the browser to.

const Stripe = require('stripe');
const { priceCart } = require('./_price-item');

// Lazy init so a missing key returns a clean JSON error instead of crashing the
// function at module load (newer stripe throws in the constructor when key is empty).
let stripe = null;
function getStripe() {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripe) stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  return stripe;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const stripe = getStripe();
  if (!stripe) {
    res.status(500).json({ error: 'STRIPE_SECRET_KEY non configurata su Vercel (Environment Variables → Production → redeploy).' });
    return;
  }

  try {
    const { productId, tierIndex, sizeIndex, formula, deliveryIndex, items, customer, shipping, sender, shippingFee, shippingZone, designRef, designFiles, designLink, customerNote } = req.body || {};
    const cart = Array.isArray(items) && items.length
      ? items.slice(0, 20)
      : [{ productId, tierIndex, sizeIndex, formula, deliveryIndex }];
    const priced = priceCart(cart);

    const origin = req.headers.origin || `https://${req.headers.host}`;

    const lineItems = priced.map((p) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: p.description },
        unit_amount: p.unitAmountCents,
      },
      quantity: 1,
    }));
    // Stripe's left-hand summary only renders the line items, so the billing holder and the
    // custom sender are folded into the first item's description — otherwise the customer
    // never sees them again between our checkout page and the payment page.
    {
      const cc = customer || {};
      const sn2 = sender || {};
      const bits = [];
      const holder = cc.invType === 'azienda' ? (cc.company || cc.name) : cc.name;
      if (holder) bits.push(`Fattura a: ${holder}${cc.vat ? ' — P.IVA ' + cc.vat : (cc.cf ? ' — CF ' + cc.cf : '')}`);
      if (sn2.use && sn2.company) bits.push(`Mittente pacco: ${sn2.company}${sn2.city ? ' (' + sn2.city + ')' : ''}`);
      if (designRef) bits.push(`Rif. file: ${designRef}`);
      if (bits.length) lineItems[0].price_data.product_data.description = bits.join(' · ').slice(0, 480);
    }
    const shipFee = Math.max(0, Number(shippingFee) || 0);
    if (shipFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'eur',
          product_data: { name: 'Spedizione Italia' },
          unit_amount: Math.round(shipFee * 100),
        },
        quantity: 1,
      });
    }

    // Flatten customer/shipping/sender data (collected on our own checkout page) into
    // Stripe session metadata — read back in stripe-webhook.js to build the FatturaPA
    // invoice and to know where/who the shipment should show as sender.
    const metadata = {};
    const c = customer || {};
    metadata.inv_type = c.invType || 'privato';
    metadata.inv_name = c.name || '';
    metadata.inv_email = c.email || '';
    metadata.inv_company = c.company || '';
    metadata.inv_vat = c.vat || '';
    metadata.inv_cf = c.cf || '';
    metadata.inv_pec = c.pec || '';
    metadata.inv_sdi = c.sdi || '';
    metadata.inv_address = c.address || '';
    metadata.inv_city = c.city || '';
    metadata.inv_cap = c.cap || '';
    metadata.inv_country = c.country || 'IT';

    const sh = shipping || {};
    if (sh.sameAsBilling) {
      metadata.ship_same = '1';
    } else {
      metadata.ship_same = '0';
      metadata.ship_name = sh.name || '';
      metadata.ship_phone = sh.phone || '';
      metadata.ship_address = sh.address || '';
      metadata.ship_city = sh.city || '';
      metadata.ship_cap = sh.cap || '';
      metadata.ship_notes = (sh.notes || '').slice(0, 490);
    }

    const sn = sender || {};
    metadata.sender_use = sn.use ? '1' : '0';
    if (sn.use) {
      metadata.sender_company = sn.company || '';
      metadata.sender_phone = sn.phone || '';
      metadata.sender_address = sn.address || '';
      metadata.sender_city = sn.city || '';
      metadata.sender_cap = sn.cap || '';
    }
    if (designRef) metadata.design_ref = String(designRef).slice(0, 40);
    if (Array.isArray(designFiles) && designFiles.length) metadata.design_files = designFiles.join(', ').slice(0, 490);
    if (designLink && /^https?:\/\//i.test(String(designLink))) metadata.design_link = String(designLink).slice(0, 490);
    if (customerNote) metadata.customer_note = String(customerNote).slice(0, 490);
    metadata.shipping_fee = String(shipFee);
    metadata.shipping_zone = shippingZone || '';

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: c.email || undefined,
      line_items: lineItems,
      metadata,
      success_url: `${origin}/grazie.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
    });

    res.status(200).json({ url: session.url });
  } catch (err) {
    console.error(err);
    if (err && err.status) { res.status(err.status).json({ error: err.message }); return; }
    res.status(500).json({ error: 'Errore nella creazione del pagamento' });
  }
};
