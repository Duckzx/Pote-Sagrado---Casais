const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');

      // 1. Remove all dark: classes completely
      content = content.replace(/dark:[a-zA-Z0-9-\/]+/g, '');

      // 2. We recently added "bg-white/40", "bg-white/60", etc. Let's revert back 
      // or change to something theme-matching. Modals had `bg-white/60 backdrop-blur-2xl`
      // Let's replace bg-white/60 with bg-cookbook-bg and bg-white/40 with bg-cookbook-bg/80
      
      content = content.replace(/bg-white\/60\s+backdrop-blur-2xl/g, 'bg-cookbook-bg shadow-xl');
      content = content.replace(/bg-white\/40\s+backdrop-blur-md/g, 'bg-cookbook-bg/90 backdrop-blur-md');
      content = content.replace(/bg-white\/40/g, 'bg-cookbook-bg');
      content = content.replace(/border-white\/40/g, 'border-cookbook-border');
      
      // Cleanup double spaces created by removing dark classes
      content = content.replace(/\s+/g, ' ');

      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(__dirname, 'src', 'components'));
console.log("Done fixing gray backgrounds.");
