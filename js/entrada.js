// Entrada e saída ao rolar. A classe .entra é aplicada aqui, nunca no HTML: se o JS
// falhar, o conteúdo já está visível em vez de ficar invisível para sempre.

const ALVOS = '.section-head, .destaques, .game-card, .value-card, .team-card, .whatsapp-card, .contato-text';
const ESCADA = 70;   // ms entre irmãos, para a fileira não entrar em bloco
const TETO = 4;      // acima disso o atraso incomoda mais do que enfeita

let observador = null;

export function entradaAoRolar(raiz = document) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  observador ??= new IntersectionObserver(entradas => {
    for (const e of entradas) {
      if (e.isIntersecting) {
        e.target.classList.add('visivel');
        e.target.classList.remove('saiu');
      } else if (e.boundingClientRect.top < 0) {
        // só quem já passou para cima; quem ainda não entrou fica como está
        e.target.classList.add('saiu');
      }
    }
  }, { rootMargin: '-10% 0px -8% 0px', threshold: 0.05 });

  const porPai = new Map();
  for (const n of raiz.querySelectorAll(ALVOS)) {
    if (n.classList.contains('entra')) continue;
    const irmaos = porPai.get(n.parentElement) ?? 0;
    porPai.set(n.parentElement, irmaos + 1);
    n.style.transitionDelay = `${Math.min(irmaos, TETO) * ESCADA}ms`;
    n.classList.add('entra');
    observador.observe(n);
  }
}
