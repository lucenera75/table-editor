// Script to fix direct state mutations to use setters
const fs = require('fs');
const path = require('path');

// Map of variable names to their setter functions
const varToSetter = {
    selectedCells: 'setSelectedCells',
    selectedRow: 'setSelectedRow',
    selectedColumn: 'setSelectedColumn',
    contextMenuTarget: 'setContextMenuTarget',
    currentCell: 'setCurrentCell',
    anchorCell: 'setAnchorCell',
    isEditMode: 'setIsEditMode',
    isMouseSelecting: 'setIsMouseSelecting',
    selectionStartCell: 'setSelectionStartCell',
    newCellCounter: 'setNewCellCounter',
    isResizing: 'setIsResizing',
    resizeType: 'setResizeType',
    resizeTarget: 'setResizeTarget',
    startX: 'setStartX',
    startY: 'setStartY',
    startWidth: 'setStartWidth',
    startHeight: 'setStartHeight',
    resizeLine: 'setResizeLine',
    savedSelection: 'setSavedSelection',
    isInputFocused: 'setIsInputFocused',
    menuHideTimeout: 'setMenuHideTimeout',
    undoStack: 'setUndoStack',
    redoStack: 'setRedoStack',
    lastSnapshot: 'setLastSnapshot',
    isUndoRedoInProgress: 'setIsUndoRedoInProgress',
    snapshotIntervalId: 'setSnapshotIntervalId',
    isDesignMode: 'setIsDesignMode',
    draggedRow: 'setDraggedRow',
    draggedColumn: 'setDraggedColumn',
    currentBgColor: 'setCurrentBgColor',
    currentTextColor: 'setCurrentTextColor',
    currentTextMenuTextColor: 'setCurrentTextMenuTextColor',
    currentTextMenuBgColor: 'setCurrentTextMenuBgColor'
};

function fixStateMutations(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    const settersNeeded = new Set();

    // Find all direct assignments to state variables
    Object.entries(varToSetter).forEach(([varName, setterName]) => {
        // Match patterns like: varName = value (but not in import statements)
        const assignmentRegex = new RegExp(`^(\\s*)${varName}\\s*=\\s*(.+);?\\s*$`, 'gm');

        const newContent = content.replace(assignmentRegex, (match, indent, value) => {
            // Skip if this is in an import statement
            if (match.includes('import')) return match;

            modified = true;
            settersNeeded.add(setterName);
            return `${indent}${setterName}(${value});`;
        });

        if (newContent !== content) {
            content = newContent;
        }
    });

    if (modified) {
        // Add setter imports if needed
        if (settersNeeded.size > 0) {
            const setters = Array.from(settersNeeded).sort();
            const lines = content.split('\n');

            // Find the state/variables import line
            let stateImportIndex = -1;
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes("from '../state/variables.js'")) {
                    stateImportIndex = i;
                    break;
                }
            }

            if (stateImportIndex >= 0) {
                // Add setters to the existing import
                const importLine = lines[stateImportIndex];
                const match = importLine.match(/import\s*{\s*([^}]+)\s*}\s*from/);
                if (match) {
                    const existingImports = match[1].split(',').map(s => s.trim());
                    const allImports = [...new Set([...existingImports, ...setters])].sort();
                    lines[stateImportIndex] = `import { ${allImports.join(', ')} } from '../state/variables.js';`;
                }
            }

            content = lines.join('\n');
        }

        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Fixed: ${filePath} (${settersNeeded.size} setters added)`);
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
            // Skip state directory (it defines the variables)
            if (entry.name !== 'state') {
                count += processAllFiles(fullPath);
            }
        } else if (entry.isFile() && entry.name.endsWith('.js') && entry.name !== 'main.js') {
            if (fixStateMutations(fullPath)) {
                count++;
            }
        }
    }

    return count;
}

console.log('Fixing direct state mutations to use setters...\n');
const count = processAllFiles(path.join(__dirname, 'src'));
console.log(`\nDone! Fixed ${count} files.`);
