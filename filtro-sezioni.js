// Filtro sezioni: i pulsanti [data-filtro] mostrano solo gli elementi [data-sez] corrispondenti.
(function () {
  function apply(id) {
    var all = !id || id === 'tutti';
    document.querySelectorAll('[data-sez]').forEach(function (el) {
      el.style.display = all || el.getAttribute('data-sez') === id ? '' : 'none';
    });
    document.querySelectorAll('[data-filtro]').forEach(function (b) {
      var on = b.getAttribute('data-filtro') === (all ? 'tutti' : id);
      b.classList.toggle('btn-primary', on);
      b.classList.toggle('btn-secondary', !on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-filtro]');
    if (!b) return;
    e.preventDefault();
    var id = b.getAttribute('data-filtro');
    apply(id);
    history.replaceState(null, '', id === 'tutti' ? location.pathname : '#' + id);
  });
  function init() {
    if (!document.querySelector('[data-sez]')) return setTimeout(init, 100);
    var id = location.hash.slice(1);
    apply(document.querySelector('[data-sez="' + id + '"]') ? id : 'tutti');
  }
  init();
})();
