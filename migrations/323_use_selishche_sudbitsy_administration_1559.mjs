export const up = (db) => {
  const sourceMention = "kirillov-1559-mention-128";
  const targetMention = "kirillov-1559-mention-060";
  const source = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(sourceMention);
  const target = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(targetMention);
  if (source?.place_id !== "selishche" || target?.place_id !== "selishche") {
    throw new Error("The Selishche mentions were not found.");
  }
  db.prepare(`INSERT INTO mention_administrative_units
    (mention_id, administrative_unit_id, context_key, display_label)
    SELECT ?, administrative_unit_id, context_key, display_label
    FROM mention_administrative_units WHERE mention_id = ? ORDER BY rowid`)
    .run(targetMention, sourceMention);
};
