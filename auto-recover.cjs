const fs = require('fs');
const path = require('path');

const dir = 'src/components';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

const keywords = [
    'const ', 'let ', 'var ', 'function ', 'export ', 'import ', 'return ',
    'if ', 'else ', 'for ', 'while ', 'switch ', 'case ', 'break ', 'continue ',
    'useEffect', 'useState', 'useMemo', 'useCallback', 'useRef', 'setTimeout',
    'console\\.', 'try ', 'catch ', 'finally ', '<div', '</div', '<span', '</span',
    '<button', '</button', '<img', '<svg', '</svg', '<path', '<h1', '<h2', '<h3',
    '<p', '<a ', '</a', '<input', '<label', '\\];', '\\};', ' \\}\\);'
];

const pattern = new RegExp('(\\/\\/.*?) (' + keywords.join('|') + ')');

for (const file of files) {
    const fullPath = path.join(dir, file);
    let orig = fs.readFileSync(fullPath, 'utf8');
    
    let count = 0;
    while(true) {
        let prev = orig;
        orig = orig.replace(pattern, function(match, commentText, nextKeyword) {
            return '/* ' + commentText.substring(2).trim() + ' */ \\n ' + nextKeyword;
        });
        if (orig === prev) break;
        count++;
        if (count > 200) break;
    }

    orig = orig.replace(/\\n/g, '\n');
    fs.writeFileSync(fullPath, orig);
}
console.log("Auto-recovery complete.");
