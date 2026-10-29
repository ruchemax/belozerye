export const up = (db) => {
  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1626");
  const pattern = /(<section\b[^>]*\bid="(?:belozersky-1626-fragment-)?patriarchal-churchyard"[^>]*>[\s\S]*?<h3\b[^>]*\bid="patriarchal-churchyard"[^>]*>[\s\S]*?<\/h3>)\s*<div\b[^>]*class="[^"]*\bvillage-lines\b[^"]*"[^>]*>([\s\S]*?)<\/div>(\s*<\/section>\s*<section\b[^>]*\bid="(?:belozersky-1626-fragment-)?igumnova")/u;
  const html = row.html.replace(pattern, "$1$2$3");
  if (html === row.html) throw new Error("Не найдена обёртка village-lines записи патриаршего погоста.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, "belozersky-1626");
};
