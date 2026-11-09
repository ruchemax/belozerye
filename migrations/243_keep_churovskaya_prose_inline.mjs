export const up = (db) => {
  const bookId = "belozersky-1585";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const flow = /(<div class="primary-heading-prose-flow"><h1\b(?=[^>]*\bid="churovskaya")[^>]*>[\s\S]*?<\/h1>)<\/div>\s*(<p\b[^>]*>)([\s\S]*?<\/p>)/u;
  if (!document || !flow.test(document.html)) throw new Error("The Churovskaya heading and following paragraph were not found.");
  const html = document.html.replace(flow, (_match, heading, paragraph, prose) =>
    `${heading}${paragraph.replace("<p", '<p class="heading-continuation"')}${prose}</div>`);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
