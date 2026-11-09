export const up = (db) => {
  const bookId = "belozersky-1626";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-1";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document?.html.includes("Болшой Двор")) throw new Error("The original Bolshoy Dvor spelling was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll("Болшой Двор", "[Большой Двор]"), bookId);
  db.prepare("UPDATE mentions SET source_name = replace(source_name, 'Болшой Двор', '[Большой Двор]') WHERE id = ?")
    .run(mentionId);
  db.prepare(`
    UPDATE place_names SET name = 'Большой Двор'
    WHERE place_id = 'charoma' AND name = 'Болшой Двор'
      AND id IN (SELECT place_name_id FROM place_name_states WHERE source_mention_id = ?)
  `).run(mentionId);
};
