export const up = (db) => {
  const columns = new Set(db.prepare("PRAGMA table_info(churches)").all().map((column) => column.name));
  if (!columns.has("location_place_id")) db.exec("ALTER TABLE churches ADD COLUMN location_place_id TEXT");
  const update = db.prepare("UPDATE churches SET location_place_id = ? WHERE id = ?");
  update.run("charoma", "ilya-prophet-charoma");
  update.run("pogost-rozhestva-bogoroditsy", "nativity-bogoroditsy-churovskaya");
  update.run("pishchalinskoe", "kirill-belozersky-pishchalinskoe");
};
