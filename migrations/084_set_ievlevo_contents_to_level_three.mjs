const bookId = "belozersky-1585";

export const up = (db) => {
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("Не найдена книга 1585 года.");

  const entryPattern = /<div\b[^>]*\bdata-contents-key="church-ievlevo"[^>]*>[\s\S]*?<\/div>/u;
  const entry = entryPattern.exec(document.html)?.[0];
  if (!entry?.includes("contents-level-2") || !entry.includes('data-contents-level="2"')) {
    throw new Error("Пункт содержания Иевлева не имеет ожидаемый второй уровень.");
  }
  let html = document.html.replace(
    entry,
    entry
      .replaceAll("contents-level-2", "contents-level-3")
      .replace('data-contents-level="2"', 'data-contents-level="3"')
  );
  html = html.replace(/<style id="ievlevo-contents-indent">[\s\S]*?<\/style>/u, "");

  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
