/* Carrello condiviso — le righe restano in localStorage finché non si va al checkout.
   Ogni pagina prodotto chiama:  window.tsCart.add({ id, name, price, col, body, img, url })
   Il contatore nel menu e la conferma a schermo sono gestiti qui.

   Forma di una riga:
   { k, id, name, price (numero), col, body (orderBody per l'API), img, url } */
(function () {
  if (window.tsCart) return;
  var KEY = 'ts_cart';
  // Prodotti che fanno quantità insieme: adulto e bambino dello stesso modello.
  // Deve restare allineato a QTY_GROUPS in api/_pricing-data.js.
  var GROUPS = {
    'felpa-urban': 'felpa-urban', 'felpa-urban-kids': 'felpa-urban',
    'felpa-badet': 'felpa-badet', 'felpa-badet-kids': 'felpa-badet',
  };
  function groupOf(id) { return GROUPS[id] || id; }
  function rowQty(r) {
    var f = r && r.body && r.body.formula;
    return Math.max(0, parseInt(f && f.qty, 10) || 0);
  }
  // Pezzi già nel carrello per il gruppo di questo prodotto.
  function groupQty(id) {
    var g = groupOf(id);
    return read().reduce(function (s, r) { return s + (groupOf(r.id) === g ? rowQty(r) : 0); }, 0);
  }

  function read() {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(a) ? a.filter(function (r) { return r && r.id; }) : [];
    } catch (e) { return []; }
  }
  function write(a) {
    try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {}
    paint();
    try { document.dispatchEvent(new CustomEvent('ts-cart-change')); } catch (e) {}
  }
  function count() { return read().length; }
  function subtotal() {
    return read().reduce(function (s, r) { return s + (parseFloat(r.price) || 0); }, 0);
  }
  function add(item) {
    var a = read();
    var row = {};
    for (var k in item) if (Object.prototype.hasOwnProperty.call(item, k)) row[k] = item[k];
    row.k = 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    row.price = +(parseFloat(item.price) || 0).toFixed(2);
    a.push(row);
    write(a);
    return row;
  }
  function removeAt(i) { var a = read(); a.splice(i, 1); write(a); }
  function clear() { write([]); }

  function fmt(n) {
    return '€ ' + (Math.round(n * 100) / 100).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // Il menu viene iniettato da site-nav.js (e rimontato da React sulle pagine prodotto):
  // si osserva solo il segnaposto del menu, non tutta la pagina.
  var paintQueued = false;
  function watchNav() {
    if (!window.MutationObserver) return;
    var slots = document.querySelectorAll('[data-site-nav]');
    for (var i = 0; i < slots.length; i++) {
      if (slots[i].getAttribute('data-cart-watch') === '1') continue;
      slots[i].setAttribute('data-cart-watch', '1');
      new MutationObserver(function () {
        if (paintQueued) return;
        paintQueued = true;
        requestAnimationFrame(function () { paintQueued = false; paint(); });
      }).observe(slots[i], { childList: true, subtree: true });
    }
  }

  // Idempotente: scrive solo se il valore cambia, altrimenti l'osservatore qui sotto
  // rileverebbe la propria scrittura e ripartirebbe all'infinito.
  function paint() {
    var n = String(count());
    var full = count() > 0 ? '1' : '0';
    var nodes = document.querySelectorAll('[data-cart-count]');
    for (var i = 0; i < nodes.length; i++) {
      if (nodes[i].textContent !== n) nodes[i].textContent = n;
    }
    var links = document.querySelectorAll('[data-cart-link]');
    for (var j = 0; j < links.length; j++) {
      if (links[j].getAttribute('data-cart-full') !== full) links[j].setAttribute('data-cart-full', full);
    }
    watchNav();
  }

  var TOAST_CSS = [
    '[data-ts-toast] { position: fixed; inset: 0; z-index: 9000; display: flex; align-items: center; justify-content: center;',
    '  padding: 16px; background: rgba(0,0,0,.45); opacity: 0; pointer-events: none; transition: opacity .2s ease; }',
    '[data-ts-toast][data-on="1"] { opacity: 1; pointer-events: auto; }',
    '[data-ts-toast] .ts-t-card { background: var(--color-surface, #fff); border: 2px solid var(--color-text, #1d1f20);',
    '  padding: 36px 32px 28px; width: 440px; max-width: 100%; text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,.28);',
    '  font-family: var(--font-body, system-ui); transform: scale(.92); transition: transform .2s ease; }',
    '[data-ts-toast][data-on="1"] .ts-t-card { transform: scale(1); }',
    '[data-ts-toast] .ts-t-check { width: 56px; height: 56px; border-radius: 50%; background: var(--color-accent, #ec3013); color: #fff;',
    '  display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }',
    '[data-ts-toast] .ts-t-msg { font-family: var(--font-heading, system-ui); font-weight: 800; font-size: 28px; line-height: 1.1; color: var(--color-text, #1d1f20); margin: 0 0 24px; }',
    '[data-ts-toast] .ts-t-actions { display: flex; flex-direction: column; gap: 10px; }',
    '[data-ts-toast] .ts-t-go { display: block; padding: 15px 20px; background: var(--color-accent, #ec3013); color: #fff; font-weight: 700; font-size: 17px; text-decoration: none; }',
    '[data-ts-toast] .ts-t-go:hover { filter: brightness(.92); color: #fff; }',
    '[data-ts-toast] .ts-t-stay { padding: 12px 20px; background: none; border: 1px solid var(--color-divider, #cfcccc); font: inherit; font-size: 15px; color: var(--color-text, #1d1f20); cursor: pointer; }',
    '[data-ts-toast] .ts-t-stay:hover { border-color: var(--color-text, #1d1f20); }',
    '@media print { [data-ts-toast] { display: none; } }',
  ].join('\n');

  var toastEl = null, toastTimer = null;
  function toast(msg, linkLabel) {
    if (!document.querySelector('[data-ts-toast-css]')) {
      var st = document.createElement('style');
      st.setAttribute('data-ts-toast-css', '');
      st.textContent = TOAST_CSS;
      (document.head || document.documentElement).appendChild(st);
    }
    if (!toastEl || !toastEl.isConnected) {
      toastEl = document.createElement('div');
      toastEl.setAttribute('data-ts-toast', '');
      toastEl.setAttribute('role', 'dialog');
      toastEl.setAttribute('aria-modal', 'true');
      toastEl.addEventListener('click', function (e) {
        if (e.target === toastEl || e.target.closest('.ts-t-stay')) toastEl.removeAttribute('data-on');
      });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && toastEl) toastEl.removeAttribute('data-on'); });
      document.body.appendChild(toastEl);
    }
    var en = /cart/i.test(linkLabel || '');
    toastEl.innerHTML = '<div class="ts-t-card">' +
      '<div class="ts-t-check"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg></div>' +
      '<p class="ts-t-msg">' + msg + '</p>' +
      '<div class="ts-t-actions">' +
      '<a class="ts-t-go" href="carrello.html">' + (linkLabel || 'Vai al carrello') + ' (<span data-cart-count>' + count() + '</span>)</a>' +
      '<button type="button" class="ts-t-stay">' + (en ? 'Keep shopping' : 'Continua gli acquisti') + '</button>' +
      '</div></div>';
    paint();
    requestAnimationFrame(function () { toastEl.setAttribute('data-on', '1'); });
    if (toastTimer) clearTimeout(toastTimer);
    var go = toastEl.querySelector('.ts-t-go'); if (go) go.focus({ preventScroll: true });
  }

  window.tsCart = {
    list: read, add: add, removeAt: removeAt, clear: clear,
    count: count, subtotal: subtotal, fmt: fmt, paint: paint, toast: toast,
    groupOf: groupOf, groupQty: groupQty, rowQty: rowQty,
    shippingFee: function (sub) {
      var s = typeof sub === 'number' ? sub : subtotal();
      return s >= 50 ? 0 : 8;
    },
  };

  // Ordine andato a buon fine: il carrello si svuota sulla pagina di ringraziamento.
  if (/grazie\.html$/.test(location.pathname)) { try { localStorage.removeItem(KEY); } catch (e) {} }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
  else paint();
  window.addEventListener('storage', function (e) { if (!e.key || e.key === KEY) paint(); });
})();
