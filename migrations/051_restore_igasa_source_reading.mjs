export const up = (db) => {
  const bookId = "belozersky-1626";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-6";
  const oldText = "Малая Игая";
  const sourceReading = "Малая Игаса [Игая]";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("Текст книги 1626/27 года не найден.");
  const occurrences = document.html.split(oldText).length - 1;
  if (occurrences !== 2) {
    throw new Error(`Ожидалось два вхождения «${oldText}», найдено: ${occurrences}.`);
  }
  db.prepare("UPDATE book_documents SET html = replace(html, ?, ?) WHERE book_id = ?")
    .run(oldText, sourceReading, bookId);
  db.prepare("UPDATE mentions SET source_name = ? WHERE id = ?")
    .run("Деревня, что была пустошь Малая Игаса [Игая] ,", mentionId);
};
