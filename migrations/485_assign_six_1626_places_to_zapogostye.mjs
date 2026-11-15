const places = ["voroshnino", "pustosh-mikitino-1626-100", "obukhovo-ugla", "pustosh-feoktistova-1626-99", "pestovo", "perkhino"];

export const up = (db) => {
  const unitId = "subdivision:Запогостье";
  for (const placeId of places) {
    const rows = db.prepare(`SELECT m.id,m.fragment_id FROM mentions m JOIN fragments f ON f.id=m.fragment_id
      WHERE m.place_id=? AND f.book_id='belozersky-1626' AND f.source_heading_id LIKE 'folios-547-561-%'`).all(placeId);
    if (rows.length !== 1) throw new Error(`Expected one section mention for ${placeId}.`);
    const row = rows[0];
    db.prepare(`INSERT INTO mention_administrative_units (mention_id,administrative_unit_id,context_key)
      VALUES (?,?,'subdivision')`).run(row.id, unitId);
    db.prepare(`INSERT OR IGNORE INTO fragment_administrative_units (fragment_id,administrative_unit_id,context_key)
      VALUES (?,?,'subdivision')`).run(row.fragment_id, unitId);
  }
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after assigning the six places to Zapogostye.");
};
