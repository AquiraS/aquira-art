import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonicalOrigin = "https://www.aquira.art";
const officialHomepages = [
  "https://www.aquira.art/",
  "https://www.aquira1978.com/",
  "https://www.aquira.org/",
];
const officialDomains = new Set(["aquira.art", "aquira1978.com", "aquira.org"]);
const skippedDirectories = new Set([".git", "node_modules"]);

async function collectHtmlPages(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    if (skippedDirectories.has(entry.name)) continue;
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectHtmlPages(absolutePath));
    if (entry.isFile() && entry.name === "index.html") files.push(absolutePath);
  }

  return files.sort();
}

function extractAttribute(attributes, name) {
  const match = attributes.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2] ?? null;
}

function extractIds(html) {
  const ids = new Set();
  for (const match of html.matchAll(/\bid\s*=\s*(["'])(.*?)\1/gi)) ids.add(match[2]);
  return ids;
}

function outputPathFor(pathname) {
  const decodedPath = decodeURIComponent(pathname);
  if (decodedPath === "/") return path.join(root, "index.html");
  if (decodedPath.endsWith("/")) return path.join(root, decodedPath.slice(1), "index.html");
  return path.join(root, decodedPath.slice(1));
}

async function assertLocalDestination(href, pageUrl, page, localPages) {
  const destination = new URL(href, pageUrl);
  const destinationFile = outputPathFor(destination.pathname);

  try {
    await access(destinationFile);
  } catch {
    throw new Error(`${page}: local link does not resolve to a published file: ${href}`);
  }

  if (!destination.hash) return;
  const targetHtml = await readFile(destinationFile, "utf8");
  const targetIds = localPages.get(destinationFile) ?? extractIds(targetHtml);
  localPages.set(destinationFile, targetIds);
  const fragment = decodeURIComponent(destination.hash.slice(1));
  if (!targetIds.has(fragment)) {
    throw new Error(`${page}: fragment target does not exist: ${href}`);
  }
}

const pages = await collectHtmlPages();
const localPages = new Map();
let anchorCount = 0;

for (const absolutePage of pages) {
  const page = path.relative(root, absolutePage) || "index.html";
  const html = await readFile(absolutePage, "utf8");
  localPages.set(absolutePage, extractIds(html));

  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]+)" \/>/);
  if (!canonicalMatch) throw new Error(`${page}: canonical URL is required for link resolution`);
  const pageUrl = canonicalMatch[1];

  const footerMatch = html.match(/<nav class="site-footer__network"[\s\S]*?<\/nav>/);
  if (!footerMatch) throw new Error(`${page}: official ecosystem footer is missing`);
  for (const homepage of officialHomepages) {
    if (!footerMatch[0].includes(`href="${homepage}"`)) {
      throw new Error(`${page}: official ecosystem footer must link to ${homepage}`);
    }
  }

  const anchors = [...html.matchAll(/<a\b([^>]*)>/gi)];
  for (const anchor of anchors) {
    anchorCount += 1;
    const href = extractAttribute(anchor[1], "href");
    if (href === null) throw new Error(`${page}: anchor is missing href`);
    if (!href.trim() || href === "#" || /^javascript:/i.test(href)) {
      throw new Error(`${page}: invalid or non-navigable href: ${href}`);
    }

    if (href.startsWith("mailto:")) {
      if (!/^mailto:[^\s@]+@[^\s@]+$/i.test(href)) throw new Error(`${page}: invalid email link: ${href}`);
      continue;
    }

    const destination = new URL(href, pageUrl);
    const baseDomain = destination.hostname.replace(/^www\./, "");
    if (officialDomains.has(baseDomain)) {
      const expectedHost = `www.${baseDomain}`;
      if (destination.protocol !== "https:" || destination.hostname !== expectedHost || destination.port) {
        throw new Error(`${page}: official domain must use its canonical HTTPS host: ${href}`);
      }
    }

    if (destination.origin === canonicalOrigin) {
      await assertLocalDestination(href, pageUrl, page, localPages);
    }
  }
}

for (const file of ["index.html", "official-network/index.html"]) {
  const html = await readFile(path.join(root, file), "utf8");
  for (const homepage of officialHomepages) {
    if (!html.includes(`<a class="official-network-card__link" href="${homepage}"`)) {
      throw new Error(`${file}: full official-network card must link to ${homepage}`);
    }
  }
}

console.log(`Link validation passed: ${pages.length} pages, ${anchorCount} anchors, and all three official homepages verified.`);
