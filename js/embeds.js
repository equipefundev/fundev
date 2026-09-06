import { el } from './dom.js';

// Game Jolt não entra: responde X-Frame-Options SAMEORIGIN.
const TIPOS = {
  'itch-jogar': id => ({ src: `https://itch.io/embed-upload/${id}?color=12100D`, proporcao: '16 / 10', titulo: 'itch.io' }),
  youtube: id => ({ src: `https://www.youtube-nocookie.com/embed/${id}?rel=0`, proporcao: '16 / 9', titulo: 'YouTube' })
};

export const suportado = embed => !!(embed && embed.tipo && embed.id && TIPOS[embed.tipo]);

export function montarIframe(embed, nomeDoJogo) {
  if (!suportado(embed)) return null;
  const conf = TIPOS[embed.tipo](embed.id);

  const frame = el('iframe', {
    src: conf.src,
    title: `${nomeDoJogo} — ${conf.titulo}`,
    allow: 'autoplay; fullscreen; gamepad; encrypted-media',
    referrerpolicy: 'strict-origin-when-cross-origin',
    class: 'embed-frame'
  });
  frame.style.aspectRatio = conf.proporcao;
  return frame;
}
