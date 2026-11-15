export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const pattern = /(Да с всех с них четь овса\.)<\/p>\s*<p class="record-prose">(И всего оброку с Синцова ржы 9 чети, ячмени 4 чети, овса 19 чети\.)/u;
  if (!pattern.test(document.html)) throw new Error("The Sintsovo rent total was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(pattern, "$1 $2"), bookId);
};
