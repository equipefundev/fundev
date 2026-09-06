// O card carrega tudo; o modal é só o player, aberto pelo botão de jogar.
// O que não tem dado não renderiza: menos de dois destaques, sem carrossel.

import { el, limpar, icone } from './dom.js';
import { t, campo } from './i18n.js';
import { tiposPresentes } from './dados.js';
import { criarFiltros } from './filtros.js';
import { tagsDoJogo } from './tags.js';
import { suportado } from './embeds.js';
import { abrirPlayer } from './modal.js';

let jogos = [], config = {};

function linksDeLoja(jogo) {
  return jogo.links.map(l =>
    el('a', { href: l.url, target: '_blank', rel: 'noopener', class: 'btn btn-play' },
      campo(l.rotulo), el('span', { 'aria-hidden': 'true' }, ' ↗'))
  );
}

function botaoJogar(jogo) {
  if (!suportado(jogo.embed)) return null;
  return el('button', {
    type: 'button',
    class: 'btn btn-primary btn-jogar',
    onclick: e => abrirPlayer(jogo.id, e.currentTarget)
  }, icone('play', 13), t('jogos.jogar'));
}

// O fundo borrado usa a propria capa, entao a URL precisa chegar ao CSS.
function moldura(jogo, classe) {
  const caixa = el('div', { class: classe },
    el('img', {
      src: jogo.capa.arquivo, alt: '', loading: 'lazy',
      width: jogo.capa.largura, height: jogo.capa.altura,
      onerror: e => { e.target.style.display = 'none'; }
    }));
  // URL absoluta: dentro de custom property o caminho relativo resolve contra a
  // folha de estilo, nao contra o documento, e cairia em /css/assets/...
  const abs = new URL(jogo.capa.arquivo, document.baseURI).href;
  caixa.style.setProperty('--capa', `url("${abs}")`);
  if (jogo.capa.cor) caixa.style.setProperty('--cor-capa', jogo.capa.cor);
  if (jogo.capa.foco) {
    caixa.dataset.foco = '';
    caixa.style.setProperty('--foco', jogo.capa.foco);
  }
  return caixa;
}

function metaDoJogo(jogo) {
  const partes = [];
  if (jogo.plataformas.length) partes.push(jogo.plataformas.map(campo).join(', '));
  if (jogo.ano) partes.push(String(jogo.ano));
  return partes.length ? el('p', { class: 'game-meta' }, partes.join(' · ')) : null;
}

function card(jogo) {
  const links = linksDeLoja(jogo);
  const jogar = botaoJogar(jogo);

  const acoes = el('div', { class: 'game-acoes' },
    el('div', { class: 'game-links' },
      links.length ? links : el('span', { class: 'btn btn-play btn-disabled' }, t('jogos.emBreve'))),
    jogar
  );

  return el('article', { class: 'game-card', id: `jogo-card-${jogo.id}` },
    el('div', { class: 'card-luz', 'aria-hidden': 'true' }),
    moldura(jogo, 'game-cover'),
    el('div', { class: 'game-body' },
      el('div', { class: 'game-tags' }, tagsDoJogo(jogo)),
      el('h3', {}, campo(jogo.titulo)),
      el('p', {}, campo(jogo.descricao)),
      metaDoJogo(jogo),
      acoes
    )
  );
}

function carrossel(destaques) {
  if (destaques.length < 2) return null;

  let indice = 0;
  const trilho = el('div', { class: 'destaque-trilho' });
  const pontos = el('div', { class: 'destaque-pontos', role: 'tablist' });

  const ir = novo => {
    indice = (novo + destaques.length) % destaques.length;
    trilho.style.transform = `translateX(-${indice * 100}%)`;
    [...pontos.children].forEach((p, i) => {
      p.classList.toggle('ativo', i === indice);
      p.setAttribute('aria-selected', String(i === indice));
      p.tabIndex = i === indice ? 0 : -1;
    });
  };

  destaques.forEach((jogo, i) => {
    trilho.append(el('div', { class: 'destaque-slide', role: 'group', 'aria-roledescription': 'slide' },
      moldura(jogo, 'destaque-arte'),
      el('div', { class: 'destaque-texto' },
        el('div', { class: 'game-tags' }, tagsDoJogo(jogo)),
        el('h3', {}, campo(jogo.titulo)),
        el('p', {}, campo(jogo.resumo)),
        el('div', { class: 'game-acoes' },
          el('div', { class: 'game-links' }, linksDeLoja(jogo)),
          botaoJogar(jogo))
      )
    ));

    pontos.append(el('button', {
      type: 'button', class: 'destaque-ponto', role: 'tab',
      'aria-label': campo(jogo.titulo), 'aria-selected': String(i === 0),
      tabindex: i === 0 ? '0' : '-1',
      onclick: () => ir(i)
    }));
  });

  const secao = el('section', {
    class: 'destaques', 'aria-roledescription': 'carrossel', 'aria-label': t('jogos.destaques')
  },
    el('div', { class: 'destaque-janela' }, trilho),
    el('div', { class: 'destaque-controles' },
      el('button', {
        type: 'button', class: 'destaque-seta',
        'aria-label': t('jogos.destaqueAnterior'), onclick: () => ir(indice - 1)
      }, icone('setaEsq', 20)),
      pontos,
      el('button', {
        type: 'button', class: 'destaque-seta',
        'aria-label': t('jogos.destaqueProximo'), onclick: () => ir(indice + 1)
      }, icone('setaDir', 20))
    )
  );

  ir(0);
  return secao;
}

// Um ouvinte na grade inteira em vez de um por card.
function seguirCursor(grade) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  grade.addEventListener('pointermove', e => {
    const card = e.target.closest('.game-card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--lx', `${((e.clientX - r.left) / r.width) * 100}%`);
    card.style.setProperty('--ly', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
}

// Cases de sucesso, para os jogos aparecerem antes da dobra.
function capasNoHero(jogos) {
  const alvo = document.getElementById('heroJogos');
  if (!alvo) return;
  limpar(alvo);
  jogos.slice(0, 4).forEach(j => alvo.append(moldura(j, 'hero-capa')));
}

export function renderizarBiblioteca(lista, cfg = {}) {
  jogos = lista;
  config = cfg;
  const alvo = document.getElementById('biblioteca');
  if (!alvo) return;

  limpar(alvo);

  if (!jogos.length) {
    alvo.append(el('p', { class: 'aviso-vazio' }, t('jogos.erro')));
    return;
  }

  const porId = new Map(jogos.map(j => [j.id, j]));
  const porLista = lista => (config[lista] || []).map(id => porId.get(id)).filter(Boolean);
  capasNoHero(porLista('cabecalho'));
  const carr = carrossel(porLista('destaques'));
  if (carr) alvo.append(carr);

  const grade = el('div', { class: 'games-grid' });
  seguirCursor(grade);

  const filtros = criarFiltros(
    jogos, tiposPresentes(jogos), config.limiteParaFiltros ?? 10,
    () => preencher()
  );

  function preencher() {
    limpar(grade);
    const visiveis = filtros ? filtros.aplicar(jogos) : jogos;
    if (!visiveis.length) {
      grade.append(el('p', { class: 'aviso-vazio' }, t('jogos.vazio')));
      return;
    }
    visiveis.forEach(j => grade.append(card(j)));
  }

  if (filtros) alvo.append(filtros.elemento);
  preencher();
  alvo.append(grade);
}

export function erroBiblioteca() {
  const alvo = document.getElementById('biblioteca');
  if (alvo) limpar(alvo).append(el('p', { class: 'aviso-vazio' }, t('jogos.erro')));
}
