export const separateChurchNames = (html) => {
  const original = "церковь Илия пророк да теплая церковь Андрей Первозванный";
  const replacement = '<span class="church-name-highlight">церковь Илия пророк</span> да теплая <span class="church-name-highlight">церковь Андрей Первозванный</span>';
  if (html.includes(replacement)) return html;
  if (!html.includes(original)) throw new Error("The two Charoma churches were not found in the 1601 book.");
  return html.replace(original, replacement);
};

export const up = (db) => {
  const bookId = "kirillov-1601";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1601 book was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(separateChurchNames(document.html), bookId);
};
