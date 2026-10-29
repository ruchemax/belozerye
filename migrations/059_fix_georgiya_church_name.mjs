export const up = (db) => {
  db.prepare("UPDATE churches SET name = ? WHERE id = ?")
    .run("Церковь страстотерпца Георгия", "georgiya-pobedonostsa-ugol");
};
