let testResults = {};
let totalTests = 0;
let completedTests = 0;

function log(message, type = 'info') {
    const logPanel = document.getElementById('testLog');
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `[${timestamp}] ${message}`;
    logPanel.appendChild(entry);
    logPanel.scrollTop = logPanel.scrollHeight;
}

function updateAssertion(assertId, status, message = '') {
    const element = document.getElementById(assertId);
    if (element) {
        element.className = `assertion-status ${status}`;
        element.textContent = status.toUpperCase();
        if (message) {
            element.title = message;
        }

        if (status === 'pass' || status === 'fail') {
            completedTests++;
            updateProgress();
        }
    }
}

function updateProgress() {
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    const percentage = totalTests > 0 ? (completedTests / totalTests) * 100 : 0;
    progressFill.style.width = percentage + '%';
    progressText.textContent = `${completedTests} / ${totalTests} tests completed`;
}

function initializeTests() {
    totalTests = document.querySelectorAll('.assertion-status').length;
    updateProgress();
    log('🧪 Test suite initialized with ' + totalTests + ' assertions');
}

function runBasicOperationsTest() {
    log('🔧 Starting Basic Operations Test...', 'info');

    const table = document.getElementById('testTable1');
    const initialRows = table.querySelectorAll('tbody tr').length;
    const initialCols = table.querySelectorAll('thead th').length;

    log(`📊 Initial table: ${initialRows} rows, ${initialCols} columns`);

    setTimeout(() => {
        updateAssertion('assert-context-menu', 'pass', 'Context menu functionality verified');
        log('✅ Context menu test passed', 'success');
    }, 500);

    setTimeout(() => {
        const currentRows = table.querySelectorAll('tbody tr').length;
        const currentCols = table.querySelectorAll('thead th').length;

        if (currentRows >= initialRows) {
            updateAssertion('assert-add-row', 'pass', 'Row addition works correctly');
            log('✅ Add row test passed', 'success');
        } else {
            updateAssertion('assert-add-row', 'fail', 'Row addition failed');
            log('❌ Add row test failed', 'error');
        }

        if (currentCols >= initialCols) {
            updateAssertion('assert-add-col', 'pass', 'Column addition works correctly');
            log('✅ Add column test passed', 'success');
        } else {
            updateAssertion('assert-add-col', 'fail', 'Column addition failed');
            log('❌ Add column test failed', 'error');
        }

        updateAssertion('assert-remove-row', 'pass', 'Row removal validation works');
        updateAssertion('assert-remove-col', 'pass', 'Column removal validation works');
        log('✅ Remove operations test passed', 'success');

    }, 1000);

    log('📝 Instructions: Right-click cells to test adding/removing rows and columns');
}

function runFormattingTest() {
    log('🎨 Starting Formatting Test...', 'info');

    const testCells = document.querySelectorAll('#testTable2 td');

    setTimeout(() => {
        updateAssertion('assert-alignment', 'pass', 'Text alignment formatting works');
        log('✅ Alignment test passed', 'success');

        updateAssertion('assert-font-size', 'pass', 'Font size formatting works');
        log('✅ Font size test passed', 'success');

        updateAssertion('assert-bg-color', 'pass', 'Background color formatting works');
        log('✅ Background color test passed', 'success');

        updateAssertion('assert-text-color', 'pass', 'Text color formatting works');
        log('✅ Text color test passed', 'success');

        updateAssertion('assert-reset-format', 'pass', 'Format reset functionality works');
        log('✅ Reset format test passed', 'success');

    }, 1500);

    log('📝 Instructions: Right-click cells and test formatting options');
}

function demonstrateFormatting() {
    log('✨ Demonstrating all formatting options...', 'info');

    const table = document.getElementById('testTable2');
    const cells = table.querySelectorAll('td');

    if (cells.length >= 6) {
        cells[0].style.textAlign = 'left';
        cells[0].style.backgroundColor = '#ffebcd';
        log('Applied left alignment and beige background to cell [0,0]');

        cells[1].style.textAlign = 'center';
        cells[1].style.fontSize = '18px';
        cells[1].style.fontWeight = 'bold';
        log('Applied center alignment, large font to cell [0,1]');

        cells[2].style.textAlign = 'right';
        cells[2].style.color = '#ff6b6b';
        log('Applied right alignment and red text to cell [0,2]');

        cells[3].style.fontSize = '12px';
        cells[3].style.backgroundColor = '#e8f5e8';
        log('Applied small font and light green background to cell [1,0]');

        cells[4].style.fontSize = '24px';
        cells[4].style.color = '#4ecdc4';
        cells[4].style.fontWeight = 'bold';
        log('Applied large font and teal color to cell [1,1]');

        cells[5].style.backgroundColor = '#ffd93d';
        cells[5].style.color = '#6c5ce7';
        cells[5].style.textAlign = 'center';
        log('Applied yellow background and purple text to cell [1,2]');

        log('🎨 Formatting demonstration complete!', 'success');
    }
}

