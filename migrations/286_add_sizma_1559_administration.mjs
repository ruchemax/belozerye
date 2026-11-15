export const up = (db) => {
  const parentId = "subdivision:sizma-1559";
  db.prepare(`INSERT INTO administrative_units (id, kind, name, parent_id)
    VALUES (?, 'subdivision', 'Сизма', NULL)`).run(parentId);
  const mentions = db.prepare(`SELECT m.id FROM mentions m JOIN fragments f ON f.id = m.fragment_id
    WHERE f.book_id = 'kirillov-1559' ORDER BY f.position`).all();
  if (mentions.length !== 133) throw new Error(`Expected 133 administrative updates, found ${mentions.length}.`);
  const insert = db.prepare(`INSERT INTO mention_administrative_units
    (mention_id, administrative_unit_id, context_key, display_label) VALUES (?, ?, 'subdivision', ?)`);
  for (const mention of mentions) {
    const subdivisions = db.prepare(`SELECT administrative_unit_id, display_label FROM mention_administrative_units
      WHERE mention_id = ? AND context_key = 'subdivision' ORDER BY rowid`).all(mention.id);
    db.prepare("DELETE FROM mention_administrative_units WHERE mention_id = ? AND context_key = 'subdivision'").run(mention.id);
    insert.run(mention.id, parentId, null);
    for (const unit of subdivisions) insert.run(mention.id, unit.administrative_unit_id, unit.display_label);
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after adding Sizma.");
};
