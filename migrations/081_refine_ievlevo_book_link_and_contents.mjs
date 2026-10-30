const bookId = "belozersky-1585";
const fragmentId = "belozersky-1585-church-ievlevo";
const linkTargetId = "ievlevo-place-name";

export const up = (db) => {
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("Не найдена книга 1585 года.");

  const headingPattern = /(<h3\b[^>]*\bid="church-ievlevo"[^>]*>)(Да тое ж Чюровские волости церковная )деревня Иевлево пуста(<\/h3>)/u;
  if (!headingPattern.test(document.html)) {
    throw new Error("Не найден заголовок церковной деревни Иевлево.");
  }
  let html = document.html.replace(
    headingPattern,
    `$1$2<span id="${linkTargetId}">деревня Иевлево пуста</span>$3`
  );

  const contentsPattern = /<div\b[^>]*\bdata-contents-key="church-ievlevo"[^>]*>[\s\S]*?<\/div>/u;
  const contentsEntry = contentsPattern.exec(html)?.[0];
  if (!contentsEntry) throw new Error("Не найден пункт содержания для Иевлева.");
  const updatedContentsEntry = contentsEntry
    .replaceAll("contents-level-2", "contents-level-3")
    .replace('data-contents-level="2"', 'data-contents-level="3"')
    .replace(/(<a\b[^>]*\bhref="#church-ievlevo"[^>]*>)[\s\S]*?(<\/a>)/u, "$1Деревня Иевлево пуста$2");
  html = html.replace(contentsEntry, updatedContentsEntry);

  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
  db.prepare("UPDATE fragments SET link_target_id = ? WHERE id = ?").run(linkTargetId, fragmentId);
};
