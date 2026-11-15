export const up = (db) => {
  db.exec("ALTER TABLE place_geometries ADD COLUMN location_note TEXT");
  for (const placeId of ["loshakova", "loshakovo-monastery"]) {
    const mention = db.prepare(`
      SELECT id, match_reason FROM mentions WHERE place_id = ?
      AND fragment_id IN (SELECT id FROM fragments WHERE book_id = 'belozersky-1544')
    `).get(placeId);
    if (!mention?.match_reason) throw new Error(`Missing location explanation for ${placeId}.`);
    const result = db.prepare("UPDATE place_geometries SET location_note = ? WHERE place_id = ?")
      .run(mention.match_reason, placeId);
    if (result.changes !== 1) throw new Error(`Missing coordinates for ${placeId}.`);
    db.prepare("UPDATE mentions SET match_reliability = 'unreviewed', match_reason = NULL WHERE id = ?")
      .run(mention.id);
  }
};
