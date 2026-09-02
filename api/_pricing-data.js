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
const NEBRASKA_PRICE_TIERS = [
  { min: 1, price: 29 }, { min: 2, price: 28 }, { min: 5, price: 27 },
  { min: 10, price: 26 }, { min: 20, price: 25 }, { min: 50, price: 24 }, { min: 100, price: 23 },
];
function pickTier(tiers, qty) { let t = tiers[0]; for (const x of tiers) if (qty >= x.min) t = x; return t; }

const PRICING = {
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
};

module.exports = { PRICING, ANGOLI_ARROTONDATI_TIERS, angoliArrotondatiPrice };
