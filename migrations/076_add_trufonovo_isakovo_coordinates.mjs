export const up = (db) => {
  const insert = db.prepare(`
    INSERT INTO place_geometries (place_id, longitude, latitude)
    VALUES (?, ?, ?)
  `);

  insert.run("trufonovo", 38.646785555556, 59.240304444444);
  insert.run("isakovo", 38.634864444444, 59.22924);
};
