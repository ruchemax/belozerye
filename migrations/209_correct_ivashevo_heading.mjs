export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document?.html.includes("Улолмке")) {
    throw new Error("The misspelled Ivashevo heading was not found in the 1626 book text.");
  }
  db.prepare("UPDATE book_documents SET html = replace(html, 'Улолмке', 'Уломке') WHERE book_id = ?").run(bookId);
};
