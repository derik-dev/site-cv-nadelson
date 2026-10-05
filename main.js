(function () {
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preloader
  var pre = $('#preloader');
  function hidePre() { if (pre) { pre.style.opacity = '0'; setTimeout(function () { pre.style.display = 'none'; }, 400); } }
  window.addEventListener('load', function () { setTimeout(hidePre, 400); });
  setTimeout(hidePre, 3000);
  $('.preloaderCls').addEventListener('click', hidePre);

  // Texto circular (lettering)
  $$('.logo-animation').forEach(function (el) {
    var t = el.textContent; el.textContent = '';
    t.split('').forEach(function (ch, i) {
      var s = document.createElement('span');
      s.className = 'char' + (i + 1); s.style.setProperty('--rotate-letter', (360 / t.length) + 'deg'); s.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(s);
    });
  });

  // Header fixo
  var sticky = $('.sticky-wrapper'), up = $('.scroll-top');
  function onScroll() {
    var y = window.scrollY;
    if (sticky) sticky.classList.toggle('sticky', y > 500);
    if (up) up.classList.toggle('show', y > 600);
    spy();
  }
  up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' }); });

  // Menu mobile
  var wrap = $('.th-menu-wrapper');
  $$('.th-menu-toggle').forEach(function (b) { b.addEventListener('click', function () { wrap.classList.toggle('th-body-visible'); }); });
  wrap.addEventListener('click', function (e) { if (e.target === wrap) wrap.classList.remove('th-body-visible'); });
  $$('a', wrap).forEach(function (a) {
    a.addEventListener('click', function (e) {
      var li = a.parentElement, sub = li.querySelector(':scope > .sub-menu');
      if (sub && a.getAttribute('href') === '#' ) { e.preventDefault(); }
      if (!sub) wrap.classList.remove('th-body-visible');
    });
  });
  $$('.th-mobile-menu .menu-item-has-children').forEach(function (li) {
    var btn = document.createElement('span'); btn.className = 'th-mean-expand'; li.appendChild(btn);
    btn.addEventListener('click', function () { li.classList.toggle('th-active'); var s = li.querySelector(':scope > .sub-menu'); s.style.display = s.style.display === 'block' ? 'none' : 'block'; });
  });

  // Scrollspy
  var secs = $$('main > section[id]'), links = $$('.main-menu a[href^="#"]');
  function spy() {
    var cur = secs[0] && secs[0].id;
    secs.forEach(function (s) { if (window.scrollY >= s.offsetTop - 180) cur = s.id; });
    links.forEach(function (l) { l.parentElement.classList.toggle('active', l.getAttribute('href') === '#' + cur); });
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // Slider do hero
  if (window.Swiper && $('#heroSlider') && document.querySelectorAll('#heroSlider .swiper-slide').length > 1) {
    new Swiper('#heroSlider', { effect: 'fade', fadeEffect: { crossFade: true }, autoHeight: true, loop: false, speed: 900, autoplay: reduced ? false : { delay: 7000, disableOnInteraction: false }, pagination: { el: '.slider-pagination', clickable: true } });
  }

  // Contadores
  function count(el) {
    var to = parseInt(el.getAttribute('data-to'), 10), sfx = el.getAttribute('data-suffix') || '', t0 = null, dur = 1400;
    var fmt = function (v) { return v.toLocaleString('pt-BR') + sfx; };
    if (reduced || !to) { el.textContent = fmt(to); return; }
    function step(ts) { if (!t0) t0 = ts; var p = Math.min((ts - t0) / dur, 1); el.textContent = fmt(Math.round(to * p)); if (p < 1) requestAnimationFrame(step); }
    requestAnimationFrame(step);
  }

  // Aparecer ao rolar + contadores
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (!reduced && e.target.animate) e.target.animate([{ opacity: .35, transform: 'translateY(26px)' }, { opacity: 1, transform: 'none' }], { duration: 650, easing: 'ease-out' });
        $$('.counter-number', e.target).forEach(count);
        io.unobserve(e.target);
      });
    }, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
    $$('.reveal').forEach(function (el) { io.observe(el); });
  } else { $$('.counter-number').forEach(count); }

  // Efeito tilt nas imagens
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    $$('.tilt-active').forEach(function (img) {
      img.style.transition = 'transform .15s ease-out'; img.style.willChange = 'transform';
      img.addEventListener('mousemove', function (e) {
        var r = img.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        img.style.transform = 'perspective(800px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 8) + 'deg) scale(1.02)';
      });
      img.addEventListener('mouseleave', function () { img.style.transform = ''; });
    });
  }

  // Acordeões ENAP
  $$('.accordion-card').forEach(function (card) {
    var btn = $('.accordion-button', card), body = $('.accordion-collapse', card);
    btn.addEventListener('click', function () {
      var open = body.classList.toggle('show');
      btn.classList.toggle('collapsed', !open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

  // Busca e filtro ENAP
  var input = $('#certSearch'), btns = $$('.filters button'), cards = $$('#enapBlocks .accordion-card'), none = $('#noResults'), cat = 'all';
  function apply() {
    var q = input.value.trim().toLowerCase(), shown = 0;
    cards.forEach(function (c) {
      var ok = (cat === 'all' || c.getAttribute('data-cat').split(' ').indexOf(cat) > -1) && (!q || c.textContent.toLowerCase().indexOf(q) > -1);
      c.style.display = ok ? '' : 'none';
      if (ok) { shown++; if (q) { $('.accordion-collapse', c).classList.add('show'); $('.accordion-button', c).classList.remove('collapsed'); } }
    });
    none.hidden = shown > 0;
  }
  input.addEventListener('input', apply);
  btns.forEach(function (b) { b.addEventListener('click', function () { btns.forEach(function (x) { x.classList.remove('active'); }); b.classList.add('active'); cat = b.getAttribute('data-filter'); apply(); }); });

  // Formulário -> WhatsApp
  $('#waForm').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = $('#fNome').value.trim(), em = $('#fEmail').value.trim(), t = $('#fTel').value.trim(), m = $('#fMsg').value.trim();
    var txt = 'Olá, Nadelson. Meu nome é ' + n + '.' + (em ? ' E-mail: ' + em + '.' : '') + (t ? ' Telefone: ' + t + '.' : '') + '\n\n' + m;
    window.open('https://wa.me/5521988292915?text=' + encodeURIComponent(txt), '_blank', 'noopener');
  });
})();
