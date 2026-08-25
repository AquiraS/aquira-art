import assert from "node:assert/strict";
import content from "../content/site-content.js";

const errors = [];

function check(condition, message) {
  if (!condition) errors.push(message);
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isAbsoluteHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function isInternalPath(value) {
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//");
}

function checkUnique(values, label) {
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index);
  check(duplicates.length === 0, `${label} に重複があります: ${[...new Set(duplicates)].join(", ")}`);
}

check(isAbsoluteHttpUrl(content.site?.origin), "site.origin は http(s) の絶対URLにしてください。");
check(nonEmptyString(content.site?.name), "site.name を入力してください。");
check(nonEmptyString(content.site?.shortName), "site.shortName を入力してください。");
check(nonEmptyString(content.site?.description), "site.description を入力してください。");

for (const field of ["name", "jobTitle", "jobTitleEnglish", "location", "locationEnglish", "description", "descriptionEnglish"]) {
  check(nonEmptyString(content.entity?.[field]), `entity.${field} を入力してください。`);
}
check(Array.isArray(content.entity?.sameAs) && content.entity.sameAs.length > 0, "entity.sameAs を1件以上入力してください。");
for (const url of content.entity?.sameAs ?? []) {
  check(isAbsoluteHttpUrl(url), `entity.sameAs に有効なURLではない値があります: ${url}`);
}
checkUnique(content.entity?.sameAs ?? [], "entity.sameAs");

for (const field of ["eyebrow", "title", "description"]) {
  check(nonEmptyString(content.hero?.[field]), `hero.${field} を入力してください。`);
}
check(isInternalPath(content.hero?.button?.href), "hero.button.href は / から始まる内部パスにしてください。");
check(nonEmptyString(content.hero?.button?.label), "hero.button.label を入力してください。");

for (const field of ["label", "href", "eyebrow", "title", "description", "buttonLabel"]) {
  check(nonEmptyString(content.contact?.[field]), `contact.${field} を入力してください。`);
}
check(/^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(content.contact?.href ?? ""), "contact.href は有効な mailto: リンクにしてください。");

check(Array.isArray(content.navigation) && content.navigation.length >= 2, "navigation は2件以上設定してください。");
for (const item of content.navigation ?? []) {
  check(nonEmptyString(item.label), "navigation の label を入力してください。");
  check(isInternalPath(item.href), `navigation の内部リンクが不正です: ${item.href}`);
}
checkUnique((content.navigation ?? []).map((item) => item.href), "navigation.href");

check(Array.isArray(content.works?.items) && content.works.items.length > 0, "works.items を1件以上設定してください。");
for (const item of content.works?.items ?? []) {
  for (const field of ["number", "title", "description"]) {
    check(nonEmptyString(item[field]), `works.items の ${field} を入力してください。`);
  }
}
checkUnique((content.works?.items ?? []).map((item) => item.number), "works.items.number");
checkUnique((content.works?.items ?? []).map((item) => item.title), "works.items.title");

check(Array.isArray(content.officialNetwork?.links) && content.officialNetwork.links.length >= 3, "officialNetwork.links を3件以上設定してください。");
for (const item of content.officialNetwork?.links ?? []) {
  for (const field of ["label", "description", "href"]) {
    check(nonEmptyString(item[field]), `officialNetwork.links の ${field} を入力してください。`);
  }
  check(isAbsoluteHttpUrl(item.href), `officialNetwork.links のURLが不正です: ${item.href}`);
}
checkUnique((content.officialNetwork?.links ?? []).map((item) => item.href), "officialNetwork.links.href");

check(Array.isArray(content.faq) && content.faq.length > 0, "faq を1件以上設定してください。");
for (const item of content.faq ?? []) {
  check(nonEmptyString(item.question), "faq の question を入力してください。");
  check(nonEmptyString(item.answer), "faq の answer を入力してください。");
}
checkUnique((content.faq ?? []).map((item) => item.question), "faq.question");

check(nonEmptyString(content.footer?.title), "footer.title を入力してください。");
check(isInternalPath(content.footer?.legalNotice?.href), "footer.legalNotice.href は / から始まる内部パスにしてください。");

if (errors.length > 0) {
  console.error("コンテンツ検査に失敗しました。");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("コンテンツ検査に合格しました: 必須項目、URL、重複、主要な導線を確認しました。");
}
