export const up = (db) => {
  const renames = [
    ["ilya-prophet-charoma", "ili-proroka-charoma"],
    ["nativity-bogoroditsy-churovskaya", "rozhdestva-bogoroditsy-churovskaya"],
    ["kirill-belozersky-pishchalinskoe", "kirilla-belozerskogo-pishchalinskoe"],
    ["george-victorious-ugol", "georgiya-pobedonostsa-ugol"],
    ["nicholas-chudotvorets-churovskaya", "nikolaya-chudotvortsa-churovskaya"]
  ];
  const findChurch = db.prepare("SELECT id FROM churches WHERE slug = ?");
  const updateChurch = db.prepare("UPDATE churches SET slug = ? WHERE slug = ?");
  const updateBookDocuments = db.prepare("UPDATE book_documents SET html = REPLACE(html, ?, ?)");

  for (const [oldSlug, newSlug] of renames) {
    if (!findChurch.get(oldSlug)) throw new Error(`Church slug ${oldSlug} was not found.`);
    if (findChurch.get(newSlug)) throw new Error(`Church slug ${newSlug} already exists.`);
    updateBookDocuments.run(`../../churches/${oldSlug}/`, `../../churches/${newSlug}/`);
    updateChurch.run(newSlug, oldSlug);
  }
};
