const fs = require('fs');

let missoes = fs.readFileSync('src/components/MissoesTab.tsx', 'utf8');

const searchStr = `    useState(
      false,
    ); /* Edit state const [editingMission, setEditingMission] = useState<Mission | null>(null); const [editTitle, setEditTitle] = useState(''); const [editDesc, setEditDesc] = useState(''); const [editReward, setEditReward] = useState(''); const [editIcon, setEditIcon] = useState(''); const [isSavingEdit, setIsSavingEdit] = useState(false); /* Add new mission state const [showAddForm, setShowAddForm] = useState(false); const [newTitle, setNewTitle] = useState(''); const [newDesc, setNewDesc] = useState(''); const [newReward, setNewReward] = useState(''); const [newIcon, setNewIcon] = useState('⭐'); const [newCategory, setNewCategory] = useState<'economia' | 'desafio'>('desafio'); /* ======================================== */`;

const replaceStr = `    useState(false); 
    
    /* Edit state */
    const [editingMission, setEditingMission] = useState<Mission | null>(null); 
    const [editTitle, setEditTitle] = useState(''); 
    const [editDesc, setEditDesc] = useState(''); 
    const [editReward, setEditReward] = useState(''); 
    const [editIcon, setEditIcon] = useState(''); 
    const [isSavingEdit, setIsSavingEdit] = useState(false); 
    
    /* Add new mission state */ 
    const [showAddForm, setShowAddForm] = useState(false); 
    const [newTitle, setNewTitle] = useState(''); 
    const [newDesc, setNewDesc] = useState(''); 
    const [newReward, setNewReward] = useState(''); 
    const [newIcon, setNewIcon] = useState('⭐'); 
    const [newCategory, setNewCategory] = useState<'economia' | 'desafio'>('desafio');`;

if (missoes.includes(searchStr)) {
  missoes = missoes.replace(searchStr, replaceStr);
} else {
  // Try alternative format without formatting newlines
  const altSearch = "false,\n    ); /* Edit state const [editingMission";
  const startIdx = missoes.indexOf("/* Edit state const [editingMission");
  if (startIdx !== -1) {
    const endIdx = missoes.indexOf("/* ======================================== */", startIdx);
    if (endIdx !== -1) {
       let target = missoes.slice(startIdx, endIdx);
       let replacement = "/* Edit state */\n" + target.substring("/* Edit state ".length)
         .replace("/* Add new mission state ", "\n/* Add new mission state */\n");
       
       missoes = missoes.replace(target, replacement);
    }
  }
}

fs.writeFileSync('src/components/MissoesTab.tsx', missoes);
console.log('Fixer v12 done');
