// Nexi XPay "codice base" (Alias + Chiave MAC). Shared by create-nexi-payment, nexi-return, nexi-webhook.
// Env: NEXI_ALIAS, NEXI_MAC_KEY (never in code). NEXI_ENV = "test" → collaudo, otherwise production.
const crypto = require('crypto');

const ENDPOINT = process.env.NEXI_ENV === 'test'
  ? 'https://int-ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet'
  : 'https://ecommerce.nexi.it/ecomm/ecomm/DispatcherServlet';

const sha1 = (s) => crypto.createHash('sha1').update(s, 'utf8').digest('hex');

// Request MAC: codTrans, divisa, importo + key.
function requestMac(codTrans, divisa, importo) {
  return sha1(`codTrans=${codTrans}divisa=${divisa}importo=${importo}${process.env.NEXI_MAC_KEY}`);
}

// Response MAC (return url and urlpost): codTrans, esito, importo, divisa, data, orario, codAut + key.
function responseMacOk(p) {
  if (!p || !p.mac || !process.env.NEXI_MAC_KEY) return false;
  const s = `codTrans=${p.codTrans || ''}esito=${p.esito || ''}importo=${p.importo || ''}divisa=${p.divisa || ''}data=${p.data || ''}orario=${p.orario || ''}codAut=${p.codAut || ''}${process.env.NEXI_MAC_KEY}`;
  const a = Buffer.from(sha1(s)), b = Buffer.from(String(p.mac).toLowerCase());
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function parseParams(req) {
  let b = req.body;
  if (typeof b === 'string') { const o = {}; new URLSearchParams(b).forEach((v, k) => { o[k] = v; }); b = o; }
  return Object.assign({}, req.query || {}, b && typeof b === 'object' ? b : {});
}

const validCod = (c) => typeof c === 'string' && /^TS[A-Z0-9]{6,26}$/.test(c);

module.exports = { ENDPOINT, requestMac, responseMacOk, parseParams, validCod };
