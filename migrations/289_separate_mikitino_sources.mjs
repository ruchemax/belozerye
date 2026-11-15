export const up = (db) => {
  for (const [id, label] of [
    ["kirillov-1559-fragment-040", "Семянник"],
    ["kirillov-1559-fragment-076", "Оброчник"]
  ]) {
    const fragment = db.prepare("SELECT raw_json FROM fragments WHERE id = ?").get(id);
    if (!fragment) throw new Error(`Missing source fragment ${id}.`);
    db.prepare("UPDATE fragments SET raw_json = ? WHERE id = ?")
      .run(JSON.stringify({ ...JSON.parse(fragment.raw_json), source_group_label: label }), id);
  }
};
