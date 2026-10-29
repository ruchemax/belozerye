import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const databasePath = path.join(root, "data", "belozerye.sqlite");

const db = new DatabaseSync(databasePath, { readOnly: true });
const parseRaw = (value) => JSON.parse(value);
const byParent = (sql, parentField, valueField) => {
  const result = new Map();
  for (const row of db.prepare(sql).all()) {
    const values = result.get(row[parentField]) ?? [];
    values.push(row[valueField]);
    result.set(row[parentField], values);
  }
  return result;
};
const placeNames = byParent(
  "SELECT place_id, name FROM place_names WHERE id LIKE 'legacy:%' ORDER BY place_id, id",
  "place_id", "name"
);
const placeTypePattern = "(?:деревня|деревни|полдеревни|полдеревня|пустошь|пустоши|пустош|селище|селища|починок|новцо|займище)";
const typeCodesByLabel = new Map(db.prepare("SELECT code, label FROM place_types").all()
  .map(({ code, label }) => [label.toLocaleLowerCase("ru-RU"), code]));
const typeLabelsByCode = new Map(db.prepare("SELECT code, label FROM place_types").all()
  .map(({ code, label }) => [code, label]));
const normalizePrimaryName = (name) => String(name ?? "")
  .replace(new RegExp(`^что\\s+(?:было|была|был|были)\\s+${placeTypePattern}\\s+`, "iu"), "")
  .trim();
const normalizeNameState = (state) => {
  const formerMatch = new RegExp(
    `^что\\s+(?:было|была|был|были)\\s+(${placeTypePattern})\\s+(.+)$`,
    "iu"
  ).exec(state.name);
  if (formerMatch) {
    const formerType = formerMatch[1].toLocaleLowerCase("ru-RU");
    const name = formerMatch[2].trim();
    const period = state.display_period ?? state.observed_year;
    return [
      {
        ...state,
        id: `${state.id}:former`, name, type_code: typeCodesByLabel.get(formerType) ?? state.type_code,
        type_label: typeLabelsByCode.get(typeCodesByLabel.get(formerType)) ?? formerMatch[1],
        observed_year: null, display_period: period ? `до ${period}` : null, assertion_kind: "inferred"
      },
      { ...state, name }
    ];
  }
  const alternativeMatch = /^(.*?),\s*(?:а\s+)?(?:зовут|называют)\s+(.+)$/iu.exec(state.name);
  if (!alternativeMatch) return [state];
  return [
    { ...state, name: alternativeMatch[1].trim() },
    { ...state, id: `${state.id}:alternative`, name: alternativeMatch[2].trim() }
  ];
};
const nameStatesByPlace = new Map();
for (const row of db.prepare(`
  SELECT states.*, names.name, types.label AS type_label
  FROM place_name_states AS states
  JOIN place_names AS names ON names.id = states.place_name_id
  LEFT JOIN place_types AS types ON types.code = states.type_code
  ORDER BY states.place_id, states.position
`).all()) {
  const states = nameStatesByPlace.get(row.place_id) ?? [];
  const state = {
    id: row.id, name: row.name, type_label: row.type_label, observed_year: row.observed_year,
    display_period: row.display_period, assertion_kind: row.assertion_kind,
    source_mention_id: row.source_mention_id, position: row.position, type_code: row.type_code
  };
  states.push(state);
  nameStatesByPlace.set(row.place_id, states);
}
const administrativeContextByMention = new Map();
for (const row of db.prepare(`
  SELECT links.mention_id, links.context_key, units.name, units.label
  FROM mention_administrative_units AS links
  JOIN administrative_units AS units ON units.id = links.administrative_unit_id
`).all()) {
  const context = administrativeContextByMention.get(row.mention_id) ?? {};
  context[row.context_key] = row.name;
  if (row.label) context[`${row.context_key}_label`] = row.label;
  administrativeContextByMention.set(row.mention_id, context);
}
const landCategoriesByMention = new Map();
for (const row of db.prepare(`
  SELECT category.mention_id, category.position, category.code, category.label, category.display_period,
    owner.name AS owner_name
  FROM mention_land_categories AS category
  LEFT JOIN mention_land_category_owners AS category_owner
    ON category_owner.mention_id = category.mention_id
    AND category_owner.land_category_position = category.position
  LEFT JOIN land_owners AS owner ON owner.id = category_owner.land_owner_id
  ORDER BY category.mention_id, category.position, category_owner.position
`).all()) {
  const categories = landCategoriesByMention.get(row.mention_id) ?? [];
  let category = categories.find((item) => item.position === row.position);
  if (!category) {
    category = {
      position: row.position, code: row.code, label: row.label,
      display_period: row.display_period, owners: []
    };
    categories.push(category);
  }
  if (row.owner_name) category.owners.push(row.owner_name);
  landCategoriesByMention.set(row.mention_id, categories);
}

