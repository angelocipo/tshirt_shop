// Peso indicativo del pacco, usato da DDT (_ddt.js) e file UPS (_ups-csv.js).
// Regola: scatola 600 g + 500 g per ogni felpa. Per gli altri articoli non c'è ancora
// un peso per pezzo: se l'ordine ne contiene, resta il peso di default da correggere a mano.

// Pezzi di una riga: il carrello manda una riga per modello con "10pz" nella descrizione.
function pieces(l) {
  const m = /(\d+)\s*pz/i.exec(String((l && l.description) || ''));
  return m ? parseInt(m[1], 10) : (Number(l && l.quantity) || 1);
}

const BOX_KG = 0.6;
const PER_PIECE_KG = [
  [/felp/i, 0.5],
];

// → { kg: number, exact: boolean }. exact = false se c'è almeno un articolo senza peso noto.
function parcelWeight(order) {
  const lines = ((order && order.lines) || []).filter((l) => !/^spedizione/i.test(String(l.description || '')));
  let kg = BOX_KG, known = 0, unknown = 0;
  for (const l of lines) {
    const rule = PER_PIECE_KG.find(([re]) => re.test(String(l.description || '')));
    if (rule) { kg += rule[1] * pieces(l); known++; } else unknown++;
  }
  if (!known) return { kg: parseFloat(process.env.UPS_DEFAULT_WEIGHT_KG || '2'), exact: false };
  return { kg: Math.round(kg * 10) / 10, exact: unknown === 0 };
}

const fmtKg = (kg) => String(kg).replace('.', ',');

module.exports = { pieces, parcelWeight, fmtKg };
