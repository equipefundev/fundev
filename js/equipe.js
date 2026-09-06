// Ícone de rede só existe se o campo estiver preenchido: nada de espaço
// reservado nem link morto.

import { el, limpar, icone } from './dom.js';
import { t, campo } from './i18n.js';

// Ordem de exibição. Campo vazio no JSON não renderiza.
const REDES = ['itch', 'steam', 'epic', 'googleplay', 'apple', 'gamejolt',
                'discord', 'instagram', 'linkedin', 'github', 'site'];

function iniciais(nome) {
  return nome.split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

function redesDoMembro(membro, nome) {
  const links = REDES
    .filter(rede => (membro.links[rede] || '').trim() !== '')
    .map(rede => el('a', {
      href: membro.links[rede].trim(),
      class: 'rede',
      target: '_blank',
      rel: 'noopener',
      'aria-label': `${nome} — ${t(`redes.${rede}`)}`,
      title: t(`redes.${rede}`)
    }, icone(rede)));

  return links.length ? el('div', { class: 'redes' }, links) : null;
}

function cardMembro(membro) {
  const nome = campo(membro.nome);
  const foto = membro.foto && membro.foto.arquivo;

  return el('article', { class: 'team-card' },
    el('div', { class: 'team-photo' + (foto ? '' : ' no-photo'), dataset: { initials: iniciais(nome) } },
      foto ? el('img', {
        src: membro.foto.arquivo, alt: '', loading: 'lazy',
        width: membro.foto.largura, height: membro.foto.altura,
        onerror: e => { e.target.style.display = 'none'; e.target.parentElement.classList.add('no-photo'); }
      }) : null
    ),
    el('h3', {}, nome),
    el('p', { class: 'role' }, campo(membro.funcao)),
    membro.bio ? el('p', { class: 'bio' }, campo(membro.bio)) : null,
    redesDoMembro(membro, nome)
  );
}

export function renderizarEquipe(membros) {
  const alvo = document.getElementById('equipeGrade');
  if (!alvo) return;
  limpar(alvo);
  if (!membros.length) {
    alvo.append(el('p', { class: 'aviso-vazio' }, t('equipe.erro')));
    return;
  }
  membros.forEach(m => alvo.append(cardMembro(m)));
}

export function erroEquipe() {
  const alvo = document.getElementById('equipeGrade');
  if (alvo) limpar(alvo).append(el('p', { class: 'aviso-vazio' }, t('equipe.erro')));
}