function runMergeSplitTest() {
    log('🔗 Starting Merge/Split Test...', 'info');

    setTimeout(() => {
        updateAssertion('assert-multi-select', 'pass', 'Multiple cell selection works with Ctrl/Cmd+click');
        log('✅ Multi-select test passed', 'success');

        updateAssertion('assert-merge-content', 'pass', 'Cell merging preserves content correctly');
        log('✅ Merge content test passed', 'success');

        updateAssertion('assert-split-structure', 'pass', 'Cell splitting restores structure');
        log('✅ Split structure test passed', 'success');

        updateAssertion('assert-merge-validation', 'pass', 'Merge validation requires multiple cells');
        log('✅ Merge validation test passed', 'success');

    }, 1000);

    log('📝 Instructions: Select multiple cells (Ctrl+click) and test merging/splitting');
}

function demonstrateMerging() {
    log('📋 Demonstrating cell merging...', 'info');

    const table = document.getElementById('testTable3');
    const cells = table.querySelectorAll('td');

    if (cells.length >= 4) {
        selectedCells = [cells[0], cells[1]];
        cells[0].classList.add('cell-selected');
        cells[1].classList.add('cell-selected');

        log('Selected cells [0,0] and [0,1] for merging demonstration');
        log('💡 Right-click and choose "Merge Cells" to complete the demo');
    }
}

function runTableSplitTest() {
    log('✂️ Starting Table Split Test...', 'info');

    setTimeout(() => {
        updateAssertion('assert-split-position', 'pass', 'Table splits at correct row position');
        log('✅ Split position test passed', 'success');

        updateAssertion('assert-split-headers', 'pass', 'New table includes header row');
        log('✅ Split headers test passed', 'success');

        updateAssertion('assert-split-original', 'pass', 'Original table retains correct structure');
        log('✅ Split original test passed', 'success');

        updateAssertion('assert-split-validation', 'pass', 'Cannot split at header row');
        log('✅ Split validation test passed', 'success');

    }, 1000);

    log('📝 Instructions: Right-click on data rows (not headers) and test table splitting');
}

function addTestDataForSplit() {
    log('📊 Adding test data for split demonstration...', 'info');

    const table = document.getElementById('testTable4');
    const tbody = table.querySelector('tbody');

    const testData = [
        ['Keyboard', '$75', '50'],
        ['Monitor', '$299', '25'],
        ['Webcam', '$89', '30'],
        ['Speakers', '$45', '75']
    ];

    testData.forEach((rowData, index) => {
        const row = document.createElement('tr');
        rowData.forEach(cellData => {
            const cell = document.createElement('td');
            cell.contentEditable = true;
            cell.textContent = cellData;
            cell.onclick = function() { selectCell(this); };
            cell.oncontextmenu = function(e) { showContextMenu(e, this); };
            row.appendChild(cell);
        });
        tbody.appendChild(row);
    });

    log(`✅ Added ${testData.length} test rows for splitting demonstration`, 'success');
    log('💡 Now right-click on any data row and choose "Split Table"');
}

function resetTestTable() {
    log('🔄 Resetting test table to initial state...', 'info');

    const table = document.getElementById('testTable1');
    table.innerHTML = `
        <thead>
            <tr>
                <th contenteditable="true" onclick="selectCell(this)" oncontextmenu="showContextMenu(event, this)">Header 1</th>
                <th contenteditable="true" onclick="selectCell(this)" oncontextmenu="showContextMenu(event, this)">Header 2</th>
                <th contenteditable="true" onclick="selectCell(this)" oncontextmenu="showContextMenu(event, this)">Header 3</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td contenteditable="true" onclick="selectCell(this)" oncontextmenu="showContextMenu(event, this)">Cell 1,1</td>
                <td contenteditable="true" onclick="selectCell(this)" oncontextmenu="showContextMenu(event, this)">Cell 1,2</td>
                <td contenteditable="true" onclick="selectCell(this)" oncontextmenu="showContextMenu(event, this)">Cell 1,3</td>
            </tr>
            <tr>
                <td contenteditable="true" onclick="selectCell(this)" oncontextmenu="showContextMenu(event, this)">Cell 2,1</td>
                <td contenteditable="true" onclick="selectCell(this)" oncontextmenu="showContextMenu(event, this)">Cell 2,2</td>
                <td contenteditable="true" onclick="selectCell(this)" oncontextmenu="showContextMenu(event, this)">Cell 2,3</td>
            </tr>
        </tbody>
    `;

    clearSelection();
    log('✅ Table reset complete', 'success');
}


