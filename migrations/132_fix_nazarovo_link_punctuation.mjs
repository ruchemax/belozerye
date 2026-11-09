export const up = (db) => {
  const bookId = "belozersky-1626";
  const fragmentId = "belozersky-1626-fragment-folios-547-561-place-26";
  const targetId = "nazarovo-place-name";
  const sourceName = "Деревня Назарово на речке на Уломке";
  const document = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get(bookId);
  const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(fragmentId);
  const original = '<span data-astro-cid-zcak6nys>Деревня Назарово на речке на Уломке ,<span class="page-mark" data-astro-cid-zcak6nys>(л. 553)</span></span>';
  if (!document?.html.includes(original) || !fragment) throw new Error("The Nazarovo source heading was not found.");
  let html = document.html.replace(original,
    `<span id="${targetId}" data-astro-cid-zcak6nys>${sourceName}</span><span class="heading-comma" data-astro-cid-zcak6nys>,</span> <span class="page-mark" data-astro-cid-zcak6nys>(л. 553)</span>`);
  html = html.replace(/(<a\b[^>]*href="#folios-547-561-place-26-heading"[^>]*>)[\s\S]*?(<\/a>)/u, `$1${sourceName}$2`);
  db.prepare("UPDATE fragments SET link_target_id = ?, raw_json = ? WHERE id = ?")
    .run(targetId, JSON.stringify({ ...JSON.parse(fragment.raw_json), source_name_override: sourceName }), fragmentId);
  db.prepare("UPDATE mentions SET source_name = ? WHERE fragment_id = ?").run(sourceName, fragmentId);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?").run(html, bookId);
};
