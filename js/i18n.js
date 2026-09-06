// t()     -> textos de interface, de i18n/<código>.json
// campo() -> textos de conteúdo, de dados/*.json, aceitando string ou mapa de
//            idiomas. Sem tradução, cai no padrão em vez de renderizar vazio.

export const PADRAO = 'pt-BR';
export const DISPONIVEIS = ['pt-BR', 'en'];
const CHAVE_MEMORIA = 'fundev:idioma';

let atual = PADRAO;
let textos = {};

export const idiomaAtual = () => atual;

function normalizar(codigo) {
  if (!codigo) return null;
  if (DISPONIVEIS.includes(codigo)) return codigo;
  const base = String(codigo).split('-')[0].toLowerCase();
  return DISPONIVEIS.find(d => d.split('-')[0].toLowerCase() === base) || null;
}

export function detectarIdioma() {
  const daUrl = normalizar(new URLSearchParams(location.search).get('lang'));
  if (daUrl) return daUrl;

  try {
    const salvo = normalizar(localStorage.getItem(CHAVE_MEMORIA));
    if (salvo) return salvo;
  } catch { /* storage bloqueado */ }

  for (const preferido of navigator.languages || [navigator.language]) {
    const achado = normalizar(preferido);
    if (achado) return achado;
  }
  return PADRAO;
}

function lembrar(codigo) {
  try { localStorage.setItem(CHAVE_MEMORIA, codigo); } catch { /* sem storage */ }
}

export async function carregarIdioma(codigo) {
  const alvo = normalizar(codigo) || PADRAO;
  try {
    const r = await fetch(`i18n/${alvo}.json`, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    textos = await r.json();
    atual = alvo;
    lembrar(alvo);
  } catch (e) {
    if (alvo !== PADRAO) {
      console.warn(`[i18n] "${alvo}" indisponível (${e.message}), voltando para ${PADRAO}`);
      return carregarIdioma(PADRAO);
    }
    throw e;
  }
  return atual;
}

export function t(caminho, substituicoes) {
  let valor = caminho.split('.').reduce((o, k) => (o == null ? undefined : o[k]), textos);
  if (valor === undefined) {
    console.warn(`[i18n] chave ausente: ${caminho}`);
    return caminho;
  }
  if (substituicoes) {
    for (const [k, v] of Object.entries(substituicoes)) {
      valor = valor.split(`{${k}}`).join(v);
    }
  }
  return valor;
}

/** Resolve um campo de conteúdo que pode ser string ou mapa de idiomas. */
export function campo(valor) {
  if (valor === null || valor === undefined) return '';
  if (typeof valor === 'string' || typeof valor === 'number') return String(valor);
  if (typeof valor !== 'object') return '';
  if (valor[atual] !== undefined) return String(valor[atual]);
  if (valor[PADRAO] !== undefined) return String(valor[PADRAO]);
  const primeiro = Object.values(valor)[0];
  return primeiro === undefined ? '' : String(primeiro);
}

export function aplicarNaPagina(raiz = document) {
  raiz.querySelectorAll('[data-i18n]').forEach(n => {
    n.textContent = t(n.dataset.i18n);
  });

  raiz.querySelectorAll('[data-i18n-html]').forEach(n => {
    n.innerHTML = t(n.dataset.i18nHtml);
  });

  raiz.querySelectorAll('[data-i18n-attr]').forEach(n => {
    for (const par of n.dataset.i18nAttr.split(';')) {
      const [attr, chave] = par.split(':').map(s => s.trim());
      if (attr && chave) n.setAttribute(attr, t(chave));
    }
  });

  if (raiz === document) {
    document.documentElement.lang = t('htmlLang');
    document.title = t('meta.titulo');
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.descricao'));
  }
}
