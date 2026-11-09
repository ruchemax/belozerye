export const up = (db) => {
  const bookId = "belozersky-1626";
  const headingId = "folios-547-561-place-18-heading";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626/27 book document was not found.");
  const heading = new RegExp(`<h3(\\b[^>]*\\bid="${headingId}"[^>]*)>([\\s\\S]*?)<\\/h3>`, "u");
  if (!heading.test(document.html)) throw new Error("The Kolенets pogost heading was not found.");
  let html = document.html.replace(heading, (_match, attributes, body) =>
    `<h2${attributes.replace('class="place-heading"', 'class="record-owner-heading"')}>${body}</h2>`);
  const contents = new RegExp(`<div\\b[^>]*\\bdata-contents-key="${headingId}"[^>]*>`, "u");
  if (!contents.test(html)) throw new Error("The Kolенets contents entry was not found.");
  html = html.replace(contents, (entry) => entry
    .replace("contents-level-3", "contents-level-2")
    .replace('data-contents-level="3"', 'data-contents-level="2"'));
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
