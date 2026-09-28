import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const origin = "https://www.aquira.art";
const ignored = new Set([".git", "node_modules"]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
async function collectPages(directory = root) {
  const entries = await readdir(directory, { withFileTypes: true });
  const pages = [];
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const location = path.join(directory, entry.name);
    if (entry.isDirectory()) pages.push(...await collectPages(location));
    if (entry.isFile() && entry.name === "index.html") pages.push(location);
  }
  return pages.sort();
}
function outputFor(pathname) {
  if (pathname === "/") return path.join(root, "index.html");
  return pathname.endsWith("/") ? path.join(root, pathname.slice(1), "index.html") : path.join(root, pathname.slice(1));
}
function attribute(attributes, name) {
  return attributes.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"))?.[2] ?? null;
}

const pages = await collectPages();
let linksChecked = 0;
for (const pageFile of pages) {
  const relative = path.relative(root, pageFile);
  const html = await readFile(pageFile, "utf8");
  const canonical = html.match(/<link rel="canonical" href="([^"]+)" \/>/)?.[1];
  assert(canonical?.startsWith(origin), `${relative}: production canonical is missing or wrong`);
  for (const match of html.matchAll(/<a\b([^>]*)>/gi)) {
    linksChecked += 1;
    const href = attribute(match[1], "href");
    assert(href && href.trim() && href !== "#" && !/^javascript:/i.test(href), `${relative}: invalid anchor href`);
    if (href.startsWith("mailto:")) {
      assert(/^mailto:[^\s@]+@[^\s@]+$/i.test(href), `${relative}: invalid mailto link ${href}`);
      continue;
    }
    const target = new URL(href, canonical);
    if (target.origin === origin) {
      await access(outputFor(target.pathname));
    }
  }
  if (html.includes('<html lang="en">')) {
    assert(html.includes('class="language-link"'), `${relative}: English language switcher is missing`);
    assert(html.includes("href=\"/en/"), `${relative}: English internal navigation is missing`);
  }
}

const requiredEnglish = ["en/index.html", "en/about/index.html", "en/works/index.html", "en/practice/index.html", "en/ecosystem/index.html", "en/official-network/index.html", "en/policy/index.html", "en/accessibility/index.html", "en/licensing/index.html", "en/faq/index.html", "en/tokushoho/index.html", "en/shipping-insurance/index.html"];
for (const file of requiredEnglish) await access(path.join(root, file));
console.log(`Link validation passed: ${pages.length} pages, ${linksChecked} anchors, and all English route destinations resolve locally.`);
