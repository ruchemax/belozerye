export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-69";
  const mention = db.prepare("SELECT place_id, source_name FROM mentions WHERE id = ?").get(mentionId);
  if (mention?.place_id !== "fomkin") throw new Error("The merged Fominskoe source mention was not found on the Fomkin card.");
  db.prepare("UPDATE place_names SET name = 'Фоминское' WHERE id = 'attested:belozersky-1626-mention-folios-547-561-place-69:0' AND name = 'Фоминсккое'")
    .run();
  db.prepare("UPDATE mentions SET source_name = replace(source_name, 'Фоминсккое', 'Фоминское') WHERE id = ?")
    .run(mentionId);
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html.replaceAll("Фоминсккое", "Фоминское");
    if (html !== document.html) db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
  }
};
