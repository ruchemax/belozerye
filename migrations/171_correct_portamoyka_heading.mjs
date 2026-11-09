export const up = (db) => {
  const mentionId = "belozersky-1626-mention-folios-547-561-place-73";
  const mention = db.prepare("SELECT source_name FROM mentions WHERE id = ?").get(mentionId);
  if (!mention || mention.source_name !== "Пустиш Портамойка") {
    throw new Error("The Portamoyka source heading was not found in its expected form.");
  }
  db.prepare("UPDATE mentions SET source_name = 'Пустошь Портамойка' WHERE id = ?").run(mentionId);

  const row = db.prepare("SELECT html FROM book_documents WHERE book_id = 'belozersky-1626'").get();
  if (!row) throw new Error("The 1626/27 book document was not found.");
  let html = row.html;
  const contentsOld = '<a href="#folios-547-561-place-73-heading" class="contents-link" data-astro-cid-zcak6nys>Пустиш Портамойка <span class="page-mark" data-astro-cid-zcak6nys>(л. 560)</span></a>';
  const contentsNew = '<a href="#folios-547-561-place-73-heading" class="contents-link" data-astro-cid-zcak6nys>Пустошь Портамойка</a>, <span class="page-mark" data-astro-cid-zcak6nys>(л. 560)</span>';
  const headingOld = '<h3 id="folios-547-561-place-73-heading" class="place-heading" data-astro-cid-zcak6nys><span data-astro-cid-zcak6nys>Пустиш Портамойка <span class="page-mark" data-astro-cid-zcak6nys>(л. 560)</span></span></h3>';
  const headingNew = '<h3 id="folios-547-561-place-73-heading" class="place-heading" data-astro-cid-zcak6nys><span data-astro-cid-zcak6nys>Пустошь Портамойка</span><span class="heading-comma" data-astro-cid-zcak6nys>,</span> <span class="page-mark" data-astro-cid-zcak6nys>(л. 560)</span></h3>';
  if (!html.includes(contentsOld) || !html.includes(headingOld)) {
    throw new Error("The expected Portamoyka contents entry or heading could not be located.");
  }
  html = html.replace(contentsOld, contentsNew).replace(headingOld, headingNew);
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = 'belozersky-1626'").run(html);
};
