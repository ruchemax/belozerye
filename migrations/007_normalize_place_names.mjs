const typePattern = /^(?:деревня|деревни|полдеревни|полдеревня|пустошь|пустоши|пустош|селище|селища|починок|новцо|займище)\s+/iu;
const mainName = (value) => String(value)
  .trim()
  .replace(typePattern, "")
  .replace(/\s+на\s+(?:реке|речке|ручье|ручью)(?=\s|$|[,.])[\s\S]*$/iu, "")
  .replace(/\s+на\s+(?:Шексне|Уломе)(?=$|[,.])[\s\S]*$/iu, "")
  .replace(/\s+против(?=\s|$|[,.])[\s\S]*$/iu, "")
  .replace(/\s+(?:на\s+)?пуст(?:а|ая|ое|ой|ои)(?=\s|$|[,.])[\s\S]*$/iu, "")
  .replace(/,\s*[^,]+?\s+тож(?=$|[,.])/iu, "")
  .replace(/[,\.\s]+$/u, "")
  .trim();

export const up = (db) => {
  db.exec("ALTER TABLE places ADD COLUMN name TEXT");
  const latest = db.prepare(`
    SELECT m.place_id, m.source_name, m.historical_name_override
    FROM mentions m
    JOIN fragments f ON f.id = m.fragment_id
    JOIN books b ON b.id = f.book_id
    ORDER BY CAST(substr(b.year, 1, 4) AS INTEGER) DESC, m.rowid ASC
  `).all();
  const firstByPlace = new Map();
  for (const mention of latest) if (!firstByPlace.has(mention.place_id)) firstByPlace.set(mention.place_id, mention);
  const setName = db.prepare("UPDATE places SET name = ? WHERE id = ?");
  for (const place of db.prepare("SELECT id, preferred_name, main_name FROM places").all()) {
    const mention = firstByPlace.get(place.id);
    const name = mainName(mention?.historical_name_override ?? mention?.source_name ?? place.main_name ?? place.preferred_name);
    if (!name) throw new Error(`Не удалось определить главное имя для ${place.id}.`);
    setName.run(name, place.id);
  }

  const addName = db.prepare(`INSERT OR IGNORE INTO place_names
    (id, place_id, name, name_kind, is_preferred) VALUES (?, ?, ?, ?, 0)`);
  for (const place of db.prepare("SELECT id, name, preferred_name, main_name FROM places").all()) {
    for (const [kind, value] of [["preferred", place.preferred_name], ["former_main", place.main_name]]) {
      if (value && value !== place.name) addName.run(`${kind}:${place.id}`, place.id, value, kind);
    }
  }
  for (const row of db.prepare("SELECT place_id, position, name FROM place_name_variants").all()) {
    addName.run(`variant:${row.place_id}:${row.position}`, row.place_id, row.name, "variant");
  }
  db.exec(`
    UPDATE places SET raw_json = json_remove(json_set(raw_json, '$.name', name), '$.preferred_name', '$.main_name');
    DROP TABLE place_name_variants;
    ALTER TABLE places DROP COLUMN preferred_name;
    ALTER TABLE places DROP COLUMN main_name;
  `);
};
