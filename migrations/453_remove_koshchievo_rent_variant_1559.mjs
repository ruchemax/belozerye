export const up = (db) => {
  const bookId = "kirillov-1559";
  const fragmentId = "kirillov-1559-rent-koshchievsky-011";
  const mentionId = `mention:${fragmentId}`;
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  if (!document || !fragment) throw new Error("The Koshchievo rent record was not found.");
  const variant = 'Кощиево <span class="name-variant">[Кощеево]</span>';
  if (!document.html.includes(variant)) throw new Error("The expected Koshchievo variant was not found.");
  const html = document.html.replace(variant,"Кощиево")
    .replace("Деревня Кощиево [Кощеево]</a>","Деревня Кощиево</a>");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  db.prepare("UPDATE mentions SET source_name='Деревня Кощиево' WHERE id=?").run(mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?").run(
    JSON.stringify({...JSON.parse(fragment.raw_json),source_name_override:"Деревня Кощиево"}),fragmentId
  );
  db.prepare(`DELETE FROM place_name_states WHERE source_mention_id=?
    AND place_name_id IN (SELECT id FROM place_names WHERE name='Кощеево')`).run(mentionId);
};
