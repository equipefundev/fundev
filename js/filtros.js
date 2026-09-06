// Escondido atrás de um botão: filtros vazios ao lado de poucos cards dizem o
// contrário do que se quer. Só existe acima de biblioteca.limiteParaFiltros.
// Os grupos vêm dos dados e só aparecem com dois valores ou mais.

import { el, icone } from './dom.js';
import { t, campo } from './i18n.js';

const TODOS = '__todos__';

const chaveDe = valor => (typeof valor === 'string' ? valor : (valor['pt-BR'] ?? Object.values(valor)[0]));

/** Gêneros presentes: chave estável, rótulo traduzido. */
function generosPresentes(jogos) {
  const mapa = new Map();
  for (const j of jogos) {
    for (const tg of j.tags || []) {
      if (tg.categoria !== 'genero') continue;
      const chave = chaveDe(tg.rotulo);
      if (!mapa.has(chave)) mapa.set(chave, tg.rotulo);
    }
  }
  return mapa;
}

function grupo(rotulo, opcoes, estado, chaveEstado, aoMudar) {
  if (opcoes.size < 2) return null;   // um valor só não é escolha

  const linha = el('div', { class: 'filtro-grupo' },
    el('span', { class: 'filtro-grupo-rotulo' }, rotulo));

  const desenhar = () => {
    [...linha.querySelectorAll('.filtro-aba')].forEach(n => n.remove());
    for (const [chave, texto] of [[TODOS, t('jogos.filtroTodos')], ...opcoes]) {
      const ativo = estado[chaveEstado] === chave;
      linha.append(el('button', {
        type: 'button',
        class: 'filtro-aba' + (ativo ? ' ativo' : ''),
        'aria-pressed': String(ativo),
        onclick: () => { estado[chaveEstado] = chave; desenhar(); aoMudar(); }
      }, typeof texto === 'string' ? texto : campo(texto)));
    }
  };
  desenhar();
  return linha;
}

/** { elemento, aplicar } ou null se a biblioteca ainda é pequena demais. */
export function criarFiltros(jogos, tipos, limite, aoMudar) {
  if (jogos.length < limite) return null;

  const estado = { busca: '', tipo: TODOS, genero: TODOS };

  const painel = el('div', { class: 'filtros-painel', id: 'filtrosPainel', hidden: '' });

  const botao = el('button', {
    type: 'button',
    class: 'filtros-botao',
    'aria-expanded': 'false',
    'aria-controls': 'filtrosPainel',
    onclick: () => {
      const abrindo = painel.hidden;
      painel.hidden = !abrindo;
      botao.setAttribute('aria-expanded', String(abrindo));
      botao.classList.toggle('aberto', abrindo);
      if (abrindo) painel.querySelector('input')?.focus();
    }
  }, icone('busca', 16), t('jogos.filtrosBotao'));

  const busca = el('input', {
    type: 'search',
    class: 'filtros-busca',
    'aria-label': t('jogos.buscaRotulo'),
    placeholder: t('jogos.buscaPlaceholder'),
    oninput: e => { estado.busca = e.target.value.trim().toLowerCase(); aoMudar(); }
  });

  painel.append(
    busca,
    grupo(t('jogos.grupoTipo'), new Map(tipos.map(x => [x, t(`tipos.${x}`)])), estado, 'tipo', aoMudar),
    grupo(t('jogos.grupoGenero'), generosPresentes(jogos), estado, 'genero', aoMudar)
  );

  const aplicar = lista => lista.filter(j => {
    if (estado.tipo !== TODOS && j.tipo !== estado.tipo) return false;
    if (estado.genero !== TODOS) {
      const temGenero = (j.tags || []).some(tg => tg.categoria === 'genero' && chaveDe(tg.rotulo) === estado.genero);
      if (!temGenero) return false;
    }
    if (estado.busca) {
      const alvo = (campo(j.titulo) + ' ' + (j.tags || []).map(tg => campo(tg.rotulo)).join(' ')).toLowerCase();
      if (!alvo.includes(estado.busca)) return false;
    }
    return true;
  });

  return { elemento: el('div', { class: 'filtros' }, botao, painel), aplicar };
}
