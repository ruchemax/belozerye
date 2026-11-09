export const up = (db) => {
  const continuation = (opening) => /\bclass="/u.test(opening)
    ? opening.replace(/\bclass="([^"]*)"/u, 'class="$1 heading-continuation"')
    : opening.replace("<p", '<p class="heading-continuation"');
  let restored = 0;
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    let html = document.html
      .replace(/<span class="heading-status-prose">([^<]*)<\/span>(\s*<div\b[^>]*\bclass="village-lines"[^>]*>\s*<p\b[^>]*>)/gu,
        (_match, prose, opening) => { restored++; return `${opening}${prose.trim()} `; })
      .replace(/<span class="heading-status-prose">([^<]*)<\/span>\s*(<p\b[^>]*>)/gu,
        (_match, prose, opening) => { restored++; return `${continuation(opening)}${prose.trim()} `; })
      .replace(/<span class="heading-status-prose">([^<]*)<\/span>(\s*<\/section>)/gu,
        (_match, prose, closing) => { restored++; return `<p class="heading-continuation" data-astro-cid-zcak6nys>${prose.trim()}</p>${closing}`; })
      .replaceAll("heading-with-status", "heading-with-prose");
    if (html.includes('class="heading-status-prose"')) throw new Error("Unconverted status prose remains.");
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
  if (restored !== 25) throw new Error(`Expected 25 status passages, found ${restored}.`);
};
