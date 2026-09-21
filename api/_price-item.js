// Calcolo prezzi lato server — unica fonte di verità per carrello, checkout e Stripe.
const { PRICING, angoliArrotondatiPrice, qtyGroup } = require('./_pricing-data');

// Prezzo e descrizione di UNA riga d'ordine, calcolati dal listino server.
// Il carrello manda `items: [...]`: ogni riga passa di qui, nessun importo arriva dal client.
function priceItem(input) {
  const { productId, tierIndex, sizeIndex, formula, deliveryIndex } = input || {};
  const product = PRICING[productId];
  if (!product) {
    const e = new Error('Prodotto sconosciuto: ' + productId);
    e.status = 400;
    throw e;
  }
  let unitAmountCents, description;
    if (product.type === 'formula') {
      const qty = Math.max(1, parseInt(formula?.qty, 10) || 1);
      const strutturaIdx = formula?.strutturaIdx === 1 ? 1 : 0;
      const rush = formula?.tempi === '24H' ? product.rate24h : 0;
      const total = qty * (product.rollupRate(qty) + product.strutturaRates[strutturaIdx] + rush);
      unitAmountCents = Math.round(total * 100);
      description = `${product.nome} — ${qty}pz, ${formula?.tempi === '24H' ? '24H' : '72H'}, ${strutturaIdx === 0 ? 'con struttura' : 'solo stampa'}`;
    } else if (product.type === 'tiersDelivery') {
      const dIdx = Number.isInteger(deliveryIndex) ? deliveryIndex : 0;
      const tiers = product.tiersByDelivery[Math.min(Math.max(dIdx, 0), product.tiersByDelivery.length - 1)];
      const idx = Number.isInteger(tierIndex) ? tierIndex : 0;
      const tier = tiers[Math.min(Math.max(idx, 0), tiers.length - 1)];
      unitAmountCents = Math.round(tier.price * 100);
      description = `${product.nome} — ${tier.qty} copie`;
    } else if (product.type === 'tiers') {
      const idx = Number.isInteger(tierIndex) ? tierIndex : 0;
      const tier = product.tiers[Math.min(Math.max(idx, 0), product.tiers.length - 1)];
      unitAmountCents = Math.round(tier.price * 100);
      description = `${product.nome} — ${tier.qty} copie`;
    } else if (product.type === 'striscioniPvc') {
      const qty = Math.max(1, Math.min(100, parseInt(formula?.qty, 10) || 1));
      const consegnaIdx = formula?.consegnaIdx === 1 ? 1 : 0;
      const occhielliIdx = formula?.occhielliIdx === 1 ? 1 : 0;
      const fIdx = Number.isInteger(formula?.formatIdx) ? formula.formatIdx : 0;
      const idx = Math.min(Math.max(fIdx, 0), 2);
      const rate = consegnaIdx === 1
        ? product.rates2gg[idx]
        : (occhielliIdx === 1 ? product.ratesSettimanaCon[idx] : product.ratesSettimanaSenza[idx]);
      const total = Math.round(rate * qty * 1.22 * 1.3);
      unitAmountCents = total * 100;
      const formats = ['200×100 cm', '300×100 cm', '400×100 cm'];
      const consegnaLabel = consegnaIdx === 1 ? '2 gg Lavorativi' : '1 Settimana';
      const occhielliLabel = consegnaIdx === 0 ? (occhielliIdx === 1 ? 'Con occhielli' : 'Senza occhielli') : '';
      description = `${product.nome} — ${formats[idx]}, ${consegnaLabel}${occhielliLabel ? ', ' + occhielliLabel : ''}, ${qty}pz`;
    } else if (product.type === 'bv24h') {
      const { larghezza, altezza, qty, latiIdx, cartaIdx, soggettiIdx } = formula || {};
      const l = Math.max(product.larghezza.min, Math.min(product.larghezza.max, parseInt(larghezza, 10) || product.larghezza.default));
      const a = Math.max(product.altezza.min, Math.min(product.altezza.max, parseInt(altezza, 10) || product.altezza.default));
      const q = Math.max(product.qty.min, Math.min(product.qty.max, parseInt(qty, 10) || product.qty.default));
      const latI = latiIdx === 1 ? 1 : 0;
      const cartaI = Math.min(Math.max(Number.isInteger(cartaIdx) ? cartaIdx : 0, 0), product.cartaMultiplier.length - 1);
      const sogI = Math.min(Math.max(Number.isInteger(soggettiIdx) ? soggettiIdx : 0, 0), product.soggettiMultiplier.length - 1);
      const bv = product.cartaMultiplier[cartaI];
      const soggetti = product.soggettiMultiplier[sogI];
      const lati = product.latiMultiplier[latI];
      let total = Math.round(20 + bv * soggetti * lati * q * (l+20)*(a+40)/440/320);
      let angoliSuffix = '';
      if (formula && formula.angoliArrotondati) { total += angoliArrotondatiPrice(q); angoliSuffix = ', Angoli arrotondati'; }
      unitAmountCents = total * 100;
      description = `${product.nome} — ${l}×${a} mm, gr.${product.cartaChoices[cartaI]}, ${product.latiChoices[latI]}, ${product.soggettiChoices[sogI]} soggetti, ${q}pz${angoliSuffix}`;
    } else if (product.type === 'adesiviPrespaziati') {
      const { base, altezza, copie, lavorazioneIdx, coloreIdx, materialeIdx, altroColore } = formula || {};
      const b = Math.max(product.base.min, Math.min(product.base.max, parseInt(base, 10) || product.base.default));
      const a = Math.max(product.altezza.min, Math.min(product.altezza.max, parseInt(altezza, 10) || product.altezza.default));
      const c = Math.max(product.copie.min, parseInt(copie, 10) || product.copie.default);
      const lIdx = Math.min(Math.max(Number.isInteger(lavorazioneIdx) ? lavorazioneIdx : 0, 0), product.lavorazioni.length - 1);
      const mIdx = materialeIdx === 1 ? 1 : 0;
      const colOptions = product.coloreByMateriale[mIdx];
      const cIdx = Math.min(Math.max(Number.isInteger(coloreIdx) ? coloreIdx : 0, 0), colOptions.length - 1);
      const colore = colOptions[cIdx] === 'Altro' ? (altroColore || 'Altro') : colOptions[cIdx];
      const mult = product.lavorazioni[lIdx].mult;
      const total = Math.round(15 + mult * 5.5 * 1.22 * 5 * ((b+2.5)*(a+2.5)/6200) * c);
      unitAmountCents = total * 100;
      description = `${product.nome} — ${b}×${a} cm, ${colore}, ${product.lavorazioni[lIdx].label}, ${c}pz`;
    } else if (product.type === 'adesivoInterno') {
      const { larghezza, altezza, qty, sagomaIdx } = formula || {};
      const l = Math.max(product.larghezza.min, Math.min(product.larghezza.max, parseInt(larghezza, 10) || product.larghezza.default));
      const a = Math.max(product.altezza.min, Math.min(product.altezza.max, parseInt(altezza, 10) || product.altezza.default));
      const q = Math.max(product.qty.min, Math.min(product.qty.max, parseInt(qty, 10) || product.qty.default));
      const sIdx = sagomaIdx === 1 ? 1 : 0;
      const mult = product.sagomaMultiplier[sIdx];
      const total = Math.round(10 + mult * ((l+2)*(a+2)/44/32) * q * 1.22 * 2);
      unitAmountCents = total * 100;
      description = `${product.nome} — ${l}×${a} cm, ${q}pz, sagoma: ${product.sagomaChoices[sIdx]}`;
    } else if (product.type === 'imageSwatchQty') {
      const { swatchIdx, qty } = formula || {};
      const idx = Math.min(Math.max(Number.isInteger(swatchIdx) ? swatchIdx : (product.defaultSwatchIdx || 0), 0), product.swatches.length - 1);
      const q = Math.max(1, parseInt(qty, 10) || 1);
      unitAmountCents = Math.round(q * product.pricePerUnit * 100);
      description = `${product.nome} — ${product.swatches[idx]}, ${q}pz`;
    } else if (product.type === 'imageSwatch') {
      const idx = Number.isInteger(sizeIndex) ? sizeIndex : 0;
      const i = Math.min(Math.max(idx, 0), product.swatches.length - 1);
      unitAmountCents = Math.round(product.price * 100);
      description = `${product.nome} — ${product.swatches[i]}`;
    } else if (product.type === 'locandine250') {
    const { formatIdx, cartaIdx, qty } = formula || {};
    const fIdx = Math.min(Math.max(Number.isInteger(formatIdx) ? formatIdx : 0, 0), product.formatRates.length - 1);
    const cIdx = Math.min(Math.max(Number.isInteger(cartaIdx) ? cartaIdx : 2, 0), product.cartaMultiplier.length - 1);
    const q = Math.max(1, parseInt(qty, 10) || 1);
    const total = Math.round(product.formatRates[fIdx] * q * product.cartaMultiplier[cIdx] * 1.22 * 100) / 100;
    unitAmountCents = Math.round(total * 100);
    description = `${product.nome} — ${product.formatChoices[fIdx]}, ${product.cartaChoices[cIdx]}, ${q}pz`;
    } else if (product.type === 'libretti') {
      const { quantita, facciate } = formula || {};
      const q = Math.max(1, parseInt(quantita, 10) || 1);
      const f = Math.max(12, parseInt(facciate, 10) || 12);
      const total = Math.round((q * (1.5 + f * 0.1) + 7) * 100) / 100;
      unitAmountCents = Math.round(total * 100);
      description = `${product.nome} — ${q}pz, ${f} facciate B/N`;
    } else if (product.type === 'strutturaEventi') {
      const { altezza, larghezza } = formula || {};
      const h = parseFloat(altezza) || 100, w = parseFloat(larghezza) || 100;
      const base = w * 0.002 + 29 + ((2*h + 2*w) / 100) * 50;
      const total = base * 1.5;
      unitAmountCents = Math.round(total * 100);
      description = `${product.nome} — ${altezza}×${larghezza}, prezzo € ${base.toFixed(2)} + caparra 50% (€ ${(base/2).toFixed(2)})`;
    } else if (product.type === 'scatolaGioielli') {
      const { misuraIdx, coloreIdx, qty } = formula || {};
      const mIdx = Math.min(Math.max(Number.isInteger(misuraIdx) ? misuraIdx : 0, 0), product.misuraRate.length - 1);
      const cIdx = Math.min(Math.max(Number.isInteger(coloreIdx) ? coloreIdx : 0, 0), product.coloreChoices.length - 1);
      const q = Math.max(1, parseInt(qty, 10) || 1);
      const rate = product.misuraRate[mIdx];
      const total = Math.round((q * rate * 2 + q * 3 + 8) * 100) / 100;
      unitAmountCents = Math.round(total * 100);
      description = `${product.nome} — ${product.misuraChoices[mIdx]}, ${product.coloreChoices[cIdx]}, ${q}pz`;
    } else if (product.type === 'skylineFormato') {
      const { formato } = formula || {};
      const total = formato === '100 x 50 cm' ? 52 : 25;
      unitAmountCents = Math.round(total * 100);
      description = `${product.nome} — ${formato || '50 x 25 cm'}`;
    } else if (product.type === 'badgeEn') {
      const { qty, holder, formato, larghezza, altezza, stampa, carta, plastificazione, cordino, creazione_file } = formula || {};
      const q = Math.max(50, parseInt(qty, 10) || 50);
      const stampaRate = { '1 side full color':0.4, '2 sides full color':0.7, '1 side B/W':0.07, '2 sides B/W':0.14, '1 side color + 1 side B/W':0.39 }[stampa] || 0.4;
      const excelRate = creazione_file === 'Yes, create the file for me' ? 0.5 : 0;
      let total, desc;
      if (holder === 'Without' || formato === 'Custom size (without badge holder)') {
        const w = parseFloat(larghezza) || 5, h = parseFloat(altezza) || 8;
        const vol = { '80 gsm':0.074, '100 gsm':0.22, '200 gsm':0.44, '300 gsm':0.68, '350 gsm':0.8, '400 gsm':0.92 }[carta] || 0.68;
        const plastRate = plastificazione === 'Yes' ? 0.2 : 0;
        total = vol*q*(w+23)*(h+23)/44/32 + stampaRate*q*(w+22)*(h+22)/44/32 + plastRate*3*q*(w+22)*(h+22)/44/32 + q*excelRate + 10;
        desc = `${product.nome} — without holder, ${w}×${h}cm, ${q}pcs`;
      } else {
        const dims = { '8.5×5.5 cm Landscape':[9,12], '8.5×5.5 cm Portrait':[9,12], '10×15 cm Portrait':[9,6], '7.5×10 cm Portrait':[9,6] };
        const [w,h] = dims[formato] || [9,12];
        const lanyardRate = cordino === 'Yes' ? 0.3 : 0;
        total = 0.68*q*(w+23)*(h+23)/44/32 + stampaRate*q*(w+22)*(h+22)/44/32 + q*1 + 10 + q*lanyardRate + q*excelRate;
        desc = `${product.nome} — ${formato || 'with badge holder'}, ${q}pcs`;
      }
      unitAmountCents = Math.round(total * 100);
      description = desc;
    } else if (product.type === 'badge') {
      const { qty, holder, formato, larghezza, altezza, stampa, carta, plastificazione, cordino, creazione_file } = formula || {};
      const q = Math.max(50, parseInt(qty, 10) || 50);
      const stampaRate = { '1 lato a colori':0.4, '2 lati a colori':0.7, '1 lato bianco nero':0.07, '2 lati bianco nero':0.14, '1 lato a colori + 1 lato bianco nero':0.39 }[stampa] || 0.4;
      const excelRate = creazione_file === 'Si, create voi il file da stampa' ? 0.5 : 0;
      let total, desc;
      if (holder === 'Senza' || formato === 'Su misura (senza porta badge)') {
        const w = parseFloat(larghezza) || 5, h = parseFloat(altezza) || 8;
        const vol = { 'gr. 80':0.074, 'gr. 100':0.22, 'gr. 200':0.44, 'gr. 300':0.68, 'gr. 350':0.8, 'gr. 400':0.92 }[carta] || 0.68;
        const plastRate = plastificazione === 'Si' ? 0.2 : 0;
        total = vol*q*(w+23)*(h+23)/44/32 + stampaRate*q*(w+22)*(h+22)/44/32 + plastRate*3*q*(w+22)*(h+22)/44/32 + q*excelRate + 10;
        desc = `${product.nome} — senza porta badge, ${w}×${h}cm, ${q}pz`;
      } else {
        const dims = { '8,5×5,5 cm Landscape':[9,12], '8,5×5,5 cm Portrait':[9,12], '10×15 cm Portrait':[9,6], '7,5×10 cm Portrait':[9,6] };
        const [w,h] = dims[formato] || [9,12];
        const lanyardRate = cordino === 'Si' ? 0.3 : 0;
        total = 0.68*q*(w+23)*(h+23)/44/32 + stampaRate*q*(w+22)*(h+22)/44/32 + q*1 + 10 + q*lanyardRate + q*excelRate;
        desc = `${product.nome} — ${formato || 'con porta badge'}, ${q}pz`;
      }
      unitAmountCents = Math.round(total * 100);
      description = desc;
    } else if (product.type === 'quadroWarhol') {
      const { lato_lungo, lato_corto, pannelli, creazione } = formula || {};
      const ll = parseFloat(lato_lungo) || 30, lc = parseFloat(lato_corto) || 21;
      const pannelliIdx = ['1','2','3','4'].indexOf(String(pannelli || '1'));
      const pannelliMult = [1, 1.8, 2.7, 3.6][pannelliIdx === -1 ? 0 : pannelliIdx];
      const creazionePrice = creazione === "No, il file ce l'ho io" ? -2 : 30;
      const total = 1.3 * pannelliMult * ll * lc / 100 + 22 + creazionePrice;
      unitAmountCents = Math.round(total * 100);
      description = `${product.nome} — ${ll}×${lc} cm, ${pannelli || '1'} pannelli, ${creazione || 'creazione file inclusa'}`;
    } else if (product.type === 'fotoQuadro') {
      const { lato_lungo, lato_corto, spessore } = formula || {};
      const ll = parseFloat(lato_lungo) || 30, lc = parseFloat(lato_corto) || 21;
      const total = Math.max(1.3 * ll * lc / 100 + 22, product.basePrice ?? 0);
      unitAmountCents = Math.round(total * 100);
      description = `${product.nome} — ${ll}×${lc} cm, ${spessore || ''}`;
    } else if (product.type === 'rilegature') {
      const { qty, pagCol, pagBn, latiIdx, cartaIdx } = formula || {};
      const q = Math.max(1, parseInt(qty, 10) || 1);
      const pc = Math.max(0, parseInt(pagCol, 10) || 0);
      const pb = Math.max(0, parseInt(pagBn, 10) || 0);
      const cIdx = Math.min(Math.max(Number.isInteger(cartaIdx) ? cartaIdx : 0, 0), product.cartaRate.length - 1);
      const lati = latiIdx === 1 ? 2 : 1;
      const ril = q > 10 ? 2 : q > 5 ? 3 : q > 1 ? 4 : 5;
      const colori = pc > 99 ? 0.137 : pc > 49 ? 0.16 : pc > 19 ? 0.2 : 0.27;
      const bn = pb > 99 ? 0.05 : pb > 49 ? 0.07 : pb > 19 ? 0.09 : 0.1;
      const cartaRate = product.cartaRate[cIdx];
      const total = Math.round((q*pc*colori + q*pb*bn + q*pc*cartaRate/lati + q*pb*cartaRate/lati + q*ril) * 100) / 100;
      unitAmountCents = Math.round(total * 100);
      description = `${product.nome} — ${q} rilegature, ${pc} col + ${pb} b/n, ${product.cartaChoices[cIdx]}, ${lati} lato/i`;
    } else if (product.type === 'flat') {
      unitAmountCents = Math.round(product.price * 100);
      description = product.nome;
    } else if (product.type === 'forexPvc') {
      const qty = Math.max(1, Math.min(100, parseInt(formula?.qty, 10) || 1));
      const spessoreIdx = formula?.spessoreIdx === 1 ? 1 : 0;
      const stampaIdx = formula?.stampaIdx === 1 ? 1 : 0;
      const consegnaIdx = formula?.consegnaIdx === 1 ? 1 : 0;
      const fIdx = Number.isInteger(formula?.formatIdx) ? formula.formatIdx : 0;
      const baseRate = product.rates[spessoreIdx][stampaIdx][consegnaIdx][Math.min(Math.max(fIdx, 0), product.formats.length - 1)];
      const multiplier = qty > 1 ? 0.8 : 1;
      const total = Math.round(baseRate * multiplier * qty);
      unitAmountCents = total * 100;
      description = `${product.nome} — ${product.formats[fIdx]}, ${product.spessoreChoices[spessoreIdx]}, ${product.stampaChoices[stampaIdx]}, ${product.consegnaChoices[consegnaIdx]}, ${qty}pz`;
    } else if (product.type === 'businessCardStrategici') {
      const { formatIndex, paperIndex, deliveryIndex } = formula || {};
      const fIdx = Number.isInteger(formatIndex) ? formatIndex : 0;
      const format = product.formats[Math.min(Math.max(fIdx, 0), product.formats.length - 1)];
      const pIdx = Number.isInteger(paperIndex) ? paperIndex : 0;
      const paper = format.papers[Math.min(Math.max(pIdx, 0), format.papers.length - 1)];
      const dIdx = Number.isInteger(deliveryIndex) ? deliveryIndex : 0;
      const delivery = paper.deliveries[Math.min(Math.max(dIdx, 0), paper.deliveries.length - 1)];
      const idx = Number.isInteger(tierIndex) ? tierIndex : 0;
      const i = Math.min(Math.max(idx, 0), delivery.prices.length - 1);
      let priceStrategici = delivery.prices[i];
      let angoliSuffixStrategici = '';
      if (formula && formula.angoliArrotondati) { priceStrategici += angoliArrotondatiPrice(product.qtyLabels[i]); angoliSuffixStrategici = ', Angoli arrotondati'; }
      unitAmountCents = Math.round(priceStrategici * 100);
      description = `${product.nome} — ${format.label}, ${paper.label}, ${delivery.label}, ${product.qtyLabels[i]} copie${angoliSuffixStrategici}`;
    } else if (product.type === 'businessCardRilievo') {
      const { formatIndex, paperIndex, colorIndex } = formula || {};
      const fIdx = Number.isInteger(formatIndex) ? formatIndex : 0;
      const format = product.formats[Math.min(Math.max(fIdx, 0), product.formats.length - 1)];
      const pIdx = Number.isInteger(paperIndex) ? paperIndex : 0;
      const paper = format.papers[Math.min(Math.max(pIdx, 0), format.papers.length - 1)];
      const idx = Number.isInteger(tierIndex) ? tierIndex : 0;
      const tier = paper.tiers[Math.min(Math.max(idx, 0), paper.tiers.length - 1)];
      let priceRilievo = tier.price;
      let angoliSuffixRilievo = '';
      if (formula && formula.angoliArrotondati) { priceRilievo += angoliArrotondatiPrice(tier.qty); angoliSuffixRilievo = ', Angoli arrotondati'; }
      unitAmountCents = Math.round(priceRilievo * 100);
      const cIdx = Number.isInteger(colorIndex) ? colorIndex : 0;
      const colorLabel = product.colorChoices ? `, ${product.colorChoices[Math.min(Math.max(cIdx, 0), product.colorChoices.length - 1)]}` : '';
      description = `${product.nome} — ${format.label}, ${paper.label}${colorLabel}, ${tier.qty} copie${angoliSuffixRilievo}`;
    } else if (product.type === 'tshirt') {
      const f = formula || {};
      const qty = Math.max(1, Math.min(999, parseInt(f.qty, 10) || 1));
      // Righe dello stesso modello nel carrello fanno quantità insieme: la fascia
      // di prezzo (capo e stampa) si legge su groupQty, la riga resta di qty pezzi.
      const rateQty = Math.max(qty, parseInt(input && input.groupQty, 10) || 0);
      const isWhite = !!f.isWhite;
      const z = f.zones || {};
      const clampIdx = (v) => Math.min(Math.max(parseInt(v, 10) || 0, 0), 11);
      // Area massima stampabile 38×48 cm: la larghezza si ferma all'indice 9.
      const clampW = (v) => Math.min(clampIdx(v), 9);
      let printTotal = 0;
      const parts = [];
      // Breakpoints delle misure stampabili, allineati a beagle.html (max 38×48 cm).
      const W_BREAKS = [8, 10, 15, 20, 22, 25, 30, 32, 35, 38];
      const H_BREAKS = [8, 10, 15, 20, 22, 25, 30, 32, 35, 40, 45, 48];
      if (z.cuore) { printTotal += product.cuoreUnitPrice(rateQty); parts.push('cuore/manica'); }
      if (z.davanti) {
        const wI = clampW(f.davantiWidthIdx), hI = clampIdx(f.davantiHeightIdx);
        printTotal += product.areaUnitPrice(wI, hI) * product.discount(rateQty);
        parts.push(`davanti ${W_BREAKS[wI]}×${H_BREAKS[hI]} cm`);
      }
      if (z.retro) {
        const wI = clampW(f.retroWidthIdx), hI = clampIdx(f.retroHeightIdx);
        printTotal += product.areaUnitPrice(wI, hI) * product.discount(rateQty);
        parts.push(`retro ${W_BREAKS[wI]}×${H_BREAKS[hI]} cm`);
      }
      // Alcuni prodotti (alta visibilità) hanno un prezzo capo diverso per taglia:
      // se il listino espone garmentTotal si usa quello, altrimenti prezzo unico × quantità.
      const garmentTotal = typeof product.garmentTotal === 'function'
        ? product.garmentTotal(qty, f.sizes, rateQty)
        : product.garmentUnitPrice(rateQty, isWhite) * qty;
      unitAmountCents = Math.round((garmentTotal + printTotal * qty) * 100);
      const color = (f.colorName || '').toString().slice(0, 40);
      // The configurator sends `sizes` as a per-size quantity map ({S:1, M:2}), not a single
      // `size` string — reading f.size always came back empty and printed the literal word
      // "taglia" on the confirmation and the invoice. Build the real breakdown from the map,
      // and keep f.size as a fallback in case a simpler caller sends one.
      const sizeMap = f.sizes && typeof f.sizes === 'object' ? f.sizes : null;
      let sizeLabel = '';
      if (sizeMap) {
        sizeLabel = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL']
          .filter((s) => (parseInt(sizeMap[s], 10) || 0) > 0)
          .map((s) => `${s}×${parseInt(sizeMap[s], 10)}`)
          .join(' ');
      }
      if (!sizeLabel) sizeLabel = (f.size || '').toString().slice(0, 40);
      description = `${product.nome} — ${color || 'colore'}, ${sizeLabel || 'taglia non indicata'}, ${qty}pz${parts.length ? ', stampa: ' + parts.join('+') : ''}`;
    } else if (product.type === 'promo100') {
      const f = formula || {};
      const rawQty = parseInt(f.qty, 10);
      const qty = Number.isFinite(rawQty) && rawQty >= 50 && rawQty <= product.maxQty
        ? rawQty
        : product.qtyChoices[0];
      const choice = product.printChoices.find((c) => c.key === f.printKey) || product.printChoices[0];
      const isWhite = !!f.isWhite;
      // Fino a 50 e fino a 100 usano la matrice; oltre 100 il prezzo unitario resta quello della fascia 100.
      const base = qty <= 50
        ? product.matrix[50][choice.col]
        : qty <= 100
          ? product.matrix[100][choice.col]
          : (product.matrix[100][choice.col] / 100) * qty;
      const total = isWhite ? base : base * product.coloredSurcharge;
      unitAmountCents = Math.round(total * 100);
      const color = (f.colorName || '').toString().slice(0, 40);
      const sizeMap = f.sizes && typeof f.sizes === 'object' ? f.sizes : null;
      let sizeLabel = '';
      if (sizeMap) {
        sizeLabel = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL']
          .filter((s) => (parseInt(sizeMap[s], 10) || 0) > 0)
          .map((s) => `${s}×${parseInt(sizeMap[s], 10)}`)
          .join(' ');
      }
      description = `${product.nome} — ${qty}pz, ${color || 'colore'}, ${sizeLabel || 'taglie da definire'}, stampa: ${choice.label}`;
    } else if (product.type === 'cap') {
      const f = formula || {};
      const qty = Math.max(1, Math.min(9999, parseInt(f.qty, 10) || 1));
      const rateQtyCap = Math.max(qty, parseInt(input && input.groupQty, 10) || 0);
      const stampa = !!f.stampa;
      const unit = product.garmentUnitPrice(rateQtyCap) + (stampa ? product.printUnitPrice(rateQtyCap) : 0);
      unitAmountCents = Math.round(unit * qty * 100);
      const color = (f.colorName || '').toString().slice(0, 40);
      description = `${product.nome} — ${color || 'colore'}, taglia unica, ${qty}pz${stampa ? ', stampa fronte 12×8 cm' : ''}`;
    } else if (product.type === 'size') {
      const idx = Number.isInteger(sizeIndex) ? sizeIndex : 0;
      const variant = product.variants[Math.min(Math.max(idx, 0), product.variants.length - 1)];
      unitAmountCents = Math.round(variant.price * 100);
      description = `${product.nome} — ${variant.label}`;
    } else {
      const e = new Error('Questo prodotto richiede un preventivo, non è acquistabile online');
      e.status = 400;
      throw e;
    }

  return { unitAmountCents, description };
}

// Prezza un carrello intero: le righe dello stesso gruppo (adulto + bambino dello
// stesso modello) sommano le quantità e leggono insieme la fascia di prezzo.
function priceCart(items) {
  const groupQty = {};
  items.forEach((it) => {
    const product = PRICING[(it || {}).productId];
    if (!product || (product.type !== 'tshirt' && product.type !== 'cap')) return;
    const g = qtyGroup(it.productId);
    const q = Math.max(1, parseInt((it.formula || {}).qty, 10) || 1);
    groupQty[g] = (groupQty[g] || 0) + q;
  });
  return items.map((it) => {
    const g = qtyGroup((it || {}).productId);
    const priced = priceItem(Object.assign({}, it, { groupQty: groupQty[g] }));
    return Object.assign({ productId: (it || {}).productId, groupQty: groupQty[g] || null }, priced);
  });
}

module.exports = { priceItem, priceCart };
