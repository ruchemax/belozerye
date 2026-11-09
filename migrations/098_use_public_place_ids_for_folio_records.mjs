export const up = (db) => {
  const rows = db.prepare(`
    SELECT id, slug, name, name_origin, type_code, status_code
    FROM places
    WHERE id LIKE 'place-1626-folio-547-%'
    ORDER BY id
  `).all();

  const updateMentions = db.prepare("UPDATE mentions SET place_id = ? WHERE place_id = ?");
  const deletePlace = db.prepare("DELETE FROM places WHERE id = ?");
  const finalizeSlug = db.prepare("UPDATE places SET slug = ? WHERE id = ?");
  const insertPlace = db.prepare(`
    INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const row of rows) {
    const temporarySlug = `${row.slug}--migration-temp`;
    insertPlace.run(row.slug, temporarySlug, row.name, row.name_origin, row.type_code, row.status_code);
    updateMentions.run(row.slug, row.id);
    deletePlace.run(row.id);
    finalizeSlug.run(row.slug, row.slug);
  }
};
