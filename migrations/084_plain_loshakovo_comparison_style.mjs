export const up = (db) => {
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1544");
  if (!row) throw new Error("Book document belozersky-1544 was not found.");

  const oldStyle = '<span style="font-weight:400">';
  const plainStyle = '<span style="font-weight:400!important;color:#33281f!important;font-size:.9375rem!important">';
  if (!row.html.includes(oldStyle)) throw new Error("The plain Loshakovo comparison span was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(row.html.replace(oldStyle, plainStyle), "belozersky-1544");
};
