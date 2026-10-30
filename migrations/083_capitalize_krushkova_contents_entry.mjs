const bookId = "belozersky-1626";
const previous = '>деревня Крушкова пуста</a>';
const next = '>Деревня Крушкова пуста</a>';

export const up = (db) => {
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document?.html.includes(previous)) {
    throw new Error("Не найден пункт содержания для Крушковой.");
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(previous, next), bookId);
};
