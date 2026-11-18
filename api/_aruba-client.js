// Aruba "Fatturazione Elettronica" REST client (API v1: https://fatturazioneelettronica.aruba.it/apidoc/docs.html).
// Available only to Premium accounts, or base accounts delegated to a Premium one.
// Uses the DEMO environment unless ARUBA_ENV=production.

const ENV = {
  demo: { auth: 'https://demoauth.fatturazioneelettronica.aruba.it', ws: 'https://demows.fatturazioneelettronica.aruba.it' },
  production: { auth: 'https://auth.fatturazioneelettronica.aruba.it', ws: 'https://ws.fatturazioneelettronica.aruba.it' },
};
const env = () => ENV[process.env.ARUBA_ENV === 'production' ? 'production' : 'demo'];

// Credentials go in the form-encoded body (Aruba blocks them in the query string). Token lasts 30 min.
async function arubaSignIn() {
  const res = await fetch(`${env().auth}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: new URLSearchParams({ grant_type: 'password', username: process.env.ARUBA_USERNAME || '', password: process.env.ARUBA_PASSWORD || '' }).toString(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) throw new Error(`Aruba signin failed: ${res.status} ${data.error_description || data.error || ''}`);
  return data.access_token;
}

async function arubaUserInfo(token) {
  const res = await fetch(`${env().auth}/auth/userInfo`, { headers: { Authorization: `Bearer ${token}` } });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Aruba userInfo failed: ${res.status} ${JSON.stringify(data)}`);
  return data;
}

// Sends the unsigned XML: Aruba signs it and forwards it to SDI. errorCode "0000" = accepted.
async function arubaUploadInvoice(token, xml) {
  const res = await fetch(`${env().ws}/services/invoice/upload`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json;charset=UTF-8', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ dataFile: Buffer.from(xml, 'utf8').toString('base64'), credential: '', domain: '' }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || (body.errorCode && body.errorCode !== '0000')) {
    throw new Error(`Aruba upload failed: ${res.status} ${body.errorCode || ''} ${body.errorDescription || JSON.stringify(body)}`);
  }
  return body; // { uploadFileName, errorCode, errorDescription }
}

module.exports = { arubaSignIn, arubaUserInfo, arubaUploadInvoice };
