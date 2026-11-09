import { readFile } from "node:fs/promises";
import path from "node:path";

export const parseBookChangelog = (markdown, source) => {
  const entries = [];
  let current;
  for (const line of markdown.split(/\r?\n/u)) {
    const heading = /^## (\d{2})\.(\d{2})\.(\d{4})(?:\s+—\s+(.+))?\s*$/u.exec(line);
    if (heading) {
      const [, day, month, year, status] = heading;
      const date = `${year}-${month}-${day}`;
      const parsed = new Date(`${date}T00:00:00Z`);
      if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
        throw new Error(`Invalid date in ${source}: ${line}`);
      }
      current = { date, displayDate: `${day}.${month}.${year}`, status: status?.trim() ?? null, sections: [] };
      entries.push(current);
    } else if (current && line.trim().startsWith("|")) {
      const cells = line.trim().replace(/^\||\|$/gu, "").split("|").map((cell) => cell.trim());
      if (cells.every((cell) => /^:?-+:?$/u.test(cell)) || cells[1] === "Листы") continue;
      if (cells.length !== 2 || !cells.every(Boolean)) throw new Error(`Invalid section row in ${source}: ${line}`);
      current.sections.push({ title: cells[0], folios: cells[1] });
    }
  }
  if (!entries.length || entries.some((entry) => !entry.sections.length)) {
    throw new Error(`Missing dated sections in ${source}`);
  }
  return entries;
};

export const loadBookUpdates = async (root, books) => {
  const updates = await Promise.all(books.map(async (book) => {
    const source = path.join(root, "content", "books", book.slug, "CHANGELOG.md");
    const entries = parseBookChangelog(await readFile(source, "utf8"), source);
    return entries.map((entry) => ({ ...entry, book }));
  }));
  return updates.flat().sort((left, right) => right.date.localeCompare(left.date)
    || Number.parseInt(right.book.year, 10) - Number.parseInt(left.book.year, 10));
};