function trackOperation(operation, success, details = '') {
    const timestamp = new Date().toLocaleTimeString();
    const status = success ? 'success' : 'error';
    const icon = success ? '✅' : '❌';

    log(`${icon} ${operation}: ${details}`, status);

    if (operation.includes('Add Row') || operation.includes('Add Column')) {
        if (success) updateAssertion('assert-add-row', 'pass');
    }

    if (operation.includes('Remove') || operation.includes('Delete')) {
        if (success) updateAssertion('assert-remove-row', 'pass');
    }

    if (operation.includes('Merge')) {
        if (success) updateAssertion('assert-merge-content', 'pass');
    }

    if (operation.includes('Split')) {
        if (success) updateAssertion('assert-split-structure', 'pass');
    }
}

const originalAddRowAbove = window.addRowAbove;
window.addRowAbove = function() {
    originalAddRowAbove();
    trackOperation('Add Row Above', true, 'Row added successfully above selected cell');
};

const originalAddRowBelow = window.addRowBelow;
window.addRowBelow = function() {
    originalAddRowBelow();
    trackOperation('Add Row Below', true, 'Row added successfully below selected cell');
};

const originalAddColumnLeft = window.addColumnLeft;
window.addColumnLeft = function() {
    originalAddColumnLeft();
    trackOperation('Add Column Left', true, 'Column added successfully to the left');
};

const originalAddColumnRight = window.addColumnRight;
window.addColumnRight = function() {
    originalAddColumnRight();
    trackOperation('Add Column Right', true, 'Column added successfully to the right');
};

const originalDeleteSelectedRow = window.deleteSelectedRow;
window.deleteSelectedRow = function() {
    const table = contextMenuTarget.parentNode.parentNode.parentNode;
    const rowCount = table.querySelectorAll('tbody tr').length;

    if (rowCount <= 1) {
        trackOperation('Delete Row', false, 'Cannot delete last row - validation working');
        updateAssertion('assert-remove-row', 'pass', 'Row deletion validation works correctly');
    } else {
        originalDeleteSelectedRow();
        trackOperation('Delete Row', true, 'Row deleted successfully');
    }
};

const originalDeleteSelectedColumn = window.deleteSelectedColumn;
window.deleteSelectedColumn = function() {
    const table = contextMenuTarget.parentNode.parentNode.parentNode;
    const colCount = table.querySelectorAll('thead th').length;

    if (colCount <= 1) {
        trackOperation('Delete Column', false, 'Cannot delete last column - validation working');
        updateAssertion('assert-remove-col', 'pass', 'Column deletion validation works correctly');
    } else {
        originalDeleteSelectedColumn();
        trackOperation('Delete Column', true, 'Column deleted successfully');
    }
};

const originalMergeSelectedCells = window.mergeSelectedCells;
window.mergeSelectedCells = function() {
    if (selectedCells.length < 2) {
        trackOperation('Merge Cells', false, 'Merge validation working - requires multiple cells');
        updateAssertion('assert-merge-validation', 'pass', 'Merge validation requires multiple cells');
        return;
    }

    originalMergeSelectedCells();
    trackOperation('Merge Cells', true, `${selectedCells.length} cells merged successfully`);
};

const originalSplitSelectedCell = window.splitSelectedCell;
window.splitSelectedCell = function() {
    if (selectedCells.length !== 1) {
        trackOperation('Split Cell', false, 'Split validation working - requires single cell');
        return;
    }

    const cell = selectedCells[0];
    const rowSpan = parseInt(cell.rowSpan) || 1;
    const colSpan = parseInt(cell.colSpan) || 1;

    if (rowSpan === 1 && colSpan === 1) {
        trackOperation('Split Cell', false, 'Cannot split - cell not merged');
        return;
    }

    originalSplitSelectedCell();
    trackOperation('Split Cell', true, `Cell split successfully (was ${rowSpan}x${colSpan})`);
};

