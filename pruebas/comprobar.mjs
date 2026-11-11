import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source=fs.readFileSync(path.join(root,'script.js'),'utf8');
const window={};
const context=vm.createContext({window});
vm.runInContext(source.slice(0,source.indexOf('\n\n\n(() => {')),context);
const cat=source.slice(source.indexOf('  const CATEGORIES = ['),source.indexOf('  const TOTAL_VARIANTS'));
const pages=source.slice(source.indexOf('  const PAGES = ['),source.indexOf('  const CATEGORIES'));
vm.runInContext(`${pages}\n${cat}\nthis.categories=CATEGORIES;this.pages=PAGES;`,context);
assert.equal(context.pages.length,35);
assert.equal(context.categories.length,20);
let total=0;
for(const family of context.categories){
  for(let v=0;v<family.variants.length;v++){
    const html=window.BroteSite.sample(family.id,v,{settings:{},components:{}},context.pages);
    assert.ok(html.length>200,`${family.id}/${v}: missing markup`);
    assert.ok(!html.includes('[object Object]'),`${family.id}/${v}: invalid markup`);
    total++;
  }
}
assert.equal(total,73);
for(const page of context.pages){
  const html=window.BroteSite.render({activePage:page.id,pages:context.pages.map(p=>p.id)},context.pages);
  assert.ok(html.includes('site-main'),page.id);
}
const editor=window.BroteSite.render({activePage:'inicio'},context.pages);
assert.ok(editor.includes('Editar portada'));
assert.ok(editor.includes('data-insert-after='));
const clean=window.BroteSite.render({activePage:'inicio'},context.pages,{clean:true});
assert.ok(!clean.includes('data-edit-section='));
assert.ok(!clean.includes('data-insert-after='));
new vm.Script(window.BroteSite.runtime);
for(const file of ['script.js','guide.js','setup.js'])new vm.Script(fs.readFileSync(path.join(root,file),'utf8'));
const all=[...fs.readdirSync(path.join(root,'assets'))];
assert.equal(all.filter(f=>f.endsWith('.jpg')).length,6);
assert.equal(all.filter(f=>f.endsWith('.woff2')).length,3);
assert.ok(fs.readFileSync(path.join(root,'index.html'),'utf8').includes('guide.js'));
console.log(JSON.stringify({pass:true,pages:35,families:20,renderedVariants:total,photos:6,fonts:3},null,2));
