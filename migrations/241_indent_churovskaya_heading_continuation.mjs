export const up = (db) => {
  const bookId = "belozersky-1585";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const headingAndProse = /<h1\b(?=[^>]*\bid="churovskaya")[^>]*>[\s\S]*?<\/h1>\s*<p\b(?=[^>]*\bclass="heading-continuation")[^>]*>[\s\S]*?<\/p>/u;
  if (!document || !headingAndProse.test(document.html)) {
    throw new Error("The Churovskaya heading and its prose continuation were not found.");
  }
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(document.html.replace(headingAndProse, (content) => `<div class="primary-heading-prose-flow">${content}</div>`), bookId);
};
