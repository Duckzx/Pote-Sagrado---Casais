const fs = require('fs');

function replaceAll(file, search, replace) {
    if (fs.existsSync(file)) {
        let text = fs.readFileSync(file, 'utf8');
        text = text.split(search).join(replace);
        fs.writeFileSync(file, text);
    }
}

replaceAll('src/components/AIAkinatorModal.tsx', '/* any */ /* Quiz state */ \n */ \n', '/* any */ /* Quiz state */ \n');

replaceAll('src/components/AIAssistantModal.tsx', 'border-amber-200 bg-amber-50" } ]; return ( <div', 'border-amber-200 bg-amber-50" } ]; return ( <div');
// Wait, for AIAssistantModal, the issue is that I appended a duplicate return statement at the end of the `links` array!
// Let me just look at AIAssistantModal.tsx entirely and fix it.
let aiassis = fs.readFileSync('src/components/AIAssistantModal.tsx', 'utf8');
if (aiassis.includes(']; return ( <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop" onClick={onClose}>')) {
  // We have a duplicated return! Let's slice the file right before the second `]; return (`
  // Actually, wait, let's just use regex to remove the FIRST incorrect block that was inserted, or the SECOND.
  // The original has `z-50`. The broken one has `z-[60]`.
  let idx1 = aiassis.indexOf('return ( <div className="fixed inset-0 z-[60]');
  let idx2 = aiassis.indexOf(']; return ( <div className="fixed inset-0 z-50');
  if (idx1 !== -1 && idx2 !== -1) {
     // remove from idx1 to idx2 + 2 (the `];` part)
     aiassis = aiassis.slice(0, idx1) + aiassis.slice(idx2 + 3); // cut out the bad return!
     fs.writeFileSync('src/components/AIAssistantModal.tsx', aiassis);
  }
}


replaceAll('src/components/ConfigTab.tsx', 'try { const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`); */ \n const data', 'try { const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`); const data');

replaceAll('src/components/ConfigTab.tsx', 'addToast(\'Salvo!\', \'Configurações salvas com sucesso!\', \'success\'); /* Do geocoding in background */ \n if (destToSave) { fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destToSave)}`) .then(res => res.json()) .then(data => { */ \n', 'addToast(\'Salvo!\', \'Configurações salvas com sucesso!\', \'success\'); /* Do geocoding in background */ if (destToSave) { fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destToSave)}`) .then(res => res.json()) .then(data => { ');


replaceAll('src/components/HomeTab.tsx', '}, [destination]); */ \n */ \n */ \n const progress', '}, [destination]); const progress');
replaceAll('src/components/HomeTab.tsx', '`https://www.google.com/travel/flights?q=Voos+de+${encodeURIComponent(origin || \'Brasil\')}+para+${encodeURIComponent(destination)}`; */ \n', '`https://www.google.com/travel/flights?q=Voos+de+${encodeURIComponent(origin || \'Brasil\')}+para+${encodeURIComponent(destination)}`; \n');


replaceAll('src/components/MissoesTab.tsx', 'addToast: (title: string, message: string, type: \'info\' | \'success\' | \'milestone\') => void; } /* Default Missions */  \n */ \n */ \n const DEFAULT_MISSIONS', 'addToast: (title: string, message: string, type: \'info\' | \'success\' | \'milestone\') => void; } /* Default Missions */ const DEFAULT_MISSIONS');
replaceAll('src/components/MissoesTab.tsx', 'icon: \'☕\', category: \'desafio\', reward: 35, recurrence: \'semanal\' }, */ \n */ \n', 'icon: \'☕\', category: \'desafio\', reward: 35, recurrence: \'semanal\' },');

replaceAll('src/components/PinboardTab.tsx', 'image: \'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop\' }, ]); */ \n */ \n */ \n */ \n', 'image: \'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&h=400&fit=crop\' }, ]);');


replaceAll('src/components/SavingsChart.tsx', 'ctx.closePath(); */ \n */ \n const gradient', 'ctx.closePath(); const gradient');
replaceAll('src/components/SavingsChart.tsx', 'ctx.fill(); /* Line */ ctx.beginPath(); dataPoints.forEach((p, i) => { */ \n const x', 'ctx.fill(); /* Line */ ctx.beginPath(); dataPoints.forEach((p, i) => { const x');

replaceAll('src/components/WaterSpill.tsx', 'transition={{ duration: 2.5 + Math.random(), delay: Math.random() * 0.4, ease: \'easeOut\' }} /> ))} </motion.div> )} </AnimatePresence> ); */ \n }; ', 'transition={{ duration: 2.5 + Math.random(), delay: Math.random() * 0.4, ease: \'easeOut\' }} /> ))} </motion.div> )} </AnimatePresence> ); }; ');

console.log('Fixer v3 done');
