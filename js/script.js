document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Ano no rodapé ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Menu mobile ---------- */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Brasas animadas no fundo ---------- */
  const canvas = document.getElementById('embers');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    function makeParticle() {
      return {
        x: Math.random() * width,
        y: height + Math.random() * 100,
        r: Math.random() * 2 + 0.6,
        speed: Math.random() * 0.6 + 0.2,
        drift: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.5 + 0.2,
        hue: Math.random() > 0.5 ? '255,106,61' : '255,193,122'
      };
    }

    const COUNT = Math.min(60, Math.floor((width * height) / 26000));
    for (let i = 0; i < COUNT; i++) {
      const p = makeParticle();
      p.y = Math.random() * height; // espalha na primeira renderização
      particles.push(p);
    }

    function tick() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -10) {
          Object.assign(p, makeParticle());
          p.y = height + 10;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue},${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(tick);
    }
    tick();
  }

});
