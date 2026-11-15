export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const total = "С Брыкина ржы 8 чети, овса 16 чети, ячмени 2 чети. И всего 26 чети.";
  const original = `</span> ${total}</p>`;
  if (!document.html.includes(original)) throw new Error("The Brykino rent total was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, `</span></p>\n<p class="record-prose">${total}</p>`), bookId);
};
