export const up = (db) => {
  const bookId = "kirillov-1559";
  const fragmentId = "kirillov-1559-fragment-skorobagatoe";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(fragmentId);
  const pattern = / <span class="source-note">\[Дополнено на левом поле другим почерком: <a class="place-title-link" id="kirillov-1559-fragment-skorobagatoe-heading" href="\.\.\/\.\.\/places\/skorobogatoy\/">Деревня Скоробагатое<\/a><span class="skorobagatoe-addition" id="kirillov-1559-fragment-skorobagatoe"> полвыти\. ([\s\S]*?)<\/span>\]<\/span><\/p><\/div><\/section>/u;
  if (!document || !fragment || !pattern.test(document.html)) throw new Error("The Skorobagatoe marginal addition was not found.");
  let html = document.html.replace(pattern, (_match, text) =>
    `</p></div></section>\n<section class="record place-record" id="${fragmentId}"><div class="record-source-note"><span class="source-note">[Дополнено на левом поле другим почерком:]</span></div><div class="record-heading-line"><h3 class="record-title place-heading" id="${fragmentId}-heading"><a class="place-title-link" href="../../places/skorobogatoy/">Деревня Скоробагатое</a></h3> <span class="heading-inline-prose">полвыти.</span></div><div class="record-body">\n<p class="record-prose">${text}</p></div></section>`);
  const nextEntry = '<div class="contents-entry contents-level-1" data-contents-entry data-contents-level="1"><a class="contents-link" href="#rent-chyurava-title">';
  if (!html.includes(nextEntry)) throw new Error("The contents insertion point was not found.");
  html = html.replace(nextEntry,
    `<div class="contents-entry contents-level-3" data-contents-entry data-contents-level="3"><a class="contents-link" href="#${fragmentId}-heading">Деревня Скоробагатое</a></div>\n${nextEntry}`);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
  const raw = JSON.parse(fragment.raw_json);
  delete raw.content_class;
  const temporaryPosition = db.prepare("SELECT MAX(position) + 2 AS n FROM fragments WHERE book_id = ?").get(bookId).n;
  db.prepare("UPDATE fragments SET position = ? WHERE id = ?").run(temporaryPosition, fragmentId);
  for (const row of db.prepare("SELECT id, position FROM fragments WHERE book_id = ? AND position >= 111 AND id <> ? ORDER BY position DESC").all(bookId, fragmentId)) {
    db.prepare("UPDATE fragments SET position = ? WHERE id = ?").run(row.position + 1, row.id);
  }
  db.prepare("UPDATE fragments SET raw_json = ?, position = 111 WHERE id = ?").run(JSON.stringify(raw), fragmentId);
};
