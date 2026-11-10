export const up = (db) => {
  const sourceId = "maltsov";
  const targetId = "malchino";
  const source = db.prepare("SELECT id FROM places WHERE id = ?").get(sourceId);
  const target = db.prepare("SELECT id FROM places WHERE id = ?").get(targetId);
  if (!source || !target) throw new Error("Карточка Мальцова или Малчина не найдена.");

  const duplicateNames = db.prepare(`
    SELECT source.name FROM place_names source
    JOIN place_names target ON target.place_id = ? AND target.name = source.name
    WHERE source.place_id = ?
  `).all(targetId, sourceId);
  if (duplicateNames.length) {
    throw new Error(`В карточке Малчина уже есть варианты имён: ${duplicateNames.map(({ name }) => name).join(", ")}.`);
  }

  db.exec("PRAGMA defer_foreign_keys = ON");
  db.prepare("UPDATE place_name_states SET place_id = ? WHERE place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE mentions SET place_id = ? WHERE place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE place_names SET place_id = ? WHERE place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE churches SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  db.prepare("UPDATE land_owners SET location_place_id = ? WHERE location_place_id = ?").run(targetId, sourceId);
  db.prepare("DELETE FROM places WHERE id = ?").run(sourceId);
};
