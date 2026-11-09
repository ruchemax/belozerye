export const up = (db) => {
  const nameId = "normalized:observed:mention-belozersky-1544-place-4-2:alternative";
  const row = db.prepare("SELECT place_id, name FROM place_names WHERE id = ?").get(nameId);
  if (row?.place_id !== "savinskoe" || row.name !== "Великим Двором") {
    throw new Error("The Savinskoe Great Dvor name variant was not found in its expected form.");
  }
  db.prepare("UPDATE place_names SET name = 'Великий Двор' WHERE id = ?").run(nameId);
};
