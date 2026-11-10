export const up = (db) => {
  const bookId = "belozersky-1626";
  const oldText = "Марко Гриториев";
  const newText = "Марко Григориев";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("Текст книги 1626/27 года не найден.");
  const occurrences = document.html.split(oldText).length - 1;
  if (occurrences !== 1) {
    throw new Error(`Ожидалось одно вхождение «${oldText}», найдено: ${occurrences}.`);
  }
  db.prepare("UPDATE book_documents SET html = replace(html, ?, ?) WHERE book_id = ?")
    .run(oldText, newText, bookId);
};
