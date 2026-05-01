const fs = require('fs');

let missoes = fs.readFileSync('src/components/MissoesTab.tsx', 'utf8');

// There are orphaned `*/` floating around.
// Let's replace any `*/ \n */ \n const` with `const`
missoes = missoes.split('*/ \n */ \n const').join('const');
missoes = missoes.split('*/ \n */ \n*/ \n const').join('const');
missoes = missoes.split('*/ \n */ \n \n const').join('const');
missoes = missoes.split('*/ \n const').join('const');
missoes = missoes.split('*/ \n */ \n').join('\n');

// specifically for line 50
missoes = missoes.split('/*  Delete mission  */ \n \n */ \n */ \n const').join('/* Delete mission */ \n const');
missoes = missoes.split('/*  Add new mission  */ \n \n */ \n */ \n const').join('/* Add new mission */ \n const');

fs.writeFileSync('src/components/MissoesTab.tsx', missoes);

console.log('Fixer v10 done');
