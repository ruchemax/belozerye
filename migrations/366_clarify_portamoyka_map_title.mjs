export const up = (db) => {
  const result = db.prepare("UPDATE place_geometries SET location_note = ? WHERE place_id = ?")
    .run(
      "Местоположение установлено предположительно по положению ручья Портамой Коргач на семитопографической карте Новгородской губернии Безкорниловича 1847 года.",
      "pustish-portamoyka-1626-73"
    );
  if (result.changes !== 1) throw new Error("Expected coordinates for Portamoyka.");
};
