// Script to remove duplicate import statements
const fs = require('fs');
const path = require('path');

function removeDuplicateImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    const seenImports = new Set();
    const newLines = [];
    let modified = false;

    for (const line of lines) {
        if (line.trim().startsWith('import ')) {
            if (seenImports.has(line.trim())) {
                modified = true;
                continue; // Skip duplicate
            }
            seenImports.add(line.trim());
        }
        newLines.push(line);
    }

    if (modified) {
        fs.writeFileSync(filePath, newLines.join('\n'), 'utf-8');
        console.log(`Removed duplicates from: ${filePath}`);
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
            if (removeDuplicateImports(fullPath)) {
                count++;
            }
        }
    }

    return count;
}

console.log('Removing duplicate imports...\n');
const count = processAllFiles(path.join(__dirname, 'src'));
console.log(`\nDone! Fixed ${count} files.`);
