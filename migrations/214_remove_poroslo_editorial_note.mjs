export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document?.html.includes("[поросло]")) {
    throw new Error("The editorial note was not found in the 1626 book text.");
  }
  const html = document.html.replace(/\s*\[поросло\]/gu, "");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
