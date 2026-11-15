export const up = (db) => {
  const result = db.prepare("UPDATE place_geometries SET location_note = ? WHERE place_id = ?")
    .run(
      "Местоположение определено приблизительно внутри дачи генерального межевания №673 на плане генерального межевания Череповского уезда 1788 года.",
      "putilovo-1559"
    );
  if (result.changes !== 1) throw new Error("Expected coordinates for Putilovo.");
};
