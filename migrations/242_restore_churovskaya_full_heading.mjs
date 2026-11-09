export const up = (db) => {
  const bookId = "belozersky-1585";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const suffix = "пуста того ж Усть-Угольского приказу.";
  const flow = /<div class="primary-heading-prose-flow">(<h1\b(?=[^>]*\bid="churovskaya")[^>]*>[\s\S]*?<\/h1>)(<p\b[^>]*>)([\s\S]*?)<\/p><\/div>/u;
  if (!document || !flow.test(document.html)) throw new Error("The Churovskaya heading flow was not found.");
  let html = document.html.replace(flow, (_match, heading, opening, text) => {
    if (!text.startsWith(`${suffix} `)) throw new Error("The Churovskaya heading continuation was not found.");
    const restored = heading.replace(" heading-with-prose", "").replace("</h1>", ` ${suffix}</h1>`);
    const paragraph = opening.replace(' class="heading-continuation"', "");
    return `<div class="primary-heading-prose-flow">${restored}</div>${paragraph}${text.slice(suffix.length + 1)}</p>`;
  });
  const contents = /<div\b(?=[^>]*\bdata-contents-key="churovskaya")[^>]*>[\s\S]*?<\/div>/u;
  if (!contents.test(html)) throw new Error("The Churovskaya contents entry was not found.");
  html = html.replace(contents, (entry) => entry.replaceAll(
    "Волость Чюровская того ж Усть-Угольского приказу",
    "Волость Чюровская пуста того ж Усть-Угольского приказу"
  ));
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
