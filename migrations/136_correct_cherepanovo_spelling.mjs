export const up = (db) => {
  const placeId = "chyuravskaya-nov";
  if (!db.prepare("SELECT 1 FROM places WHERE id = ?").get(placeId)) throw new Error("The Cherepanovo card was not found.");
  for (const document of db.prepare("SELECT book_id, html FROM book_documents WHERE instr(html, 'Черепапово') > 0").all()) {
    db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
      .run(document.html.replaceAll("Черепапово", "Черепаново"), document.book_id);
  }
  db.prepare("UPDATE places SET name = 'Черепаново' WHERE id = ?").run(placeId);
  db.prepare(`UPDATE mentions SET source_name = replace(source_name, 'Черепапово', 'Черепаново'),
    historical_name_override = replace(historical_name_override, 'Черепапово', 'Черепаново')
    WHERE place_id = ?`).run(placeId);
  const oldName = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = 'Черепапово'").get(placeId);
  const correctName = db.prepare("SELECT id FROM place_names WHERE place_id = ? AND name = 'Черепаново'").get(placeId);
  if (oldName && correctName) {
    db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE place_name_id = ?").run(correctName.id, oldName.id);
    db.prepare("DELETE FROM place_names WHERE id = ?").run(oldName.id);
  } else if (oldName) {
    db.prepare("UPDATE place_names SET name = 'Черепаново' WHERE id = ?").run(oldName.id);
  }
};
