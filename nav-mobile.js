/* Mobile nav: on phones the hover dropdowns can't open, so the first tap on a
   parent item expands its submenu inline and the second tap follows the link. */
(function () {
  var MQ = '(max-width: 700px)';

  var css = '@media ' + MQ + ' {' +
    'nav.nav { position: relative; column-gap: 11px; }' +
    'nav.nav .nav-lang { position: absolute; top: 10px; right: 18px; margin-left: 0 !important; }' +
    'nav.nav .nav-brand { flex: 1 1 100%; min-width: 0; box-sizing: border-box; padding-right: 96px; font-size: 15px; overflow: hidden; }' +
    'nav.nav .nav-brand > span { overflow: hidden; text-overflow: ellipsis; }' +
    'nav.nav .nav-brand > span > span { display: none; }' +
    'nav.nav .nav-drop { display: inline-flex !important; width: auto; position: relative; }' +
    'nav.nav > a:not(.nav-brand), nav.nav .nav-drop > a { font-size: 13px; }' +
    'nav.nav .nav-drop > a { display: flex; align-items: center; min-height: 44px; }' +
    'nav.nav .nav-drop.nav-open > a { color: var(--color-accent, #ec3013); }' +
    'nav.nav .nav-drop.nav-open > .nav-sub {' +
      'display: flex !important; flex-direction: column !important; align-items: stretch !important;' +
      'position: absolute !important; top: 100% !important; left: 0 !important;' +
      'width: max-content !important; min-width: 0 !important; max-width: 80vw; height: auto !important; margin: 0;' +
      'border: 1px solid var(--color-divider); background: var(--color-surface); z-index: 70;' +
    '}' +
    'nav.nav .nav-drop:not(.nav-open) > .nav-sub { display: none !important; }' +
    'nav.nav .nav-sub .nav-drop:not(.nav-open) > .nav-sub-2 { display: none !important; }' +
    'nav.nav .nav-sub .nav-drop.nav-open > .nav-sub-2 {' +
      'display: flex !important; flex-direction: column !important; position: static !important;' +
      'top: auto !important; left: auto !important; width: auto !important; min-width: 0 !important;' +
      'height: auto !important; margin: 0 0 6px 10px; border: 0; border-left: 2px solid var(--color-accent, #ec3013); background: transparent;' +
    '}' +
    'nav.nav .nav-sub, nav.nav .nav-sub-2 { padding: 2px 0; }' +
    'nav.nav .nav-sub > a, nav.nav .nav-sub > span,' +
    'nav.nav .nav-sub-2 > a, nav.nav .nav-sub-2 > span {' +
      'white-space: nowrap; min-height: 0 !important; height: auto !important; display: flex; align-items: center;' +
      'padding: 8px 12px !important; font-size: 13px; line-height: 1.25;' +
    '}' +
    'nav.nav .nav-sub .nav-drop { display: block !important; width: auto; }' +
    'nav.nav .nav-sub .nav-drop > a { min-height: 0 !important; padding: 8px 12px !important; }' +
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
    if (!drop.querySelector('.nav-sub, .nav-sub-2')) return;
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
  }, true);

  window.addEventListener('resize', function () {
    if (isMobile()) return;
    Array.prototype.forEach.call(document.querySelectorAll('.nav-open'), function (n) {
      n.classList.remove('nav-open');
    });
  });
})();
