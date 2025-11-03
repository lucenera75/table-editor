// Script to fix imports in all module files
const fs = require('fs');
const path = require('path');

// Map of function names to their file paths
const functionMap = {
    // Selection
    selectCell: './selection/selectCell.js',
    clearSelection: './selection/clearSelection.js',
    startMouseSelection: './selection/startMouseSelection.js',
    handleMouseOverCell: './selection/handleMouseOverCell.js',
    stopMouseSelection: './selection/stopMouseSelection.js',
    navigateToCell: './selection/navigateToCell.js',
    extendSelection: './selection/extendSelection.js',
    selectRange: './selection/selectRange.js',

    // Edit
    enterEditMode: './edit/enterEditMode.js',
    exitEditMode: './edit/exitEditMode.js',

    // Menus
    showContextMenu: './menus/showContextMenu.js',
    hideContextMenu: './menus/hideContextMenu.js',
    clearSelectionFromContext: './menus/clearSelectionFromContext.js',

    // Table
    addRow: './table/addRow.js',
    addColumn: './table/addColumn.js',
    removeRow: './table/removeRow.js',
    removeColumn: './table/removeColumn.js',
    addRowAbove: './table/addRowAbove.js',
    addRowBelow: './table/addRowBelow.js',
    addColumnLeft: './table/addColumnLeft.js',
    addColumnRight: './table/addColumnRight.js',
    deleteSelectedRow: './table/deleteSelectedRow.js',
    deleteSelectedColumn: './table/deleteSelectedColumn.js',
    moveRowUp: './table/moveRowUp.js',
    moveRowDown: './table/moveRowDown.js',
    sortColumnAZ: './table/sortColumnAZ.js',
    sortColumnZA: './table/sortColumnZA.js',
    sortColumn: './table/sortColumn.js',
    getTableColumnCount: './table/getTableColumnCount.js',
    getCellsNeededForRow: './table/getCellsNeededForRow.js',
    getColumnPosition: './table/getColumnPosition.js',
    splitTable: './table/splitTable.js',
    deleteTable: './table/deleteTable.js',
    deleteTableFromContext: './table/deleteTableFromContext.js',
    toggleTableHeaders: './table/toggleTableHeaders.js',

    // Cells
    deleteCell: './cells/deleteCell.js',
    mergeSelectedCells: './cells/mergeSelectedCells.js',
    areSelectedCellsAdjacent: './cells/areSelectedCellsAdjacent.js',
    splitSelectedCell: './cells/splitSelectedCell.js',
    toggleCellInvisible: './cells/toggleCellInvisible.js',
    toggleVerticalText: './cells/toggleVerticalText.js',

    // Formatting
    updateFormatControls: './formatting/updateFormatControls.js',
    rgbToHex: './formatting/rgbToHex.js',
    applyAlignmentFromContext: './formatting/applyAlignmentFromContext.js',
    applyVerticalAlignmentFromContext: './formatting/applyVerticalAlignmentFromContext.js',
    applyFontSizeFromContext: './formatting/applyFontSizeFromContext.js',
    toggleBold: './formatting/toggleBold.js',
    toggleItalic: './formatting/toggleItalic.js',
    toggleUnderline: './formatting/toggleUnderline.js',
    toggleStrikethrough: './formatting/toggleStrikethrough.js',
    applyStyleToSelection: './formatting/applyStyleToSelection.js',
    applyTextDecorationToSelection: './formatting/applyTextDecorationToSelection.js',
    updateFormatButtons: './formatting/updateFormatButtons.js',
    toggleBgColorDropdown: './formatting/toggleBgColorDropdown.js',
    toggleTextColorDropdown: './formatting/toggleTextColorDropdown.js',
    selectBgColor: './formatting/selectBgColor.js',
    selectTextColor: './formatting/selectTextColor.js',
    applyBackgroundColorFromContext: './formatting/applyBackgroundColorFromContext.js',
    applyTextColorFromContext: './formatting/applyTextColorFromContext.js',
    resetFormatFromContext: './formatting/resetFormatFromContext.js',
    applyTextFontSize: './formatting/applyTextFontSize.js',
    selectTextMenuTextColor: './formatting/selectTextMenuTextColor.js',
    selectTextMenuBgColor: './formatting/selectTextMenuBgColor.js',
    toggleTextMenuTextColorDropdown: './formatting/toggleTextMenuTextColorDropdown.js',
    toggleTextMenuBgColorDropdown: './formatting/toggleTextMenuBgColorDropdown.js',

    // Text
    showTextFormatMenu: './text/showTextFormatMenu.js',
    hideTextFormatMenu: './text/hideTextFormatMenu.js',
    selectParentTag: './text/selectParentTag.js',
    clearTextFormat: './text/clearTextFormat.js',
    createTableFromMenu: './text/createTableFromMenu.js',
    pasteAsPlainText: './text/pasteAsPlainText.js',

    // Resize
    addResizeHandles: './resize/addResizeHandles.js',
    startResize: './resize/startResize.js',
    handleResize: './resize/handleResize.js',
    stopResize: './resize/stopResize.js',
    initializeResizeHandles: './resize/initializeResizeHandles.js',

    // Drag
    addRowDragHandle: './drag/addRowDragHandle.js',
    addColumnDragHandle: './drag/addColumnDragHandle.js',

    // Mode
    toggleMode: './mode/toggleMode.js',

    // Undo
    initializeUndoSystem: './undo/initializeUndoSystem.js',
    saveUndoStackToStorage: './undo/saveUndoStackToStorage.js',
    captureSnapshot: './undo/captureSnapshot.js',
    normalizeHtmlForComparison: './undo/normalizeHtmlForComparison.js',
    startSnapshotTimer: './undo/startSnapshotTimer.js',
    stopSnapshotTimer: './undo/stopSnapshotTimer.js',
    restoreSnapshot: './undo/restoreSnapshot.js',
    reinitializeAfterRestore: './undo/reinitializeAfterRestore.js',
    undo: './undo/undo.js',
    redo: './undo/redo.js'
};

