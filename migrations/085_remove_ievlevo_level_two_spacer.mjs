const bookId = "belozersky-1585";

export const up = (db) => {
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("Не найдена книга 1585 года.");

  const entryPattern = /<div\b[^>]*\bdata-contents-key="church-ievlevo"[^>]*>[\s\S]*?<\/div>/u;
  const entry = entryPattern.exec(document.html)?.[0];
  if (!entry?.includes("contents-toggle-spacer")) {
    throw new Error("Не найден лишний отступ второго уровня у Иевлева.");
  }
  const updatedEntry = entry.replace(/\s*<span\b[^>]*\bcontents-toggle-spacer\b[^>]*><\/span>/u, "");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(entry, updatedEntry), bookId);
};
