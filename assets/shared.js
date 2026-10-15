(() => {
  const filter = document.querySelector('#filter');
  if (!filter) return;
  const empty = document.querySelector('#empty');
  filter.addEventListener('input', () => {
    const query = filter.value.trim().toLocaleLowerCase('fr');
    let visible = 0;
    for (const template of document.querySelectorAll('.template')) {
      const matches = `${template.dataset.tags} ${template.textContent}`.toLocaleLowerCase('fr').includes(query);
      template.hidden = !matches;
      if (matches) visible += 1;
    }
    empty.hidden = visible > 0;
  });
})();