import assert from 'node:assert/strict';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve('dist');
const pages = readdirSync(root).filter(name => name.endsWith('.html'));
assert.equal(pages.length, 8);
for (const page of pages) {
  const html = readFileSync(resolve(root, page), 'utf8');
  const data = JSON.parse(html.match(/<script type="application\/json" id="data">(.*?)<\/script>/s)[1]);
  for (const [, path] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (!path.startsWith('https:')) assert.ok(existsSync(resolve(root, path)), page + ' → ' + path);
  }
  const menu = html.match(/id="startmenu".*?<hr>/s)[0];
  for (const target of pages) assert.ok(menu.includes('href="' + target + '"'), page + ' → ' + target);
  assert.equal(data.works.length, 3);
  for (const work of data.works) {
    assert.ok(existsSync(resolve(root, 'assets', work[2])));
    if (data.modes) assert.ok(existsSync(resolve(root, 'assets', work[2].replace('.webp','-alt.webp'))));
  }
}
console.log('Verified all eight pages, navigation, media and alternate views.');
