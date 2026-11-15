export const up = (db) => {
  const mentionId = "kirillov-1601-mention-073-golobokovo";
  const name = db.prepare("SELECT id FROM place_names WHERE place_id='golobokovo' AND name='Голобокое'").get();
  if (!name) throw new Error("The Golobokoe name was not found.");
  const updated = db.prepare("UPDATE place_name_states SET place_name_id=? WHERE source_mention_id=?")
    .run(name.id, mentionId);
  if (updated.changes !== 1) throw new Error("The 1601 Golobokaya name state was not found.");
  db.prepare("UPDATE mentions SET historical_name_override=? WHERE id=?")
    .run("Деревня Голобокое", mentionId);
  db.prepare(`DELETE FROM place_names WHERE place_id='golobokovo' AND name='Голобокой'
    AND NOT EXISTS (SELECT 1 FROM place_name_states WHERE place_name_id=place_names.id)`).run();
};
