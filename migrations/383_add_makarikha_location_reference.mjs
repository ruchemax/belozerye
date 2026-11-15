export const up = (db) => {
  const result = db.prepare("UPDATE place_geometries SET location_note = ? WHERE place_id = ?")
    .run(
      "Местоположение определено приблизительно внутри дачи генерального межевания №751 «Лукьяново и Макаришка» на плане генерального межевания Череповского уезда 1788 года. Дополнительный ориентир — урочище Макариха на карте ГосГИСцентра.",
      "pustosh-makarovo-1626-77"
    );
  if (result.changes !== 1) throw new Error("Expected coordinates for Makarovo.");
};
