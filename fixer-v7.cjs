const fs = require('fs');

// 1. MissoesTab.tsx
let missoes = fs.readFileSync('src/components/MissoesTab.tsx', 'utf8');
missoes = missoes.replace('/* Check */ \n if yesterday counts', '/* Check if yesterday counts */ \n');
fs.writeFileSync('src/components/MissoesTab.tsx', missoes);


// 2. PinboardTab.tsx
let pinboard = fs.readFileSync('src/components/PinboardTab.tsx', 'utf8');
pinboard = pinboard.replace('holder:text-cookbook-text/30" /> */ \n <div className="flex ', 'holder:text-cookbook-text/30" /> \n <div className="flex ');
fs.writeFileSync('src/components/PinboardTab.tsx', pinboard);

console.log('Fixer v7 done');
