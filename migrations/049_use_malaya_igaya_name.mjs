export const up = (db) => {
  const bookId = "belozersky-1626";
  const placeId = "derevnya-1626-6";
  const mentionId = "belozersky-1626-mention-folios-547-561-place-6";
  const oldName = "Малая Игаса [Игая]";
  const newName = "Малая Игая";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("Текст книги 1626/27 года не найден.");
  const occurrences = document.html.split(oldName).length - 1;
  if (occurrences !== 2) {
    throw new Error(`Ожидалось два вхождения «${oldName}», найдено: ${occurrences}.`);
  }
  if (!db.prepare("SELECT 1 FROM mentions WHERE id = ? AND place_id = ?").get(mentionId, placeId)) {
    throw new Error("Упоминание Малой Игасы не связано с ожидаемой карточкой.");
  }
  db.prepare("UPDATE book_documents SET html = replace(html, ?, ?) WHERE book_id = ?")
    .run(oldName, newName, bookId);
  db.prepare("UPDATE mentions SET source_name = replace(source_name, ?, ?) WHERE id = ?")
    .run(oldName, newName, mentionId);
  db.prepare(`UPDATE place_names SET name = ? WHERE id =
    'attested:belozersky-1626-mention-folios-547-561-place-6:0' AND place_id = ?`)
    .run(newName, placeId);
  db.prepare("UPDATE places SET name = ?, name_origin = 'observed' WHERE id = ?")
    .run(newName, placeId);
};
