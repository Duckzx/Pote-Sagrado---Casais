const fs = require('fs');
let content = fs.readFileSync('src/components/PinboardTab.tsx', 'utf8');

// The file has a '// Replace this placeholder below:' that comments out the rest of the file
content = content.replace(/\/\/ Replace this placeholder below:/, '/* Replace this placeholder below: */');

// There might be another '//' comment
content = content.replace(/\/\/ (.*?) return \(/, '/* $1 */ return (');

fs.writeFileSync('src/components/PinboardTab.tsx', content);
