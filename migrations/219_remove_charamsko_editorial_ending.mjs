export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document?.html.includes("Чарамско[го]")) {
    throw new Error("The Charamsko editorial ending was not found in the 1626 book text.");
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll("Чарамско[го]", "Чарамско"), bookId);
};
