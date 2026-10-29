import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { places } from "./load-database.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const text = (html) => html.replace(/<[^>]+>/gu, "").replace(/\s+/gu, " ").trim();
const year = (period) => Number(String(period).match(/\d{4}/u)?.[0] ?? Infinity);
const renderedNames = (place) => {
  const groups = new Map();
  for (const state of place.name_states ?? []) {
    const period = state.display_period ?? state.observed_year;
    if (!period || state.assertion_kind === "editorial") continue;
    const label = `${state.type_label ? `${state.type_label.toLocaleLowerCase("ru-RU")} ` : ""}${state.name}`;
    const group = groups.get(label) ?? { label, periods: [], position: state.position, year: Infinity };
    if (!group.periods.includes(period)) group.periods.push(period);
    group.position = Math.min(group.position, state.position);
    group.year = Math.min(group.year, state.assertion_kind === "inferred" ? -Infinity : year(period));
    groups.set(label, group);
  }
  return [...groups.values()]
    .sort((left, right) => left.year - right.year || left.position - right.position)
    .map(({ label, periods }) => `${label} (${periods.sort((left, right) => year(left) - year(right)).join(", ")})`)
    .join(" ");
};

const failures = [];
for (const place of places) {
  const page = await readFile(path.join(root, "dist", "places", place.slug, "index.html"), "utf8");
  const heading = text(/<div class="place-info">[\s\S]*?<h1>([\s\S]*?)<\/h1>/u.exec(page)?.[1] ?? "");
  if (heading !== place.name) failures.push(`${place.slug}: главное имя карточки «${heading}» != базе «${place.name}».`);
  const expected = renderedNames(place);
  if (!expected) continue;
  const names = text(/<summary><span class="overview-label">\s*Названия\s*<\/span><\/summary>\s*<ul class="overview-value">([\s\S]*?)<\/ul>/u.exec(page)?.[1] ?? "");
  if (names !== expected) failures.push(`${place.slug}: названия карточки «${names}» != базе «${expected}».`);
}

if (failures.length) throw new Error(`Названия карточек не соответствуют базе (${failures.length}):\n${failures.join("\n")}`);
console.log(`Названия карточек сверены с базой: ${places.length}.`);
