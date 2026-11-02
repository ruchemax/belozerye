export const up = (db) => {
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1544");
  if (!row) throw new Error("Book document belozersky-1544 was not found.");

  const oldText = "</a> против митрополича <a data-astro-cid-zcak6nys=\"\" href=\"../../places/loshakova/\">";
  const plainText = "</a><span style=\"font-weight:400\"> против митрополича </span><a data-astro-cid-zcak6nys=\"\" href=\"../../places/loshakova/\">";
  if (!row.html.includes(oldText)) throw new Error("Could not find the Loshakovo comparison text.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(row.html.replace(oldText, plainText), "belozersky-1544");
};