export const books = db.prepare("SELECT * FROM books ORDER BY rowid").all().map((row) => {
  const { title: _legacyTitle, card_title: _legacyCardTitle, ...rawBook } = parseRaw(row.raw_json);
  return {
  ...rawBook,
  id: row.id, slug: row.slug, full_title: row.full_title,
  short_title: row.short_title,
  year: row.year, archive_reference: row.archive_reference,
  publication_reference: row.publication_reference
  };
});
export const fragments = db.prepare("SELECT * FROM fragments ORDER BY book_id, position").all().map((row) => ({
  ...parseRaw(row.raw_json),
  id: row.id, book_id: row.book_id, source_heading_id: row.source_heading_id, folio: row.folio,
  order: row.position, link_target_id: row.link_target_id
}));
export const places = db.prepare(`
  SELECT places.*, place_types.label AS type_label, place_statuses.label AS status_label
  FROM places
  JOIN place_types ON place_types.code = places.type_code
  JOIN place_statuses ON place_statuses.code = places.status_code
  ORDER BY places.rowid
`).all().map((row) => ({
  id: row.id, slug: row.slug, name: row.name, name_origin: row.name_origin,
  type: { code: row.type_code, label: row.type_label },
  status: { code: row.status_code, label: row.status_label },
  name_variants: placeNames.get(row.id) ?? [],
  name_states: nameStatesByPlace.get(row.id) ?? []
}));
export const mentions = db.prepare("SELECT * FROM mentions ORDER BY rowid").all().map((row) => ({
  id: row.id, place_id: row.place_id, fragment_id: row.fragment_id,
  source_name: row.source_name,
  historical_name_override: row.historical_name_override,
  source_context: {
    ...(administrativeContextByMention.get(row.id) ?? {}),
    land_categories: landCategoriesByMention.get(row.id) ?? []
  }
}));
export const locations = {
  type: "FeatureCollection",
  features: db.prepare(`
    SELECT place_id, longitude, latitude
    FROM place_geometries
    ORDER BY place_id
  `).all().map((row) => ({
    type: "Feature",
    geometry: { type: "Point", coordinates: [row.longitude, row.latitude] },
    properties: { place_id: row.place_id }
  }))
};
export const churches = db.prepare(`
  SELECT churches.*, geometries.longitude, geometries.latitude
  FROM churches
  LEFT JOIN church_geometries AS geometries ON geometries.church_id = churches.id
  ORDER BY churches.rowid
`).all();
export const churchSources = db.prepare(`
  SELECT
    church_sources.church_id,
    fragments.id AS fragment_id,
    books.slug AS book_slug,
    books.short_title AS source_title,
    books.year AS source_year,
    fragments.source_heading_id AS source_anchor
  FROM church_sources
  JOIN fragments ON fragments.id = church_sources.fragment_id
  JOIN books ON books.id = fragments.book_id
  ORDER BY church_sources.church_id, CAST(books.year AS INTEGER), fragments.position, church_sources.rowid
`).all();
export const bookDocuments = new Map(db.prepare(`
  SELECT book_id, html FROM book_documents
`).all().map((row) => [row.book_id, row.html]));

db.close();
