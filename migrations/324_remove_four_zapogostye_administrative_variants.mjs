export const up = (db) => {
  const pairs = [
    ["larino", "061", "129"],
    ["poteryaevo", "062", "130"],
    ["ostyunino-1559", "063", "131"],
    ["kharlamovo", "064", "132"],
  ];
  for (const [placeId, targetSuffix, sourceSuffix] of pairs) {
    const targetMention = `kirillov-1559-mention-${targetSuffix}`;
    const sourceMention = `kirillov-1559-mention-${sourceSuffix}`;
    const target = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(targetMention);
    const source = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(sourceMention);
    const variant = db.prepare(`SELECT 1 FROM mention_administrative_units
      WHERE mention_id = ? AND administrative_unit_id = ?`)
      .get(targetMention, "subdivision:Запогостье");
    const sourceUnits = db.prepare("SELECT * FROM mention_administrative_units WHERE mention_id = ? ORDER BY rowid").all(sourceMention);
    if (target?.place_id !== placeId || source?.place_id !== placeId || !variant || !sourceUnits.length) {
      throw new Error(`The administrative variants for ${placeId} were not found.`);
    }
    db.prepare("DELETE FROM mention_administrative_units WHERE mention_id = ?").run(targetMention);
    for (const unit of sourceUnits) {
      db.prepare(`INSERT INTO mention_administrative_units
        (mention_id, administrative_unit_id, context_key, display_label) VALUES (?, ?, ?, ?)`)
        .run(targetMention, unit.administrative_unit_id, unit.context_key, unit.display_label);
    }
  }
};
