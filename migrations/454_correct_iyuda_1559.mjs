export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const oldName = '<strong class="person-name">Иода</strong>';
  if (document.html.split(oldName).length - 1 !== 2) throw new Error("Expected two Ioda occurrences in the 1559 book.");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?")
    .run(document.html.replaceAll(oldName,'<strong class="person-name">Июда</strong>'),bookId);
};
