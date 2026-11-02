export const up = (db) => {
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1544");
  if (!row) throw new Error("Book document belozersky-1544 was not found.");
  const oldHref = "../../churches/rozhdestva-bogoroditsy-churovskaya/";
  const newHref = "../../churches/rozhdestva-bogoroditsy-churovskaya-1544/";
  if (!row.html.includes(oldHref)) throw new Error("The old 1544 church link was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(row.html.replace(oldHref, newHref), "belozersky-1544");
};
