/**
 * AQUIRA SEO/AEO output validation.
 * Verifies generated pages, canonical URLs, language metadata, JSON-LD, sitemap, and crawler rules.
 */
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const checks = [
  { file: "index.html", canonical: "https://www.aquira.art/", type: "WebPage", language: "ja" },
  { file: "accessibility/index.html", canonical: "https://www.aquira.art/accessibility/", type: "WebPage", language: "ja" },
  { file: "tokushoho/index.html", canonical: "https://www.aquira.art/tokushoho/", type: "WebPage", language: "ja" },
  { file: "about/index.html", canonical: "https://www.aquira.art/about/", type: "ProfilePage", language: "ja" },
  { file: "policy/index.html", canonical: "https://www.aquira.art/policy/", type: "WebPage", language: "ja" },
  { file: "ecosystem/index.html", canonical: "https://www.aquira.art/ecosystem/", type: "WebPage", language: "ja" },
  { file: "works/index.html", canonical: "https://www.aquira.art/works/", type: "CollectionPage", language: "ja" },
  { file: "practice/index.html", canonical: "https://www.aquira.art/practice/", type: "CollectionPage", language: "ja" },
  { file: "official-network/index.html", canonical: "https://www.aquira.art/official-network/", type: "CollectionPage", language: "ja" },
  { file: "licensing/index.html", canonical: "https://www.aquira.art/licensing/", type: "WebPage", language: "ja" },
  { file: "faq/index.html", canonical: "https://www.aquira.art/faq/", type: "FAQPage", language: "ja" },
  { file: "en/index.html", canonical: "https://www.aquira.art/en/", type: "WebPage", language: "en" },
];

for (const { file, canonical, type, language } of checks) {
  const html = await readFile(path.join(root, file), "utf8");
  if (!html.includes(`<html lang="${language}">`)) {
    throw new Error(`${file}: HTML language is missing or incorrect`);
  }
  if (!html.includes(`<link rel="canonical" href="${canonical}" />`)) {
    throw new Error(`${file}: canonical URL is missing or incorrect`);
  }
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) throw new Error(`${file}: JSON-LD script is missing`);
  const schema = JSON.parse(match[1]);
  const graph = schema["@graph"] ?? [];
  if (!graph.some((item) => item["@type"] === type)) {
    throw new Error(`${file}: required ${type} schema is missing`);
  }
  if (!graph.some((item) => item["@type"] === "Person" && item.name === "Aquira")) {
    throw new Error(`${file}: Aquira Person entity is missing`);
  }
  if (!graph.some((item) => item["@type"] === "WebSite")) {
    throw new Error(`${file}: WebSite entity is missing`);
  }
}

const home = await readFile(path.join(root, "index.html"), "utf8");
const englishHomeVisual = await readFile(path.join(root, "en/index.html"), "utf8");
for (const [file, html] of [["index.html", home], ["en/index.html", englishHomeVisual]]) {
  if (!html.includes('class="hero hero--visual"') || !html.includes('src="/media/aquira-archive-interior.webp"') || !html.includes('srcset="/media/aquira-archive-interior-mobile.webp"') || !html.includes('alt="梁のある室内、カウンター、花、吊り下げ照明、右側に立つ人物を写したモノクロ写真"')) {
    throw new Error(`${file}: main visual picture, responsive source, or accessible alternative text is missing`);
  }
  if (!html.includes('<link rel="preload" as="image"') || !html.includes('fetchpriority="high"')) {
    throw new Error(`${file}: main visual preload is missing`);
  }
}
await access(path.join(root, "media/aquira-archive-interior.webp"));
await access(path.join(root, "media/aquira-archive-interior-mobile.webp"));

const japaneseHome = await readFile(path.join(root, "index.html"), "utf8");
const englishHome = await readFile(path.join(root, "en/index.html"), "utf8");
for (const html of [japaneseHome, englishHome]) {
  if (!html.includes('hreflang="ja" href="https://www.aquira.art/"') && !html.includes('href="https://www.aquira.art/" hreflang="ja"')) {
    throw new Error("localized home page: Japanese hreflang reference is missing");
  }
  if (!html.includes('hreflang="en" href="https://www.aquira.art/en/"') && !html.includes('href="https://www.aquira.art/en/" hreflang="en"')) {
    throw new Error("localized home page: English hreflang reference is missing");
  }
}

const robots = await readFile(path.join(root, "robots.txt"), "utf8");
for (const bot of ["GPTBot", "Google-Extended", "OAI-SearchBot", "ClaudeBot", "PerplexityBot"]) {
  if (!robots.includes(`User-agent: ${bot}\nAllow: /`)) throw new Error(`robots.txt: ${bot} allowance is missing`);
}
if (!robots.includes("User-agent: PetalBot\nDisallow: /")) {
  throw new Error("robots.txt: PetalBot block is missing");
}

const sitemap = await readFile(path.join(root, "sitemap.xml"), "utf8");
for (const { canonical } of checks) {
  if (!sitemap.includes(`<loc>${canonical}</loc>`)) throw new Error(`sitemap.xml: ${canonical} is missing`);
}

const officialNetwork = await readFile(path.join(root, "official-network/index.html"), "utf8");
for (const url of ["https://www.aquira.art/", "https://www.aquira1978.com/", "https://www.aquira.org/"]) {
  if (!officialNetwork.includes(url)) throw new Error(`official-network/index.html: missing official-domain link ${url}`);
}

for (const file of ["official-network/index.html"]) {
  const html = await readFile(path.join(root, file), "utf8");
  for (const url of ["https://www.aquira.art/", "https://www.aquira1978.com/", "https://www.aquira.org/"]) {
    if (!html.includes(`<a class="official-network-card__link" href="${url}"`)) {
      throw new Error(`${file}: ${url} must be a full-card official-network link`);
    }
  }
}

const production = JSON.parse(await readFile(path.join(root, "ops/production.json"), "utf8"));
if (production.production_origin !== "https://www.aquira.art/") throw new Error("production.json: production origin is incorrect");
if (production.canonical_host !== "www.aquira.art") throw new Error("production.json: canonical host is incorrect");
if (production.deployment_mode !== "manual workflow dispatch") throw new Error("production.json: unexpected deployment mode");

console.log(`SEO validation passed: ${checks.length} canonical pages, bilingual metadata, JSON-LD, robots, and sitemap verified.`);
