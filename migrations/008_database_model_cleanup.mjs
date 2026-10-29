const columns = (db, table) => new Set(
  db.prepare(`PRAGMA table_info("${table}")`).all().map((column) => column.name)
);

export const up = (db) => {
  // A name is an entity, not an attestation: repeated spellings for the same
  // place share one name record; the separate states retain every source.
  const duplicates = db.prepare(`
    SELECT place_id, lower(name) AS normalized
    FROM place_names
    GROUP BY place_id, lower(name)
    HAVING COUNT(*) > 1
  `).all();
  const namesForValue = db.prepare(`
    SELECT id, name_kind, is_preferred, source_mention_id
    FROM place_names
    WHERE place_id = ? AND lower(name) = ?
    ORDER BY is_preferred DESC, CASE name_kind WHEN 'attested' THEN 0 ELSE 1 END, id
  `);
  const repointStates = db.prepare("UPDATE place_name_states SET place_name_id = ? WHERE place_name_id = ?");
  const updateName = db.prepare(`
    UPDATE place_names
    SET is_preferred = MAX(is_preferred, ?),
        source_mention_id = COALESCE(source_mention_id, ?)
    WHERE id = ?
  `);
  const deleteName = db.prepare("DELETE FROM place_names WHERE id = ?");
  for (const duplicate of duplicates) {
    const [canonical, ...redundant] = namesForValue.all(duplicate.place_id, duplicate.normalized);
    for (const name of redundant) {
      repointStates.run(canonical.id, name.id);
      updateName.run(name.is_preferred, name.source_mention_id, canonical.id);
      deleteName.run(name.id);
    }
  }

  // Positions provide a stable presentation order, so ties are removed.
  const states = db.prepare(`
    SELECT id, place_id
    FROM place_name_states
    ORDER BY place_id, position, id
  `).all();
  const nextPosition = new Map();
  const setPosition = db.prepare("UPDATE place_name_states SET position = ? WHERE id = ?");
  for (const state of states) {
    const position = nextPosition.get(state.place_id) ?? 0;
    setPosition.run(position, state.id);
    nextPosition.set(state.place_id, position + 1);
  }

  const geometryColumns = columns(db, "place_geometries");
  for (const column of ["longitude", "latitude", "certainty", "source"]) {
    if (geometryColumns.has(column)) db.exec(`ALTER TABLE place_geometries DROP COLUMN "${column}"`);
  }

  db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS fragments_book_position_unique
      ON fragments(book_id, position);
    CREATE UNIQUE INDEX IF NOT EXISTS place_names_place_name_unique
      ON place_names(place_id, name COLLATE NOCASE);
    CREATE INDEX IF NOT EXISTS place_name_states_name_idx
      ON place_name_states(place_name_id);
    CREATE INDEX IF NOT EXISTS place_name_states_source_mention_idx
      ON place_name_states(source_mention_id);
    CREATE INDEX IF NOT EXISTS place_names_source_mention_idx
      ON place_names(source_mention_id);
  `);
};
