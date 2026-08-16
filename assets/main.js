(function () {
  document.documentElement.classList.add('js');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Lenis smooth scroll ---------- */
  var lenis = null;
  if (window.Lenis && !reduce) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true, wheelMultiplier: 0.95, touchMultiplier: 1.6 });
    function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    window.__lenis = lenis;
  }

  /* ---------- anchor scrolling ---------- */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href');
    if (!id || id === '#') return;
    var el = document.querySelector(id);
    if (!el) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(el, { offset: -10, duration: 1.4 });
    else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    var mm = document.getElementById('mobmenu');
    if (mm && mm.classList.contains('open')) closeMenu();
  });

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  var watched = document.querySelectorAll('.rv, .mask, .imgwrap');
  watched.forEach(function (el) { io.observe(el); });

  /* safety: anything already in view (or if IO misbehaves) reveals shortly after load */
  setTimeout(function () {
    watched.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 1.15) el.classList.add('in');
    });
  }, 260);

  /* ---------- nav state ---------- */
  var nav = document.querySelector('.nav');
  var darkZones = Array.prototype.slice.call(document.querySelectorAll('[data-nav="dark"]'));

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (nav) {
      nav.classList.toggle('scrolled', y > 12);
      var probe = 34, dark = false;
      darkZones.forEach(function (z) {
        var r = z.getBoundingClientRect();
        if (r.top <= probe && r.bottom >= probe) dark = true;
      });
      nav.classList.toggle('on-dark-nav', dark);
    }
    /* parallax */
    document.querySelectorAll('[data-para]').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
      var speed = parseFloat(el.getAttribute('data-para')) || 0.08;
      var mid = r.top + r.height / 2 - window.innerHeight / 2;
      el.style.transform = 'translate3d(0,' + (-mid * speed).toFixed(2) + 'px,0)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ---------- custom cursor ---------- */
  var cur = document.querySelector('.cursor');
  if (cur && window.matchMedia('(hover:hover)').matches) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0) scale(' + (cur.classList.contains('on') ? 1 : 0) + ')';
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll('[data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cur.textContent = el.getAttribute('data-cursor') || 'VIEW';
        cur.classList.add('on');
      });
      el.addEventListener('mouseleave', function () { cur.classList.remove('on'); });
    });
  }

  /* ---------- mobile menu ---------- */
  var burger = document.getElementById('burger');
  var mm = document.getElementById('mobmenu');
  function closeMenu() {
    if (!mm) return;
    mm.classList.remove('open');
    mm.style.opacity = '0'; mm.style.pointerEvents = 'none';
    document.body.style.overflow = '';
    if (lenis) lenis.start();
  }
  function openMenu() {
    if (!mm) return;
    mm.classList.add('open');
    mm.style.opacity = '1'; mm.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
  }
  if (burger && mm) {
    burger.addEventListener('click', function () {
      mm.classList.contains('open') ? closeMenu() : openMenu();
    });
    mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  }
  window.closeMenu = closeMenu;

  /* ---------- year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (e) { e.textContent = '2026'; });
})();
