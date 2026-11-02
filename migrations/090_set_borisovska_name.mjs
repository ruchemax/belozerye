export const up = (db) => {
  db.prepare("UPDATE places SET name = ? WHERE id = ?")
    .run("Борисовска", "borisovskaya");
  db.prepare("UPDATE place_names SET name = ? WHERE id = ?")
    .run("Борисовска", "attested:borisovskaya:45");
  db.prepare("UPDATE mentions SET source_name = ? WHERE id = ?")
    .run("Деревня Борисовска на ручье", "mention-belozersky-1626-borisovska");
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1626");
  if (!document?.html.includes("Борисовская")) {
    throw new Error("The Borisovskaya spelling was not found in the 1626/27 book.");
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll("Борисовская", "Борисовска"), "belozersky-1626");
};
