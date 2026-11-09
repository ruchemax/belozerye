export const up = (db) => {
  const bookId = "belozersky-1626";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-1";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document?.html.includes("[Большой Двор]")) throw new Error("The Bolshoy Dvor transcription was not found.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replaceAll("[Большой Двор]", "Болшой [Большой] Двор"), bookId);
  db.prepare("UPDATE mentions SET source_name = replace(source_name, '[Большой Двор]', 'Болшой [Большой] Двор') WHERE id = ?")
    .run(mentionId);
};
