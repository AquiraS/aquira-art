import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ignoredPrefixes = ["#", "mailto:", "tel:", "data:", "javascript:"];
const errors = [];

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory() && entry.name !== ".git" && entry.name !== "node_modules") return filesUnder(entryPath);
    return entry.isFile() ? [entryPath] : [];
  }));
  return nested.flat();
}

function isIgnored(value) {
  return !value || ignoredPrefixes.some((prefix) => value.toLowerCase().startsWith(prefix));
}

function isExternal(value) {
  return /^https?:\/\//i.test(value);
}

function localTarget(value) {
  const pathname = value.split("#")[0].split("?")[0];
  if (pathname === "/") return path.join(root, "index.html");
  if (pathname.endsWith("/")) return path.join(root, pathname, "index.html");
  return path.join(root, pathname.replace(/^\//, ""));
}

async function exists(target) {
  try {
    await access(target);
    return true;
  } catch {
    return false;
  }
}

const htmlFiles = (await filesUnder(root)).filter((file) => file.endsWith(".html"));
for (const file of htmlFiles) {
  const relativeFile = path.relative(root, file);
  const html = await readFile(file, "utf8");
  const references = [...html.matchAll(/\b(?:href|src)="([^"]+)"/g)].map((match) => match[1]);

  for (const reference of references) {
    if (isIgnored(reference) || isExternal(reference)) continue;
    const target = localTarget(reference);
    if (!(await exists(target))) errors.push(`${relativeFile}: リンク先がありません: ${reference}`);
  }

  const externalBlankLinks = [...html.matchAll(/<a\b[^>]*\bhref="(https?:[^\"]+)"[^>]*\btarget="_blank"[^>]*>/gi)];
  for (const match of externalBlankLinks) {
    const tag = match[0];
    const rel = tag.match(/\brel="([^"]*)"/i)?.[1] ?? "";
    if (!/\bnoopener\b/i.test(rel) || !/\bnoreferrer\b/i.test(rel)) {
      errors.push(`${relativeFile}: target="_blank" の外部リンクに rel="noopener noreferrer" がありません: ${match[1]}`);
    }
  }

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const anchors = [...html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]);
  for (const anchor of anchors) {
    if (!ids.has(anchor)) errors.push(`${relativeFile}: ページ内アンカー先がありません: #${anchor}`);
  }
}

if (errors.length > 0) {
  console.error("リンク検査に失敗しました。");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`リンク検査に合格しました: ${htmlFiles.length}ページの内部参照、アンカー、外部リンク保護を確認しました。`);
}
