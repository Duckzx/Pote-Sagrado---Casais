const fs = require('fs');

const files = fs.readdirSync('src/components').filter(f => f.endsWith('.tsx'));
for (const file of files) {
    const content = fs.readFileSync('src/components/' + file, 'utf8');
    const matches = content.match(/\/\/.{1,50}/g);
    if (matches && matches.length > 0) {
        console.log("--- " + file + " ---");
        matches.forEach(m => console.log(m));
    }
}
