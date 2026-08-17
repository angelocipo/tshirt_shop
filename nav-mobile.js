/* Mobile nav: on phones the hover dropdowns can't open, so the first tap on a
   parent item expands its submenu inline and the second tap follows the link. */
(function () {
  var MQ = '(max-width: 700px)';

  var css = '@media ' + MQ + ' {' +
    'nav.nav .nav-drop { display: block !important; width: 100%; position: relative; }' +
    'nav.nav .nav-drop > a { display: flex; align-items: center; justify-content: space-between; min-height: 44px; }' +
    'nav.nav .nav-drop > a::after { content: "+"; font-family: var(--font-heading, inherit); font-weight: 800; font-size: 15px; line-height: 1; opacity: .55; padding-left: 10px; }' +
    'nav.nav .nav-drop.nav-open > a::after { content: "\\2212"; }' +
    'nav.nav .nav-drop.nav-open > .nav-sub,' +
    'nav.nav .nav-sub .nav-drop.nav-open > .nav-sub-2 {' +
      'display: flex !important; position: static !important; top: auto !important; left: auto !important;' +
      'width: 100%; min-width: 0; margin: 2px 0 8px; border: 0;' +
      'border-left: 2px solid var(--color-accent, #ec3013); background: transparent;' +
    '}' +
    'nav.nav .nav-sub > a, nav.nav .nav-sub > span,' +
    'nav.nav .nav-sub-2 > a, nav.nav .nav-sub-2 > span {' +
      'white-space: normal; min-height: 44px; display: flex; align-items: center; padding: 10px 12px;' +
    '}' +
    'nav.nav .nav-sub .nav-drop > a { padding-left: 12px; }' +
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
