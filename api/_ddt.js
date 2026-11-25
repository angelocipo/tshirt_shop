// DDT (documento di trasporto, DPR 472/1996) as an A4 PDF, attached to the owner email.
// Number left blank (filled by hand, like the invoice). Mittente = shop, or the customer's own sender
// when they chose neutral shipping (md.sender_use === '1').
// Requires the "pdf-lib" dependency (package.json). Standard Helvetica: text is mapped to WinAnsi.

const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

// Absolute URL: the function runs on Vercel, the logo is fetched from the live site. Hidden on neutral shipping.
const LOGO = 'https://www.tshirt-shop.online/img/logo-tshirt-shop.png';
const SHOP = { name: 'Tshirt Shop Online by Printing Italy di Angelo Cipolla', l1: 'Via Lorenzo Bonincontri 26', l2: '00147 Roma (RM)', vat: 'P.IVA IT02452700590' };

const INK = rgb(0.114, 0.122, 0.125), MUTED = rgb(0.333, 0.349, 0.361), BLUE = rgb(0.239, 0.373, 0.502);
const LINE = rgb(0.604, 0.663, 0.722), FILL = rgb(0.902, 0.922, 0.945), RULE = rgb(0.831, 0.839, 0.851);

async function fetchLogo() {
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 3000);
    const r = await fetch(LOGO, { signal: ctl.signal });
    clearTimeout(t);
    return r.ok ? new Uint8Array(await r.arrayBuffer()) : null;
  } catch (e) { return null; }
}

// Pieces in a line: the cart sends one line per model with "10pz" in the description.
function pieces(l) {
  const m = /(\d+)\s*pz/i.exec(String(l.description || ''));
  return m ? parseInt(m[1], 10) : (Number(l.quantity) || 1);
}

