import { t } from './i18n.js';

export function iniciarFormulario() {
  const form = document.getElementById('formContato');
  const email = document.querySelector('[data-site="contato.email"]')?.textContent.trim();
  if (!form || !email) return;

  form.addEventListener('submit', evento => {
    evento.preventDefault();
    const dados = new FormData(form);
    const assunto = `Contato pelo site — ${dados.get('tipo')}`;
    const corpo = [
      `${t('contato.nome')}: ${dados.get('nome')}`,
      `${t('contato.email')}: ${dados.get('email')}`,
      `${t('contato.tipo')}: ${dados.get('tipo')}`,
      `${t('contato.prazo')}: ${dados.get('prazo') || '—'}`,
      '',
      `${t('contato.mensagem')}:`,
      dados.get('mensagem')
    ].join('\n');
    window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  });
}
