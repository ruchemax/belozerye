export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-1";
  const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
  if (mention?.place_id !== "charoma") throw new Error("The 1626/27 Charoma mention was not found.");

  const unitId = "subdivision:Чаромский ключ";
  db.prepare(`
    INSERT INTO administrative_units (id, kind, name, label)
    VALUES (?, 'subdivision', 'Чаромский ключ', NULL)
    ON CONFLICT(id) DO UPDATE SET name = excluded.name
  `).run(unitId);
  db.prepare(`
    INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, 'subdivision')
    ON CONFLICT(mention_id, context_key) DO UPDATE
      SET administrative_unit_id = excluded.administrative_unit_id
  `).run(mentionId, unitId);
};
