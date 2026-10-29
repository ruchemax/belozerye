export const up = (db) => {
  const ownerId = "tserkov-bogoyavleniya-popovskaya";
  db.prepare("DELETE FROM mention_land_category_owners WHERE land_owner_id = ?").run(ownerId);
  db.prepare("DELETE FROM land_owner_places WHERE land_owner_id = ?").run(ownerId);
  db.prepare("DELETE FROM land_owners WHERE id = ?").run(ownerId);
};
