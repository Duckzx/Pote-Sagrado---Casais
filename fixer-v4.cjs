const fs = require('fs');

function replaceAll(file, search, replace) {
    if (fs.existsSync(file)) {
        let text = fs.readFileSync(file, 'utf8');
        text = text.split(search).join(replace);
        fs.writeFileSync(file, text);
    }
}

replaceAll('src/components/ConfigTab.tsx', 'const token = await getToken(messaging, { /* ATENÇÃO: É recomendável colocar vapidKey aqui para Web Push */ if (token) {', 'const token = await getToken(messaging); /* ATENÇÃO: vapidKey */ if (token) {');

replaceAll('src/components/HomeTab.tsx', '`https://www.google.com/travel/flights?q=Voos+de+${encodeURIComponent(origin || \'Brasil\')}+para+${encodeURIComponent(destination)}`; */ \n', '`https://www.google.com/travel/flights?q=Voos+de+${encodeURIComponent(origin || \'Brasil\')}+para+${encodeURIComponent(destination)}`; \n');

// MissoesTab.tsx
replaceAll('src/components/MissoesTab.tsx', ']; type FilterType = \'todas\' | \'economia\' | \'desafio\' | \'custom\'; const FILTERS: { id: FilterType; label: string; emoji: string }[] = [ { id: \'todas\', label: \'Todas\', emoji: \'🎯\' }, { id: \'economia\', label: \'Economia\', emoji: \'💚\' }, { id: \'desafio\', label: \'Desafios\', emoji: \'⚔️\' }, { id: \'custom\', label: \'Minhas\', emoji: \'⭐\' }, ]; /* ======================================== /* Component /* ======================================== */ \n */ \n */ \n import { compressImage }', ']; type FilterType = \'todas\' | \'economia\' | \'desafio\' | \'custom\'; const FILTERS: { id: FilterType; label: string; emoji: string }[] = [ { id: \'todas\', label: \'Todas\', emoji: \'🎯\' }, { id: \'economia\', label: \'Economia\', emoji: \'💚\' }, { id: \'desafio\', label: \'Desafios\', emoji: \'⚔️\' }, { id: \'custom\', label: \'Minhas\', emoji: \'⭐\' }, ]; /* Component */ import { compressImage }');


// PinboardTab.tsx
replaceAll('src/components/PinboardTab.tsx', 'image: \'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop\' }, ]); */ \n */ \n const [isAddingLink', 'image: \'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop\' }, ]); const [isAddingLink');
replaceAll('src/components/PinboardTab.tsx', 'image: \'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop\' } ]); */ \n', 'image: \'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=400&fit=crop\' } ]); \n');

// SavingsChart.tsx
replaceAll('src/components/SavingsChart.tsx', '}, [dataPoints, goalAmount, dimensions]); /* Touch/mouse interaction */ \n for tooltip const handleInteraction', '}, [dataPoints, goalAmount, dimensions]); /* Touch/mouse interaction for tooltip */ const handleInteraction');


// Also check if HomeTab has `*/` after flightsUrl
let hometab = fs.readFileSync('src/components/HomeTab.tsx', 'utf8');
hometab = hometab.replace('const flightsUrl = `https://www.google.com/travel/flights?q=Voos+de+${encodeURIComponent(origin || \'Brasil\')}+para+${encodeURIComponent(destination)}`; */', 'const flightsUrl = `https://www.google.com/travel/flights?q=Voos+de+${encodeURIComponent(origin || \'Brasil\')}+para+${encodeURIComponent(destination)}`; ');
fs.writeFileSync('src/components/HomeTab.tsx', hometab);

console.log('Fixer v4 done');
