export const up = (db) => {
  const bookId = "kirillov-1559";
  const fragmentId = "kirillov-1559-seed-koshchievsky-026";
  const mentionId = `mention:${fragmentId}`;
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id=?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id=?").get(fragmentId);
  if (!document || !fragment) throw new Error("The Ramenie seed record was not found.");
  const variant = 'Рамение <span class="name-variant">[Раменье]</span>';
  if (!document.html.includes(variant)) throw new Error("The expected Ramenie variant was not found.");
  const html = document.html.replace(variant,"Рамение")
    .replace("Деревня Рамение [Раменье]</a>","Деревня Рамение</a>");
  db.prepare("UPDATE book_documents SET html=? WHERE book_id=?").run(html,bookId);
  db.prepare("UPDATE mentions SET source_name='Деревня Рамение' WHERE id=?").run(mentionId);
  db.prepare("UPDATE fragments SET raw_json=? WHERE id=?").run(
    JSON.stringify({...JSON.parse(fragment.raw_json),source_name_override:"Деревня Рамение"}),fragmentId
  );
  db.prepare(`DELETE FROM place_name_states WHERE source_mention_id=?
    AND place_name_id IN (SELECT id FROM place_names WHERE name='Раменье')`).run(mentionId);
};
