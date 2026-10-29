export const up = (db) => {
  db.exec(`
    CREATE TABLE church_sources (
      church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
      book_slug TEXT NOT NULL,
      book_title TEXT NOT NULL,
      source_anchor TEXT NOT NULL,
      PRIMARY KEY (church_id, book_slug, source_anchor)
    );
    INSERT INTO church_sources (church_id, book_slug, book_title, source_anchor)
    SELECT id, book_slug, book_title, source_anchor FROM churches;
  `);

  db.prepare(`
    INSERT INTO church_sources (church_id, book_slug, book_title, source_anchor)
    VALUES (?, ?, ?, ?)
  `).run(
    "bogoyavlenie-ugol",
    "belozersky_uezd-1626-27",
    "Писцовая книга Белозерского уезда (1626/27 г.)",
    "church-and-estates"
  );

  const oldHref = "../../churches/bogoyavlenie-state-churchyard/";
  const newHref = "../../churches/bogoyavlenie-ugol/";
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1626");
  if (!row) throw new Error("Book document belozersky-1626 was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(row.html.replaceAll(oldHref, newHref), "belozersky-1626");

  db.prepare(`
    UPDATE churches
    SET location_place_id = (
      SELECT location_place_id FROM churches WHERE id = ?
    )
    WHERE id = ?
  `).run("bogoyavlenie-state-churchyard", "bogoyavlenie-ugol");
  db.prepare(`
    UPDATE church_geometries
    SET church_id = ?
    WHERE church_id = ?
  `).run("bogoyavlenie-ugol", "bogoyavlenie-state-churchyard");
  db.prepare("DELETE FROM churches WHERE id = ?").run("bogoyavlenie-state-churchyard");
};
