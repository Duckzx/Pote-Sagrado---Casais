const fs = require('fs');

// 1. MissoesTab.tsx
let missoes = fs.readFileSync('src/components/MissoesTab.tsx', 'utf8');
missoes = missoes.replace('/* ======================================== /* Edit mission /* ======================================== */ \n */ \n */ \n ', '/* ======================================== */ \n /* Edit mission */ \n ');
missoes = missoes.replace('} const handleSaveEdit', '}; const handleSaveEdit');
fs.writeFileSync('src/components/MissoesTab.tsx', missoes);

// 2. PinboardTab.tsx
let pinboard = fs.readFileSync('src/components/PinboardTab.tsx', 'utf8');
pinboard = pinboard.split('} const ').join('}; const ');
fs.writeFileSync('src/components/PinboardTab.tsx', pinboard);

console.log('Fixer v8 done');
