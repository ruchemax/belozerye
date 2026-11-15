export const up = (db) => {
  const unitId = "subdivision:Судбицах";
  if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ?").get(unitId)) {
    throw new Error("The Sudbitsy administrative unit was not found.");
  }
  for (const suffix of ["064", "132"]) {
    const mentionId = `kirillov-1559-mention-${suffix}`;
    const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
    if (mention?.place_id !== "kharlamovo") throw new Error(`The Kharlamovo mention ${mentionId} was not found.`);
    db.prepare(`INSERT INTO mention_administrative_units
      (mention_id, administrative_unit_id, context_key, display_label)
      VALUES (?, ?, 'subdivision', NULL)`).run(mentionId, unitId);
  }
};
