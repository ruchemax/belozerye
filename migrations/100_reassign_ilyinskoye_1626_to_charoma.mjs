export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-1";
  if (!db.prepare("SELECT 1 FROM places WHERE id = 'charoma'").get()) {
    throw new Error("The Charoma place card was not found.");
  }
  const mention = db.prepare("SELECT place_id FROM mentions WHERE id = ?").get(mentionId);
  if (!mention) throw new Error("The 1626/27 Ilyinskoye mention was not found.");
  db.prepare("UPDATE mentions SET place_id = 'charoma', match_reliability = 'exact' WHERE id = ?")
    .run(mentionId);
};
