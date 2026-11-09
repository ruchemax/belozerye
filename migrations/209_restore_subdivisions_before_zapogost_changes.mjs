export const up = (db) => {
  const numbers = [36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 49, 50, 51, 52, 53, 54, 55, 56];
  const previousSubdivisions = new Map([
    [39, "subdivision:Коленца"],
    [41, "subdivision:Коленца"],
    [44, "subdivision:Судбицах"],
    [45, "subdivision:Судбицах"]
  ]);
  const remove = db.prepare("DELETE FROM mention_administrative_units WHERE mention_id = ? AND context_key = 'subdivision'");
  const insert = db.prepare("INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key) VALUES (?, ?, 'subdivision')");
  for (const number of numbers) {
    const mentionId = `belozersky-1626-mention-folios-547-561-place-${number}`;
    if (!db.prepare("SELECT 1 FROM mentions WHERE id = ?").get(mentionId)) {
      throw new Error(`The mention ${mentionId} was not found.`);
    }
    remove.run(mentionId);
    const subdivisionId = previousSubdivisions.get(number);
    if (subdivisionId) insert.run(mentionId, subdivisionId);
  }
};