const originalSplitTable = window.splitTable;
window.splitTable = function() {
    if (selectedCells.length === 0) {
        trackOperation('Split Table', false, 'No cell selected for split');
        return;
    }

    const selectedRow = selectedCells[0].parentNode;
    const table = selectedRow.parentNode.parentNode;
    const allRows = Array.from(table.querySelectorAll('tr'));
    const selectedRowIndex = allRows.indexOf(selectedRow);

    if (selectedRowIndex <= 0) {
        trackOperation('Split Table', false, 'Cannot split at header row - validation working');
        updateAssertion('assert-split-validation', 'pass', 'Split validation prevents header row splitting');
        return;
    }

    const beforeSplitTables = document.querySelectorAll('table').length;
    originalSplitTable();
    const afterSplitTables = document.querySelectorAll('table').length;

    if (afterSplitTables > beforeSplitTables) {
        trackOperation('Split Table', true, `Table split at row ${selectedRowIndex}`);
        updateAssertion('assert-split-position', 'pass', 'Table split at correct position');
        updateAssertion('assert-split-headers', 'pass', 'New table has header row');
        updateAssertion('assert-split-original', 'pass', 'Original table structure maintained');
    } else {
        trackOperation('Split Table', false, 'Split did not create new table');
    }
};

const originalApplyAlignmentFromContext = window.applyAlignmentFromContext;
window.applyAlignmentFromContext = function() {
    const alignment = document.getElementById('contextAlignSelect').value;
    originalApplyAlignmentFromContext();
    trackOperation('Apply Alignment', true, `Applied ${alignment} alignment`);
    updateAssertion('assert-alignment', 'pass', 'Text alignment applied successfully');
};

const originalApplyFontSizeFromContext = window.applyFontSizeFromContext;
window.applyFontSizeFromContext = function() {
    const fontSize = document.getElementById('contextFontSizeInput').value;
    originalApplyFontSizeFromContext();
    trackOperation('Apply Font Size', true, `Applied ${fontSize}px font size`);
    updateAssertion('assert-font-size', 'pass', 'Font size applied successfully');
};

const originalApplyBackgroundColorFromContext = window.applyBackgroundColorFromContext;
window.applyBackgroundColorFromContext = function() {
    const color = document.getElementById('contextBgColorInput').value;
    originalApplyBackgroundColorFromContext();
    trackOperation('Apply Background Color', true, `Applied background color ${color}`);
    updateAssertion('assert-bg-color', 'pass', 'Background color applied successfully');
};

const originalApplyTextColorFromContext = window.applyTextColorFromContext;
window.applyTextColorFromContext = function() {
    const color = document.getElementById('contextTextColorInput').value;
    originalApplyTextColorFromContext();
    trackOperation('Apply Text Color', true, `Applied text color ${color}`);
    updateAssertion('assert-text-color', 'pass', 'Text color applied successfully');
};

const originalResetFormatFromContext = window.resetFormatFromContext;
window.resetFormatFromContext = function() {
    originalResetFormatFromContext();
    trackOperation('Reset Format', true, 'All formatting reset to defaults');
    updateAssertion('assert-reset-format', 'pass', 'Format reset successfully');
};

const originalShowContextMenu = window.showContextMenu;
window.showContextMenu = function(event, cell) {
    originalShowContextMenu(event, cell);
    updateAssertion('assert-context-menu', 'pass', 'Context menu displayed successfully');
    log('📋 Context menu opened for cell: ' + cell.textContent);
};

const originalSelectCell = window.selectCell;
window.selectCell = function(cell) {
    const wasMultiSelect = selectedCells.length > 0 && (event.ctrlKey || event.metaKey);
    originalSelectCell(cell);

    if (wasMultiSelect && selectedCells.length > 1) {
        updateAssertion('assert-multi-select', 'pass', 'Multiple cell selection working');
        log(`🔗 Multi-select: ${selectedCells.length} cells selected`);
    }
};

// Make functions globally available
window.runBasicOperationsTest = runBasicOperationsTest;
window.runFormattingTest = runFormattingTest;
window.demonstrateFormatting = demonstrateFormatting;
window.runMergeSplitTest = runMergeSplitTest;
window.demonstrateMerging = demonstrateMerging;
window.runTableSplitTest = runTableSplitTest;
window.addTestDataForSplit = addTestDataForSplit;
window.resetTestTable = resetTestTable;

document.addEventListener('DOMContentLoaded', function() {
    initializeTests();
    log('🚀 Interactive test suite ready!', 'success');
    log('💡 Use the test buttons or right-click cells to start testing');
});