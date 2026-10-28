// DDT (documento di trasporto, DPR 472/1996) as a printable A4 HTML file, attached to the owner email.
// Number left blank (filled by hand, like the invoice). Mittente = shop, or the customer's own sender
// when they chose neutral shipping (md.sender_use === '1').

const h = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Absolute URL: the DDT is opened from the email, outside the site. Hidden on neutral shipping.
const LOGO = 'https://tshirt-shop.online/img/logo-tshirt-shop.webp';
const SHOP = { name: 'Tshirt Shop Online by Printing Italy di Angelo Cipolla', l1: 'Via Lorenzo Bonincontri 26', l2: '00147 Roma (RM)', vat: 'P.IVA IT02452700590' };

function buildDdtHtml(order, md = {}) {
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
  const rows = (order.lines || []).map((l) => `<tr><td style="padding:10px 12px;border-bottom:1px solid #d4d6d9;">${h(l.description)}</td><td style="padding:10px 12px;border-bottom:1px solid #d4d6d9;text-align:right;white-space:nowrap;">${h(l.quantity)}</td></tr>`).join('');
  const party = (label, p) => `<div style="position:relative;border:1px solid #9aa9b8;padding:14px 16px;min-height:96px;">
      ${['top:-5px;left:-5px', 'top:-5px;right:-5px', 'bottom:-5px;left:-5px', 'bottom:-5px;right:-5px'].map((pos) => `<span style="position:absolute;${pos};font:400 12px/10px monospace;color:#5980a6;">+</span>`).join('')}
      <div style="font:600 11px/1 Barlow,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#3d5f80;margin-bottom:8px;">${label}</div>
      <div style="font:700 16px/1.3 'Barlow Condensed',Arial Narrow,sans-serif;">${h(p.name)}</div>
      <div>${h(p.l1)}</div><div>${h(p.l2)}</div><div style="color:#55595c;">${h(p.vat)}</div></div>`;
  const field = (k, v) => `<div style="border-top:1px solid #1d1f20;padding-top:6px;"><div style="font:600 10px/1 Barlow,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#55595c;margin-bottom:6px;">${k}</div><div style="min-height:18px;">${v}</div></div>`;

  const html = `<!DOCTYPE html><html lang="it"><head><meta charset="utf-8"><title>DDT ordine ${h(order.number)}</title>
<link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;600&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet">
<style>@page{size:A4;margin:14mm}body{margin:0;background:#f2f2f3}@media print{body{background:#fff}}</style></head>
<body><div style="box-sizing:border-box;max-width:794px;margin:24px auto;background:#fff;padding:40px 44px;font:400 13px/1.45 Barlow,Arial,sans-serif;color:#1d1f20;">
  ${neutral ? '' : `<img src="${LOGO}" alt="Tshirt Shop Online" style="display:block;height:64px;width:auto;margin-bottom:20px;">`}
  <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:24px;border-bottom:2px solid #5980a6;padding-bottom:14px;">
    <div><div style="font:700 34px/1 'Barlow Condensed',Arial Narrow,sans-serif;letter-spacing:.02em;text-transform:uppercase;">Documento di trasporto</div>
      <div style="color:#55595c;margin-top:4px;">DPR 472/1996 · Rif. ordine ${h(order.number)}</div></div>
    <div style="display:grid;grid-template-columns:auto auto;gap:4px 16px;text-align:right;">
      <span style="color:#55595c;">N.</span><span style="border-bottom:1px solid #1d1f20;min-width:90px;">&nbsp;</span>
      <span style="color:#55595c;">Data</span><span>${date}</span></div>
  </div>
  <div style="display:grid;grid-template-columns:repeat(${ship ? 3 : 2},minmax(0,1fr));gap:18px;margin-top:26px;">
    ${party('Mittente', from)}${party('Destinatario', dest)}${ship ? party('Luogo di destinazione', ship) : ''}
  </div>
  <table style="width:100%;border-collapse:collapse;margin-top:28px;">
    <thead><tr><th style="text-align:left;padding:8px 12px;background:#e6ebf1;font:600 11px/1 Barlow,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#3d5f80;">Descrizione dei beni</th>
    <th style="text-align:right;padding:8px 12px;background:#e6ebf1;font:600 11px/1 Barlow,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#3d5f80;width:80px;">Q.tà</th></tr></thead>
    <tbody>${rows}</tbody></table>
  <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-top:30px;">
    ${field('Causale del trasporto', 'Vendita')}${field('Aspetto dei beni', 'Scatola')}${field('N. colli', '1')}${field('Peso indicativo', `${h(kg)} kg`)}
    ${field('Trasporto a cura di', 'Vettore')}${field('Vettore', 'UPS')}${field('Porto', 'Franco')}${field('Data e ora ritiro', '&nbsp;')}
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px;margin-top:56px;">
    ${field('Firma mittente', '&nbsp;')}${field('Firma vettore', '&nbsp;')}${field('Firma destinatario', '&nbsp;')}
  </div>
</div></body></html>`;
  return { html, filename: `DDT_${String(order.number).replace(/[^A-Za-z0-9-]/g, '')}.html` };
}

function ddtEmailParts(r) {
  return {
    attachment: { filename: r.filename, content: Buffer.from(r.html, 'utf8').toString('base64') },
    html: `<div style="margin-top:16px;font-family:sans-serif;font-size:14px"><strong>DDT</strong>: ${r.filename} allegato. Aprilo, scrivi il numero e stampalo.</div>`,
  };
}

module.exports = { buildDdtHtml, ddtEmailParts };
