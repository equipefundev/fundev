// Faíscas dentro do modal. Só existem enquanto ele está aberto: o laço para e o
// canvas é destruído no fechamento, senão ficaria rodando atrás da página.

const QUANTIDADE = 26;
let parar = null;

function nova(largura, altura) {
  return {
    x: Math.random() * largura,
    y: altura + Math.random() * altura * 0.4,
    r: Math.random() * 1.6 + 0.5,
    subida: Math.random() * 0.35 + 0.12,
    deriva: (Math.random() - 0.5) * 0.25,
    alfa: Math.random() * 0.45 + 0.15,
    fase: Math.random() * Math.PI * 2
  };
}

export function ligarFaiscas(caixa) {
  desligarFaiscas();
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'faiscas';
  canvas.setAttribute('aria-hidden', 'true');
  caixa.prepend(canvas);

  const ctx = canvas.getContext('2d');
  let largura = 0, altura = 0, faiscas = [], quadro = 0;

  const medir = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = caixa.getBoundingClientRect();
    largura = r.width; altura = r.height;
    canvas.width = Math.round(largura * dpr);
    canvas.height = Math.round(altura * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const observador = new ResizeObserver(medir);
  observador.observe(caixa);
  medir();
  faiscas = Array.from({ length: QUANTIDADE }, () => {
    const f = nova(largura, altura);
    f.y = Math.random() * altura;
    return f;
  });

  const passo = () => {
    ctx.clearRect(0, 0, largura, altura);
    for (const f of faiscas) {
      f.y -= f.subida;
      f.fase += 0.02;
      f.x += f.deriva + Math.sin(f.fase) * 0.18;
      if (f.y < -8) Object.assign(f, nova(largura, altura));
      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      // cintila devagar, para a faísca não virar ponto fixo
      ctx.fillStyle = `rgba(255,170,110,${f.alfa * (0.6 + 0.4 * Math.sin(f.fase * 1.7))})`;
      ctx.fill();
    }
    quadro = requestAnimationFrame(passo);
  };
  passo();

  parar = () => {
    cancelAnimationFrame(quadro);
    observador.disconnect();
    canvas.remove();
    parar = null;
  };
}

export function desligarFaiscas() {
  parar?.();
}
