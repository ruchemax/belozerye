export const up = (db) => {
  const bookId = "kirillov-1559";
  if (!db.prepare("SELECT 1 FROM books WHERE id = ?").get(bookId)) {
    throw new Error("The 1559 book was not found.");
  }
  const reference = "Горфункель А.Х., Дмитриева З.В. (сост.). Вотчинные хозяйственные книги XVI в.: Вытные книги. Хлебные оброчники и переписная книга вотчин Кирилло-Белозерского монастыря 1559–1601 гг. / под ред. А.Г. Манькова. Москва; Ленинград, 1983. Раздел «Вытные книги» (1559 г.). С. 2–311.";
  db.prepare("UPDATE books SET publication_reference = ? WHERE id = ?").run(reference, bookId);
};
