const fs = require('fs');
const acorn = require('acorn');
try {
  const code = fs.readFileSync('sections/main-cart.liquid', 'utf8');
  // Just strip liquid tags naively to see if Acorn can parse the script tag contents
  let scripts = [];
  const regex = /<script[\s\S]*?>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(code)) !== null) {
    scripts.push(match[1]);
  }
  
  scripts.forEach((script, idx) => {
    let js = script.replace(/\{%[\s\S]*?%\}/g, '/* liquid */');
    js = js.replace(/\{\{[\s\S]*?\}\}/g, 'null');
    try {
      acorn.parse(js, { ecmaVersion: 2020 });
      console.log(`Script ${idx} parsed successfully.`);
    } catch(e) {
      console.log(`Script ${idx} SYNTAX ERROR at line ${e.loc.line} col ${e.loc.column}: ${e.message}`);
      const lines = js.split('\n');
      console.log('Error line:', lines[e.loc.line - 1]);
    }
  });
} catch(err) { console.error(err); }