// Get relative path from one file to another
function getRelativePath(fromFile, toFile) {
    const fromDir = path.dirname(fromFile);
    const relative = path.relative(fromDir, toFile);
    return relative.startsWith('.') ? relative : './' + relative;
}

// Process a single file
function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Find which functions are called in this file
    const calledFunctions = new Set();
    const currentFunctionName = path.basename(filePath, '.js');

    Object.keys(functionMap).forEach(funcName => {
        // Don't import the function from its own file
        if (funcName === currentFunctionName) return;

        // Check if this function is called (with parentheses)
        const regex = new RegExp(`\\b${funcName}\\s*\\(`, 'g');
        if (regex.test(content)) {
            calledFunctions.add(funcName);
        }
    });

    if (calledFunctions.size === 0) {
        return; // No imports needed
    }

    // Build import statements
    const imports = {};
    calledFunctions.forEach(funcName => {
        const funcPath = functionMap[funcName];
        const relativePath = getRelativePath(filePath, path.join(__dirname, 'src', funcPath));

        if (!imports[relativePath]) {
            imports[relativePath] = [];
        }
        imports[relativePath].push(funcName);
    });

    // Generate import lines
    const importLines = Object.entries(imports).map(([importPath, functions]) => {
        return `import { ${functions.join(', ')} } from '${importPath}';`;
    }).join('\n');

    // Check if file already has these imports
    const existingImportRegex = /^import\s+{[^}]+}\s+from\s+['"][^'"]+['"];?\s*$/gm;
    const existingImports = content.match(existingImportRegex) || [];

    // Find where to insert imports (after existing imports or at the start)
    let insertIndex = 0;
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
            insertIndex = i + 1;
        } else if (lines[i].trim() && !lines[i].startsWith('//') && !lines[i].startsWith('import ')) {
            break;
        }
    }

    // Insert new imports
    const importLinesList = importLines.split('\n');
    lines.splice(insertIndex, 0, ...importLinesList);

    const newContent = lines.join('\n');
    fs.writeFileSync(filePath, newContent, 'utf-8');

    console.log(`Updated: ${filePath} (added ${calledFunctions.size} imports)`);
}

// Process all files in src directory
function processAllFiles(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Skip main.js, state, and events directories
            if (entry.name !== 'events' && entry.name !== 'state') {
                processAllFiles(fullPath);
            }
        } else if (entry.isFile() && entry.name.endsWith('.js') && entry.name !== 'main.js') {
            processFile(fullPath);
        }
    }
}

console.log('Fixing imports in all module files...\n');
processAllFiles(path.join(__dirname, 'src'));
console.log('\nDone!');
