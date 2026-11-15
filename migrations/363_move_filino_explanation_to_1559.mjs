export const up = (db) => {
  const early = db.prepare("SELECT match_reason FROM mentions WHERE id = 'mention-belozersky-1544-place-1-12' AND place_id = 'olekseeva'").get();
  if (!early?.match_reason) throw new Error("Missing Filino explanation from 1544.");
  const update = db.prepare("UPDATE mentions SET match_reason = ? WHERE id = ? AND place_id = 'olekseeva'");
  for (const id of ["kirillov-1559-mention-006", "kirillov-1559-mention-079"]) {
    const mention = db.prepare("SELECT match_reason FROM mentions WHERE id = ? AND place_id = 'olekseeva'").get(id);
    if (!mention?.match_reason) throw new Error(`Missing Olekseeva explanation: ${id}.`);
    update.run(`${early.match_reason} ${mention.match_reason}`, id);
  }
  db.prepare("UPDATE mentions SET match_reliability = 'exact', match_reason = NULL WHERE id = 'mention-belozersky-1544-place-1-12' AND place_id = 'olekseeva'").run();
};
