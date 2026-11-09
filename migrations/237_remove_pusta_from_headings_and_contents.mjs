export const up = (db) => {
  const containsWord = (text) => /(?<![\p{L}\p{N}_])пуста(?![\p{L}\p{N}_])/iu.test(text);
  const clean = (text) => !containsWord(text) ? text : text
    .replace(/(?<![\p{L}\p{N}_])пуста(?![\p{L}\p{N}_])/giu, "")
    .replace(/ {2,}/gu, " ")
    .replace(/ +(?=[,.;:]|<\/)/gu, "");
  for (const document of db.prepare("SELECT book_id, html FROM book_documents").all()) {
    const html = document.html
      .replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/gu, clean)
      .replace(/<div\b(?=[^>]*\bdata-contents-entry\b)[^>]*>[\s\S]*?<\/div>/gu, clean)
      .replace(/<span\b(?=[^>]*\bclass="[^"]*\bplace-heading\b)[^>]*>[\s\S]*?<\/span>/gu, clean);
    if (html !== document.html) {
      db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, document.book_id);
    }
  }
  const update = db.prepare("UPDATE mentions SET source_name = ? WHERE id = ?");
  for (const mention of db.prepare("SELECT id, source_name FROM mentions").all()) {
    if (!containsWord(mention.source_name)) continue;
    const name = clean(mention.source_name).trim();
    if (name !== mention.source_name) update.run(name, mention.id);
  }
};
