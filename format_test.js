const fs = require('fs');
const code = fs.readFileSync('sections/main-cart.liquid', 'utf8');
const regex = /<script[\s\S]*?>([\s\S]*?)<\/script>/gi;
let match;
let i = 0;
while ((match = regex.exec(code)) !== null) {
  if (i === 2) {
    let js = match[1];
    js = js.replace(/\{% if customer %\}true\{% else %\}false\{% endif %\}/g, 'true');
    js = js.replace(/\{%[\s\S]*?%\}/g, '/* liquid */');
    js = js.replace(/\{\{[\s\S]*?\}\}/g, 'null');
    fs.writeFileSync('script2.js', js);
  }
  i++;
}
