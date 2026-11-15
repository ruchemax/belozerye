export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const original = '<p class="record-prose">Судбици <span class="source-note">[Опущено]</span>.</p></div></section>';
  if (!document.html.includes(original)) throw new Error("The Sudbitsy heading was not found.");
  let html = document.html.replace(original,
    '</div></section>\n<h2 id="rent-sudbitsy" class="group-heading">Судбици</h2>\n<p class="record-prose"><span class="source-note">[опущено]</span>.</p>');
  const nextEntry = '<div class="contents-entry contents-level-3" data-contents-entry data-contents-level="3"><a class="contents-link" href="#kirillov-1559-fragment-128-heading">';
  if (!html.includes(nextEntry)) throw new Error("The Sudbitsy contents insertion point was not found.");
  html = html.replace(nextEntry,
    '<div class="contents-entry contents-level-2" data-contents-entry data-contents-level="2"><a class="contents-link" href="#rent-sudbitsy">Судбици</a></div>\n' + nextEntry);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
