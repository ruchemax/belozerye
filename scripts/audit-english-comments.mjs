import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const includedExtensions = new Set([".css", ".html", ".js", ".jsonc", ".mjs", ".ps1", ".py", ".sql"]);
const ignoredDirectories = new Set([".git", ".tmp", "backups", "node_modules"]);
const cyrillic = /[А-Яа-яЁё]/u;
const violations = [];

async function listCodeFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listCodeFiles(absolute));
    else if (includedExtensions.has(path.extname(entry.name).toLocaleLowerCase())) files.push(absolute);
  }
  return files;
}

function lineNumber(source, offset) {
  return source.slice(0, offset).split("\n").length;
}

function inspectMatches(file, source, pattern) {
  for (const match of source.matchAll(pattern)) {
    if (!cyrillic.test(match[0])) continue;
    violations.push(`${path.relative(root, file)}:${lineNumber(source, match.index)} ${match[0].trim().slice(0, 160)}`);
  }
}

for (const file of await listCodeFiles(root)) {
  const source = await readFile(file, "utf8");
  inspectMatches(file, source, /\/\*[\s\S]*?\*\/|<!--[\s\S]*?-->/gu);
  inspectMatches(file, source, /^\s*\/\/[^\r\n]*/gmu);
  const extension = path.extname(file).toLocaleLowerCase();
  if (extension === ".py" || extension === ".ps1") inspectMatches(file, source, /^\s*#(?![!])[^\r\n]*/gmu);
  if (extension === ".sql") inspectMatches(file, source, /^\s*--[^\r\n]*/gmu);
}

if (violations.length) {
  console.error(`Cyrillic comments found: ${violations.length}`);
  for (const violation of violations) console.error(`- ${violation}`);
  process.exitCode = 1;
} else {
  console.log("Code comments checked: all comments are in English.");
}
