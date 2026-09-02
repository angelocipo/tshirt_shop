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
        { it: 'Tutte le promozioni', en: 'All promotions', href: 'promozioni.html' },
        { it: '100 Magliette + Stampa', en: '100 T-Shirts + Printing', href: 'promozione-100-magliette.html' },
        { it: 'Altre offerte in arrivo', en: 'More offers coming soon' },
      ] },
      { it: 'Uomo', en: 'Men', href: 'uomo.html', sub: [
        { it: 'T-shirt', en: 'T-shirts', href: 'tshirt-uomo.html', sub: [
          { it: 'Maglietta Beagle', en: 'Beagle T-Shirt', href: 'beagle.html' },
          { it: 'Maglietta Tecnica Bahrain', en: 'Bahrain Technical T-Shirt', href: 'bahrain.html' },
          { it: 'Atomic — in arrivo', en: 'Atomic — coming soon' },
        ] },
        { it: 'Polo', en: 'Polo', href: 'polo-uomo.html', sub: [
          { it: 'Polo Austral', en: 'Austral Polo', href: 'austral-polo.html' },
          { it: 'Polo Star', en: 'Star Polo', href: 'star-polo.html' },
        ] },
        { it: 'Giubbotti', en: 'Jackets', href: 'giubbotti-uomo.html', sub: [
          { it: 'Giubbotto Nebraska', en: 'Nebraska Softshell', href: 'nebraska.html' },
          { it: 'Giubbotto Rudolph', en: 'Rudolph Softshell', href: 'rudolph.html' },
        ] },
      ] },
      { it: 'Donna', en: 'Women', href: 'donna.html', sub: [
        { it: 'T-shirt', en: 'T-shirts', href: 'tshirt-donna.html', sub: [
          { it: 'Maglietta Jamaica Donna', en: "Jamaica Women's T-Shirt", href: 'jamaica.html' },
          { it: 'Maglietta Tecnica Bahrain Donna', en: "Bahrain Women's Technical T-Shirt", href: 'bahrain-donna.html' },
        ] },
        { it: 'Polo', en: 'Polo', href: 'polo-donna.html', sub: [
          { it: 'Polo Star Donna', en: "Star Women's Polo", href: 'star-polo-donna.html' },
        ] },
        { it: 'Giubbotti', en: 'Jackets', href: 'giubbotti-donna.html', sub: [
          { it: 'Giubbotto Nebraska Donna', en: "Nebraska Women's Softshell", href: 'nebraska-donna.html' },
        ] },
      ] },
      { it: 'Bambino', en: 'Kids', href: 'bambino.html', sub: [
        { it: 'T-shirt', en: 'T-shirts', href: 'tshirt-bambino.html', sub: [
          { it: 'Maglietta Beagle Bimbo', en: 'Beagle Kids T-Shirt', href: 'beagle-kids.html' },
          { it: 'Maglietta Jamaica Bambina', en: 'Jamaica Kids T-Shirt', href: 'jamaica-kids.html' },
          { it: 'Maglietta Tecnica Bahrain Bambino', en: 'Bahrain Kids Technical T-Shirt', href: 'bahrain-kids.html' },
        ] },
        { it: 'Polo', en: 'Polo', href: 'polo-bambino.html', sub: [
          { it: 'Polo Star Bambino', en: 'Star Kids Polo', href: 'star-polo-kids.html' },
        ] },
        { it: 'Giubbotti', en: 'Jackets', href: 'nebraska-kids.html', sub: [
          { it: 'Giubbotto Nebraska Bambino', en: 'Nebraska Kids Softshell', href: 'nebraska-kids.html' },
        ] },
      ] },
      { it: 'Esempi', en: 'Examples', href: 'esempi.html' },
      { it: 'Contatti', en: 'Contact', href: 'contattateci.html' },
    ],
  };

  var CSS = [
    'nav.nav[data-site-nav] { flex-wrap: wrap; row-gap: var(--space-2); }',
    'nav.nav[data-site-nav] .nav-brand { flex: 0 0 100%; text-decoration: none; color: inherit; white-space: nowrap; font-family: var(--font-heading); font-weight: 800; display: flex; align-items: center; gap: 10px; }',
    'nav.nav[data-site-nav] .nav-brand img { height: 34px; width: auto; display: block; flex: none; }',
    'nav.nav[data-site-nav] > a:not(.nav-brand) { font-size: 14px; }',
    'nav.nav[data-site-nav] .btn-primary, nav.nav[data-site-nav] .btn-primary:hover { font-size: 14px; padding: 10px 16px; white-space: nowrap; color: var(--color-bg); }',
    'nav.nav[data-site-nav] .nav-drop { position: relative; display: inline-flex; align-items: center; }',
    'nav.nav[data-site-nav] .nav-sub { position: absolute; top: 100%; left: 0; min-width: 186px; background: var(--color-surface); border: 1px solid var(--color-divider); display: none; flex-direction: column; z-index: 60; }',
    'nav.nav[data-site-nav] .nav-drop:hover > .nav-sub, nav.nav[data-site-nav] .nav-drop:focus-within > .nav-sub { display: flex; }',
    'nav.nav[data-site-nav] .nav-sub > a { padding: 9px 12px; font-size: 14px; text-decoration: none; color: var(--color-text); white-space: nowrap; }',
    'nav.nav[data-site-nav] .nav-sub > a:hover { background: color-mix(in srgb, var(--color-accent) 12%, transparent); }',
    'nav.nav[data-site-nav] .nav-sub > span:not(.nav-drop) { padding: 9px 12px; font-size: 14px; color: var(--color-neutral-700); white-space: nowrap; }',
    'nav.nav[data-site-nav] .nav-sub .nav-drop { display: block; position: relative; }',
    'nav.nav[data-site-nav] .nav-sub-2 { position: absolute; top: -1px; left: 100%; min-width: 190px; background: var(--color-surface); border: 1px solid var(--color-divider); display: none; flex-direction: column; z-index: 61; }',
    'nav.nav[data-site-nav] .nav-sub .nav-drop:hover > .nav-sub-2, nav.nav[data-site-nav] .nav-sub .nav-drop:focus-within > .nav-sub-2 { display: flex; }',
    'nav.nav[data-site-nav] .nav-sub-2 > a { padding: 9px 12px; font-size: 14px; text-decoration: none; color: var(--color-text); white-space: nowrap; }',
    'nav.nav[data-site-nav] .nav-sub-2 > a:hover { background: color-mix(in srgb, var(--color-accent) 12%, transparent); }',
    'nav.nav[data-site-nav] .nav-sub-2 > span { padding: 9px 12px; font-size: 14px; color: var(--color-neutral-700); white-space: nowrap; }',
    'nav.nav[data-site-nav] .nav-lang { display: flex; align-items: center; border: 1px solid var(--color-divider); margin-left: auto; }',
    'nav.nav[data-site-nav] .nav-lang button { font-family: var(--font-heading); font-size: 12px; letter-spacing: .06em; padding: 7px 10px; border: none; background: transparent; color: var(--color-neutral-700); font-weight: 600; cursor: pointer; }',
    'nav.nav[data-site-nav] .nav-lang button + button { border-left: 1px solid var(--color-divider); }',
    '@media (max-width: 700px) {',
    '  nav.nav[data-site-nav] { justify-content: flex-start; padding-left: 18px; padding-right: 18px; box-sizing: border-box; }',
    '  nav.nav[data-site-nav] .btn-primary { margin-left: 0; flex: 0 0 100%; }',
    '  nav.nav[data-site-nav] .nav-sub, nav.nav[data-site-nav] .nav-sub-2 { display: none; }',
    '}',
    // alcune pagine nascondono i link del menu sotto i 600px con ".nav a { display: none }":
    // qui li rimettiamo, altrimenti su telefono resterebbe solo il logo.
    'nav.nav[data-site-nav] > a, nav.nav[data-site-nav] .nav-drop > a,',
    'nav.nav[data-site-nav] .nav-sub > a, nav.nav[data-site-nav] .nav-sub-2 > a { display: flex; align-items: center; }',
    'nav.nav[data-site-nav] > a.btn-primary { display: inline-flex; }',
  ].join('\n');

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function en(node) {
    return node.en ? ' data-en="' + esc(node.en) + '"' : '';
  }
  // Livello 2 e 3 del menu.
  function renderChild(node, depth) {
    if (node.sub && node.sub.length) {
      return '<span class="nav-drop"><a href="' + esc(node.href || '#') + '"' + en(node) + '>' + esc(node.it) + '</a>' +
        '<span class="nav-sub-' + (depth + 1) + '">' + node.sub.map(function (c) { return renderChild(c, depth + 1); }).join('') + '</span></span>';
    }
    if (!node.href) return '<span' + en(node) + '>' + esc(node.it) + '</span>';
    return '<a href="' + esc(node.href) + '"' + en(node) + '>' + esc(node.it) + '</a>';
  }
  function renderTop(item) {
    var style = item.accent ? ' style="color:#ec3013;font-weight:800;"' : '';
    var link = '<a href="' + esc(item.href || '#') + '"' + en(item) + style + '>' + esc(item.it) + '</a>';
    if (!item.sub || !item.sub.length) return link;
    return '<span class="nav-drop">' + link +
      '<span class="nav-sub">' + item.sub.map(function (c) { return renderChild(c, 1); }).join('') + '</span></span>';
  }

  function html() {
    var b = MENU.brand;
    var out = '<a href="' + esc(b.href) + '" class="nav-brand"><img src="' + esc(b.logo) + '" alt="' + esc(b.name) + '"><span>' +
      esc(b.name) + ' <span style="opacity:.55;font-weight:400;">' + esc(b.suffix) + '</span></span></a>';
    out += MENU.items.map(renderTop).join('');
    out += '<span class="nav-lang">' +
      '<button type="button" data-lang="it" aria-pressed="true">IT</button>' +
      '<button type="button" data-lang="en" aria-pressed="false">EN</button></span>';
    out += '<a class="btn btn-primary" href="' + esc(MENU.whatsapp.href) + '" style="text-decoration:none;" data-en="' +
      esc(MENU.whatsapp.en) + '">' + esc(MENU.whatsapp.it) + '</a>';
    return out;
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
