const fs = require('fs');

let missoes = fs.readFileSync('src/components/MissoesTab.tsx', 'utf8');
missoes = missoes.replace(/\/\* ======================================== \/\*(.+?)\/\* ======================================== \*\//g, '/* ======================================== */ \n /* $1 */ \n');
// Also clean up stray */ that follow those, or just manually do it safely
missoes = missoes.replace(/\*\//g, '*/'); // no-op

// Specifically:
missoes = missoes.replace('/* ======================================== /* Delete mission /* ======================================== */ \n */ \n */ \n ', '/* ======================================== */ \n /* Delete mission */ \n');
missoes = missoes.replace('/* ======================================== /* Add new mission /* ======================================== */ \n */ \n */ \n ', '/* ======================================== */ \n /* Add new mission */ \n');

// Also in case they are missing newlines:
missoes = missoes.replace('/* ======================================== /* Delete mission /* ======================================== */ \n */ \n */ \n', '/* ======================================== */ \n /* Delete mission */ \n');
missoes = missoes.replace('/* ======================================== /* Add new mission /* ======================================== */ \n */ \n */ \n', '/* ======================================== */ \n /* Add new mission */ \n');

fs.writeFileSync('src/components/MissoesTab.tsx', missoes);

console.log('Fixer v9 done');
