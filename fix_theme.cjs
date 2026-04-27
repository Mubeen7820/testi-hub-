const fs = require('fs');
const path = require('path');

const directoriesToScan = [
    path.join(__dirname, 'src', 'pages'),
    path.join(__dirname, 'src', 'components')
];

const replacements = {
    '\\bbg-white\\b': 'bg-card',
    '\\btext-slate-900\\b': 'text-foreground',
    '\\btext-slate-800\\b': 'text-foreground',
    '\\btext-slate-500\\b': 'text-muted-foreground',
    '\\bbg-slate-50/50\\b': 'bg-muted/50',
    '\\bbg-slate-50\\b': 'bg-accent',
    '\\bbg-gray-50\\b': 'bg-background',
    '\\bborder-slate-200\\b': 'border-border',
    '\\bborder-slate-100\\b': 'border-border',
    '\\bborder-slate-300\\b': 'border-border',
    '\\btext-slate-600\\b': 'text-muted-foreground',
    '\\btext-slate-700\\b': 'text-foreground',
};

let filesModified = 0;

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walkDir(filePath);
        } else {
            if (!filePath.endsWith('.tsx')) continue;
            if (filePath.includes('TestimonialTemplates') || filePath.includes('TemplatePicker')) continue;
            
            const content = fs.readFileSync(filePath, 'utf-8');
            let newContent = content;
            
            for (const [oldStr, newStr] of Object.entries(replacements)) {
                newContent = newContent.replace(new RegExp(oldStr, 'g'), newStr);
            }
            
            if (newContent !== content) {
                fs.writeFileSync(filePath, newContent, 'utf-8');
                console.log(`Updated ${file}`);
                filesModified++;
            }
        }
    }
}

directoriesToScan.forEach(dir => {
    if (fs.existsSync(dir)) walkDir(dir);
});

console.log(`\nTotal files updated: ${filesModified}`);
