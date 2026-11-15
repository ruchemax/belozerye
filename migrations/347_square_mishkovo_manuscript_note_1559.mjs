export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const original = "(в рукописи «с» написано по исправленному: «на»)";
  const replacement = "[в рукописи «с» написано по исправленному: «на»]";
  if (!document?.html.includes(original)) throw new Error("The Mishkovo manuscript note was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll(original, replacement), bookId);
};
