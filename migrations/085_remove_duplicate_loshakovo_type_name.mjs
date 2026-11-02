export const up = (db) => {
  db.prepare("UPDATE places SET name = ? WHERE id = ?")
    .run("Лошаково", "loshakovo-monastery");
  db.prepare("UPDATE place_names SET name = ? WHERE id = ?")
    .run("Лошаково", "attested:loshakovo-monastery:1544");
};
