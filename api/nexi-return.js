// Vercel serverless function — GET/POST /api/nexi-return
// Where Nexi sends the customer back. Verifies the MAC, then redirects:
// esito OK → grazie.html (same reference as the emails), anything else → checkout with an error.
// No emails here: they are sent by /api/nexi-webhook.
const NX = require('./_nexi');

module.exports = (req, res) => {
  const p = NX.parseParams(req);
  const ok = NX.validCod(p.codTrans) && NX.responseMacOk(p) && p.esito === 'OK';
  console.log('Nexi return', p.codTrans || 'NONE', 'esito', p.esito || '?', ok ? 'OK' : 'NOT OK');
  const to = ok
    ? `/grazie.html?session_id=${encodeURIComponent(p.codTrans)}&via=nexi`
    : `/checkout.html?cart=1&nexi=rifiutato`;
  res.statusCode = 302;
  res.setHeader('Location', to);
  res.end();
};
