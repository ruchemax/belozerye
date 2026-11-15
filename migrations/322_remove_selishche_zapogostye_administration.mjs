export const up = (db) => {
  const mentionId = "kirillov-1559-mention-060";
  const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
  const unit = db.prepare(`SELECT 1 FROM mention_administrative_units
    WHERE mention_id = ? AND administrative_unit_id = ?`)
    .get(mentionId, "subdivision:Запогостье");
  if (mention?.place_id !== "selishche" || !unit) {
    throw new Error("The Selishche administrative variant with Zapogostye was not found.");
  }
  db.prepare("DELETE FROM mention_administrative_units WHERE mention_id = ?").run(mentionId);
};
