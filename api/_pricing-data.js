// Server-side pricing mirror of the catalog. Keep in sync with PRODUCTS in index.html.
// Only what's needed to recompute price safely (never trust a price sent from the browser).

const ANGOLI_ARROTONDATI_TIERS = [{qty:100,price:8},{qty:250,price:10},{qty:500,price:14},{qty:1000,price:19},{qty:2500,price:23},{qty:5000,price:29},{qty:7500,price:38},{qty:10000,price:48}];
function angoliArrotondatiPrice(qty) {
  const t = ANGOLI_ARROTONDATI_TIERS.find(t => qty <= t.qty);
  return (t || ANGOLI_ARROTONDATI_TIERS[ANGOLI_ARROTONDATI_TIERS.length - 1]).price;
}

// --- T-Shirt Unisex 24H (mirror of T-Shirt Product Page.html) ---
const TSHIRT_PRICE_TIERS = [
  { min: 1, white: 8, other: 8.8 }, { min: 5, white: 6.5, other: 7.15 },
  { min: 10, white: 5, other: 5.5 }, { min: 20, white: 3.5, other: 3.85 },
  { min: 50, white: 2.9, other: 3.2 }, { min: 100, white: 2.5, other: 2.75 },
];
const TSHIRT_CUORE_TIERS = [
  { min: 1, price: 14 }, { min: 2, price: 10 }, { min: 5, price: 5 },
  { min: 10, price: 4 }, { min: 20, price: 3.5 }, { min: 50, price: 2.5 }, { min: 100, price: 2.2 },
];
const TSHIRT_AREA_TABLE = [
  [12,12,12,13,14,14,14,16,16,16,17,18],[12,12,13,14,14,14,16,16,16,17,18,18],
  [12,13,14,14,14,16,16,16,17,18,18,19],[13,14,14,14,16,16,16,17,18,20.5,22.5,25],
  [14,14,14,16,16,16,17,18,19,22,24.75,26],[14,14,16,16,16,17,18,20,22,25,28,28],
  [14,16,16,16,17,18,20,22,24,26,28,30],[16,16,16,17,18,20,22,24,26,28,30,32],
  [16,16,17,18,19,22,24,26,28,30,32,34],[16,17,18,20.5,22,25,26,28,30,32,34,36],
  [17,18,18,22.5,24.75,28,28,30,32,34,36,38],[18,18,19,25,26,28,30,32,34,36,38,40],
];
const TSHIRT_DISCOUNT_TIERS = [
  { min: 1, mult: 1 }, { min: 2, mult: 0.67 }, { min: 5, mult: 0.61 },
  { min: 10, mult: 0.56 }, { min: 20, mult: 0.44 }, { min: 50, mult: 0.39 }, { min: 100, mult: 0.33 },
];
const BAHRAIN_PRICE_TIERS = [
  { min: 1, price: 6.1 }, { min: 5, price: 4.88 }, { min: 10, price: 3.78 },
  { min: 20, price: 2.5 }, { min: 50, price: 2.2 }, { min: 100, price: 1.95 },
];
const BAHRAIN_KIDS_PRICE_TIERS = [
  { min: 1, price: 6.1 }, { min: 5, price: 4.88 }, { min: 10, price: 3.78 },
  { min: 20, price: 2.5 }, { min: 50, price: 2.2 }, { min: 100, price: 1.95 },
];
const POLO_PRICE_TIERS = [
  { min: 1, price: 8 }, { min: 2, price: 7.5 }, { min: 5, price: 7 },
  { min: 10, price: 6.5 }, { min: 20, price: 6 }, { min: 50, price: 5.5 }, { min: 100, price: 5.2 },
];
const STAR_POLO_PRICE_TIERS = [
  { min: 1, price: 9 }, { min: 2, price: 8.5 }, { min: 5, price: 8 },
  { min: 10, price: 7.5 }, { min: 20, price: 7 }, { min: 50, price: 6.5 }, { min: 100, price: 5.95 },
];
const RUDOLPH_PRICE_TIERS = [
  { min: 1, price: 25 }, { min: 2, price: 24.5 }, { min: 5, price: 24 },
  { min: 10, price: 23.5 }, { min: 20, price: 23 }, { min: 50, price: 22.5 }, { min: 100, price: 22 },
];
const NEBRASKA_PRICE_TIERS = [
  { min: 1, price: 24 }, { min: 2, price: 23.5 }, { min: 5, price: 23 },
  { min: 10, price: 22.5 }, { min: 20, price: 22 }, { min: 50, price: 21.5 }, { min: 100, price: 21 },
];
// Cappellino Basica — capo e stampa fronte 12×8, prezzi IVA compresa. Minimo ordine 5 pz
// (le fasce sotto i 10 pz restano per sicurezza ma non sono raggiungibili dal configuratore).
const BASICA_CAP_PRICE_TIERS = [
  { min: 1, price: 5 }, { min: 5, price: 4 }, { min: 10, price: 3.1 },
  { min: 20, price: 2.2 }, { min: 50, price: 2 }, { min: 100, price: 1.8 },
];
const KARIN_CAP_PRICE_TIERS = [
  { min: 1, price: 7.8 }, { min: 5, price: 6.24 }, { min: 10, price: 4.84 },
  { min: 20, price: 3.43 }, { min: 50, price: 3.12 }, { min: 100, price: 2.81 },
];
const URANUS_CAP_PRICE_TIERS = [
  { min: 1, price: 4.65 }, { min: 5, price: 3.72 }, { min: 10, price: 2.88 },
  { min: 20, price: 2.05 }, { min: 50, price: 1.86 }, { min: 100, price: 1.67 },
];
const BASICA_CAP_PRINT_TIERS = [
  { min: 1, price: 5 }, { min: 2, price: 4.5 }, { min: 5, price: 4.2 },
  { min: 10, price: 3.8 }, { min: 20, price: 3.5 }, { min: 50, price: 3.2 }, { min: 100, price: 3 },
];
// --- Alta visibilità Roly (mirror delle pagine hv-*.html) ---
// Prezzo capo = listino di acquisto della TAGLIA × moltiplicatore della fascia quantità.
// Minimo ordine 5 pz; le fasce sotto i 10 restano per sicurezza ma non sono raggiungibili.
const HV_QTY_MULT = [
  { min: 1, mult: 5.00 }, { min: 2, mult: 4.50 }, { min: 5, mult: 4.20 },
  { min: 10, mult: 3.80 }, { min: 20, mult: 3.50 }, { min: 50, mult: 3.20 },
  { min: 100, mult: 3.00 },
];
function hvMult(qty) { let t = HV_QTY_MULT[0]; for (const x of HV_QTY_MULT) if (qty >= x.min) t = x; return t.mult; }
const HV_BASE = {
  'hv-delta': {"S":4.65,"M":4.65,"L":4.65,"XL":4.65,"XXL":4.65,"XXXL":4.9,"XXXXL":5.2},
  'hv-tauri': {"S":8.95,"M":8.95,"L":8.95,"XL":8.95,"XXL":8.95,"XXXL":9.75,"XXXXL":10},
  'hv-vega': {"S":6.5,"M":6.5,"L":6.5,"XL":6.5,"XXL":6.5,"XXXL":6.9,"XXXXL":7.25},
  'hv-vega-ls': {"S":8.5,"M":8.5,"L":8.5,"XL":8.5,"XXL":8.5,"XXXL":8.95,"XXXXL":9.5},
  'hv-atrio': {"S":9.95,"M":9.95,"L":9.95,"XL":9.95,"XXL":9.95,"XXXL":10.5,"XXXXL":11},
  'hv-atrio-ls': {"S":12.5,"M":12.5,"L":12.5,"XL":12.5,"XXL":12.5,"XXXL":13.15,"XXXXL":13.8},
  'prince-donna': {"S":4.9,"M":4.9,"L":4.9,"XL":4.9,"XXL":4.9,"XXXL":5.9},
  'prince-polo': {"S":4.9,"M":4.9,"L":4.9,"XL":4.9,"XXL":4.9,"XXXL":5.9},
  'aifos': {"S":6.95,"M":6.95,"L":6.95,"XL":6.95,"XXL":6.95,"XXXL":7.65},
  'aifos-ls': {"S":7.25,"M":7.25,"L":7.25,"XL":7.25,"XXL":7.25,"XXXL":7.65},
  'moscu': {"S":9.95,"M":9.95,"L":9.95,"XL":9.95,"XXL":9.95,"XXXL":10.5},
  'vaccine-donna': {"XS":7.95,"S":7.95,"M":7.95,"L":7.95,"XL":7.95,"XXL":7.95},
  'vaccine': {"XS":7.95,"S":7.95,"M":7.95,"L":7.95,"XL":7.95,"XXL":7.95,"XXXL":7.95,"XXXXL":7.95},
  'sofia-ls': {"S":7.25,"M":7.25,"L":7.25,"XL":7.25,"XXL":7.25,"XXXL":7.25},
  'sofia': {"S":5.95,"M":5.95,"L":5.95,"XL":5.95,"XXL":5.95,"XXXL":6.25},
  'moscu-donna': {"S":9.95,"M":9.95,"L":9.95,"XL":9.95,"XXL":9.95,"XXXL":9.95},
  'hv-polaris': {"S":4.95,"M":4.95,"L":4.95,"XL":4.95,"XXL":4.95,"XXXL":5.5,"XXXXL":5.95},
  'hv-foran': {"XS":7.95,"S":7.95,"M":7.95,"L":7.95,"XL":7.95,"XXL":7.95,"XXXL":8.35},
  'serena': {"S":9.25,"M":9.25,"L":9.25,"XL":9.25,"XXL":9.25},
  'murray': {"S":8.65,"M":8.65,"L":8.65,"XL":8.65,"XXL":8.65},
  'slam-donna': {"S":2.6,"M":2.6,"L":2.6,"XL":2.6,"XXL":2.6},
  'slam': {"S":2.6,"M":2.6,"L":2.6,"XL":2.6,"XXL":2.6,"XXXL":2.8},
  'monzha': {"S":2.95,"M":2.95,"L":2.95,"XL":2.95,"XXL":2.95,"XXXL":3.41},
  'tormo': {"S":3.75,"M":3.75,"L":3.75,"XL":3.75,"XXL":3.75,"XXXL":3.95},
  'felpa-badet': {"XS":10.5,"S":10.5,"M":10.5,"L":10.5,"XL":10.5,"XXL":10.5,"XXXL":11},
  'felpa-badet-kids': {"3/4":8.65,"5/6":8.65,"7/8":8.65,"9/10":8.65,"11/12":8.65},
  'hv-foran-ls': {"XS":9.95,"S":9.95,"M":9.95,"L":9.95,"XL":9.95,"XXL":9.95,"XXXL":10.5},
};
// Le camicie hanno una scala moltiplicatore propria (più bassa): 3,00 a 1 pz → 2,00 da 100 pz.
const CAMICIE_QTY_MULT = [
  { min: 1, mult: 3.00 }, { min: 2, mult: 2.90 }, { min: 5, mult: 2.80 },
  { min: 10, mult: 2.60 }, { min: 20, mult: 2.40 }, { min: 50, mult: 2.20 },
  { min: 100, mult: 2.00 },
];
const CAMICIE_SLUGS = ['aifos', 'aifos-ls', 'moscu', 'sofia', 'sofia-ls', 'moscu-donna', 'vaccine', 'vaccine-donna', 'tormo', 'serena', 'murray', 'monzha', 'slam', 'slam-donna', 'felpa-badet', 'felpa-badet-kids'];
// Le polo Prince seguono la scala di Austral/Star: 2,30 a 1 pz → 1,50 da 100 pz.
const POLO_QTY_MULT = [
  { min: 1, mult: 2.30 }, { min: 2, mult: 2.15 }, { min: 5, mult: 2.00 },
  { min: 10, mult: 1.85 }, { min: 20, mult: 1.70 }, { min: 50, mult: 1.57 },
  { min: 100, mult: 1.50 },
];
const POLO_SLUGS = ['prince-polo', 'prince-donna'];
function slugMult(slug, qty) {
  const tiers = CAMICIE_SLUGS.includes(slug) ? CAMICIE_QTY_MULT
    : POLO_SLUGS.includes(slug) ? POLO_QTY_MULT : HV_QTY_MULT;
  let t = tiers[0]; for (const x of tiers) if (qty >= x.min) t = x; return t.mult;
}
function hvGarmentTotal(slug, qty, sizes) {
  const base = HV_BASE[slug];
  const m = slugMult(slug, qty);
  const unit = (s) => Math.round((base[s] || 0) * m * 100) / 100;
  const map = sizes && typeof sizes === 'object' ? sizes : {};
  const keys = Object.keys(base);
  let total = 0, counted = 0;
  for (const s of keys) {
    const n = Math.max(0, parseInt(map[s], 10) || 0);
    if (n) { total += n * unit(s); counted += n; }
  }
  // Taglie non indicate: prezzo della taglia base (mai un prezzo inferiore).
  const rest = Math.max(0, qty - counted);
  if (rest) total += rest * unit(keys[0]);
  return total;
}

