import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("dist");
const pages = readdirSync(root)
  .filter((name) => name.endsWith(".html"))
  .sort();
const studies = {
  orbit: 'class="poster-print"',
  field: 'class="essay"',
  frame: 'class="wall"',
  press: 'class="spread"',
  post: 'class="stamp-grid"',
  plan: 'class="diptych"',
  kiln: 'class="table-scroll"',
  signal: 'class="library"',
  log: 'class="timeline"',
  night: 'class="chart"',
};
assert.deepEqual(pages, ["index", ...Object.keys(studies)].map((key) => key + ".html").sort());
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
for (const page of pages) {
  const html = readFileSync(resolve(root, page), "utf8");
  const key = page.replace(".html", "");
  assert.ok(html.includes("v" + packageJson.version), page + ": visible version");
  const menu = html.match(/<nav id="switcher".*?<\/nav>/s)?.[0];
  assert.ok(menu, page + ": navigation");
  for (const target of pages) assert.ok(menu.includes('href="' + target + '"'), page + " → " + target);
  for (const [, ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    if (ref.startsWith("https:")) continue;
    if (ref.startsWith("#")) assert.ok(html.includes('id="' + ref.slice(1) + '"'), page + " → " + ref);
    else assert.ok(existsSync(resolve(root, ref)), page + " → " + ref);
  }
  if (key === "index") {
    for (const id of Object.keys(studies)) {
      assert.ok(html.includes("assets/previews/" + id + ".webp"));
      assert.ok(html.includes('<th scope="row"><a href="' + id + '.html">'));
    }
  } else {
    assert.ok(html.includes(studies[key]), page + ": example composition");
    for (const label of ["阅读顺序", "适用内容", "使用边界"])
      assert.ok(html.includes("<dt>" + label + "</dt>"));
  }
}
console.log("Verified ten example compositions, guide entries, anchors, shared navigation and local assets.");
