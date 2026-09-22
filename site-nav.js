/* Menu di testata condiviso.
   Un solo posto da modificare: la costante MENU qui sotto.
   Ogni pagina mette solo il segnaposto  <nav class="nav" data-site-nav></nav>
   e carica questo file:  <script defer src="site-nav.js"></script>
   (prima di i18n.js e nav-mobile.js — entrambi funzionano anche sul menu iniettato).

   COME MODIFICARE IL MENU
   - aggiungere una voce di primo livello: nuovo oggetto in MENU.items
   - aggiungere un prodotto: nuovo { it, en, href } dentro il "sub" giusto
   - voce non ancora cliccabile: ometti href e diventa testo grigio "in arrivo"
   Le etichette EN sono opzionali: se manca "en" la voce non viene tradotta. */
(function () {
  if (window.tsSiteNav) return; // il file viene caricato sia da <head> sia da <helmet>
  // Vercel Speed Insights (solo sul dominio live, non in anteprima locale)
  if (/tshirt-shop\.online$/.test(location.hostname)) {
    window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
    var siScript = document.createElement('script');
    siScript.defer = true;
    siScript.src = '/_vercel/speed-insights/script.js';
    document.head.appendChild(siScript);
  }
  var MENU = {
    brand: { href: 'index.html', logo: 'img/logo-tshirt-shop.webp', name: 'TSHIRT SHOP ONLINE', suffix: 'by Printing Italy' },
    whatsapp: { href: 'https://api.whatsapp.com/send/?phone=393396021366', it: 'Preventivo WhatsApp', en: 'Quote on WhatsApp' },
    items: [
      { it: 'PROMO', en: 'Promo', href: 'promozioni.html', accent: true, sub: [
        { it: '100 Magliette + Stampa', en: '100 T-Shirts + Printing', href: 'promozione-100-magliette.html' },
        { it: 'Maglietta Unisex 24H', en: 'Unisex T-Shirt 24H', href: 'beagle.html' },
        { it: 'Altre offerte in arrivo', en: 'More offers coming soon' },
      ] },
      { it: 'Uomo', en: 'Men', href: 'uomo.html', sub: [
        { it: 'T-shirt', en: 'T-shirts', href: 'tshirt-uomo.html' },
        { it: 'Polo', en: 'Polo', href: 'polo-uomo.html' },
        { it: 'Camicie', en: 'Shirts', href: 'camicie-uomo.html' },
        { it: 'Camici da laboratorio', en: 'Lab coats', href: 'camici-uomo.html' },
        { it: 'Sport', en: 'Sport', href: 'sport-uomo.html' },
        { it: 'Felpe', en: 'Sweatshirts', href: 'felpe.html' },
        { it: 'Giubbotti', en: 'Jackets', href: 'giubbotti-uomo.html' },
      ] },
      { it: 'Donna', en: 'Women', href: 'donna.html', sub: [
        { it: 'T-shirt', en: 'T-shirts', href: 'tshirt-donna.html' },
        { it: 'Polo', en: 'Polo', href: 'polo-donna.html' },
        { it: 'Camicie', en: 'Shirts', href: 'camicie-donna.html' },
        { it: 'Camici da laboratorio', en: 'Lab coats', href: 'camici.html' },
        { it: 'Sport', en: 'Sport', href: 'sport-donna.html' },
        { it: 'Felpe', en: 'Sweatshirts', href: 'felpe.html' },
        { it: 'Giubbotti', en: 'Jackets', href: 'giubbotti-donna.html' },
      ] },
      { it: 'Bambino', en: 'Kids', href: 'bambino.html', sub: [
        { it: 'T-shirt', en: 'T-shirts', href: 'tshirt-bambino.html' },
        { it: 'Polo', en: 'Polo', href: 'polo-bambino.html' },
        { it: 'Felpe', en: 'Sweatshirts', href: 'felpe-bambino.html' },
        { it: 'Giubbotti', en: 'Jackets', href: 'nebraska-kids.html' },
      ] },
      { it: 'Sport', en: 'Sport', href: 'sport.html', sub: [
        { it: 'Sport Uomo', en: 'Men\'s Sport', href: 'sport-uomo.html' },
        { it: 'Sport Donna', en: 'Women\'s Sport', href: 'sport-donna.html' },
        { it: 'Polo tecniche', en: 'Technical polos', href: 'sport.html#polo' },
        { it: 'T-shirt tecniche', en: 'Technical T-shirts', href: 'sport.html#tshirt' },
        { it: 'Shorts e gonne sport', en: 'Sports shorts and skirts', href: 'sport.html#shorts' },
        { it: 'Canotte e top', en: 'Vests and tops', href: 'sport.html#canotte' },
        { it: 'Leggings', en: 'Leggings', href: 'sport.html#leggings' },
        { it: 'Pantaloni e tute', en: 'Trousers and tracksuits', href: 'sport.html#pantaloni' },
        { it: 'Felpe e giacche', en: 'Sweatshirts and jackets', href: 'sport.html#felpe' },
        { it: 'Completi calcio', en: 'Football kits', href: 'sport.html#calcio' },
      ] },
      { it: 'Lavoro', en: 'Workwear', href: 'abbigliamento-lavoro-personalizzato.html', sub: [
        { it: 'Alta visibilità', en: 'High visibility', href: 'alta-visibilita.html' },
        { it: 'Camicie', en: 'Shirts', href: 'camicie.html' },
        { it: 'Camici da laboratorio', en: 'Lab coats', href: 'camici.html' },
      ] },
      { it: 'Gadget', en: 'Gadgets', href: 'cappellini.html', sub: [
        { it: 'Cappellini', en: 'All caps', href: 'cappellini.html' },
        { it: 'Zaini', en: 'Backpacks', href: 'zaini.html' },
      ] },
      { it: 'Solo stampa', en: 'Print only', href: 'solo-stampa.html' },
      { it: 'Esempi', en: 'Examples', href: 'esempi.html' },
    ],
  };

  var CSS = [
    'nav.nav[data-site-nav] { flex-wrap: wrap; row-gap: var(--space-2); }',
    'nav.nav[data-site-nav] .nav-brand { flex: 0 0 100%; text-decoration: none; color: inherit; white-space: nowrap; font-family: var(--font-heading); font-weight: 800; display: flex; align-items: center; gap: 10px; }',
    'nav.nav[data-site-nav] .nav-brand img { height: 34px; width: auto; display: block; flex: none; }',
    'nav.nav[data-site-nav] > a:not(.nav-brand) { font-size: 14px; }',
    'nav.nav[data-site-nav] .btn-primary, nav.nav[data-site-nav] .btn-primary:hover { font-size: 14px; padding: 10px 16px; white-space: nowrap; color: var(--color-bg); }',
    'nav.nav[data-site-nav] .nav-drop { position: relative; display: inline-flex; align-items: center; }',
    'nav.nav[data-site-nav] .nav-sub { position: absolute; top: 100%; left: 0; min-width: 280px; background: var(--color-neutral-200); box-shadow: 0 8px 24px rgba(0,0,0,.12); display: none; flex-direction: column; z-index: 60; }',
    'nav.nav[data-site-nav] .nav-drop:hover > .nav-sub, nav.nav[data-site-nav] .nav-drop:focus-within > .nav-sub { display: flex; }',
    'nav.nav[data-site-nav] .nav-sub > a { padding: 16px 20px; font-size: 14px; text-decoration: none; color: var(--color-text); white-space: nowrap; }',
    'nav.nav[data-site-nav] .nav-sub > a:hover { background: var(--color-neutral-300); }',
    'nav.nav[data-site-nav] .nav-sub > span:not(.nav-drop) { padding: 16px 20px; font-size: 14px; color: var(--color-text); white-space: nowrap; }',
    'nav.nav[data-site-nav] .nav-lang { display: flex; align-items: center; border: 1px solid var(--color-divider); margin-left: auto; }',
    'nav.nav[data-site-nav] .nav-lang button { font-family: var(--font-heading); font-size: 12px; letter-spacing: .06em; padding: 7px 10px; border: none; background: transparent; color: var(--color-neutral-700); font-weight: 600; cursor: pointer; }',
    'nav.nav[data-site-nav] .nav-lang button + button { border-left: 1px solid var(--color-divider); }',
    'nav.nav[data-site-nav] .nav-cart { display: inline-flex; align-items: center; gap: 7px; border: 1px solid var(--color-divider); padding: 6px 11px; text-decoration: none; color: var(--color-text); font-family: var(--font-heading); font-weight: 700; font-size: 13px; letter-spacing: .04em; }',
    'nav.nav[data-site-nav] .nav-cart:hover { background: color-mix(in srgb, var(--color-accent) 12%, transparent); }',
    'nav.nav[data-site-nav] .nav-cart svg { flex: none; }',
    'nav.nav[data-site-nav] .nav-cart[data-cart-full="1"] { border-color: var(--color-accent); color: var(--color-accent-700); }',
    '@media (max-width: 700px) {',
    '  nav.nav[data-site-nav] { justify-content: center; row-gap: 4px; padding-left: 18px; padding-right: 18px; box-sizing: border-box; }',
    '  nav.nav[data-site-nav] .nav-brand { justify-content: center; }',
    '  nav.nav[data-site-nav] > a, nav.nav[data-site-nav] .nav-drop > a { padding-top: 2px; padding-bottom: 2px; }',
    '  nav.nav[data-site-nav] .btn-primary { margin-left: 0; flex: 0 0 100%; }',
    '  nav.nav[data-site-nav] .nav-sub { display: none; }',
    '  nav.nav[data-site-nav] .nav-cart { position: absolute; top: 10px; left: 18px; padding: 5px 9px; }',
    '}',
    // alcune pagine nascondono i link del menu sotto i 600px con ".nav a { display: none }":
    // qui li rimettiamo, altrimenti su telefono resterebbe solo il logo.
    'nav.nav[data-site-nav] > a, nav.nav[data-site-nav] .nav-drop > a,',
    'nav.nav[data-site-nav] .nav-sub > a { display: flex; align-items: center; }',
    'nav.nav[data-site-nav] > a.btn-primary { display: inline-flex; }',
  ].join('\n');

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function en(node) {
    return node.en ? ' data-en="' + esc(node.en) + '"' : '';
  }
  // Livello 2 del menu (voci del sottomenu: nessuna ha pi\u00f9 un ulteriore sottolivello).
  function renderChild(node) {
    if (!node.href) return '<span' + en(node) + '>' + esc(node.it) + '</span>';
    return '<a href="' + esc(node.href) + '"' + en(node) + '>' + esc(node.it) + '</a>';
  }
  function renderTop(item) {
    var style = item.accent ? ' style="color:#ec3013;font-weight:800;"' : '';
    var link = '<a href="' + esc(item.href || '#') + '"' + en(item) + style + '>' + esc(item.it) + '</a>';
    if (!item.sub || !item.sub.length) return link;
    return '<span class="nav-drop">' + link +
      '<span class="nav-sub">' + item.sub.map(renderChild).join('') + '</span></span>';
  }

  function html() {
    var b = MENU.brand;
    var out = '<a href="' + esc(b.href) + '" class="nav-brand"><img src="' + esc(b.logo) + '" alt="' + esc(b.name) + '"><span>' +
      esc(b.name) + ' <span style="opacity:.55;font-weight:400;">' + esc(b.suffix) + '</span></span></a>';
    out += MENU.items.map(renderTop).join('');
    out += '<span class="nav-lang">' +
      '<button type="button" data-lang="it" aria-pressed="true">IT</button>' +
      '<button type="button" data-lang="en" aria-pressed="false">EN</button></span>';
    out += '<a class="nav-cart" href="carrello.html" data-cart-link aria-label="Carrello" title="Carrello">' +
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
      '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>' +
      '<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>' +
      '<span data-cart-count>0</span></a>';
    out += '<a class="btn btn-primary" href="' + esc(MENU.whatsapp.href) + '" style="text-decoration:none;" data-en="' +
      esc(MENU.whatsapp.en) + '">' + esc(MENU.whatsapp.it) + '</a>';
    return out;
  }

  // Il contatore del carrello vive in cart.js: caricalo una volta per tutte le pagine.
  if (!window.tsCart && !document.querySelector('script[data-ts-cart]')) {
    var cartScript = document.createElement('script');
    cartScript.setAttribute('data-ts-cart', '');
    cartScript.defer = true;
    cartScript.src = 'cart.js';
    (document.head || document.documentElement).appendChild(cartScript);
  }

  var style = document.createElement('style');
  style.setAttribute('data-site-nav-css', '');
  style.textContent = CSS;
  (document.head || document.documentElement).appendChild(style);

  function mount() {
    var slots = document.querySelectorAll('[data-site-nav]');
    for (var i = 0; i < slots.length; i++) {
      var el = slots[i];
      if (el.getAttribute('data-site-nav-done') === '1') continue;
      el.innerHTML = html();
      el.setAttribute('data-site-nav-done', '1');
      // Il menu appena iniettato porta il contatore a zero: cart.js lo riallinea subito.
      if (window.tsCart) window.tsCart.paint();
    }
  }

  window.tsSiteNav = { menu: MENU, mount: mount };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
  // I product page sono Design Component: React può rimontare il segnaposto.
  if (window.MutationObserver) {
    var obs = new MutationObserver(function () {
      var slots = document.querySelectorAll('[data-site-nav]:not([data-site-nav-done="1"])');
      if (slots.length) mount();
    });
    if (document.body) obs.observe(document.body, { childList: true, subtree: true });
    else document.addEventListener('DOMContentLoaded', function () { obs.observe(document.body, { childList: true, subtree: true }); });
  }
})();
