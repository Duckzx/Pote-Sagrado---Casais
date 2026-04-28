const fs = require('fs');

const fixes = {
  'src/components/WaterSpill.tsx': [
    { from: '/* Float elegantly upwards */', to: '// Float elegantly upwards ' }, // Reset what auto-recover did
    { from: '// Float elegantly upwards ', to: '/* Float elegantly upwards */ ' },
    { from: '/* Float elegantly upwards */ \n rotate:', to: '/* Float elegantly upwards */ rotate:' },
  ],
  'src/components/AIAkinatorModal.tsx': [
    { from: '/* any /* Quiz state */ \n const ', to: '/* any */ /* Quiz state */ const ' },
    { from: '/* Find match processResult(newAnswers); } */ \n else {', to: '/* Find match */ processResult(newAnswers); } else {' },
    { from: '/* Go to question 2 } */ \n }; const processResult', to: '/* Go to question 2 */ } }; const processResult' },
    { from: '/* Result view */ \n try', to: '/* Result view */ try' },
    { from: '/* Fallback if AI fails for any reason */ \n const', to: '/* Fallback if AI fails for any reason */ const' },
  ],
  'src/components/AIAssistantModal.tsx': [
    { from: '/* Constrói URLs de pesquisa para facilitar a vida do usuário de graça */ \n const destEncoded =', to: '/* Constrói URLs de pesquisa para facilitar a vida do usuário de graça */ const destEncoded =' },
    { from: 'https:/* www', to: 'https://www', all: true },
    { from: ' color: "border-amber-200 bg-amber-50" } */ \n */ \n */ \n */', to: ' color: "border-amber-200 bg-amber-50" } ]; return ( <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop" onClick={onClose}> <div className="bg-cookbook-bg shadow-xl border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative overflow-hidden animate-modal-enter" onClick={e => e.stopPropagation()}> <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cookbook-primary via-cookbook-gold to-cookbook-primary opacity-50" /> <button onClick={onClose} className="absolute top-4 right-4 text-cookbook-text/40 hover:text-cookbook-text z-10 transition-colors"> <X size={20} /> </button> <div className="mt-2 text-center mb-6"> <div className="w-14 h-14 bg-cookbook-gold/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-cookbook-gold/20 shadow-sm relative group cursor-pointer" onClick={() => window.open(`https://www.google.com/search?q=viajar+para+${destEncoded}`)}> <Compass size={24} className="text-cookbook-gold" /> <div className="absolute inset-0 bg-cookbook-gold rounded-full text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity shadow-lg"> <ExternalLink size={20} /> </div> </div> <h3 className="font-serif text-xl text-cookbook-text mb-1 flex items-center justify-center gap-2"> Explorador de Viagem <Info size={16} className="text-cookbook-text/40" /> </h3> <p className="font-sans text-xs text-cookbook-text/60"> Dicas para {destination} </p> </div> <div className="space-y-3 px-1 custom-scrollbar max-h-[50vh] overflow-y-auto"> {links.map((link, i) => ( <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className={`block w-full p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-[0.98] ${link.color} hover:shadow-md`} > <div className="flex items-center gap-4"> <div className="bg-white/60 p-2.5 rounded-xl border border-white"> {link.icon} </div> <div className="flex-1 text-left"> <p className="font-sans font-bold text-[10px] uppercase tracking-widest text-cookbook-text"> {link.title} </p> <p className="font-serif italic text-xs text-cookbook-text/70 mt-0.5"> {link.desc} </p> </div> </div> </a> ))} </div> </div> </div> ); };' },
  ],
  'src/components/CountdownWidget.tsx': [
    { from: '/* update every minute */ \n return', to: '/* update every minute */ return' },
    { from: '/* Progress: from when config was set (approximate) to target /* We\'ll show percentage of time elapsed assuming 365 day max window */ \n */ \n const ', to: '/* Progress: from when config was set to target. We show percentage of time elapsed assuming 365 day max window */ const ' }
  ],
  'src/components/DisputaTab.tsx': [
    { from: '/* Ensure we have at least two users */ \n for the UI, even if empty if', to: '/* Ensure we have at least two users for the UI, even if empty */ if' },
    { from: '/* Monthly breakdown */ \n for chart-like display const', to: '/* Monthly breakdown for chart-like display */ const' },
    { from: '/* Trigger a funny buzz/vibrate */ \n if available if', to: '/* Trigger a funny buzz/vibrate if available */ if' },
  ],
  'src/components/CheapDateModal.tsx': [
    { from: '/* Base ideas */ \n const ideas =', to: '/* Base ideas */ const ideas =' },
    { from: '/* Incorporate custom ideas */ \n for the selected tier const ', to: '/* Incorporate custom ideas for the selected tier */ const ' },
    { from: '/* If we are showing the add form */ \n if', to: '/* If we are showing the add form */ if' },
    { from: '/* Normal view */ \n return', to: '/* Normal view */ return' }
  ],
  'src/components/ConfigTab.tsx': [
    { from: '/* Handle auto-save on blur */ \n const handleSaveLocal', to: '/* Handle auto-save on blur */ const handleSaveLocal' },
    { from: 'https:/* nominatim', to: 'https://nominatim' },
    { from: '/* ATENÇÃO: É fortemente recomendado colocar seu vapidKey aqui para Web Push no futuro: /* vapidKey: \'SEU_VAPID_KEY_AQUI\' }); */ \n */ \n if (token)', to: '/* ATENÇÃO: É recomendável colocar vapidKey aqui para Web Push */ if (token)' },
    { from: '/* Clean amount */ \n ', to: '/* Clean amount */ let parsedAmount = parseCurrencyString(amountToSave); if (isNaN(parsedAmount)) parsedAmount = 0; /* Optimistic save without waiting for geocoding */ await setDoc(doc(db, \'trip_config\', \'main\'), { destination: destToSave, origin: originToSave, goalAmount: parsedAmount, theme: themeToSave, updatedAt: serverTimestamp() }, { merge: true }); setSaveTrigger(0); setIsSaving(false); addToast(\'Sucesso\', \'Configurações salvas!\', \'success\'); } catch (error) { handleFirestoreError(error, OperationType.WRITE, \'trip_config\'); setIsSaving(false); } }; ' }
  ],
  'src/components/BingoTab.tsx': [
    { from: '/* Fire confetti confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [\'#8E7F6D\', \'#2C2A26\', \'#E8E4D9\'] }); setSelectedAction(null); setAmount(\'\'); } */ \n catch (error)', to: '/* Fire confetti */ confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: [\'#8E7F6D\', \'#2C2A26\', \'#E8E4D9\'] }); setSelectedAction(null); setAmount(\'\'); } catch (error)' }
  ],
  'src/components/BottomNav.tsx': [
    { from: 'http:/* www.w3.org', to: 'http://www.w3.org' },
    { from: '/* Reduced to 5 focused items, removing Extrato since it mixes with Home\'s Diário de Bordo. /* Focus is now balanced around a prominent center. */ \n */ \n const tabsLeft', to: '/* Reduced to 5 focused items, removing Extrato since it mixes with Home\'s Diário de Bordo. Focus is now balanced around a prominent center. */ const tabsLeft' }
  ],
  'src/components/HomeTab.tsx': [
    { from: '/* Highest achieved */ \n const activeMilestone', to: '/* Highest achieved */ const activeMilestone' },
    { from: '/* Animation states */ \n for Pot Breaking const', to: '/* Animation states for Pot Breaking */ const' },
    { from: '/* FAB quick deposit */ \n const ', to: '/* FAB quick deposit */ const ' },
    { from: '/* Daily motivational quote (deterministic based on day of year) */ \n const', to: '/* Daily motivational quote (deterministic based on day of year) */ const' },
    { from: '/* Haptic and audio feedback vibrate([30, 50, 30]); */ \n if', to: '/* Haptic and audio feedback */ vibrate([30, 50, 30]); if' },
    { from: 'https:/* loremflickr', to: 'https://loremflickr', all: true },
    { from: '*/ \n ', to: '', all: false } 
  ],
  'src/components/MissoesTab.tsx': [
    { from: '/* ======================================== /* Types /* ======================================== interface Mission { id: string; title: string; desc: string; icon: string; category: \'economia\' | \'desafio\' | \'custom\'; reward: number; /* 0 = user inputs amount recurrence?: \'livre\' | \'diaria\' | \'semanal\' | \'mensal\'; } interface MissoesTabProps { stats: Record<string, number>; customChallenges?: any[]; battleChallenges?: any[]; deposits: any[]; currentUser: any; addToast: (title: string, message: string, type: \'info\' | \'success\' | \'milestone\') => void; } /* ======================================== /* Default Missions (merged from Bingo + Batalha) /* ======================================== */ \n */ \n */ \n */ \n */', 
      to: '/* Types */ interface Mission { id: string; title: string; desc: string; icon: string; category: \'economia\' | \'desafio\' | \'custom\'; reward: number; recurrence?: \'livre\' | \'diaria\' | \'semanal\' | \'mensal\'; } interface MissoesTabProps { stats: Record<string, number>; customChallenges?: any[]; battleChallenges?: any[]; deposits: any[]; currentUser: any; addToast: (title: string, message: string, type: \'info\' | \'success\' | \'milestone\') => void; } /* Default Missions */ ' 
    }
  ],
  'src/components/PinboardTab.tsx': [
    { from: '/* Nossos Sonhos */ \n const [links', to: '/* Nossos Sonhos */ const [links' },
    { from: 'https:/* airbnb', to: 'https://airbnb' },
    { from: 'https:/* tiktok', to: 'https://tiktok' },
    { from: 'https:/* decolar', to: 'https://decolar' },
    { from: 'https:/* images', to: 'https://images', all: true }
  ],
  'src/components/RemotionIntro.tsx': [
    { from: '/* Auto-dismiss handler */ \n useEffect', to: '/* Auto-dismiss handler */ useEffect' },
    { from: '/* 6s duration */ \n return', to: '/* 6s duration */ return' },
    { from: '/* 6 seconds compositionWidth={400} compositionHeight={500} fps={30} style={{ width: \'100%\', height: \'100%\' }} autoPlay loop={false} /> {/* Fading text overlay */} */ \n <div', to: '/* 6 seconds */ compositionWidth={400} compositionHeight={500} fps={30} style={{ width: \'100%\', height: \'100%\' }} autoPlay loop={false} /> {/* Fading text overlay */} <div' }
  ],
  'src/components/SacredPot.tsx': [
    { from: '/* Cap visual fill at 95% to prevent the wave animation from spilling out of the top of the CSS pot */ \n const ', to: '/* Cap visual fill at 95% to prevent the wave animation from spilling out of the top of the CSS pot */ const ' },
    { from: '/* Trigger continuous light confetti */ \n if goal reached useEffect', to: '/* Trigger continuous light confetti if goal reached */ useEffect' },
    { from: 'origin: { x: 0.5, y: 0.4 }, /* Center of the local absolute canvas colors: [\'#FFD700\', \'#FDB931\', \'#FF8C00\', \'#FFF8DC\'], /* Gold variants disableForReducedMotion: true, ticks: 100, gravity: 0.8, scalar: 0.6, zIndex: 10, }); }, 1500); */ \n */ \n return', to: 'origin: { x: 0.5, y: 0.4 }, colors: [\'#FFD700\', \'#FDB931\', \'#FF8C00\', \'#FFF8DC\'], disableForReducedMotion: true, ticks: 100, gravity: 0.8, scalar: 0.6, zIndex: 10, }); }, 1500); return' }
  ],
  'src/components/SavingsChart.tsx': [
    { from: '/* Map functions */ \n const mapX', to: '/* Map functions */ const mapX' },
    { from: '/* Clear ctx.clearRect(0, 0, w, h); /* Grid lines ctx.strokeStyle = borderColor + \'40\'; ctx.lineWidth = 0.5; */ \n */ \n const', to: '/* Clear */ ctx.clearRect(0, 0, w, h); /* Grid lines */ ctx.strokeStyle = borderColor + \'40\'; ctx.lineWidth = 0.5; const' },
    { from: '/* Y axis label */ \n const', to: '/* Y axis label */ const' },
    { from: '/* X axis labels (first and last) ctx.fillStyle = textColor + \'40\'; ctx.font = \'8px Helvetica Neue, Arial, sans-serif\'; ctx.textAlign = \'center\'; ctx.textBaseline = \'top\'; ctx.fillText(dataPoints[0].label, mapX(dataPoints[0].date), h - padding.bottom + 8); ctx.fillText(dataPoints[dataPoints.length - 1].label, mapX(dataPoints[dataPoints.length - 1].date), h - padding.bottom + 8); /* Goal line */ \n */', to: '/* X axis labels (first and last) */ ctx.fillStyle = textColor + \'40\'; ctx.font = \'8px Helvetica Neue, Arial, sans-serif\'; ctx.textAlign = \'center\'; ctx.textBaseline = \'top\'; ctx.fillText(dataPoints[0].label, mapX(dataPoints[0].date), h - padding.bottom + 8); ctx.fillText(dataPoints[dataPoints.length - 1].label, mapX(dataPoints[dataPoints.length - 1].date), h - padding.bottom + 8); /* Goal line */' }
  ],
  'src/components/UserBadges.tsx': [
    { from: '/* 1. Primeiro Passo */ \n if', to: '/* 1. Primeiro Passo */ if' },
    { from: '/* 2. Mestre Cuca (check */ \n for food related actions) const ', to: '/* 2. Mestre Cuca (check for food related actions) */ const ' },
    { from: '/* 3. Foco Total (50% of goal) */ \n const', to: '/* 3. Foco Total (50% of goal) */ const' },
    { from: '/* 4. Combo 3 Dias (Streak calculation is tricky with just dates, doing a simplified version) /* Map to unique date strings */ \n */ \n const ', to: '/* 4. Combo 3 Dias (Streak calculation is tricky with just dates, doing a simplified version) Map to unique date strings */ const ' }
  ],
  'src/components/WrappedModal.tsx': [
    { from: '/* Biggest single save */ \n let', to: '/* Biggest single save */ let' },
    { from: '/* Handle tap */ \n for navigating stories const', to: '/* Handle tap for navigating stories */ const' },
    { from: '/* Prevent scrolling */ \n while holding }} > {/* Progress Bars */} <div', to: '/* Prevent scrolling while holding */ }} > {/* Progress Bars */} <div' }
  ]
};

for (const [file, items] of Object.entries(fixes)) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    for (const { from, to, all } of items) {
      if (all) {
        content = content.split(from).join(to);
      } else {
        content = content.replace(from, to);
      }
    }
    fs.writeFileSync(file, content);
  }
}
console.log("Fixer done");
