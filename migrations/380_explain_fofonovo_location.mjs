export const up = (db) => {
  const result = db.prepare("UPDATE place_geometries SET location_note = ? WHERE place_id = ?")
    .run(
      "Местоположение определено приблизительно внутри дачи генерального межевания №642 «Фофаново» на плане генерального межевания Череповского уезда 1788 года.",
      "fofonovo"
    );
  if (result.changes !== 1) throw new Error("Expected coordinates for Fofonovo.");
};
