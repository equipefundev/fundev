function iniciarFormulario() {
  const form = document.getElementById('formContato');
  const endereco = document.querySelector('[data-site="contato.email"]')?.textContent.trim();
  if (!form || !endereco) return;

  const rotulo = nome => form.querySelector(`[name="${nome}"]`)
    ?.closest('label')?.querySelector('span')?.textContent.trim() || nome;

  form.addEventListener('submit', evento => {
    evento.preventDefault();

    const dados = new FormData(form);
    const tipo = form.elements.namedItem('tipo');
    const tipoProjeto = tipo?.selectedOptions?.[0]?.textContent.trim() || dados.get('tipo');
    const corpo = [
      `${rotulo('nome')}: ${dados.get('nome')}`,
      `${rotulo('email')}: ${dados.get('email')}`,
      `${rotulo('tipo')}: ${tipoProjeto}`,
      `${rotulo('prazo')}: ${dados.get('prazo') || '—'}`,
      '',
      `${rotulo('mensagem')}:`,
      dados.get('mensagem')
    ].join('\n');

    const gmail = new URL('https://mail.google.com/mail/');
    gmail.search = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: endereco,
      su: `Contato pelo site — ${tipoProjeto}`,
      body: corpo
    }).toString();

    const janela = window.open(gmail.href, '_blank');
    if (janela) {
      janela.opener = null;
    } else {
      // Se novas abas estiverem bloqueadas, abre o rascunho na aba atual.
      window.location.assign(gmail.href);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciarFormulario, { once: true });
} else {
  iniciarFormulario();
}
