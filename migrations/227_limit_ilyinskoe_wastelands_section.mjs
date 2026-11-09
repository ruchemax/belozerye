export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626 book document was not found.");

  const oldEnd = /(<section\b[^>]*\bid="folios-547-561-place-56"[^>]*>[\s\S]*?<\/section>)\s*<\/div>\s*<\/section>/u;
  const newEnd = /(<section\b[^>]*\bid="folios-547-561-place-52"[^>]*>[\s\S]*?<\/section>)(\s*<section\b[^>]*\bid="folios-547-561-place-53"[^>]*>)/u;
  const contents = /<div\b[^>]*\bdata-contents-key="folios-547-561-place-48-heading"[^>]*>/u;
  if (!oldEnd.test(document.html) || !newEnd.test(document.html) || !contents.test(document.html)) {
    throw new Error("The old wastelands section boundaries or contents entry were not found.");
  }
  const html = document.html
    .replace(oldEnd, "$1")
    .replace(newEnd, "$1</div></section>$2")
    .replace(contents, (tag) => tag.replace(/>$/u, ' data-contents-end="folios-547-561-place-53-heading">'));
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);

  const unitIds = ["subdivision:Чаромский ключ", "subdivision:село Ильинское"];
  for (const id of unitIds) {
    if (!db.prepare("SELECT 1 FROM administrative_units WHERE id = ?").get(id)) {
      throw new Error(`The administrative unit ${id} was not found.`);
    }
  }
  const remove = db.prepare("DELETE FROM mention_administrative_units WHERE mention_id = ? AND context_key = 'subdivision'");
  const insert = db.prepare(`
    INSERT INTO mention_administrative_units (mention_id, administrative_unit_id, context_key)
    VALUES (?, ?, 'subdivision')
  `);
  for (const number of [49, 50, 51, 52]) {
    const mentionId = `belozersky-1626-mention-folios-547-561-place-${number}`;
    if (!db.prepare("SELECT 1 FROM mentions WHERE id = ?").get(mentionId)) {
      throw new Error(`The Ilyinskoe wasteland mention ${mentionId} was not found.`);
    }
    remove.run(mentionId);
    for (const unitId of unitIds) insert.run(mentionId, unitId);
  }
};
