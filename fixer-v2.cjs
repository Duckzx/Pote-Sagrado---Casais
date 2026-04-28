const fs = require('fs');

function applyFixes(file, fixes) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        for (const [from, to] of Object.entries(fixes)) {
            content = content.replace(from, to);
        }
        fs.writeFileSync(file, content);
    }
}

applyFixes('src/components/AIAkinatorModal.tsx', {
    '/* any /* Quiz state */': '/* any */ /* Quiz state */',
    '/* Find match */ processResult(newAnswers); } else { setStep(1); /* Go to question 2 */ } }; const processResult = async (finalAnswers: string[]) => { setIsLoading(true); setStep(2); /* Result view */ try { const aiResult = await getDestinationRecommendation(finalAnswers); if (aiResult) { setResult(aiResult); } else { /* Fallback */ \n if AI fails for any reason const matchedDest': '/* Find match */ processResult(newAnswers); } else { setStep(1); /* Go to question 2 */ } }; const processResult = async (finalAnswers: string[]) => { setIsLoading(true); setStep(2); /* Result view */ try { const aiResult = await getDestinationRecommendation(finalAnswers); if (aiResult) { setResult(aiResult); } else { /* Fallback if AI fails for any reason */ const matchedDest',
    '} } */ \n catch (e) { const matchedDest': '} } catch (e) { const matchedDest',
    'matchedDest.dest)}/all?random=1` }); } */ \n': 'matchedDest.dest)}/all?random=1` }); }',
});

applyFixes('src/components/AIAssistantModal.tsx', {
    '} ]; return (': '} ]; return (', // already working? wait
    /* the error was: Declaration or statement expected. meaning the `return` is outside a block. */
    'return ( <div className="fixed inset-0 z-[60]': 'return ( <div className="fixed inset-0 z-[60]',
    // Actually the error showed `return ( ` at line 2 and it was outside the array?
    // Let's just fix it properly!
    'border-amber-200 bg-amber-50" } ]; return ( <div': 'border-amber-200 bg-amber-50" } ]; return ( <div',
});

// For AIAssistantModal, the issue is there are TWO return statements! Let's check the code:
// I accidentally appended the entire component to the end of the file when doing my `color: ...` replace.

applyFixes('src/components/ConfigTab.tsx', {
    'https:/* nominatim': 'https://nominatim',
    '/* ATENÇÃO: É recomendável colocar vapidKey aqui para Web Push */ if (token)': '/* ATENÇÃO: É recomendável colocar vapidKey aqui para Web Push */ if (token)',
});

applyFixes('src/components/RemotionIntro.tsx', {
    '/* 6 seconds compositionWidth={400}': '/* 6 seconds */ compositionWidth={400}',
    'autoPlay loop={false} /> {/* Fading text overlay */} */ \n <div': 'autoPlay loop={false} /> <div',
});

applyFixes('src/components/HomeTab.tsx', {
    'https:/* loremflickr': 'https://loremflickr',
});

applyFixes('src/components/SavingsChart.tsx', {
    'ctx.textBaseline = \'top\'; ctx.fillText(dataPoints[0].label, mapX(dataPoints[0].date), h - padding.bottom + 8); ctx.fillText(dataPoints[dataPoints.length - 1].label, mapX(dataPoints[dataPoints.length - 1].date), h - padding.bottom + 8); /* Goal line */ \n if (goalAmount > 0) {': 'ctx.textBaseline = \'top\'; ctx.fillText(dataPoints[0].label, mapX(dataPoints[0].date), h - padding.bottom + 8); ctx.fillText(dataPoints[dataPoints.length - 1].label, mapX(dataPoints[dataPoints.length - 1].date), h - padding.bottom + 8); /* Goal line */ if (goalAmount > 0) {',
    '/* Goal label ctx.fillStyle': '/* Goal label */ ctx.fillStyle',
    'META\', w - padding.right, goalY - 4); } /* Area fill ctx.beginPath();': 'META\', w - padding.right, goalY - 4); } /* Area fill */ ctx.beginPath();',
    'mapY(0)); ctx.closePath(); */ \n const gradient': 'mapY(0)); ctx.closePath(); const gradient',
    'ctx.fill(); /* Line ctx.beginPath();': 'ctx.fill(); /* Line */ ctx.beginPath();',
    'ctx.stroke(); /* Data points (dots) dataPoints.forEach((p, i) => { */ \n if (i === 0)': 'ctx.stroke(); /* Data points (dots) */ dataPoints.forEach((p, i) => { if (i === 0)',
});

applyFixes('src/components/UserBadges.tsx', {
    'for food related actions) const foodDeposits': '/* for food related actions */ const foodDeposits',
    '/* Map to unique date strings */ \n const depositDates': '/* Map to unique date strings */ const depositDates',
    'isInitialLoad.current = false; } return; } */ \n const newBadgesList': 'isInitialLoad.current = false; } return; } const newBadgesList',
    '/* Staggered confetti bursts */ \n for more drama setTimeout': '/* Staggered confetti bursts for more drama */ setTimeout',
});

applyFixes('src/components/WaterSpill.tsx', {
    '/* Float elegantly upwards rotate:': '/* Float elegantly upwards */ rotate:'
});

console.log("Fixer v2 run.");
