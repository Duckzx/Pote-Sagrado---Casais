const fs = require('fs');

function replaceAll(file, search, replace) {
    if (fs.existsSync(file)) {
        let text = fs.readFileSync(file, 'utf8');
        text = text.split(search).join(replace);
        fs.writeFileSync(file, text);
    }
}

// 1. ConfigTab.tsx
let config = fs.readFileSync('src/components/ConfigTab.tsx', 'utf8');
let performSaveStart = config.indexOf('const performSave =');
if (performSaveStart !== -1) {
  let before = config.slice(0, performSaveStart);
  let handleSaveIndex = config.indexOf('const handleSave =');
  let after = config.slice(handleSaveIndex);
  let newPerformSave = `const performSave = async (destToSave: string, amountToSave: string, originToSave: string, challengesToSave: any[], targetDateToSave: string, prizeToSave: string, themeToSave: string) => {
    setIsSaving(true);
    try {
      let parsedAmount = parseCurrencyString(amountToSave);
      if (isNaN(parsedAmount)) parsedAmount = 0;
      await setDoc(doc(db, 'trip_config', 'main'), {
        destination: destToSave,
        origin: originToSave,
        goalAmount: parsedAmount,
        customChallenges: challengesToSave,
        targetDate: targetDateToSave,
        monthlyPrize: prizeToSave,
        theme: themeToSave,
        updatedAt: serverTimestamp()
      }, { merge: true });
      if (auth.currentUser) {
        await setDoc(doc(db, 'users', auth.currentUser.uid), {
          theme: themeToSave,
          displayName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0]
        }, { merge: true });
      }
      setSaveTrigger(0);
      setIsSaving(false);
      addToast('Sucesso', 'Configurações salvas!', 'success');
      if (destToSave) {
        fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(destToSave)}\`)
          .then(res => res.json())
          .then(data => {
             if (data && data.length > 0) {
               setDoc(doc(db, 'trip_config', 'main'), { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }, { merge: true });
             }
          })
          .catch(e => console.error("Geocoding failed", e));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'trip_config');
      setIsSaving(false);
    }
  };
`;
  fs.writeFileSync('src/components/ConfigTab.tsx', before + newPerformSave + after);
}


// 2. HomeTab.tsx
let home = fs.readFileSync('src/components/HomeTab.tsx', 'utf8');
// Fix galleryItems block that ends in random */ \n */ \n */ \n const progress ... const flightsUrl
let badHome = `], [destination]); */ \n */ \n */ \n const progress = goalAmount > 0 ? Math.min((totalSaved / goalAmount) * 100, 100) : 0; const flightsUrl = \`https:/* www.google.com/travel/flights?q=Voos+de+\${encodeURIComponent(origin || 'Brasil')}+para+\${encodeURIComponent(destination)}\`; */ `;
let goodHome = `], [destination]); const progress = goalAmount > 0 ? Math.min((totalSaved / goalAmount) * 100, 100) : 0; const flightsUrl = \`https://www.google.com/travel/flights?q=Voos+de+\${encodeURIComponent(origin || 'Brasil')}+para+\${encodeURIComponent(destination)}\`; `;
home = home.split(badHome).join(goodHome);

// And around handleMap... Wait, PinboardTab has "for demo const imageUrl"
home = home.replace('/* Start breaking animation setIsPotBreaking(true); */ \n if (vibrate)', 'setIsPotBreaking(true); if (vibrate)');
home = home.replace('/* Crack the pot after short delay */ \n setTimeout(()', 'setTimeout(()');
home = home.replace('/* Execute database operations */ \n while water spills setTimeout(async ()', 'setTimeout(async ()');
home = home.replace('/* 1. Add achievement await addDoc(collection(db, \'achievements\'), { destination: destination || \'Nossa Viagem\', amount: Number(totalSaved), goalAmount: Number(goalAmount), createdAt: serverTimestamp(), }); /* 2. Clear all deposits */ \n */ \n for (const deposit of deposits)', `await addDoc(collection(db, 'achievements'), { destination: destination || 'Nossa Viagem', amount: Number(totalSaved), goalAmount: Number(goalAmount), createdAt: serverTimestamp(), }); for (const deposit of deposits)`);
fs.writeFileSync('src/components/HomeTab.tsx', home);


// 3. MissoesTab.tsx
let missoes = fs.readFileSync('src/components/MissoesTab.tsx', 'utf8');
missoes = missoes.replace('/* Default Missions */ const DEFAULT_MISSIONS: Mission[] = [ /* Economia (from Bingo) { id:', '/* Default Missions */ const DEFAULT_MISSIONS: Mission[] = [ { id:');
missoes = missoes.replace('{ id: \'multa\', title: \'Multa da Regra\', desc: \'Alguém quebrou uma regra e paga a multa!\', icon: \'⚖️\', category: \'economia\', reward: 0 }, /* Desafios (from Batalha) { id: \'c1\'', '{ id: \'multa\', title: \'Multa da Regra\', desc: \'Alguém quebrou uma regra e paga a multa!\', icon: \'⚖️\', category: \'economia\', reward: 0 }, { id: \'c1\'');
missoes = missoes.replace('/* If there are Firestore battle challenges, use those instead of default desafios */ \n if (battleChallenges.length > 0) { /* Keep default economia missions missions.push(...DEFAULT_MISSIONS.filter(m => m.category === \'economia\')); /* Use Firestore battle challenges as desafio battleChallenges.forEach(bc => { missions.push({ id: bc.id, title: bc.title, desc: bc.desc || \'\', icon: bc.icon || \'⭐\', category: \'desafio\', reward: bc.reward || 0, recurrence: bc.recurrence || \'livre\' }); }); } */ \n */ \n else { missions.push(...DEFAULT_MISSIONS); } /* Add custom challenges from Bingo config customChallenges.forEach(cc => { missions.push({ id: cc.id, title: cc.label, desc: \'\', icon: cc.icon || \'⭐\', category: \'custom\', reward: 0 }); }); */ \n return', 'if (battleChallenges.length > 0) { missions.push(...DEFAULT_MISSIONS.filter(m => m.category === \'economia\')); battleChallenges.forEach(bc => { missions.push({ id: bc.id, title: bc.title, desc: bc.desc || \'\', icon: bc.icon || \'⭐\', category: \'desafio\', reward: bc.reward || 0, recurrence: bc.recurrence || \'livre\' }); }); } else { missions.push(...DEFAULT_MISSIONS); } customChallenges.forEach(cc => { missions.push({ id: cc.id, title: cc.label, desc: \'\', icon: cc.icon || \'⭐\', category: \'custom\', reward: 0 }); }); return');
fs.writeFileSync('src/components/MissoesTab.tsx', missoes);


// 4. PinboardTab.tsx
let pinboard = fs.readFileSync('src/components/PinboardTab.tsx', 'utf8');
pinboard = pinboard.replace('/* Auto generated image */ \n for demo const imageUrl = `https:/* picsum.photos', '/* Auto generated image */ const imageUrl = `https://picsum.photos');
fs.writeFileSync('src/components/PinboardTab.tsx', pinboard);

console.log('Fixer v5 done');
