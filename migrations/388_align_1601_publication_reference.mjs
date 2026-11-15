export const up = (db) => {
  const source = db.prepare("SELECT publication_reference FROM books WHERE id = ?").get("kirillov-1559");
  if (!source?.publication_reference?.includes("Вытные книги 1559 г.")) {
    throw new Error("The expected 1559 publication reference was not found.");
  }
  const reference = source.publication_reference
    .replace("Вытные книги 1559 г.", "Переписная книга вотчин 1601 г.")
    .replace("С. 2–311.", "С. 357–434.");
  const result = db.prepare("UPDATE books SET publication_reference = ? WHERE id = ?")
    .run(reference, "kirillov-1601");
  if (result.changes !== 1) throw new Error("The 1601 book was not found.");
};
