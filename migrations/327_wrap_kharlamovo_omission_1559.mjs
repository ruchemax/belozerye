export const up = (db) => {
  const bookId = "kirillov-1559";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1559 book was not found.");
  const text = "А полвыти пуста, рожь не сияна, оброку не взято пол-2 чети ржы. И всего пол-8 чети";
  const original = `${text} <span class="source-note">[Опущено]</span>.`;
  const replacement = `<span class="source-note">[Опущено: ${text}]</span>.`;
  if (!document.html.includes(original)) throw new Error("The Kharlamovo omission was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(original, replacement), bookId);
};
