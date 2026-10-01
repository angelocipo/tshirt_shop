// Receives ONE design file as a raw binary POST body and PARKS it in Vercel Blob under
// designs/<ref>/. No email is sent here: the file is attached to the owner's order email by
// api/stripe-webhook.js only when the payment completes. Unpaid uploads expire after 7 days.
//
//   POST /api/upload-design?ref=DES-AB12CD&name=logo.pdf
//   Content-Type: application/octet-stream
//   body: raw file bytes
//
// Content-Type is deliberately NOT application/json: the Vercel Node runtime then leaves
// the request stream untouched so we can read the bytes without base64 inflation.
// Requires BLOB_READ_WRITE_TOKEN (created automatically when a Blob store is connected).
const { put, list, del } = require('@vercel/blob');
const EXPIRE_MS = 7 * 24 * 3600 * 1000;

const MAX_BYTES = 4 * 1024 * 1024; // Vercel serverless request bodies cap out at 4.5 MB — hard platform limit
const ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'pdf', 'ai', 'eps', 'psd', 'tif', 'tiff', 'zip'];

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BYTES) { reject(Object.assign(new Error('too-large'), { code: 'too-large' })); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function safeName(raw) {
  return String(raw || 'design')
    .replace(/[\\/]/g, '_')
    .replace(/[^\w.\-À-ÿ ]/g, '')
    .slice(-120) || 'design';
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const url = new URL(req.url, 'http://localhost');
  const ref = safeName(url.searchParams.get('ref') || 'DES-000000');
  const filename = safeName(url.searchParams.get('name') || 'design');
  const product = (url.searchParams.get('product') || '').slice(0, 120);
  const ext = (filename.split('.').pop() || '').toLowerCase();

  if (!ALLOWED_EXT.includes(ext)) {
    res.status(415).json({ error: `Formato .${ext} non supportato. Usa ${ALLOWED_EXT.join(', ')}.` });
    return;
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    res.status(500).json({ error: 'Servizio di upload non configurato (BLOB_READ_WRITE_TOKEN).' });
    return;
  }

  let buf;
  try {
    buf = await readBody(req);
  } catch (err) {
    if (err.code === 'too-large') {
      res.status(413).json({ error: 'File troppo grande (max 4 MB). Inviacelo via email dopo l\'ordine.' });
      return;
    }
    res.status(400).json({ error: 'Lettura del file non riuscita.' });
    return;
  }
  if (!buf || !buf.length) { res.status(400).json({ error: 'File vuoto.' }); return; }

  try {
    await put(`designs/${ref}/${filename}`, buf, {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/octet-stream',
    });
  } catch (err) {
    console.error('upload-design: Blob put failed', err);
    res.status(502).json({ error: 'Invio del file non riuscito, riprova.' });
    return;
  }

  // Housekeeping: drop files from carts that never reached payment. Never blocks the reply.
  try {
    const { blobs } = await list({ prefix: 'designs/', limit: 1000 });
    const old = blobs.filter((b) => Date.now() - new Date(b.uploadedAt).getTime() > EXPIRE_MS).map((b) => b.url);
    if (old.length) await del(old);
  } catch (err) {
    console.error('upload-design: cleanup failed', err);
  }

  res.status(200).json({ ok: true, ref, filename, bytes: buf.length });
};
