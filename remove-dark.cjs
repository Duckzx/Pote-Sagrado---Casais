const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        processDir(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Remove all dark: classes (like dark:bg-black/40, dark:border-white/5, dark:hover:bg-white/10, etc)
      // We look for boundaries or spaces before dark:
      const before = content;
      content = content.replace(/\bdark:[a-zA-Z0-9-\/\[\]\.]+\b/g, '');
      
      // Clean up multiple spaces that might have been left
      content = content.replace(/className="([^"]*)"/g, (match, p1) => {
        const cleaned = p1.replace(/\s+/g, ' ').trim();
        return `className="${cleaned}"`;
      });
      content = content.replace(/className=\{`([^`]+)`\}/g, (match, p1) => {
        const cleaned = p1.replace(/\s+/g, ' ').trim();
        return `className={\`${cleaned}\`}`;
      });

      if (before !== content) {
        fs.writeFileSync(fullPath, content);
        console.log("Updated", fullPath);
      }
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log("Done removing dark classes.");
