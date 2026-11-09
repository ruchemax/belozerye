export const up = (db) => {
  const bookId = "belozersky-1626";
  const original = "Чарамского ключа из Запогостья";
  const corrected = "Чарамского ключа и з Запогостья";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document?.html.includes(original)) {
    throw new Error("The Zapogost heading was not found in the 1626 book text.");
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll(original, corrected), bookId);
};
