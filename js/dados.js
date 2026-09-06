// Registro ruim é descartado com aviso e os outros renderizam. Só a falha de
// carregar o arquivo inteiro vira erro visível ao visitante.

async function ler(caminho) {
  const r = await fetch(caminho, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${caminho}: HTTP ${r.status}`);
  return r.json();
}

function conferir(registro, obrigatorios, rotulo, indice) {
  const faltando = obrigatorios.filter(c => {
    const v = registro[c];
    return v === undefined || v === null || v === '' ||
           (Array.isArray(v) && c !== 'links' && v.length === 0);
  });
  if (faltando.length) {
    console.warn(`[dados] ${rotulo}[${indice}] descartado, faltam campos: ${faltando.join(', ')}`, registro);
    return false;
  }
  return true;
}

function semDuplicados(lista, rotulo) {
  const vistos = new Set();
  return lista.filter(r => {
    if (vistos.has(r.id)) {
      console.warn(`[dados] ${rotulo}: id repetido "${r.id}", mantendo só o primeiro`);
      return false;
    }
    vistos.add(r.id);
    return true;
  });
}

export async function carregarJogos() {
  const bruto = await ler('dados/jogos.json');
  const lista = Array.isArray(bruto.jogos) ? bruto.jogos : [];

  const validos = lista
    .filter((j, i) => conferir(j, ['id', 'titulo', 'tipo', 'status', 'resumo', 'capa'], 'jogos', i))
    .filter((j, i) => {
      if (!j.capa || !j.capa.arquivo) {
        console.warn(`[dados] jogos[${i}] "${j.id}" descartado: capa sem arquivo`);
        return false;
      }
      return true;
    })
    .map(j => ({
      tags: [], plataformas: [], links: [], galeria: [], creditos: [],
      embed: {}, video: '', ano: null, descricao: j.resumo,
      ...j
    }));

  const jogos = semDuplicados(validos, 'jogos');

  // Duas listas, não uma: o cabeçalho mostra os cases de sucesso e o carrossel
  // pede para testarem algo agora. Propósitos diferentes, ordens diferentes.
  const cfg = bruto.biblioteca || {};
  const existentes = lista => (lista || []).filter(id => {
    if (jogos.some(j => j.id === id)) return true;
    console.warn('[dados] a lista aponta para um jogo inexistente: "' + id + '"');
    return false;
  });
  const cabecalho = existentes(cfg.cabecalho);
  const destaques = existentes(cfg.destaques);

  return {
    jogos,
    vocabulario: bruto.vocabularioTags || {},
    biblioteca: { limiteParaFiltros: cfg.limiteParaFiltros ?? 10, cabecalho, destaques }
  };
}

export async function carregarEquipe() {
  const bruto = await ler('dados/equipe.json');
  const lista = Array.isArray(bruto.membros) ? bruto.membros : [];

  const validos = lista
    .filter((m, i) => conferir(m, ['id', 'nome', 'funcao'], 'equipe', i))
    .map(m => ({ links: {}, bio: '', foto: null, ...m }));

  return semDuplicados(validos, 'equipe');
}

/** Tipos presentes, na ordem em que aparecem. */
export function tiposPresentes(jogos) {
  const vistos = [];
  for (const j of jogos) if (!vistos.includes(j.tipo)) vistos.push(j.tipo);
  return vistos;
}
