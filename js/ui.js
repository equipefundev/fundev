// Peças que não dependem dos dados.

import { el, icone } from './dom.js';
import { t, DISPONIVEIS, idiomaAtual } from './i18n.js';

export function anoDoRodape() {
  const n = document.getElementById('year');
  if (n) n.textContent = new Date().getFullYear();
}

export function menuMobile() {
  const botao = document.getElementById('navToggle');
  const lista = document.getElementById('navLinks');
  if (!botao || !lista) return;

  const definir = aberto => {
    lista.classList.toggle('open', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', t(aberto ? 'nav.fecharMenu' : 'nav.abrirMenu'));
  };

  botao.addEventListener('click', () => definir(!lista.classList.contains('open')));
  lista.addEventListener('click', e => { if (e.target.closest('a')) definir(false); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lista.classList.contains('open')) { definir(false); botao.focus(); }
  });
  document.addEventListener('click', e => {
    if (lista.classList.contains('open') && !lista.contains(e.target) && !botao.contains(e.target)) definir(false);
  });
}

// Ouvintes de documento entram uma vez só; a função é chamada de novo a cada
// troca de idioma para a sigla e o item ativo acompanharem.
let idiomaLigado = false;

// Globo mais a sigla do idioma; a lista abre no clique.
export function seletorDeIdioma(nomes, aoTrocar) {
  const area = document.getElementById('seletorIdioma');
  if (!area || DISPONIVEIS.length < 2) return;

  const sigla = c => c.split('-')[0].toUpperCase();
  const menu = el('ul', { class: 'idioma-menu', role: 'listbox', hidden: '', 'aria-label': t('nav.idioma') });

  const botao = el('button', {
    type: 'button', class: 'idioma-botao',
    'aria-haspopup': 'listbox', 'aria-expanded': 'false', 'aria-label': t('nav.idioma'),
    onclick: e => { e.stopPropagation(); abrir(menu.hidden); }
  }, icone('site', 15), el('span', { class: 'idioma-sigla' }, sigla(idiomaAtual())));

  function abrir(sim) {
    menu.hidden = !sim;
    botao.setAttribute('aria-expanded', String(sim));
    botao.classList.toggle('aberto', sim);
    if (sim) menu.querySelector('.ativo, button')?.focus();
  }

  DISPONIVEIS.forEach(codigo => {
    const atual = codigo === idiomaAtual();
    menu.append(el('li', { role: 'presentation' },
      el('button', {
        type: 'button', role: 'option', class: 'idioma-opcao' + (atual ? ' ativo' : ''),
        'aria-selected': String(atual),
        onclick: () => {
          abrir(false);
          botao.focus();
          // comparado agora, não na construção: senão o item nunca volta a ser clicável
          if (codigo !== idiomaAtual()) aoTrocar(codigo);
        }
      }, el('span', { class: 'idioma-sigla' }, sigla(codigo)), nomes[codigo] || codigo)));
  });

  if (!idiomaLigado) {
    idiomaLigado = true;
    document.addEventListener('click', e => {
      const m = document.querySelector('.idioma-menu');
      if (m && !m.hidden && !area.contains(e.target)) {
        m.hidden = true;
        document.querySelector('.idioma-botao')?.setAttribute('aria-expanded', 'false');
        document.querySelector('.idioma-botao')?.classList.remove('aberto');
      }
    });
    document.addEventListener('keydown', e => {
      const m = document.querySelector('.idioma-menu');
      if (e.key === 'Escape' && m && !m.hidden) {
        m.hidden = true;
        const b = document.querySelector('.idioma-botao');
        b?.setAttribute('aria-expanded', 'false');
        b?.classList.remove('aberto');
        b?.focus();
      }
    });
  }

  area.replaceChildren(botao, menu);
}

// O navegador restaura a rolagem anterior ao reabrir a aba, o que fazia o site
// abrir no meio da página. Sem âncora na URL, começa no topo.
export function comecarNoTopo() {
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
}

const CLICAVEIS = '.btn, .rede, .destaque-seta, .filtro-aba, .filtros-botao, .idioma-opcao, .idioma-botao, .modal-fechar, .destaque-ponto';

export function ondaAoClicar() {
  document.addEventListener('pointerdown', e => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const alvo = e.target.closest(CLICAVEIS);
    if (!alvo) return;

    let area = alvo.querySelector(':scope > .onda-area');
    if (!area) {
      area = el('span', { class: 'onda-area', 'aria-hidden': 'true' });
      alvo.append(area);
    }
    const r = alvo.getBoundingClientRect();
    const onda = el('span', { class: 'onda' });
    onda.style.left = `${e.clientX - r.left}px`;
    onda.style.top = `${e.clientY - r.top}px`;
    // o timeout e rede: se a animacao nao rodar, animationend nunca dispara
    const limpar = () => onda.remove();
    onda.addEventListener('animationend', limpar, { once: true });
    setTimeout(limpar, 900);
    area.append(onda);
  });
}

export function brasas() {
  const canvas = document.getElementById('embers');
  if (!canvas) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const ctx = canvas.getContext('2d');
  let largura, altura, particulas = [];

  function medir() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    largura = window.innerWidth;
    altura = window.innerHeight;
    canvas.width = Math.round(largura * dpr);
    canvas.height = Math.round(altura * dpr);
    canvas.style.width = `${largura}px`;
    canvas.style.height = `${altura}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const nova = () => ({
    x: Math.random() * largura,
    y: altura + Math.random() * 100,
    r: Math.random() * 2 + 0.6,
    velocidade: Math.random() * 0.6 + 0.2,
    deriva: (Math.random() - 0.5) * 0.4,
    alfa: Math.random() * 0.5 + 0.2,
    cor: Math.random() > 0.5 ? '255,106,61' : '255,193,122'
  });

  window.addEventListener('resize', medir);
  medir();

  const quantidade = Math.min(60, Math.floor((largura * altura) / 26000));
  for (let i = 0; i < quantidade; i++) {
    const p = nova();
    p.y = Math.random() * altura;   // espalha na primeira renderização
    particulas.push(p);
  }

  (function quadro() {
    ctx.clearRect(0, 0, largura, altura);
    for (const p of particulas) {
      p.y -= p.velocidade;
      p.x += p.deriva;
      if (p.y < -10) { Object.assign(p, nova()); p.y = altura + 10; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.cor},${p.alfa})`;
      ctx.fill();
    }
    requestAnimationFrame(quadro);
  })();
}
