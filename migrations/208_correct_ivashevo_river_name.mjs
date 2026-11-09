export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-2";
  const mention = db.prepare("SELECT source_name FROM mentions WHERE id = ?").get(mentionId);
  if (!mention || !mention.source_name.includes("Улолмке")) {
    throw new Error("The Ivashevo mention with the misspelled river name was not found.");
  }
  db.prepare("UPDATE mentions SET source_name = replace(source_name, 'Улолмке', 'Уломке') WHERE id = ?").run(mentionId);

  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document?.html.includes("Улолмке")) {
    throw new Error("The misspelled river name was not found in the 1626 book text.");
  }
  db.prepare("UPDATE book_documents SET html = replace(html, 'Улолмке', 'Уломке') WHERE book_id = ?").run(bookId);
};
