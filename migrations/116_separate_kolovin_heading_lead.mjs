export const up = (db) => {
  const bookId = "belozersky-1626";
  const fragmentId = "belozersky-1626-fragment-folios-547-561-place-13";
  const targetId = "kolovin-place-name";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(fragmentId);
  if (!document || !fragment) throw new Error("The Kolovin source record was not found.");
  const original = '<span data-astro-cid-zcak6nys>У погоста ж на церковной земле починок Коловин</span>';
  if (!document.html.includes(original)) throw new Error("The original Kolovin heading was not found.");
  let html = document.html.replace(original,
    `<span class="plain-heading-text" data-astro-cid-zcak6nys>У погоста ж на церковной земле </span><span id="${targetId}" data-astro-cid-zcak6nys>починок Коловин</span>`);
  html = html.replace(/(<a\b[^>]*href="#folios-547-561-place-13-heading"[^>]*>)[\s\S]*?(<\/a>)/u, '$1Починок Коловин$2');
  const settings = { ...JSON.parse(fragment.raw_json), source_name_override: "починок Коловин" };
  db.prepare("UPDATE fragments SET link_target_id = ?, raw_json = ? WHERE id = ?")
    .run(targetId, JSON.stringify(settings), fragmentId);
  db.prepare("UPDATE mentions SET source_name = 'починок Коловин' WHERE fragment_id = ?").run(fragmentId);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
