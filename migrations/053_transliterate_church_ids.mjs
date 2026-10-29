export const up = (db) => {
  db.exec("PRAGMA defer_foreign_keys = ON");
  const renames = [
    ["ilya-prophet-charoma", "ili-proroka-charoma"],
    ["nativity-bogoroditsy-churovskaya", "rozhdestva-bogoroditsy-churovskaya"],
    ["kirill-belozersky-pishchalinskoe", "kirilla-belozerskogo-pishchalinskoe"],
    ["george-victorious-ugol", "georgiya-pobedonostsa-ugol"],
    ["nicholas-chudotvorets-churovskaya", "nikolaya-chudotvortsa-churovskaya"]
  ];
  const findChurch = db.prepare("SELECT 1 FROM churches WHERE id = ?");
  const updateSources = db.prepare("UPDATE church_sources SET church_id = ? WHERE church_id = ?");
  const updateGeometries = db.prepare("UPDATE church_geometries SET church_id = ? WHERE church_id = ?");
  const updateChurch = db.prepare("UPDATE churches SET id = ? WHERE id = ?");

  for (const [oldId, newId] of renames) {
    if (!findChurch.get(oldId)) throw new Error(`Church ${oldId} was not found.`);
    if (findChurch.get(newId)) throw new Error(`Church ${newId} already exists.`);
    updateSources.run(newId, oldId);
    updateGeometries.run(newId, oldId);
    updateChurch.run(newId, oldId);
  }
};
