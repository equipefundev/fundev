// Cor significa tipo de informação, não importância:
//   roxo = gênero · azul = característica · rosa = contexto · laranja = propósito
//   verde/amarelo/cinza = estado
// A paleta vive em vocabularioTags no dados/jogos.json; a tag guarda só a
// categoria, senão o mesmo hex se repetiria em cada jogo.

import { el } from './dom.js';
import { t, campo } from './i18n.js';

let vocabulario = {};

export function definirVocabulario(v) {
  vocabulario = v || {};
}

export function pilula(categoria, texto) {
  const paleta = vocabulario[categoria];
  const n = el('span', { class: 'tag', dataset: { categoria } },
    el('span', { class: 'tag-ponto', 'aria-hidden': 'true' }),
    texto
  );
  if (paleta) {
    n.style.setProperty('--tag-cor', paleta.cor);
    n.style.setProperty('--tag-fundo', paleta.fundo);
  } else {
    console.warn(`[tags] categoria sem cor no vocabulário: "${categoria}"`);
  }
  return n;
}

/** Tags do jogo mais a de estado. */
export function tagsDoJogo(jogo) {
  const lista = (jogo.tags || []).map(tg => pilula(tg.categoria, campo(tg.rotulo)));
  if (jogo.status) lista.push(pilula(jogo.status, t(`status.${jogo.status}`)));
  return lista;
}
