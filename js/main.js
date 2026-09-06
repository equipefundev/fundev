// Ponto de entrada: só amarra as peças.

import { carregarIdioma, detectarIdioma, aplicarNaPagina, t, DISPONIVEIS } from './i18n.js';
import { carregarJogos, carregarEquipe } from './dados.js';
import { definirVocabulario } from './tags.js';
import { renderizarBiblioteca, erroBiblioteca } from './biblioteca.js';
import { renderizarEquipe, erroEquipe } from './equipe.js';
import { iniciarModal } from './modal.js';
import { anoDoRodape, menuMobile, seletorDeIdioma, brasas, comecarNoTopo, ondaAoClicar } from './ui.js';
import { icone } from './dom.js';
import { entradaAoRolar } from './entrada.js';

let jogos = [], membros = [], configBiblioteca = {}, nomesIdioma = {};

// Nome de cada idioma, lido do arquivo dele, para o seletor não mostrar códigos.
async function nomesDosIdiomas() {
  const pares = await Promise.all(DISPONIVEIS.map(async codigo => {
    try {
      const r = await fetch(`i18n/${codigo}.json`, { cache: 'no-cache' });
      return [codigo, r.ok ? (await r.json()).nome || codigo : codigo];
    } catch { return [codigo, codigo]; }
  }));
  return Object.fromEntries(pares);
}

// O <li> declara data-rede e o ícone entra aqui.
function iconesDeContato() {
  document.querySelectorAll('.contact-list li[data-rede]').forEach(li => {
    li.querySelector('.contact-icone')?.remove();
    const svg = icone(li.dataset.rede);
    if (!svg) return;
    const caixa = document.createElement('span');
    caixa.className = 'contact-icone';
    caixa.title = t(`redes.${li.dataset.rede}`);
    caixa.append(svg);
    li.prepend(caixa);
  });
}

function redesenhar() {
  aplicarNaPagina();
  iconesDeContato();
  seletorDeIdioma(nomesIdioma, trocarIdioma);   // sigla e item ativo acompanham a troca
  renderizarBiblioteca(jogos, configBiblioteca);
  renderizarEquipe(membros);
  entradaAoRolar();
}

async function trocarIdioma(codigo) {
  await carregarIdioma(codigo);
  const url = new URL(location.href);
  url.searchParams.set('lang', codigo);
  history.replaceState(history.state, '', url);
  redesenhar();
}

async function iniciar() {
  comecarNoTopo();
  anoDoRodape();
  brasas();
  ondaAoClicar();

  try {
    await carregarIdioma(detectarIdioma());
  } catch (e) {
    console.error('[fundev] nenhum arquivo de idioma carregou', e);
    return;
  }
  aplicarNaPagina();
  iconesDeContato();
  menuMobile();
  nomesIdioma = await nomesDosIdiomas();
  seletorDeIdioma(nomesIdioma, trocarIdioma);

  const [resJogos, resEquipe] = await Promise.allSettled([carregarJogos(), carregarEquipe()]);

  if (resJogos.status === 'fulfilled') {
    jogos = resJogos.value.jogos;
    configBiblioteca = resJogos.value.biblioteca;
    definirVocabulario(resJogos.value.vocabulario);
    renderizarBiblioteca(jogos, configBiblioteca);
    iniciarModal(jogos);
  } else {
    console.error('[fundev] jogos não carregaram', resJogos.reason);
    erroBiblioteca();
  }

  if (resEquipe.status === 'fulfilled') {
    membros = resEquipe.value;
    renderizarEquipe(membros);
  } else {
    console.error('[fundev] equipe não carregou', resEquipe.reason);
    erroEquipe();
  }

  entradaAoRolar();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
else iniciar();
