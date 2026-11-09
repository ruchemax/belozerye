export const up = (db) => {
  const bookId = "belozersky-1626";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  if (!document) throw new Error("The 1626 book document was not found.");

  let html = document.html;
  for (const number of [49, 50, 51, 52]) {
    const headingId = `folios-547-561-place-${number}-heading`;
    const heading = new RegExp(`<h4(\\b[^>]*\\bid="${headingId}"[^>]*)>([\\s\\S]*?)<\\/h4>`, "u");
    if (!heading.test(html)) throw new Error(`The wasteland heading ${headingId} was not found.`);
    html = html.replace(heading, (_match, attributes, body) => `<h3${attributes}>${body}</h3>`);

    const contents = new RegExp(`<div\\b[^>]*\\bdata-contents-key="${headingId}"[^>]*>`, "u");
    if (!contents.test(html)) throw new Error(`The wasteland contents entry ${headingId} was not found.`);
    html = html.replace(contents, (entry) => entry
      .replace("contents-level-4", "contents-level-3")
      .replace('data-contents-level="4"', 'data-contents-level="3"'));
  }

  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
