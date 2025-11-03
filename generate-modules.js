// Script to automatically split document-editor.js into separate function files
const fs = require('fs');
const path = require('path');

const sourceFile = './document-editor.js';
const source = fs.readFileSync(sourceFile, 'utf-8');

// Function categories and their directory mappings
const categories = {
    undo: [
        'initializeUndoSystem', 'saveUndoStackToStorage', 'captureSnapshot',
        'normalizeHtmlForComparison', 'startSnapshotTimer', 'stopSnapshotTimer',
        'restoreSnapshot', 'reinitializeAfterRestore', 'undo', 'redo'
    ],
    selection: [
        'selectCell', 'clearSelection', 'startMouseSelection',
        'handleMouseOverCell', 'stopMouseSelection', 'navigateToCell',
        'extendSelection', 'selectRange'
    ],
    edit: ['enterEditMode', 'exitEditMode'],
    table: [
        'addRow', 'addColumn', 'removeRow', 'removeColumn',
        'getTableColumnCount', 'getCellsNeededForRow', 'addRowAbove', 'addRowBelow',
        'getColumnPosition', 'addColumnLeft', 'addColumnRight',
        'deleteSelectedRow', 'deleteSelectedColumn', 'moveRowUp', 'moveRowDown',
        'sortColumnAZ', 'sortColumnZA', 'sortColumn', 'splitTable',
        'deleteTable', 'deleteTableFromContext', 'toggleTableHeaders'
    ],
    cells: [
        'deleteCell', 'mergeSelectedCells', 'areSelectedCellsAdjacent',
        'splitSelectedCell', 'toggleCellInvisible', 'toggleVerticalText'
    ],
    formatting: [
        'updateFormatControls', 'rgbToHex', 'applyAlignmentFromContext',
        'applyVerticalAlignmentFromContext', 'applyFontSizeFromContext',
        'toggleBold', 'toggleItalic', 'toggleUnderline', 'toggleStrikethrough',
        'applyStyleToSelection', 'applyTextDecorationToSelection',
        'updateFormatButtons', 'toggleBgColorDropdown', 'toggleTextColorDropdown',
        'selectBgColor', 'selectTextColor', 'applyBackgroundColorFromContext',
        'applyTextColorFromContext', 'resetFormatFromContext', 'applyTextFontSize',
        'selectTextMenuTextColor', 'selectTextMenuBgColor',
        'toggleTextMenuTextColorDropdown', 'toggleTextMenuBgColorDropdown'
    ],
    text: [
        'showTextFormatMenu', 'hideTextFormatMenu', 'selectParentTag',
        'clearTextFormat', 'createTableFromMenu', 'pasteAsPlainText'
    ],
    menus: ['showContextMenu', 'hideContextMenu', 'clearSelectionFromContext'],
    resize: [
        'addResizeHandles', 'startResize', 'handleResize',
        'stopResize', 'initializeResizeHandles'
    ],
    drag: ['addRowDragHandle', 'addColumnDragHandle'],
    mode: ['toggleMode']
};

// Extract function from source
function extractFunction(functionName) {
    // Match function declaration
    const regex = new RegExp(
        `function\\s+${functionName}\\s*\\([^)]*\\)\\s*\\{`,
        'g'
    );

    const match = regex.exec(source);
    if (!match) {
        console.log(`Function ${functionName} not found`);
        return null;
    }

    const startIndex = match.index;
    let braceCount = 0;
    let inFunction = false;
    let endIndex = startIndex;

    for (let i = startIndex; i < source.length; i++) {
        const char = source[i];

        if (char === '{') {
            braceCount++;
            inFunction = true;
        } else if (char === '}') {
            braceCount--;
            if (inFunction && braceCount === 0) {
                endIndex = i + 1;
                break;
            }
        }
    }

    return source.substring(startIndex, endIndex);
}

// Generate imports for a function
function generateImports(functionBody) {
    const imports = new Set();

    // Check for state variable usage
    const stateVars = [
        'selectedCells', 'currentCell', 'anchorCell', 'isEditMode',
        'isMouseSelecting', 'selectionStartCell', 'contextMenuTarget',
        'isResizing', 'savedSelection', 'isInputFocused', 'menuHideTimeout',
        'undoStack', 'redoStack', 'lastSnapshot', 'isUndoRedoInProgress',
        'snapshotIntervalId', 'isDesignMode', 'draggedRow', 'draggedColumn',
        'currentBgColor', 'currentTextColor', 'newCellCounter',
        'resizeType', 'resizeTarget', 'startX', 'startY', 'startWidth', 'startHeight',
        'resizeLine', 'SNAPSHOT_INTERVAL_MS', 'MAX_UNDO_STATES',
        'selectedRow', 'selectedColumn', 'currentTextMenuTextColor', 'currentTextMenuBgColor'
    ];

    stateVars.forEach(varName => {
        if (functionBody.includes(varName)) {
            imports.add(varName);
        }
    });

    return imports;
}

// Create function file
function createFunctionFile(category, functionName) {
    const functionBody = extractFunction(functionName);
    if (!functionBody) return;

    const imports = generateImports(functionBody);
    const importStatements = [];

    if (imports.size > 0) {
        importStatements.push(
            `import { ${Array.from(imports).join(', ')} } from '../state/variables.js';`
        );
    }

    const content = `${importStatements.join('\n')}\n\nexport ${functionBody}\n`;

    const filePath = path.join(__dirname, 'src', category, `${functionName}.js`);
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Created: ${filePath}`);
}

// Generate all function files
Object.entries(categories).forEach(([category, functions]) => {
    functions.forEach(functionName => {
        createFunctionFile(category, functionName);
    });
});

console.log('Done generating function files!');
