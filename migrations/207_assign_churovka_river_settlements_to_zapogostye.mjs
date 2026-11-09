export const up = (db) => {
  const mentionIds = [
    "belozersky-1626-mention-folios-547-561-place-36",
    "belozersky-1626-mention-folios-547-561-place-37",
    "belozersky-1626-mention-folios-547-561-place-38",
    "belozersky-1626-mention-folios-547-561-place-39",
    "belozersky-1626-mention-folios-547-561-place-40",
    "belozersky-1626-mention-folios-547-561-place-41",
    "belozersky-1626-mention-folios-547-561-place-42",
    "belozersky-1626-mention-folios-547-561-place-43",
    "belozersky-1626-mention-folios-547-561-place-44",
    "belozersky-1626-mention-folios-547-561-place-45",
    "belozersky-1626-mention-folios-547-561-place-46",
    "belozersky-1626-mention-folios-547-561-place-47",
    "belozersky-1626-mention-folios-547-561-place-49",
    "belozersky-1626-mention-folios-547-561-place-50",
    "belozersky-1626-mention-folios-547-561-place-51",
    "belozersky-1626-mention-folios-547-561-place-52",
    "belozersky-1626-mention-folios-547-561-place-53",
    "belozersky-1626-mention-folios-547-561-place-54",
    "belozersky-1626-mention-folios-547-561-place-55",
    "belozersky-1626-mention-folios-547-561-place-56"
  ];
  const placeholders = mentionIds.map(() => "?").join(", ");
  const count = db.prepare(`SELECT COUNT(*) AS count FROM mentions WHERE id IN (${placeholders})`).get(...mentionIds).count;
  if (count !== mentionIds.length) throw new Error("Not all settlements from the Churovka passage were found.");

  db.prepare(`DELETE FROM mention_administrative_units WHERE context_key = 'subdivision' AND mention_id IN (${placeholders})`)
    .run(...mentionIds);
  const insert = db.prepare(`
    INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, 'subdivision:Запогостье', 'subdivision')
  `);
  for (const mentionId of mentionIds) insert.run(mentionId);
};
