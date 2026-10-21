/* Mobile nav: on phones the hover dropdowns can't open, so the first tap on a
   parent item expands its submenu inline and the second tap follows the link. */
(function () {
  var MQ = '(max-width: 700px)';

  var css = '@media ' + MQ + ' {' +
    'nav.nav { position: relative; column-gap: 11px; row-gap: 0 !important; padding-top: 8px !important; padding-bottom: 8px !important; justify-content: center; }' +
    'nav.nav .nav-drop { display: inline-flex !important; width: auto; position: relative; }' +
    'nav.nav > a:not(.nav-brand), nav.nav .nav-drop > a { font-size: 13px; }' +
    'nav.nav > a:not(.nav-brand) { display: flex; align-items: center; min-height: 20px; padding: 0; line-height: 1.05; }' +
    'nav.nav .nav-drop > a { display: flex; align-items: center; min-height: 20px; line-height: 1.05; }' +
    'nav.nav .nav-drop.nav-open > a { color: var(--color-accent, #ec3013); }' +
    'nav.nav .nav-drop.nav-open > .nav-sub {' +
      'display: flex !important; flex-direction: column !important; align-items: stretch !important;' +
      'position: absolute !important; top: 100% !important; left: 0 !important;' +
      'width: max-content !important; min-width: 0 !important; max-width: 80vw; height: auto !important; margin: 0;' +
      'left: 50% !important; transform: translateX(-50%);' +
      'border: 1px solid var(--color-divider); background: var(--color-surface); z-index: 70;' +
    '}' +
    'nav.nav .nav-drop:first-of-type.nav-open > .nav-sub { left: 0 !important; right: auto !important; transform: none; }' +
    'nav.nav .nav-drop:last-of-type.nav-open > .nav-sub { left: auto !important; right: 0 !important; transform: none; }' +
    'nav.nav .nav-drop:not(.nav-open) > .nav-sub { display: none !important; }' +
    'nav.nav .nav-sub-2 { display: none !important; }' +
    'nav.nav .nav-sub, nav.nav .nav-sub-2 { padding: 5px 0; }' +
    'nav.nav .nav-sub > a, nav.nav .nav-sub > span,' +
    'nav.nav .nav-sub-2 > a, nav.nav .nav-sub-2 > span {' +
      'white-space: nowrap; min-height: 0 !important; height: auto !important; display: flex; align-items: center;' +
      'justify-content: center; text-align: center;' +
      'padding: 7px 14px !important; font-size: 13px; line-height: 1.25;' +
    '}' +
    'nav.nav .btn-primary { margin-top: 18px; }' +
    'nav.nav .nav-sub .nav-drop { display: block !important; width: auto; }' +
    'nav.nav .nav-sub .nav-drop > a { min-height: 0 !important; padding: 7px 14px !important; justify-content: center; text-align: center; }' +
    '}';

  var style = document.createElement('style');
  style.setAttribute('data-nav-mobile', '');
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);

  function isMobile() {
    return window.matchMedia && window.matchMedia(MQ).matches;
  }

  document.addEventListener('click', function (e) {
    if (!isMobile()) return;
    var link = e.target.closest ? e.target.closest('nav.nav .nav-drop > a') : null;
    if (!link) return;
    var drop = link.parentElement;
    if (!drop || !drop.classList.contains('nav-drop')) return;
    // only top-level items expand; second-level items (Polo, Camicie…) just follow their link
    if (!drop.parentElement || !drop.parentElement.classList.contains('nav')) return;
    if (!drop.querySelector('.nav-sub')) return;
    if (drop.classList.contains('nav-open')) return; // second tap follows the link

    e.preventDefault();
    var parentScope = drop.parentElement;
    if (parentScope) {
      Array.prototype.forEach.call(parentScope.children, function (sib) {
        if (sib !== drop && sib.classList && sib.classList.contains('nav-open')) {
          sib.classList.remove('nav-open');
          Array.prototype.forEach.call(sib.querySelectorAll('.nav-open'), function (n) {
            n.classList.remove('nav-open');
          });
        }
      });
    }
    drop.classList.add('nav-open');
    clampSub(drop);
  }, true);

  // keep the open submenu inside the viewport (portrait phones)
  function clampSub(drop) {
    var sub = drop.querySelector('.nav-sub');
    if (!sub) return;
    sub.style.setProperty('transform', 'none', 'important');
    sub.style.setProperty('right', 'auto', 'important');
    sub.style.setProperty('left', '0px', 'important');
    var vw = document.documentElement.clientWidth, pad = 8;
    var d = drop.getBoundingClientRect(), w = sub.getBoundingClientRect().width;
    var x = d.left + d.width / 2 - w / 2;
    x = Math.max(pad, Math.min(x, vw - pad - w));
    sub.style.setProperty('left', (x - d.left) + 'px', 'important');
  }

  window.addEventListener('resize', function () {
    if (isMobile()) {
      Array.prototype.forEach.call(document.querySelectorAll('nav.nav > .nav-drop.nav-open'), clampSub);
      return;
    }
    Array.prototype.forEach.call(document.querySelectorAll('.nav-open'), function (n) {
      n.classList.remove('nav-open');
    });
  });
})();
