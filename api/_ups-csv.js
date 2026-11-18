// UPS Batch File Shipping (ups.com → Spedizione → Batch File Shipping): one row per shipment,
// NO header row, every delimiter present even for empty fields. Semicolon-separated (SSV) so
// Italian addresses with commas need no quoting. Column order = UPS batch template (33 = Reference 1).
// Weight/dimensions aren't known by the site: defaults from env, to be corrected in UPS before printing.

const clean = (s, max) => String(s ?? '').replace(/[;\r\n"]/g, ' ').replace(/\s+/g, ' ').trim()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x20-\x7E]/g, '').slice(0, max);

// md = Stripe/Nexi metadata, order = webhook order object, extra = { phone, email }
function buildUpsCsv(order, md, extra = {}) {
  const warnings = [];
  const c = order.customer || {};
  const same = md.ship_same !== '0';
  const to = same
    ? { name: c.name, company: c.isCompany ? c.name : '', address: c.address, city: c.city, cap: c.cap, province: c.province, country: c.country, phone: extra.phone }
    : { name: md.ship_name, company: '', address: md.ship_address, city: md.ship_city, cap: md.ship_cap, province: '', country: same ? c.country : (md.shipping_zone === 'ue' ? '' : 'IT'), phone: md.ship_phone || extra.phone };
  if (!to.country) warnings.push('Paese di destinazione mancante (spedizione UE): da inserire in UPS.');
  if (!to.phone) warnings.push('Telefono destinatario mancante.');
  if (!to.address || !to.cap || !to.city) warnings.push('Indirizzo di spedizione incompleto.');

  const kg = process.env.UPS_DEFAULT_WEIGHT_KG || '2';
  const [L, W, H] = (process.env.UPS_DEFAULT_DIMS_CM || '40x30x10').split('x');
  warnings.push(`Peso e misure di default (${kg} kg, ${L}x${W}x${H} cm): correggili in UPS prima di stampare.`);

  const cols = new Array(35).fill('');
  cols[0] = clean(to.name, 35);                       // Contact Name
  cols[1] = clean(to.company || to.name, 35);         // Company or Name
  cols[2] = clean(to.country, 2).toUpperCase();       // Country (ISO 2)
  cols[3] = clean(to.address, 35);                    // Address 1
  cols[6] = clean(to.city, 30);                       // City
  cols[7] = clean(to.province, 5);                    // State/Prov/Other
  cols[8] = clean(to.cap, 10);                        // Postal Code
  cols[9] = clean(to.phone, 15);                      // Telephone
  cols[11] = c.isCompany && same ? '0' : '1';         // Residential Ind
  cols[12] = clean(extra.email, 50);                  // Consignee Email
  cols[13] = '2';                                     // Packaging Type: customer supplied
  cols[15] = kg;                                      // Weight
  cols[16] = L; cols[17] = W; cols[18] = H;           // Length / Width / Height
  cols[20] = 'Abbigliamento stampato';                // Description of Goods
  cols[24] = process.env.UPS_SERVICE || '11';         // Service: 11 Standard, 65 Saver, 07 Express
  cols[32] = clean(order.number, 35);                 // Reference 1 = codice ordine
  return { csv: cols.join(';') + '\r\n', filename: `UPS_${clean(order.number, 20)}.csv`, warnings };
}

function upsEmailParts(r) {
  const li = r.warnings.map((w) => `<li>${w}</li>`).join('');
  return {
    attachment: { filename: r.filename, content: Buffer.from(r.csv, 'latin1').toString('base64') },
    html: `<div style="margin-top:24px;font-family:sans-serif;font-size:14px"><strong>Spedizione UPS</strong>: file ${r.filename} allegato (ups.com → Batch File Shipping).<ul>${li}</ul></div>`,
  };
}

module.exports = { buildUpsCsv, upsEmailParts };
