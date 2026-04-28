const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // Replace standard solid bg-white with bg-cookbook-bg except in some specific cases
      // For instance, "bg-white border" -> "bg-cookbook-bg border"
      content = content.replace(/bg-white border/g, 'bg-cookbook-bg border');
      content = content.replace(/bg-white {1,2}border/g, 'bg-cookbook-bg border');
      // replace hover:bg-white with hover:bg-cookbook-border/30 or something similar
      content = content.replace(/hover:bg-white\/60/g, 'hover:bg-cookbook-border/30');
      content = content.replace(/hover:bg-white/g, 'hover:bg-cookbook-border/30');

      fs.writeFileSync(fullPath, content);
    }
  }
}

// Ensure Consistence of Modals
// Usually backdrop is: fixed inset-0 z-[60] flex items-center justify-center p-4 bg-cookbook-bg/90 backdrop-blur-md animate-modal-backdrop
// And modal is: bg-cookbook-bg shadow-xl border border-cookbook-border rounded-3xl w-full max-w-sm p-6 shadow-2xl relative animate-modal-enter

processDir(path.join(__dirname, 'src', 'components'));
console.log("Done fixing white backgrounds.");