async function buildDdtPdf(order, md = {}) {
  const c = order.customer || {};
  const d = order.date || new Date();
  const date = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
  const neutral = md.sender_use === '1';
  const from = neutral
    ? { name: md.sender_company, l1: md.sender_address, l2: [md.sender_cap, md.sender_city].filter(Boolean).join(' '), vat: md.sender_phone ? `Tel. ${md.sender_phone}` : '' }
    : SHOP;
  const dest = { name: c.name, l1: c.address, l2: `${[c.cap, c.city].filter(Boolean).join(' ')}${c.province ? ` (${c.province})` : ''}${c.country && c.country !== 'IT' ? ` - ${c.country}` : ''}`, vat: c.vatNumber ? `P.IVA ${c.vatNumber}` : (c.fiscalCode ? `C.F. ${c.fiscalCode}` : '') };
  const ship = md.ship_same === '0'
    ? { name: md.ship_name, l1: md.ship_address, l2: [md.ship_cap, md.ship_city].filter(Boolean).join(' '), vat: md.ship_phone ? `Tel. ${md.ship_phone}` : '' }
    : null;
  const kg = process.env.UPS_DEFAULT_WEIGHT_KG || '2';

  const pdf = await PDFDocument.create();
  pdf.setTitle(`DDT ordine ${order.number}`);
  pdf.setAuthor(neutral ? (md.sender_company || '') : 'Printing Italy di Angelo Cipolla');
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // WinAnsi only: typographic characters to ASCII, anything else the font can't encode is dropped.
  const safe = (s, f = reg) => {
    const t = String(s ?? '').replace(/[‒-―−]/g, '-').replace(/[‘’‚]/g, "'")
      .replace(/[“”„]/g, '"').replace(/…/g, '...').replace(/×/g, 'x').replace(/[  -​ ]/g, ' ');
    let out = '';
    for (const ch of t) { try { f.encodeText(ch); out += ch; } catch (e) { /* skip */ } }
    return out;
  };
  const wrap = (s, f, size, max) => {
    const words = safe(s, f).split(/\s+/).filter(Boolean);
    const lines = []; let cur = '';
    for (const w of words) {
      const next = cur ? `${cur} ${w}` : w;
      if (f.widthOfTextAtSize(next, size) <= max) cur = next;
      else { if (cur) lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines.length ? lines : [''];
  };

  const W = 595.28, H = 841.89, M = 42, CW = W - 2 * M;
  let page = pdf.addPage([W, H]);
  const text = (s, x, y, size = 10, f = reg, color = INK) => page.drawText(safe(s, f), { x, y, size, font: f, color });
  const textR = (s, xr, y, size = 10, f = reg, color = INK) => { const t = safe(s, f); page.drawText(t, { x: xr - f.widthOfTextAtSize(t, size), y, size, font: f, color }); };

  let y = H - M;
  if (!neutral) {
    const bytes = await fetchLogo();
    if (bytes) {
      try {
        const img = await pdf.embedPng(bytes);
        const h = 46, w = img.width * h / img.height;
        page.drawImage(img, { x: M, y: y - h, width: w, height: h });
        y -= h + 16;
      } catch (e) { /* logo optional */ }
    }
  }

  // Header: title left, number/date right.
  text('DOCUMENTO DI TRASPORTO', M, y - 24, 24, bold);
  text(`DPR 472/1996 - Rif. ordine ${order.number}`, M, y - 40, 10, reg, MUTED);
  textR('N.', W - M - 100, y - 18, 10, reg, MUTED);
  page.drawLine({ start: { x: W - M - 92, y: y - 20 }, end: { x: W - M, y: y - 20 }, thickness: 0.8, color: INK });
  textR('Data', W - M - 100, y - 36, 10, reg, MUTED);
  textR(date, W - M, y - 36, 10);
  y -= 52;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1.5, color: rgb(0.349, 0.502, 0.651) });
  y -= 18;

  // Parties.
  const parties = [['MITTENTE', from], ['DESTINATARIO', dest]];
  if (ship) parties.push(['LUOGO DI DESTINAZIONE', ship]);
  const gap = 14, bw = (CW - gap * (parties.length - 1)) / parties.length;
  const blocks = parties.map(([label, p]) => {
    const rows = [];
    wrap(p.name, bold, 11, bw - 24).forEach((t) => rows.push([t, bold, 11, INK]));
    [p.l1, p.l2].filter(Boolean).forEach((v) => wrap(v, reg, 9.5, bw - 24).forEach((t) => rows.push([t, reg, 9.5, INK])));
    if (p.vat) wrap(p.vat, reg, 9.5, bw - 24).forEach((t) => rows.push([t, reg, 9.5, MUTED]));
    return { label, rows };
  });
  const bh = Math.max(92, ...blocks.map((b) => 34 + b.rows.length * 13 + 10));
  blocks.forEach((b, i) => {
    const x = M + i * (bw + gap);
    page.drawRectangle({ x, y: y - bh, width: bw, height: bh, borderColor: LINE, borderWidth: 0.8 });
    text(b.label, x + 12, y - 18, 8, bold, BLUE);
    let ry = y - 34;
    b.rows.forEach(([t, f, s, col]) => { page.drawText(t, { x: x + 12, y: ry, size: s, font: f, color: col }); ry -= 13; });
  });
  y -= bh + 24;

  // Goods table.
  const qtyW = 70;
  const drawHead = () => {
    page.drawRectangle({ x: M, y: y - 20, width: CW, height: 20, color: FILL });
    text('DESCRIZIONE DEI BENI', M + 10, y - 14, 8, bold, BLUE);
    textR('Q.TA (PZ)', W - M - 10, y - 14, 8, bold, BLUE);
    y -= 20;
  };
  drawHead();
  for (const l of order.lines || []) {
    const lines = wrap(l.description, reg, 9.5, CW - qtyW - 30);
    const rh = 10 + lines.length * 12.5 + 4;
    if (y - rh < 230) { page = pdf.addPage([W, H]); y = H - M; drawHead(); }
    let ty = y - 16;
    lines.forEach((t) => { page.drawText(t, { x: M + 10, y: ty, size: 9.5, font: reg, color: INK }); ty -= 12.5; });
    textR(String(pieces(l)), W - M - 10, y - 16, 9.5);
    y -= rh;
    page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 0.6, color: RULE });
  }
  const totalPz = (order.lines || []).reduce((t, l) => t + pieces(l), 0);
  textR(`Totale pezzi: ${totalPz}`, W - M - 10, y - 16, 9.5, bold);
  y -= 40;

  // Transport fields, 4 per row, then signatures.
  const field = (k, v, x, w, fy) => {
    page.drawLine({ start: { x, y: fy }, end: { x: x + w, y: fy }, thickness: 0.8, color: INK });
    text(k.toUpperCase(), x, fy - 12, 7, bold, MUTED);
    if (v) text(v, x, fy - 26, 10);
  };
  const grid = (items, cols, fy) => {
    const g = 14, w = (CW - g * (cols - 1)) / cols;
    items.forEach(([k, v], i) => field(k, v, M + (i % cols) * (w + g), w, fy - Math.floor(i / cols) * 44));
  };
  grid([
    ['Causale del trasporto', 'Vendita'], ['Aspetto dei beni', 'Scatola'], ['N. colli', '1'], ['Peso indicativo', `${kg} kg`],
    ['Trasporto a cura di', 'Vettore'], ['Vettore', 'UPS'], ['Porto', 'Franco'], ['Data e ora ritiro', ''],
  ], 4, y);
  y -= 44 * 2 + 40;
  grid([['Firma mittente', ''], ['Firma vettore', ''], ['Firma destinatario', '']], 3, y);

  const bytes = await pdf.save();
  return { pdf: bytes, filename: `DDT_${String(order.number).replace(/[^A-Za-z0-9-]/g, '')}.pdf` };
}

function ddtEmailParts(r) {
  return {
    attachment: { filename: r.filename, content: Buffer.from(r.pdf).toString('base64') },
    html: `<div style="margin-top:16px;font-family:sans-serif;font-size:14px"><strong>DDT</strong>: ${r.filename} allegato (PDF). Aprilo, scrivi il numero e stampalo.</div>`,
  };
}

module.exports = { buildDdtPdf, ddtEmailParts };
