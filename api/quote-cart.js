// POST /api/quote-cart — Body: { items: [orderBody, ...] }
// Restituisce il prezzo di ogni riga calcolato dal listino server, con le righe
// dello stesso modello che fanno quantità insieme. Nessun importo arriva dal client.
const { priceCart } = require('./_price-item');

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  try {
    const items = Array.isArray((req.body || {}).items) ? req.body.items.slice(0, 20) : [];
    if (!items.length) { res.status(200).json({ rows: [], subtotal: 0 }); return; }
    const priced = priceCart(items);
    const rows = priced.map((r) => ({
      productId: r.productId,
      description: r.description,
      groupQty: r.groupQty,
      price: Math.round(r.unitAmountCents) / 100,
    }));
    const subtotal = Math.round(rows.reduce((t, r) => t + r.price, 0) * 100) / 100;
    res.status(200).json({ rows, subtotal });
  } catch (err) {
    console.error(err);
    if (err && err.status) { res.status(err.status).json({ error: err.message }); return; }
    res.status(500).json({ error: 'Errore nel calcolo del carrello' });
  }
};
