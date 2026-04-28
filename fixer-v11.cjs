const fs = require('fs');

let missoes = fs.readFileSync('src/components/MissoesTab.tsx', 'utf8');

const replaces = [
  ['/* Merge all missions const allMissions', '/* Merge all missions */ \n const allMissions'],
  ['/* Filtered missions const filteredMissions', '/* Filtered missions */ \n const filteredMissions'],
  ['/* Streak calculation const streaks', '/* Streak calculation */ \n const streaks'],
  ['/* Complete a mission const handleImageUpload', '/* Complete a mission */ \n const handleImageUpload'],
  ['/* Edit mission const handleEditClick', '/* Edit mission */ \n const handleEditClick'],
  ['/* Total count const count', '/* Total count */ \n const count'],
  ['/* Streak: consecutive days with this mission const dates', '/* Streak: consecutive days with this mission */ \n const dates'],
  ['/* Check if yesterday counts const yesterday', '/* Check if yesterday counts */ \n const yesterday'],
  ['/* Update in the appropriate Firestore collection const isDesafio', '/* Update in the appropriate Firestore collection */ \n const isDesafio']
];

for(const [s, r] of replaces) {
  missoes = missoes.split(s).join(r);
}

fs.writeFileSync('src/components/MissoesTab.tsx', missoes);
console.log('Fixer v11 done');
