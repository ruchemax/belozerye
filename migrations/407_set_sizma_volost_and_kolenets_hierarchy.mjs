export const up = (db) => {
  const oldId = "subdivision:sizma-1559";
  const volostId = "volost:Сизма";
  if (!db.prepare("SELECT 1 FROM administrative_units WHERE id=? AND name='Сизма'").get(oldId)) {
    throw new Error("The Sizma administrative unit was not found.");
  }
  db.prepare("INSERT INTO administrative_units (id,kind,name) VALUES (?,'volost','Сизма')").run(volostId);
  const links = db.prepare("SELECT mention_id FROM mention_administrative_units WHERE administrative_unit_id=?").all(oldId);
  for (const { mention_id: mentionId } of links) {
    if (db.prepare("SELECT 1 FROM mention_administrative_units WHERE mention_id=? AND context_key='volost'").get(mentionId)) {
      throw new Error(`A volost is already assigned to ${mentionId}.`);
    }
    db.prepare("UPDATE mention_administrative_units SET administrative_unit_id=?,context_key='volost' WHERE mention_id=? AND administrative_unit_id=?")
      .run(volostId,mentionId,oldId);
  }
  db.prepare("UPDATE administrative_units SET parent_id=? WHERE parent_id=?").run(volostId,oldId);
  db.prepare("UPDATE administrative_units SET parent_id=? WHERE id='subdivision:Коленца'").run(volostId);
  db.prepare("DELETE FROM administrative_units WHERE id=?").run(oldId);
  if (db.prepare("PRAGMA foreign_key_check").all().length) throw new Error("Invalid references after updating the Sizma volost.");
};
