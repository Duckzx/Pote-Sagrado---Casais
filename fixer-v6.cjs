const fs = require('fs');

function replaceAll(file, search, replace) {
    if (fs.existsSync(file)) {
        let text = fs.readFileSync(file, 'utf8');
        text = text.split(search).join(replace);
        fs.writeFileSync(file, text);
    }
}

// 1. MissoesTab.tsx
let missoes = fs.readFileSync('src/components/MissoesTab.tsx', 'utf8');
// Fix stray comments
missoes = missoes.replace('/* ======================================== /* Merge all missions from different sources /* ======================================== */ \n */ \n */ \n const allMissions =', '/* ======================================== */ \n /* Merge all missions */ \n const allMissions =');

missoes = missoes.replace('/* ======================================== /* Filtered missions /* ======================================== */ \n */ \n */ \n const filteredMissions =', '/* ======================================== */ \n /* Filtered missions */ \n const filteredMissions =');

missoes = missoes.replace('/* ======================================== /* Streak calculation per mission /* ======================================== */ \n */ \n */ \n const streaks =', '/* ======================================== */ \n /* Streak calculation */ \n const streaks =');

missoes = missoes.replace('/* ======================================== /* Complete a mission /* ======================================== */ \n */ \n */ \n', '/* ======================================== */ \n /* Complete a mission */ \n');

fs.writeFileSync('src/components/MissoesTab.tsx', missoes);


// 2. PinboardTab.tsx
let pinboard = fs.readFileSync('src/components/PinboardTab.tsx', 'utf8');
pinboard = pinboard.replace('addToast(\'Adicionado\', \'Link salvo no mural!\', \'success\'); */ \n };', 'addToast(\'Adicionado\', \'Link salvo no mural!\', \'success\'); \n };');

// Also in PinboardTab:
// <input type="url" placeholder="Link (https:/* ...)" 
pinboard = pinboard.replace('<input type="url" placeholder="Link (https:/* ...)"', '<input type="url" placeholder="Link (https://...)"');

fs.writeFileSync('src/components/PinboardTab.tsx', pinboard);

console.log('Fixer v6 done');
