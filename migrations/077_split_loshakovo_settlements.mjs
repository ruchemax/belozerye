export const up = (db) => {
  const monasterialId = "loshakovo-monastery";
  const metropolitanId = "loshakova";

  // Keep the existing Loshakova identity for the metropolitan settlement so
  // its 1626/27 selishche record remains on the same card.
  db.prepare("UPDATE places SET name = ?, type_code = ? WHERE id = ?")
    .run("Лошаково (митрополичье)", "pochinok", metropolitanId);
  db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, ?, 'ru', 'variant')")
    .run("variant:loshakova:metropolitan", metropolitanId, "Митрополичье Лошаково");

  db.prepare(`
    INSERT INTO places (id, slug, name, name_origin, type_code, status_code)
    VALUES (?, ?, ?, 'observed', 'pochinok', 'unknown')
  `).run(monasterialId, monasterialId, "Лошаково (монастырское)");
  db.prepare("INSERT INTO place_names (id, place_id, name, language, name_kind) VALUES (?, ?, ?, 'ru', 'variant')")
    .run("variant:loshakovo-monastery:monastery", monasterialId, "Монастырское Лошаково");

  const geometry = db.prepare(`
    INSERT INTO place_geometries (place_id, longitude, latitude) VALUES (?, ?, ?)
  `);
  geometry.run(monasterialId, 38.488950555556, 59.267807777778);
  geometry.run(metropolitanId, 38.487237222222, 59.271234166667);

  // The source heading names both settlements in one line. Link each name to
  // its own place card while preserving the source wording and prose.
  const doc = db.prepare("SELECT html FROM book_documents WHERE book_id = ?").get("belozersky-1544");
  const oldLink = '<a data-astro-cid-zcak6nys="" href="../../places/ulushkovo/">Починок Лошаково против митрополича починка Лошакова</a>';
  const splitLinks = `<a data-astro-cid-zcak6nys="" href="../../places/${monasterialId}/">Починок Лошаково</a> против митрополича <a data-astro-cid-zcak6nys="" href="../../places/${metropolitanId}/">починка Лошакова</a>`;
  if (!doc?.html.includes(oldLink)) throw new Error("Could not find the original Loshakovo link in the 1544 source.");
  db.prepare("UPDATE book_documents SET html = ? WHERE book_id = ?")
    .run(doc.html.replace(oldLink, splitLinks), "belozersky-1544");

  db.prepare("INSERT INTO mentions (id, place_id, fragment_id, source_name, historical_name_override) VALUES (?, ?, ?, ?, ?)")
    .run(
      "mention-belozersky-1544-place-12-1-monastery",
      monasterialId,
      "belozersky-1544-place-12-1-metropolitan",
      "Починок Лошаково против митрополича починка Лошакова",
      "монастырский починок Лошаково"
    );
};
