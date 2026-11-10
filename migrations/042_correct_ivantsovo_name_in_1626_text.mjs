export const up = (db) => {
  const bookId = "belozersky-1626";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-9";
  const stateId = `observed:${mentionId}:0`;
  const book = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!book) throw new Error("Текст книги 1626/27 года не найден.");

  const oldName = "Волцово";
  const newName = "Иванцово";
  const occurrences = book.html.split(oldName).length - 1;
  if (occurrences !== 2) {
    throw new Error(`Ожидалось два упоминания «${oldName}» в тексте, найдено: ${occurrences}.`);
  }

  db.prepare("UPDATE book_documents SET html = replace(html, ?, ?) WHERE book_id = ?")
    .run(oldName, newName, bookId);
  db.prepare("UPDATE mentions SET source_name = ? WHERE id = ? AND source_name = ?")
    .run("Деревня Иванцово", mentionId, "Деревня Волцово");
  db.prepare(`UPDATE place_name_states
    SET place_name_id = 'attested:ivantsovo:151' WHERE id = ? AND place_id = 'ivantsovo'`)
    .run(stateId);
  db.prepare("DELETE FROM place_names WHERE id = 'attested:ivantsovo:voltsovo-1626'")
    .run();
};
