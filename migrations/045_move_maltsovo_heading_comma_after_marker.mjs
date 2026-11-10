export const up = (db) => {
  const bookId = "belozersky-1626";
  const oldHeading = '<span data-astro-cid-zcak6nys>Деревня Мальцово, Малгиево тож,</span>';
  const newHeading = '<span data-astro-cid-zcak6nys>Деревня Мальцово, Малгиево тож</span><span class="heading-comma" data-astro-cid-zcak6nys>,</span>';
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("Текст книги 1626/27 года не найден.");
  if (!document.html.includes(oldHeading)) {
    throw new Error("Исходный заголовок Мальцова не найден в ожидаемом виде.");
  }
  db.prepare("UPDATE book_documents SET html = replace(html, ?, ?) WHERE book_id = ?")
    .run(oldHeading, newHeading, bookId);
};
