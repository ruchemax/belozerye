export const up = (db) => {
  const bookId = "kirillov-1559";
  const fragmentId = "kirillov-1559-seed-koshchievsky-005";
  const mentionId = `mention:${fragmentId}`;
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  if (!document || !fragment) throw new Error("The Koshcheevo seed record was not found.");
  const variant = 'Кощеево <span class="name-variant">[Кощиево]</span>';
  if (!document.html.includes(variant)) throw new Error("The expected Koshcheevo variant was not found.");
  const html = document.html.replace(variant,"Кощеево")
    .replace("Деревня Кощеево [Кощиево]</a>","Деревня Кощеево</a>");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  db.prepare("UPDATE mentions SET source_name='Деревня Кощеево' WHERE id=?").run(mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?").run(
    JSON.stringify({...JSON.parse(fragment.raw_json),source_name_override:"Деревня Кощеево"}),fragmentId
  );
  db.prepare(`DELETE FROM place_name_states WHERE source_mention_id=?
    AND place_name_id IN (SELECT id FROM place_names WHERE name='Кощиево')`).run(mentionId);
};
