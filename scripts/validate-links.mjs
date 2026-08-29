import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const canonicalOrigin = "https://www.aquira.art";
const officialHomepages = [
  { label: "作品・表現", href: "https://www.aquira.art/" },
  { label: "起点・記録", href: "https://www.aquira1978.com/" },
  { label: "公共的実践", href: "https://www.aquira.org/" },
];
const photographyGallery = "https://www.viewbug.com/member/Aquira#/";
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
  const footerLinks = [...footerMatch[0].matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g)]
    .map((match) => ({ href: match[1], label: match[2] }));
  for (const { label, href } of officialHomepages) {
    if (!footerLinks.some((link) => link.label === label && link.href === href)) {
      throw new Error(`${page}: official ecosystem footer must map ${label} to ${href}`);
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
  const cards = [...html.matchAll(/<a class="official-network-card__link" href="([^"]+)"[^>]*>[\s\S]*?<h3>([^<]+)<\/h3>[\s\S]*?<\/a>/g)]
    .map((match) => ({ href: match[1], label: match[2] }));
  if (cards.length !== officialHomepages.length) {
    throw new Error(`${file}: expected ${officialHomepages.length} official ecosystem cards, found ${cards.length}`);
  }
  for (const expected of officialHomepages) {
    if (!cards.some((card) => card.label === expected.label && card.href === expected.href)) {
      throw new Error(`${file}: full card must map ${expected.label} to ${expected.href}`);
    }
  }
}

for (const file of ["index.html", "works/index.html"]) {
  const html = await readFile(path.join(root, file), "utf8");
  const photographyCard = html.match(/<a class="work-card__link"([^>]*)>[\s\S]*?<h3>Photography<\/h3>[\s\S]*?<span>作品領域を見る →<\/span>[\s\S]*?<\/a>/);
  if (!photographyCard) throw new Error(`${file}: Photography work card is missing`);
  const attributes = photographyCard[1];
  if (extractAttribute(attributes, "href") !== photographyGallery) {
    throw new Error(`${file}: Photography card must link directly to ${photographyGallery}`);
  }
  if (extractAttribute(attributes, "target") !== "_blank" || extractAttribute(attributes, "rel") !== "external noopener noreferrer") {
    throw new Error(`${file}: Photography gallery must open in a safe new tab`);
  }
  if (extractAttribute(attributes, "aria-label") !== "Photographyの作品領域をViewBugギャラリーで新しいタブで見る") {
    throw new Error(`${file}: Photography gallery needs the exact accessible label`);
  }
}

console.log(`Link validation passed: ${pages.length} pages, ${anchorCount} anchors, all three official labels, and the Photography gallery mapped to their canonical destinations.`);
