export const up = (db) => {
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1626");
  if (!document?.html.includes("Борисовска[я]")) {
    throw new Error("The Borisovskaya source spelling was not found in the 1626/27 book.");
  }

  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll("Борисовска[я]", "Борисовская"), "belozersky-1626");
  db.prepare("UPDATE mentions SET source_name = ? WHERE id = ?")
    .run("Деревня Борисовская на ручье", "mention-belozersky-1626-borisovska");
  db.prepare("UPDATE place_names SET name = ? WHERE id = ?")
    .run("Борисовская", "attested:borisovskaya:45");
};
