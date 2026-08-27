# Layout standard pagina prodotto

Riferimento: `bahrain.dc.html` (versione approvata 27 ago 2026). Vale per **tutte** le pagine
prodotto: bahrain, bahrain-kids, Beagle, beagle-kids, jamaica, Jamaica.kids, nebraska,
nebraska-donna, nebraska-kids, rudolph, Star-Polo, Star-Polo-donna, Star-Polo-kids, Austral-Polo,
e ogni nuovo prodotto.

## Contenitore

Wrapper esterno: `max-width: 1280px; margin: 0 auto; padding: var(--space-6) var(--space-4) var(--space-8)`
— identico a `tshirt-uomo.dc.html`. Footer interno: `max-width: 1280px`.

## Tre colonne (≥ 1200px)

`.prod-grid` — `grid-template-columns: minmax(0,400px) minmax(0,1fr) minmax(0,1fr)`,
`grid-template-rows: auto auto`, aree `"head head head" "left mid right"`,
`column-gap: var(--space-8)`, `row-gap: var(--space-6)`.
Tutte e tre le colonne hanno cornice: `border: 1px solid var(--color-divider)`,
`padding: var(--space-4)`, `align-self: stretch` — i tre bordi arrivano alla stessa altezza.

Ordine dei blocchi, dall'alto:

| Colonna | Classe | Contenuto |
| --- | --- | --- |
| 1 | `.col-left` (flex column) | foto prodotto `.prod-visual` → Colore Maglietta `.cfg-top` → Stampa su `.cfg-zones` |
| 2 | `.col-mid` | disegno "come misurare" + tabella misure capo `.cfg-misure` → quantità per taglia `.prod-qty` |
| 3 | `.col-right .prod-config` | Composizione e osservazioni `.cfg-comp` (filetto sotto) → upload file, link file, note ordine, riepilogo prezzi, bottoni carrello/preventivo, badge spedizione + Roma (`.cfg-rest`) |

Altezze risultanti su Bahrain: 850 / 850 / 850 px — le colonne vanno tenute bilanciate;
se un prodotto sbilancia molto, si sposta un blocco, non si forza l'altezza.

## Due colonne (900–1199px)

`grid-template-columns: minmax(0,460px) minmax(0,1fr)`,
`grid-template-rows: auto min-content 1fr`, aree `"head head" "left mid" "left right"`,
`align-content: start`.
La riga `1fr` serve a evitare che l'altezza in eccesso della colonna 1 (che occupa due righe)
gonfi la riga della colonna 2 lasciando un buco. In questo range `.col-left { align-self: start }`,
altrimenti la sua cornice si allunga per due righe e resta mezza vuota.

## Mobile (< 900px)

`.col-left, .col-mid, .col-right { display: contents }` e ordine per aree:
`"head" "visual" "cfgtop" "zones" "misure" "qty" "comp" "cfgrest"`.
Ogni blocco spostato tra le colonne va aggiunto anche a questa lista con la sua `grid-area`,
o scompare dal mobile.

## Dettagli fissati

- Nessun `<hr>` sopra "Colore Maglietta".
- Swatch colori: `display: grid; grid-template-columns: repeat(8, 30px); gap: var(--space-2); justify-content: space-between` — 8 per riga, giustificati.
- Righe quantità `.size-row`: `padding: 2px var(--space-3)`; `.qty-btn` 32×30px, `.qty-input` 52×30px.
- Disegno misure: `img/misure-tshirt.webp` (600×617, WebP q0.85, trasparente), `width: 100%`, centrato, sopra la tabella.
- EAN: in **neretto** come ultima riga del box "Composizione e osservazioni", non sotto il titolo.
- Foto: `.prod-media` max 480px sotto 900px, 100% da 900px in su.
- Ordine minimo 20 pz, taglie miste, avviso rosso se sotto il minimo.
- Badge in fondo alla colonna 3: "Spedizione pronta in settimana" + "Prodotto a Roma"
  (su Bahrain; le altre pagine dicono ancora "in 24 ore" — verificare prima di copiare).

## Prezzi

Bahrain adulto è tarato perché a **20 pz capo + stampa cuore = €6,00 / pezzo**
(capo 2,50 + cuore 3,50, IVA compresa). Fasce capo: 6,10 / 4,88 / 3,78 / 2,50 / 2,20 / 1,95.
Bahrain bambino ha una tabella separata (`BAHRAIN_KIDS_PRICE_TIERS`) ancora sul listino vecchio.
Ogni modifica al listino va fatta **in due posti**: `PRICE_TIERS` nella pagina e
`api/_pricing-data.js` (validazione server) — se divergono, il checkout rifiuta l'ordine.

## Da verificare a ogni replica

- Le misure A/B della tabella sono quelle del prodotto specifico (non copiate da Bahrain).
- Il numero di colori cambia per prodotto: con 21 colori l'ultima riga resta incompleta, è normale.
- Il link alla versione bambino/donna punta al file giusto.
- Le tre colonne restano di altezza simile a 1400px di viewport.
