const fs = require('fs');

let pin = fs.readFileSync('src/components/PinboardTab.tsx', 'utf8');

// Add the icons we need if they are not there: Pencil, AlertCircle
if (!pin.includes('AlertCircle')) {
  pin = pin.replace('import {', 'import {\n  AlertCircle,\n  Pencil,');
}

// Add state variables below `const saldo = ...;`
const stateInjection = `  const [editing, setEditing] = useState<any>(null);
  const [editAmount, setEditAmount] = useState("");
  const [editAction, setEditAction] = useState("");
  const [deleting, setDeleting] = useState<any>(null);

  const handleEdit = (deposit: any) => {
    setEditing(deposit);
    setEditAmount(deposit.amount.toString());
    setEditAction(deposit.action || "");
  };

  const confirmEdit = async () => {
    const parsedAmount = Number(editAmount.replace(",", "."));
    if (!editing || !editAmount || isNaN(parsedAmount) || parsedAmount <= 0) return;
    try {
      await updateDoc(doc(db, "deposits", editing.id), {
        amount: parsedAmount,
        action: editAction,
      });
      addToast("Tudo Certo!", "Transação editada com sucesso.", "success");
      setEditing(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "deposits");
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteDoc(doc(db, "deposits", deleting.id));
      addToast("Removido", "Lançamento apagado.", "info");
      setDeleting(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "deposits");
    }
  };

  // Replace this placeholder below:
`;

pin = pin.split('  const saldo = totals.depositos - totals.gastos;').join(`  const saldo = totals.depositos - totals.gastos;\n${stateInjection}`);

// Add edit/delete buttons to the list items:
// Find `<div className={\`font-serif text-sm font-medium shrink-0 \${isExpense ? "text-red-500" : "text-emerald-600"}\`}>`
const itemAmountDiv = `<div
                        className={\`font-serif text-sm font-medium shrink-0 \${isExpense ? "text-red-500" : "text-emerald-600"}\`}
                      >
                        {" "}
                        {isExpense ? "-" : "+"}
                        {formatCurrency(d.amount)}{" "}
                      </div>`;

const buttonsInjection = `                      <div className="flex flex-col items-end gap-1">
                        <div className={\`font-serif text-sm font-medium shrink-0 \${isExpense ? "text-red-500" : "text-emerald-600"}\`}>
                          {isExpense ? "-" : "+"}{formatCurrency(d.amount)}
                        </div>
                        {d.who === auth.currentUser?.uid && (
                          <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(d)} className="text-cookbook-text/40 hover:text-cookbook-primary">
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => setDeleting(d)} className="text-cookbook-text/40 hover:text-red-500">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        )}
                      </div>`;

pin = pin.split('className="flex items-center justify-between py-2 border-b border-white/20 last:border-0 hover:bg-cookbook-bg :bg-white/5 px-2 -mx-2 rounded-xl transition-colors cursor-default"').join('className="group flex flex-col md:flex-row items-start md:items-center justify-between py-2 border-b border-white/20 last:border-0 hover:bg-cookbook-bg :bg-white/5 px-2 -mx-2 rounded-xl transition-colors cursor-default gap-2"');

pin = pin.replace(itemAmountDiv, buttonsInjection);

// If the regex replacement misses it because of formatting, just do a more robust one
if (!pin.includes('group-hover:opacity-100')) {
  let target = pin.substring(pin.indexOf('<div\n                        className={`font-serif text-sm font-medium'));
  target = target.substring(0, target.indexOf('</div>') + 6);
  pin = pin.replace(target, buttonsInjection);
}


// Add modals before the final `</div>`
const modalInjection = `
      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop" onClick={() => setEditing(null)}>
          <div className="bg-cookbook-bg border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter" onClick={e => e.stopPropagation()}>
            <h3 className="font-serif text-xl text-cookbook-text mb-4 font-medium">Editar Lançamento</h3>
            <div className="space-y-4 mb-6">
              <input type="text" inputMode="numeric" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} placeholder="0.00" className="w-full bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl py-3 pr-4 font-serif text-2xl text-center text-cookbook-text focus:outline-none focus:border-cookbook-primary" />
              <input type="text" value={editAction} onChange={(e) => setEditAction(e.target.value)} placeholder="Descrição" className="w-full bg-cookbook-bg/90 backdrop-blur-md border border-cookbook-border rounded-2xl px-4 py-3 font-sans text-xs text-cookbook-text focus:outline-none focus:border-cookbook-primary" />
            </div>
            <div className="flex space-x-3">
              <button onClick={() => setEditing(null)} className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase py-3 rounded-2xl font-bold">Cancelar</button>
              <button onClick={confirmEdit} className="flex-1 bg-cookbook-primary text-white font-sans text-[10px] uppercase py-3 rounded-2xl font-bold">Salvar</button>
            </div>
          </div>
        </div>
      )}

      {deleting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop" onClick={() => setDeleting(null)}>
          <div className="bg-cookbook-bg border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative text-center animate-modal-enter" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 mx-auto bg-red-500/10 rounded-full flex items-center justify-center mb-4"><AlertCircle size={24} className="text-red-500" /></div>
            <h3 className="font-serif text-xl text-cookbook-text mb-2 font-medium">Remover?</h3>
            <p className="font-sans text-xs text-cookbook-text/60 mb-6">Deseja excluir este valor? Essa ação não pode ser desfeita.</p>
            <div className="flex space-x-3">
              <button onClick={() => setDeleting(null)} className="flex-1 bg-cookbook-bg border border-cookbook-border text-cookbook-text font-sans text-[10px] uppercase py-3 rounded-2xl font-bold">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 bg-red-500 text-white font-sans text-[10px] uppercase py-3 rounded-2xl font-bold">Remover</button>
            </div>
          </div>
        </div>
      )}
`;

pin = pin.replace('    </div>\n  );\n};', `${modalInjection}    </div>\n  );\n};`);

fs.writeFileSync('src/components/PinboardTab.tsx', pin);
console.log('Fixer v13 done');
