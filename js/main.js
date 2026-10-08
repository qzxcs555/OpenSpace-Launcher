/* ============================================================
   OpenSpace Launcher — сайт. Чистый JS, работает с file://
   (без модулей, fetch и внешних запросов).
   ============================================================ */

/* ------------------------------------------------------------
   ВАЖНО: если хотите давать ссылку на файл в облаке
   (Google Drive, Discord и т.п.) — вставьте её сюда в кавычки.
   Она будет приоритетной для ВСЕХ кнопок «Скачать».
   Пустая строка = качаем локальный файл из папки download/.
   ------------------------------------------------------------ */
var MIRROR_URL = '';

/* ---------- кнопки «Скачать» ---------- */
(function () {
  if (!MIRROR_URL) return;
  var links = document.querySelectorAll('a[href*="download/"]');
  for (var i = 0; i < links.length; i++) {
    links[i].setAttribute('href', MIRROR_URL);
  }
})();

/* ---------- звёздный фон ---------- */
(function () {
  var canvas = document.getElementById('stars');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2);
  var stars = [];
  var shooting = null;
  var paused = false;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    fill();
  }

  function fill() {
    var count = Math.min(240, Math.round((W * H) / 7000));
    stars = [];
    for (var i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.4 + 0.3,
        a: Math.random(),           // фаза мерцания
        s: Math.random() * 0.015 + 0.004, // скорость мерцания
        v: Math.random() * 0.16 + 0.03,   // скорость дрейфа
        hue: Math.random() < 0.22 ? 'cyan' : (Math.random() < 0.4 ? 'violet' : 'white')
      });
    }
  }

  function starColor(hue, alpha) {
    if (hue === 'cyan') return 'rgba(140, 236, 255,' + alpha + ')';
    if (hue === 'violet') return 'rgba(190, 165, 255,' + alpha + ')';
    return 'rgba(255, 255, 255,' + alpha + ')';
  }

  function spawnShootingStar() {
    shooting = {
      x: Math.random() * W * 0.8,
      y: Math.random() * H * 0.4,
      len: Math.random() * 110 + 70,
      speed: Math.random() * 9 + 11,
      life: 1
    };
  }

  var nextShoot = 2600;

  function frame() {
    if (paused) { requestAnimationFrame(frame); return; }
    ctx.clearRect(0, 0, W, H);

    // звёзды
    for (var i = 0; i < stars.length; i++) {
      var st = stars[i];
      st.a += st.s;
      st.y += st.v;
      if (st.y > H + 4) { st.y = -4; st.x = Math.random() * W; }
      var alpha = 0.35 + Math.abs(Math.sin(st.a)) * 0.65;
      ctx.fillStyle = starColor(st.hue, alpha);
      ctx.beginPath();
      ctx.arc(st.x, st.y, st.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // падающая звезда
    nextShoot -= 16;
    if (!shooting && nextShoot <= 0) {
      spawnShootingStar();
      nextShoot = 3800 + Math.random() * 5200;
    }
    if (shooting) {
      var sh = shooting;
      var tx = sh.x + sh.len * 0.85;
      var ty = sh.y + sh.len * 0.5;
      var grad = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
      grad.addColorStop(0, 'rgba(255,255,255,' + sh.life + ')');
      grad.addColorStop(0.4, 'rgba(160,190,255,' + sh.life * 0.7 + ')');
      grad.addColorStop(1, 'rgba(139,92,246,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      sh.x += sh.speed;
      sh.y += sh.speed * 0.58;
      sh.life -= 0.014;
      if (sh.life <= 0) shooting = null;
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', function () {
    paused = document.hidden;
  });
  resize();
  requestAnimationFrame(frame);
})();

/* ---------- шапка: фон при прокрутке ---------- */
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---------- мобильное меню ---------- */
(function () {
  var burger = document.getElementById('navBurger');
  var links = document.getElementById('navLinks');
  if (!burger || !links) return;
  burger.addEventListener('click', function () {
    links.classList.toggle('open');
  });
  links.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') links.classList.remove('open');
  });
})();

/* ---------- активный пункт меню по секции ---------- */
(function () {
  var links = document.querySelectorAll('.nav-links a');
  var map = {};
  var sections = [];
  for (var i = 0; i < links.length; i++) {
    var href = links[i].getAttribute('href') || '';
    if (href.charAt(0) === '#') {
      var sec = document.getElementById(href.slice(1));
      if (sec) { map[href.slice(1)] = links[i]; sections.push(sec); }
    }
  }
  if (!sections.length || !('IntersectionObserver' in window)) return;

  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      var e = entries[j];
      if (e.isIntersecting) {
        for (var id in map) map[id].classList.remove('active');
        if (map[e.target.id]) map[e.target.id].classList.add('active');
      }
    }
  }, { rootMargin: '-40% 0px -50% 0px' });

  for (var k = 0; k < sections.length; k++) io.observe(sections[k]);
})();

/* ---------- появление блоков при прокрутке ---------- */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < els.length; i++) els[i].classList.add('visible');
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var j = 0; j < entries.length; j++) {
      if (entries[j].isIntersecting) {
        entries[j].target.classList.add('visible');
        io.unobserve(entries[j].target);
      }
    }
  }, { threshold: 0.12 });
  for (var k = 0; k < els.length; k++) io.observe(els[k]);
})();

/* ---------- свечение карточки за курсором ---------- */
(function () {
  var cards = document.querySelectorAll('.card');
  for (var i = 0; i < cards.length; i++) {
    (function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        card.style.setProperty('--my', (e.clientY - r.top) + 'px');
      });
    })(cards[i]);
  }
})();
