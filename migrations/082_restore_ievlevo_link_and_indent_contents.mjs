const bookId = "belozersky-1585";
const fragmentId = "belozersky-1585-church-ievlevo";
const originalHeading = "Да тое ж Чюровские волости церковная деревня Иевлево пуста";

export const up = (db) => {
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("Не найдена книга 1585 года.");

  let html = document.html.replace(
    /(<h3\b[^>]*\bid="church-ievlevo"[^>]*>)Да тое ж Чюровские волости церковная <span id="ievlevo-place-name">деревня Иевлево пуста<\/span>(<\/h3>)/u,
    `$1${originalHeading}$2`
  );
  if (html === document.html) throw new Error("Не найдена изменённая ссылка Иевлева.");

  const contentsPattern = /<div\b[^>]*\bdata-contents-key="church-ievlevo"[^>]*>[\s\S]*?<\/div>/u;
  const contentsEntry = contentsPattern.exec(html)?.[0];
  if (!contentsEntry) throw new Error("Не найден пункт содержания для Иевлева.");
  const restoredContentsEntry = contentsEntry
    .replaceAll("contents-level-3", "contents-level-2")
    .replace('data-contents-level="3"', 'data-contents-level="2"')
    .replace(/(<a\b[^>]*\bhref="#church-ievlevo"[^>]*>)[\s\S]*?(<\/a>)/u, `$1${originalHeading}$2`);
  html = html.replace(contentsEntry, restoredContentsEntry);

  const style = `<style id="ievlevo-contents-indent">
.contents-entry[data-contents-key="church-ievlevo"] { padding-left: 2rem; }
</style>`;
  if (!html.includes('id="ievlevo-contents-indent"')) html = html.replace("</head>", `${style}</head>`);

  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
  db.prepare("UPDATE fragments SET link_target_id = NULL WHERE id = ?").run(fragmentId);
};