function pickTier(tiers, qty) { let t = tiers[0]; for (const x of tiers) if (qty >= x.min) t = x; return t; }

const PRICING = {
  // Solo stampa — il capo lo fornisce il cliente: nessun costo capo, solo tariffe DTF. Minimo 5 pz.
  'solo-stampa': { nome: 'Solo Stampa DTF', type: 'tshirt',
    garmentUnitPrice: () => 0,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'tshirt': { nome: 'Maglietta Unisex 24H', type: 'tshirt',
    garmentUnitPrice: (qty, isWhite) => { const t = pickTier(TSHIRT_PRICE_TIERS, qty); return isWhite ? t.white : t.other; },
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // Polo Austral — listino capi Austral (unico per tutti i colori); stampa = tariffe DTF t-shirt.
  // Polo Star — listino capi Star (tabella 1-1, unico per tutti i colori); stampa = tariffe DTF t-shirt.
  'star-polo': { nome: 'Polo Star', type: 'tshirt',
    garmentUnitPrice: (qty) => pickTier(STAR_POLO_PRICE_TIERS, qty).price,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // Giubbotto Nebraska — listino capi (tabella 1-2, unico per tutti i colori); stampa = tariffe DTF t-shirt.
  'nebraska': { nome: 'Giubbotto Nebraska', type: 'tshirt',
    garmentUnitPrice: (qty) => pickTier(NEBRASKA_PRICE_TIERS, qty).price,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // Giubbotto Rudolph — listino capi (unico per tutti i colori); stampa = tariffe DTF t-shirt.
  'rudolph': { nome: 'Giubbotto Rudolph', type: 'tshirt',
    garmentUnitPrice: (qty) => pickTier(RUDOLPH_PRICE_TIERS, qty).price,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'nebraska-kids': { nome: 'Giubbotto Nebraska Bambino', type: 'tshirt',
    garmentUnitPrice: (qty) => pickTier(NEBRASKA_PRICE_TIERS, qty).price,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'nebraska-donna': { nome: 'Giubbotto Nebraska Donna', type: 'tshirt',
    garmentUnitPrice: (qty) => pickTier(NEBRASKA_PRICE_TIERS, qty).price,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // Maglietta Tecnica Bahrain — listino capi (unico per colore e taglia); stampa = tariffe DTF t-shirt.
  'bahrain': { nome: 'Maglietta Tecnica Bahrain', type: 'tshirt',
    garmentUnitPrice: (qty) => pickTier(BAHRAIN_PRICE_TIERS, qty).price,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'bahrain-donna': { nome: 'Maglietta Tecnica Bahrain Donna', type: 'tshirt',
    garmentUnitPrice: (qty) => pickTier(BAHRAIN_PRICE_TIERS, qty).price,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'bahrain-kids': { nome: 'Maglietta Tecnica Bahrain Bambino', type: 'tshirt',
    garmentUnitPrice: (qty) => pickTier(BAHRAIN_KIDS_PRICE_TIERS, qty).price,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'austral-polo': { nome: 'Polo Austral', type: 'tshirt',
    garmentUnitPrice: (qty) => pickTier(POLO_PRICE_TIERS, qty).price,
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // Promozione 100 Magliette + Stampa — prezzi a matrice (IVA inclusa, magliette bianche;
  // colorate +10%, spedizione inclusa). Fonte: scheda prodotto printeurope.pro.
  'promo100': { nome: 'Promozione 100 Magliette + Stampa', type: 'promo100',
    qtyChoices: [50, 100],
    // Oltre i 100 pz il prezzo è lineare al prezzo unitario della fascia 100 (nessuno scaglione).
    maxQty: 1000,
    // colonne: c8 = 8×8cm · s10 = 25×10cm · s32 = 25×32cm · cr10 = 8×8 + 25×10 · cr32 = 8×8 + 25×32
    matrix: {
      50:  { c8: 145, s10: 186, s32: 290, cr10: 216, cr32: 365 },
      100: { c8: 260, s10: 343, s32: 570, cr10: 393, cr32: 620 },
    },
    printChoices: [
      { key: 'cuore_8x8', label: 'Cuore/manica 8×8 cm', col: 'c8' },
      { key: 'davanti_25x10', label: 'Davanti 25×10 cm', col: 's10' },
      { key: 'retro_25x10', label: 'Retro 25×10 cm', col: 's10' },
      { key: 'davanti_25x32', label: 'Davanti 25×32 cm', col: 's32' },
      { key: 'retro_25x32', label: 'Retro 25×32 cm', col: 's32' },
      { key: 'cuore_retro_25x10', label: 'Cuore + retro 25×10 cm', col: 'cr10' },
      { key: 'cuore_retro_25x32', label: 'Cuore + retro 25×32 cm', col: 'cr32' },
    ],
    coloredSurcharge: 1.1 },

  'hv-delta': { nome: 'T-Shirt Alta Visibilità Delta', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('hv-delta', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('hv-delta', 1, null) * hvMult(qty) / hvMult(1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'hv-tauri': { nome: 'T-Shirt Alta Visibilità Tauri', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('hv-tauri', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('hv-tauri', 1, null) * hvMult(qty) / hvMult(1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'hv-vega': { nome: 'Polo Alta Visibilità Vega', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('hv-vega', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('hv-vega', 1, null) * hvMult(qty) / hvMult(1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'hv-vega-ls': { nome: 'Polo Alta Visibilità Vega Maniche Lunghe', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('hv-vega-ls', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('hv-vega-ls', 1, null) * hvMult(qty) / hvMult(1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'hv-atrio': { nome: 'Polo Alta Visibilità Atrio', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('hv-atrio', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('hv-atrio', 1, null) * hvMult(qty) / hvMult(1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'hv-atrio-ls': { nome: 'Polo Alta Visibilità Atrio Maniche Lunghe', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('hv-atrio-ls', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('hv-atrio-ls', 1, null) * hvMult(qty) / hvMult(1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'prince-donna': { nome: 'Polo da Donna Prince Woman', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('prince-donna', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('prince-donna', 1, null) * slugMult('prince-donna', qty) / slugMult('prince-donna', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'prince-polo': { nome: 'Polo da Uomo Prince', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('prince-polo', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('prince-polo', 1, null) * slugMult('prince-polo', qty) / slugMult('prince-polo', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'aifos': { nome: 'Camicia Uomo Aifos Manica Corta', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('aifos', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('aifos', 1, null) * slugMult('aifos', qty) / slugMult('aifos', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'aifos-ls': { nome: 'Camicia Uomo Aifos Manica Lunga', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('aifos-ls', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('aifos-ls', 1, null) * slugMult('aifos-ls', qty) / slugMult('aifos-ls', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'moscu': { nome: 'Camicia Uomo Moscu Manica Lunga', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('moscu', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('moscu', 1, null) * slugMult('moscu', qty) / slugMult('moscu', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'vaccine-donna': { nome: 'Camice da Laboratorio Donna Vaccine', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('vaccine-donna', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('vaccine-donna', 1, null) * slugMult('vaccine-donna', qty) / slugMult('vaccine-donna', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'vaccine': { nome: 'Camice da Laboratorio Vaccine', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('vaccine', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('vaccine', 1, null) * slugMult('vaccine', qty) / slugMult('vaccine', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'sofia-ls': { nome: 'Camicia Donna Sofia Manica Lunga', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('sofia-ls', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('sofia-ls', 1, null) * slugMult('sofia-ls', qty) / slugMult('sofia-ls', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'sofia': { nome: 'Camicia Donna Sofia Manica Corta', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('sofia', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('sofia', 1, null) * slugMult('sofia', qty) / slugMult('sofia', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'moscu-donna': { nome: 'Camicia Donna Moscu Manica Lunga', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('moscu-donna', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('moscu-donna', 1, null) * slugMult('moscu-donna', qty) / slugMult('moscu-donna', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'hv-polaris': { nome: 'Polo Alta Visibilità Polaris', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('hv-polaris', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('hv-polaris', 1, null) * hvMult(qty) / hvMult(1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'hv-foran': { nome: 'Polo Foran Maggiore Visibilità', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('hv-foran', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('hv-foran', 1, null) * hvMult(qty) / hvMult(1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'slam-donna': { nome: 'T-Shirt Tecnica Slam Woman', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('slam-donna', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('slam-donna', 1, null) * slugMult('slam-donna', qty) / slugMult('slam-donna', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // T-shirt tecnica Slam (Roly CA0304) — moltiplicatore 3: 3,00 → 2,00.
  'slam': { nome: 'T-Shirt Tecnica Slam', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('slam', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('slam', 1, null) * slugMult('slam', qty) / slugMult('slam', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // Polo sport Monzha (Roly PO0404) — moltiplicatore 3: 3,00 → 2,00.
  'monzha': { nome: 'Polo Sport Monzha', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('monzha', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('monzha', 1, null) * slugMult('monzha', qty) / slugMult('monzha', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // Gonna sport Serena (Roly PA0307) e short sport Murray (Roly PA0306) — moltiplicatore 3: 3,00 → 2,00.
  'serena': { nome: 'Gonna Sport Serena', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('serena', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('serena', 1, null) * slugMult('serena', qty) / slugMult('serena', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'murray': { nome: 'Short Sport Murray', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('murray', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('murray', 1, null) * slugMult('murray', qty) / slugMult('murray', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // Polo sport Tormo (Roly PO0400) — scala moltiplicatore 3: 3,00 a 1 pz → 2,00 da 100 pz.
  'tormo': { nome: 'Polo Sport Tormo', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('tormo', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('tormo', 1, null) * slugMult('tormo', qty) / slugMult('tormo', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  // Felpa Badet (Roly SU1058) — moltiplicatore 3: 3,00 → 2,00.
  'felpa-badet': { nome: 'Felpa Badet', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('felpa-badet', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('felpa-badet', 1, null) * slugMult('felpa-badet', qty) / slugMult('felpa-badet', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'felpa-badet-kids': { nome: 'Felpa Badet Bambino', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('felpa-badet-kids', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('felpa-badet-kids', 1, null) * slugMult('felpa-badet-kids', qty) / slugMult('felpa-badet-kids', 1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'hv-foran-ls': { nome: 'Polo Foran L/S Maggiore Visibilità', type: 'tshirt',
    garmentTotal: (qty, sizes) => hvGarmentTotal('hv-foran-ls', qty, sizes),
    garmentUnitPrice: (qty) => hvGarmentTotal('hv-foran-ls', 1, null) * hvMult(qty) / hvMult(1),
    cuoreUnitPrice: (qty) => pickTier(TSHIRT_CUORE_TIERS, qty).price,
    areaUnitPrice: (wIdx, hIdx) => TSHIRT_AREA_TABLE[wIdx][hIdx],
    discount: (qty) => pickTier(TSHIRT_DISCOUNT_TIERS, qty).mult },

  'basica-cap': { nome: 'Cappellino Basica', type: 'cap',
    garmentUnitPrice: (qty) => pickTier(BASICA_CAP_PRICE_TIERS, qty).price,
    printUnitPrice: (qty) => pickTier(BASICA_CAP_PRINT_TIERS, qty).price },
  'karin-cap': { nome: 'Cappellino Karin', type: 'cap',
    garmentUnitPrice: (qty) => pickTier(KARIN_CAP_PRICE_TIERS, qty).price,
    printUnitPrice: (qty) => pickTier(BASICA_CAP_PRINT_TIERS, qty).price },
  'uranus-cap': { nome: 'Cappellino Uranus', type: 'cap',
    garmentUnitPrice: (qty) => pickTier(URANUS_CAP_PRICE_TIERS, qty).price,
    printUnitPrice: (qty) => pickTier(BASICA_CAP_PRINT_TIERS, qty).price },
};

module.exports = { PRICING, ANGOLI_ARROTONDATI_TIERS, angoliArrotondatiPrice };
