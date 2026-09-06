// Player, e só. Foco preso enquanto aberto, Esc e clique fora fecham, o foco
// volta ao botão de origem. O endereço vira #jogar-<id> para o link ser
// compartilhável. Fechar destrói o conteúdo: sem isso o jogo segue rodando.

import { el, limpar, anexar, icone } from './dom.js';
import { t, campo } from './i18n.js';
import { montarIframe, suportado } from './embeds.js';
import { ligarFaiscas, desligarFaiscas } from './faiscas.js';

const FOCAVEIS = 'a[href], button:not([disabled]), iframe, input, select, textarea, [tabindex]:not([tabindex="-1"])';

let raiz, caixa, corpo, aberto = null, focoAnterior = null, jogosRef = [];

function conteudo(jogo) {
  const titulo = campo(jogo.titulo);
  return [
    el('h3', { id: 'modalTitulo', class: 'modal-titulo' }, titulo),
    montarIframe(jogo.embed, titulo),
    el('p', { class: 'modal-nota' }, t('modal.avisoEmbed')),
    jogo.links.length
      ? el('div', { class: 'modal-acoes' }, jogo.links.map(l =>
          el('a', { href: l.url, target: '_blank', rel: 'noopener', class: 'btn btn-play' },
            campo(l.rotulo), el('span', { 'aria-hidden': 'true' }, ' ↗'))))
      : null
  ];
}

function aoTeclado(e) {
  if (!aberto) return;
  if (e.key === 'Escape') { e.preventDefault(); fechar(); return; }
  if (e.key !== 'Tab') return;

  const alvos = [...caixa.querySelectorAll(FOCAVEIS)];
  if (!alvos.length) return;
  const primeiro = alvos[0], ultimo = alvos[alvos.length - 1];
  if (e.shiftKey && document.activeElement === primeiro) { e.preventDefault(); ultimo.focus(); }
  else if (!e.shiftKey && document.activeElement === ultimo) { e.preventDefault(); primeiro.focus(); }
}

export function abrirPlayer(id, origem) {
  const jogo = jogosRef.find(j => j.id === id);
  if (!jogo) { console.warn(`[modal] jogo "${id}" não existe`); return; }
  if (!suportado(jogo.embed)) { console.warn(`[modal] "${id}" não tem embed jogável`); return; }

  focoAnterior = origem || document.activeElement;
  aberto = jogo;

  limpar(corpo);
  anexar(corpo, conteudo(jogo));

  raiz.hidden = false;
  document.body.classList.add('sem-rolagem');
  caixa.querySelector('.modal-fechar').focus();
  ligarFaiscas(caixa);

  if (location.hash !== `#jogar-${id}`) history.pushState({ jogar: id }, '', `#jogar-${id}`);
}

export function fechar({ mexerNoHistorico = true } = {}) {
  if (!aberto) return;
  aberto = null;
  raiz.hidden = true;
  desligarFaiscas();
  limpar(corpo);
  document.body.classList.remove('sem-rolagem');

  if (mexerNoHistorico && location.hash.startsWith('#jogar-')) {
    history.pushState({}, '', location.pathname + location.search);
  }
  if (focoAnterior && document.contains(focoAnterior)) focoAnterior.focus();
  focoAnterior = null;
}

function sincronizarComEndereco() {
  const m = location.hash.match(/^#jogar-(.+)$/);
  if (m) abrirPlayer(m[1]);
  else fechar({ mexerNoHistorico: false });
}

export function iniciarModal(jogos) {
  jogosRef = jogos;
  raiz = document.getElementById('modalJogo');
  if (!raiz) return;

  caixa = raiz.querySelector('.modal-caixa');
  const fechaBtn = raiz.querySelector('.modal-fechar');
  fechaBtn.replaceChildren(icone('fechar', 18));
  corpo = raiz.querySelector('.modal-corpo');

  raiz.querySelector('.modal-fundo').addEventListener('click', () => fechar());
  raiz.querySelector('.modal-fechar').addEventListener('click', () => fechar());
  document.addEventListener('keydown', aoTeclado);
  window.addEventListener('popstate', sincronizarComEndereco);

  if (location.hash.startsWith('#jogar-')) sincronizarComEndereco();
}
