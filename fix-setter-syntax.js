// Script to fix setter syntax errors
const fs = require('fs');
const path = require('path');

function fixSetterSyntax(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');

    // Fix patterns like: setSomething(value;); -> setSomething(value);
    const before = content;
    content = content.replace(/\(([^();]+);(\s*)\)/g, '($1)$2');

    if (content !== before) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed: ${filePath}`);
        return true;
    }

    return false;
}

function processAllFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    let count = 0;

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            count += processAllFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
            if (fixSetterSyntax(fullPath)) {
                count++;
            }
        }
    }

    return count;
}

console.log('Fixing setter syntax errors...\n');
const count = processAllFiles(path.join(__dirname, 'src'));
console.log(`\nDone! Fixed ${count} files.`);
