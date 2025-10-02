let selectedCells = [];
let selectedRow = null;
let selectedColumn = null;
let contextMenuTarget = null;
let currentCell = null; // Currently focused cell for keyboard navigation
let anchorCell = null; // Starting cell for range selection
let isEditMode = false; // Track if we're in edit mode

// Mouse drag selection variables
let isMouseSelecting = false;
let selectionStartCell = null;

// Resize functionality variables
let isResizing = false;
let resizeType = null; // 'col', 'row', or 'corner'
let resizeTarget = null;
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let resizeLine = null;

document.addEventListener('click', function(e) {
    if (!e.target.closest('.context-menu')) {
        hideContextMenu();
    }

    // Don't clear selection when clicking away - only clear via context menu
});

// Handle contenteditable focus events to detect edit mode
document.addEventListener('focusin', function(e) {
    const cell = e.target.closest('td, th');
    if (cell && (cell.tagName === 'TD' || cell.tagName === 'TH')) {
        // If cell gets focus and we're not in navigation mode, we might be in edit mode
        if (!isEditMode && currentCell === cell && window.getSelection().toString()) {
            isEditMode = true;
            cell.classList.add('editing-mode');
        }
    }
});

// Keyboard navigation and edit mode
document.addEventListener('keydown', function(e) {
    if (!currentCell) return;

    // If in edit mode, only handle Escape
    if (isEditMode) {
        if (e.key === 'Escape') {
            exitEditMode();
            e.preventDefault();
        }
        return;
    }

    // Keyboard navigation
    switch(e.key) {
        case 'Escape':
            // Clear selection when not in edit mode
            clearSelection();
            e.preventDefault();
            break;
        case 'ArrowUp':
            if (e.shiftKey) {
                extendSelection('up');
            } else {
                navigateToCell('up');
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (e.shiftKey) {
                extendSelection('down');
            } else {
                navigateToCell('down');
            }
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (e.shiftKey) {
                extendSelection('left');
            } else {
                navigateToCell('left');
            }
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (e.shiftKey) {
                extendSelection('right');
            } else {
                navigateToCell('right');
            }
            e.preventDefault();
            break;
        case 'Enter':
            enterEditMode();
            e.preventDefault();
            break;
    }
});

function selectCell(cell, event = null) {
    // Don't interfere if we're resizing
    if (isResizing) return;

    // Check if this is a right-click (context menu) - preserve selection if cell is already selected
    if (event && event.button === 2) {
        if (selectedCells.includes(cell)) {
            // Cell is already selected, don't change selection
            return;
        }
    }

    // Handle mousedown events
    if (event && event.type === 'mousedown' && event.button === 0) {
        event.preventDefault();

        // Check if this is a Shift+click to select range
        if (event.shiftKey && anchorCell) {
            selectRange(anchorCell, cell);
            currentCell = cell;
            cell.tabIndex = 0;
            cell.focus();
            updateFormatControls(cell);
            return;
        }

        // Otherwise, start drag selection (for normal click without Shift)
        if (!event.ctrlKey && !event.metaKey) {
            startMouseSelection(cell);
            return;
        }
    }

    // Handle Ctrl/Cmd+click for multi-select
    if (!event || (!event.ctrlKey && !event.metaKey)) {
        clearSelection();
    }

    cell.classList.add('cell-selected');
    if (!selectedCells.includes(cell)) {
        selectedCells.push(cell);
    }

    // Set as current cell for keyboard navigation
    currentCell = cell;
    anchorCell = cell; // Set anchor for range selection
    cell.tabIndex = 0; // Make it focusable
    cell.focus();

    updateFormatControls(cell);
}

function clearSelection() {
    selectedCells.forEach(cell => {
        cell.classList.remove('cell-selected');
        cell.removeAttribute('tabIndex'); // Remove tab focus
    });
    selectedCells = [];

    document.querySelectorAll('.row-selected').forEach(row => {
        row.classList.remove('row-selected');
    });

    document.querySelectorAll('.col-selected').forEach(cell => {
        cell.classList.remove('col-selected');
    });

    selectedRow = null;
    selectedColumn = null;
    currentCell = null;
    anchorCell = null;
}

// Mouse drag selection functions
function startMouseSelection(cell) {
    if (isResizing) return;

    isMouseSelecting = true;
    selectionStartCell = cell;

    clearSelection();

    // Set anchor AFTER clearing selection
    anchorCell = cell;

    cell.classList.add('cell-selected');
    selectedCells.push(cell);
    currentCell = cell;

    // Add event listeners for drag selection
    document.addEventListener('mouseover', handleMouseOverCell);
    document.addEventListener('mouseup', stopMouseSelection);

    updateFormatControls(cell);
}

function handleMouseOverCell(e) {
    if (!isMouseSelecting) return;

    const cell = e.target.closest('td, th');
    if (!cell || !selectionStartCell) return;

    // Check if the cell is in the same table
    if (cell.closest('table') !== selectionStartCell.closest('table')) return;

    // Select range from start to current cell
    selectRange(selectionStartCell, cell);
    currentCell = cell;
}

function stopMouseSelection() {
    if (!isMouseSelecting) return;

    isMouseSelecting = false;

    document.removeEventListener('mouseover', handleMouseOverCell);
    document.removeEventListener('mouseup', stopMouseSelection);

    // Set focus to the current cell for keyboard navigation
    if (currentCell) {
        currentCell.tabIndex = 0;
        currentCell.focus();
    }
}

// Navigation functions
function navigateToCell(direction) {
    if (!currentCell) return;

    const table = document.getElementById('mainTable');
    const rows = Array.from(table.querySelectorAll('tr'));
    const currentRow = currentCell.parentNode;
    const currentRowIndex = rows.indexOf(currentRow);
    const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell);

    let newCell = null;

    switch(direction) {
        case 'up':
            if (currentRowIndex > 0) {
                const targetRow = rows[currentRowIndex - 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'down':
            if (currentRowIndex < rows.length - 1) {
                const targetRow = rows[currentRowIndex + 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'left':
            if (currentCellIndex > 0) {
                newCell = currentRow.children[currentCellIndex - 1];
            }
            break;
        case 'right':
            if (currentCellIndex < currentRow.children.length - 1) {
                newCell = currentRow.children[currentCellIndex + 1];
            }
            break;
    }

    if (newCell) {
        selectCell(newCell);
    }
}

// Extended selection function for Shift+arrow keys
function extendSelection(direction) {
    if (!currentCell) return;

    const table = document.getElementById('mainTable');
    const rows = Array.from(table.querySelectorAll('tr'));
    const currentRow = currentCell.parentNode;
    const currentRowIndex = rows.indexOf(currentRow);
    const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell);

    let newCell = null;

    switch(direction) {
        case 'up':
            if (currentRowIndex > 0) {
                const targetRow = rows[currentRowIndex - 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'down':
            if (currentRowIndex < rows.length - 1) {
                const targetRow = rows[currentRowIndex + 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'left':
            if (currentCellIndex > 0) {
                newCell = currentRow.children[currentCellIndex - 1];
            }
            break;
        case 'right':
            if (currentCellIndex < currentRow.children.length - 1) {
                newCell = currentRow.children[currentCellIndex + 1];
            }
            break;
    }

    if (newCell) {
        // Update current cell
        currentCell = newCell;
        newCell.tabIndex = 0;
        newCell.focus();

        // Select range from anchor to new cell
        selectRange(anchorCell, newCell);
    }
}

// Select a range of cells from start to end
function selectRange(startCell, endCell) {
    if (!startCell || !endCell) return;

    const table = document.getElementById('mainTable');
    const rows = Array.from(table.querySelectorAll('tr'));

    const startRow = startCell.parentNode;
    const endRow = endCell.parentNode;
    const startRowIndex = rows.indexOf(startRow);
    const endRowIndex = rows.indexOf(endRow);
    const startCellIndex = Array.from(startRow.children).indexOf(startCell);
    const endCellIndex = Array.from(endRow.children).indexOf(endCell);

    // Clear current selection
    clearSelection();

    // Determine the range bounds
    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startCellIndex, endCellIndex);
    const maxCol = Math.max(startCellIndex, endCellIndex);

    // Select all cells in the range
    for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
        const row = rows[rowIndex];
        for (let colIndex = minCol; colIndex <= maxCol && colIndex < row.children.length; colIndex++) {
            const cell = row.children[colIndex];
            cell.classList.add('cell-selected');
            if (!selectedCells.includes(cell)) {
                selectedCells.push(cell);
            }
        }
    }

    // Restore anchor and current cell
    anchorCell = startCell;
    currentCell = endCell;
}

// Edit mode functions
function enterEditMode() {
    if (!currentCell || isEditMode) return;

    isEditMode = true;

    // Add a specific class to indicate edit mode
    currentCell.classList.add('editing-mode');
    currentCell.focus();

    // Select all text in the cell
    const range = document.createRange();
    range.selectNodeContents(currentCell);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function exitEditMode() {
    if (!isEditMode || !currentCell) return;

    isEditMode = false;

    // Remove edit mode class
    currentCell.classList.remove('editing-mode');

    // Clear text selection and refocus cell for navigation
    window.getSelection().removeAllRanges();

    // Force blur and refocus to ensure we're back in navigation mode
    currentCell.blur();
    setTimeout(() => {
        if (currentCell) {
            currentCell.focus();
        }
    }, 10);
}

function updateFormatControls(cell) {
    const computedStyle = window.getComputedStyle(cell);

    document.getElementById('contextAlignSelect').value = computedStyle.textAlign || 'left';
    document.getElementById('contextFontSizeInput').value = parseInt(computedStyle.fontSize) || 14;

    // Update background color picker
    const bgColor = computedStyle.backgroundColor;
    const bgColorHex = rgbToHex(bgColor);

    // Define color map for background
    const bgColorMap = {
        '#000000': 'Black',
        '#ffffff': 'White',
        '#4ac6e9': 'Light Blue',
        '#008aba': 'Blue',
        '#90639d': 'Light Purple',
        '#722a81': 'Purple',
        '#f26649': 'Orange',
        'yellow': 'Yellow',
        '#ffff00': 'Yellow' // Alternative hex for yellow
    };

    const bgLabel = bgColorMap[bgColorHex.toLowerCase()] || bgColorMap[bgColor] || 'None';
    const bgColorValue = bgColorMap[bgColorHex.toLowerCase()] || bgColorMap[bgColor] ? (bgColor === 'yellow' ? 'yellow' : bgColorHex) : '';

    currentBgColor = bgColorValue;
    document.getElementById('bgColorPreview').style.backgroundColor = bgColorValue || 'transparent';
    document.getElementById('bgColorLabel').textContent = bgLabel;

    // Update text color picker
    const textColor = computedStyle.color;
    const textColorHex = rgbToHex(textColor);

    // Define color map for text
    const textColorMap = {
        '#000000': 'Black',
        '#ffffff': 'White',
        '#4ac6e9': 'Light Blue',
        '#008aba': 'Blue',
        '#90639d': 'Light Purple',
        '#722a81': 'Purple',
        '#f26649': 'Orange',
        'yellow': 'Yellow',
        '#ffff00': 'Yellow' // Alternative hex for yellow
    };

    const textLabel = textColorMap[textColorHex.toLowerCase()] || textColorMap[textColor] || 'Black';
    const textColorValue = textColorMap[textColorHex.toLowerCase()] || textColorMap[textColor] ? (textColor === 'yellow' ? 'yellow' : textColorHex) : '#000000';

    currentTextColor = textColorValue;
    document.getElementById('textColorPreview').style.backgroundColor = textColorValue;
    document.getElementById('textColorLabel').textContent = textLabel;
}

function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';

    return '#' + result.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function addRow() {
    const table = document.getElementById('mainTable');
    const tbody = table.querySelector('tbody');
    const headerCount = table.querySelector('thead tr').children.length;

    const newRow = document.createElement('tr');

    for (let i = 0; i < headerCount; i++) {
        const cell = document.createElement('td');
        cell.contentEditable = true;
        cell.textContent = `New Cell ${tbody.children.length + 1},${i + 1}`;
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        newRow.appendChild(cell);
    }

    tbody.appendChild(newRow);
}

function addColumn() {
    const table = document.getElementById('mainTable');
    const rows = table.querySelectorAll('tr');

    rows.forEach((row, rowIndex) => {
        const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
        cell.contentEditable = true;
        cell.textContent = rowIndex === 0 ? `Header ${row.children.length + 1}` : `Cell ${rowIndex},${row.children.length + 1}`;
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        row.appendChild(cell);
    });
}

function removeRow() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in the row you want to remove');
        return;
    }

    const row = selectedCells[0].parentNode;
    const tbody = row.parentNode;

    if (tbody.children.length <= 1) {
        alert('Cannot remove the last row');
        return;
    }

    row.remove();
    clearSelection();
}

function removeColumn() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in the column you want to remove');
        return;
    }

    const cellIndex = Array.from(selectedCells[0].parentNode.children).indexOf(selectedCells[0]);
    const table = document.getElementById('mainTable');
    const rows = table.querySelectorAll('tr');

    if (rows[0].children.length <= 1) {
        alert('Cannot remove the last column');
        return;
    }

    rows.forEach(row => {
        if (row.children[cellIndex]) {
            row.children[cellIndex].remove();
        }
    });

    clearSelection();
}

function addRowAbove() {
    if (!contextMenuTarget) return;

    const currentRow = contextMenuTarget.parentNode;
    const table = document.getElementById('mainTable');
    const headerCount = table.querySelector('thead tr').children.length;

    const newRow = document.createElement('tr');

    for (let i = 0; i < headerCount; i++) {
        const cell = document.createElement('td');
        cell.contentEditable = true;
        cell.textContent = `New Cell`;
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        newRow.appendChild(cell);
    }

    currentRow.parentNode.insertBefore(newRow, currentRow);
    hideContextMenu();
}

function addRowBelow() {
    if (!contextMenuTarget) return;

    const currentRow = contextMenuTarget.parentNode;
    const table = document.getElementById('mainTable');
    const headerCount = table.querySelector('thead tr').children.length;

    const newRow = document.createElement('tr');

    for (let i = 0; i < headerCount; i++) {
        const cell = document.createElement('td');
        cell.contentEditable = true;
        cell.textContent = `New Cell`;
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        newRow.appendChild(cell);
    }

    currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);
    hideContextMenu();
}

function addColumnLeft() {
    if (!contextMenuTarget) return;

    const cellIndex = Array.from(contextMenuTarget.parentNode.children).indexOf(contextMenuTarget);
    const table = document.getElementById('mainTable');
    const rows = table.querySelectorAll('tr');

    rows.forEach((row, rowIndex) => {
        const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
        cell.contentEditable = true;
        cell.textContent = rowIndex === 0 ? `New Header` : `New Cell`;
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        row.insertBefore(cell, row.children[cellIndex]);
    });

    hideContextMenu();
}

function addColumnRight() {
    if (!contextMenuTarget) return;

    const cellIndex = Array.from(contextMenuTarget.parentNode.children).indexOf(contextMenuTarget);
    const table = document.getElementById('mainTable');
    const rows = table.querySelectorAll('tr');

    rows.forEach((row, rowIndex) => {
        const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
        cell.contentEditable = true;
        cell.textContent = rowIndex === 0 ? `New Header` : `New Cell`;
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);

        const nextSibling = row.children[cellIndex + 1];
        if (nextSibling) {
            row.insertBefore(cell, nextSibling);
        } else {
            row.appendChild(cell);
        }
    });

    hideContextMenu();
}

function deleteSelectedRow() {
    if (!contextMenuTarget) return;

    const row = contextMenuTarget.parentNode;
    const tbody = row.parentNode;

    if (tbody.children.length <= 1) {
        alert('Cannot remove the last row');
        return;
    }

    row.remove();
    hideContextMenu();
}

function deleteSelectedColumn() {
    if (!contextMenuTarget) return;

    const cellIndex = Array.from(contextMenuTarget.parentNode.children).indexOf(contextMenuTarget);
    const table = document.getElementById('mainTable');
    const rows = table.querySelectorAll('tr');

    if (rows[0].children.length <= 1) {
        alert('Cannot remove the last column');
        return;
    }

    rows.forEach(row => {
        if (row.children[cellIndex]) {
            row.children[cellIndex].remove();
        }
    });

    hideContextMenu();
}

function mergeSelectedCells() {
    if (selectedCells.length < 2) {
        alert('Please select at least 2 cells to merge');
        return;
    }

    // Check if cells are adjacent (horizontally or vertically)
    if (!areSelectedCellsAdjacent()) {
        alert('Please select adjacent cells to merge (horizontally or vertically)');
        return;
    }

    const firstCell = selectedCells[0];
    let content = selectedCells.map(cell => cell.textContent.trim()).filter(text => text).join(' ');

    // Get cell positions
    const cellPositions = selectedCells.map(cell => {
        const row = cell.parentNode;
        const table = row.parentNode.parentNode;
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        const colIndex = Array.from(row.children).indexOf(cell);
        return { cell, rowIndex, colIndex };
    });

    // Find bounds
    let minRow = Math.min(...cellPositions.map(p => p.rowIndex));
    let maxRow = Math.max(...cellPositions.map(p => p.rowIndex));
    let minCol = Math.min(...cellPositions.map(p => p.colIndex));
    let maxCol = Math.max(...cellPositions.map(p => p.colIndex));

    const rowSpan = maxRow - minRow + 1;
    const colSpan = maxCol - minCol + 1;

    // Remove all cells except the first one
    selectedCells.forEach(cell => {
        if (cell !== firstCell) {
            cell.remove();
        }
    });

    // Set span attributes on the first cell
    if (rowSpan > 1) firstCell.rowSpan = rowSpan;
    if (colSpan > 1) firstCell.colSpan = colSpan;
    firstCell.textContent = content;

    // Re-add resize handles to the merged cell
    addResizeHandles(firstCell);

    clearSelection();
    hideContextMenu();
}

function areSelectedCellsAdjacent() {
    if (selectedCells.length < 2) return false;

    // Get positions of all selected cells
    const positions = selectedCells.map(cell => {
        const row = cell.parentNode;
        const table = row.parentNode.parentNode;
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        const colIndex = Array.from(row.children).indexOf(cell);
        return { rowIndex, colIndex };
    });

    // Check if cells form a continuous horizontal line
    const isHorizontalLine = () => {
        const row = positions[0].rowIndex;
        if (!positions.every(pos => pos.rowIndex === row)) return false;

        const cols = positions.map(pos => pos.colIndex).sort((a, b) => a - b);
        for (let i = 1; i < cols.length; i++) {
            if (cols[i] - cols[i-1] !== 1) return false;
        }
        return true;
    };

    // Check if cells form a continuous vertical line
    const isVerticalLine = () => {
        const col = positions[0].colIndex;
        if (!positions.every(pos => pos.colIndex === col)) return false;

        const rows = positions.map(pos => pos.rowIndex).sort((a, b) => a - b);
        for (let i = 1; i < rows.length; i++) {
            if (rows[i] - rows[i-1] !== 1) return false;
        }
        return true;
    };

    // Check if cells form a rectangular block
    const isRectangularBlock = () => {
        const minRow = Math.min(...positions.map(p => p.rowIndex));
        const maxRow = Math.max(...positions.map(p => p.rowIndex));
        const minCol = Math.min(...positions.map(p => p.colIndex));
        const maxCol = Math.max(...positions.map(p => p.colIndex));

        const expectedCells = (maxRow - minRow + 1) * (maxCol - minCol + 1);
        if (selectedCells.length !== expectedCells) return false;

        // Check that all positions in the rectangle are selected
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                if (!positions.some(pos => pos.rowIndex === row && pos.colIndex === col)) {
                    return false;
                }
            }
        }
        return true;
    };

    return isHorizontalLine() || isVerticalLine() || isRectangularBlock();
}

function splitSelectedCell() {
    if (selectedCells.length !== 1) {
        alert('Please select exactly one cell to split');
        return;
    }

    const cell = selectedCells[0];
    const rowSpan = parseInt(cell.rowSpan) || 1;
    const colSpan = parseInt(cell.colSpan) || 1;

    if (rowSpan === 1 && colSpan === 1) {
        alert('This cell cannot be split further');
        return;
    }

    const row = cell.parentNode;
    const table = row.parentNode.parentNode;
    const cellIndex = Array.from(row.children).indexOf(cell);
    const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);

    cell.rowSpan = 1;
    cell.colSpan = 1;

    for (let r = 0; r < rowSpan; r++) {
        for (let c = 0; c < colSpan; c++) {
            if (r === 0 && c === 0) continue;

            const targetRow = table.querySelectorAll('tr')[rowIndex + r];
            const newCell = document.createElement(targetRow.parentNode.tagName === 'THEAD' ? 'th' : 'td');
            newCell.contentEditable = true;
            newCell.textContent = '';
            newCell.onmousedown = function(e) { selectCell(this, e); };
            newCell.oncontextmenu = function(e) { showContextMenu(e, this); };
            addResizeHandles(newCell);

            const insertIndex = cellIndex + c;
            if (targetRow.children[insertIndex]) {
                targetRow.insertBefore(newCell, targetRow.children[insertIndex]);
            } else {
                targetRow.appendChild(newCell);
            }
        }
    }

    clearSelection();
    hideContextMenu();
}

function applyAlignmentFromContext() {
    const alignment = document.getElementById('contextAlignSelect').value;
    selectedCells.forEach(cell => {
        cell.style.textAlign = alignment;
    });
}

function applyFontSizeFromContext() {
    const fontSize = document.getElementById('contextFontSizeInput').value;
    selectedCells.forEach(cell => {
        cell.style.fontSize = fontSize + 'px';
    });
}

// Custom color picker functions
let currentBgColor = '';
let currentTextColor = '#000000';

function toggleBgColorDropdown() {
    const dropdown = document.getElementById('bgColorDropdown');
    const textDropdown = document.getElementById('textColorDropdown');
    textDropdown.classList.remove('show');
    dropdown.classList.toggle('show');
}

function toggleTextColorDropdown() {
    const dropdown = document.getElementById('textColorDropdown');
    const bgDropdown = document.getElementById('bgColorDropdown');
    bgDropdown.classList.remove('show');
    dropdown.classList.toggle('show');
}

function selectBgColor(color, label) {
    currentBgColor = color;
    document.getElementById('bgColorPreview').style.backgroundColor = color || 'transparent';
    document.getElementById('bgColorLabel').textContent = label;
    document.getElementById('bgColorDropdown').classList.remove('show');
    applyBackgroundColorFromContext();
}

function selectTextColor(color, label) {
    currentTextColor = color;
    document.getElementById('textColorPreview').style.backgroundColor = color;
    document.getElementById('textColorLabel').textContent = label;
    document.getElementById('textColorDropdown').classList.remove('show');
    applyTextColorFromContext();
}

function applyBackgroundColorFromContext() {
    selectedCells.forEach(cell => {
        cell.style.backgroundColor = currentBgColor;
    });
}

function applyTextColorFromContext() {
    selectedCells.forEach(cell => {
        cell.style.color = currentTextColor;
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.color-picker-container') && !e.target.closest('.context-menu')) {
        document.getElementById('bgColorDropdown').classList.remove('show');
        document.getElementById('textColorDropdown').classList.remove('show');
    }
});

function resetFormatFromContext() {
    selectedCells.forEach(cell => {
        cell.style.textAlign = '';
        cell.style.fontSize = '';
        cell.style.backgroundColor = '';
        cell.style.color = '';
    });

    document.getElementById('contextAlignSelect').value = 'left';
    document.getElementById('contextFontSizeInput').value = 14;
    document.getElementById('contextBgColorInput').value = '#ffffff';
    document.getElementById('contextTextColorInput').value = '#000000';
}

function splitTable() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in the row where you want to split the table');
        return;
    }

    const selectedRow = selectedCells[0].parentNode;
    const table = document.getElementById('mainTable');
    const allRows = Array.from(table.querySelectorAll('tr'));
    const selectedRowIndex = allRows.indexOf(selectedRow);

    if (selectedRowIndex <= 0) {
        alert('Cannot split at header row');
        return;
    }

    const headerRow = table.querySelector('thead tr');
    const rowsToMove = allRows.slice(selectedRowIndex);

    const newTable = document.createElement('table');
    newTable.style.marginTop = '20px';

    const newThead = document.createElement('thead');
    const newHeaderRow = headerRow.cloneNode(true);
    Array.from(newHeaderRow.children).forEach(cell => {
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
    });
    newThead.appendChild(newHeaderRow);
    newTable.appendChild(newThead);

    const newTbody = document.createElement('tbody');
    rowsToMove.forEach(row => {
        Array.from(row.children).forEach(cell => {
            cell.onmousedown = function(e) { selectCell(this, e); };
            cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        });
        newTbody.appendChild(row);
    });
    newTable.appendChild(newTbody);

    const tableContainer = document.querySelector('.table-container');
    const newContainer = document.createElement('div');
    newContainer.className = 'table-container';
    newContainer.style.marginTop = '20px';

    // Add delete button to new table
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'table-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete Table';
    deleteBtn.onclick = function() { deleteTable(this); };
    newContainer.appendChild(deleteBtn);

    newContainer.appendChild(newTable);

    tableContainer.parentNode.insertBefore(newContainer, tableContainer.nextSibling);

    clearSelection();
}

function deleteTable(button) {
    const tableContainer = button.closest('.table-container');

    // Confirm deletion
    if (confirm('Are you sure you want to delete this table?')) {
        tableContainer.remove();
        clearSelection();
    }
}

function showContextMenu(event, cell) {
    event.preventDefault();
    contextMenuTarget = cell;

    // Only change selection if right-clicking on a cell that's not already selected
    if (!selectedCells.includes(cell)) {
        clearSelection();
        cell.classList.add('cell-selected');
        selectedCells.push(cell);
        currentCell = cell;
        anchorCell = cell;
    }

    updateFormatControls(cell);

    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    const menuRect = contextMenu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (menuRect.right > windowWidth) {
        contextMenu.style.left = (event.pageX - menuRect.width) + 'px';
    }

    if (menuRect.bottom > windowHeight) {
        contextMenu.style.top = (event.pageY - menuRect.height) + 'px';
    }
}

function clearSelectionFromContext() {
    clearSelection();
    hideContextMenu();
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';
    contextMenuTarget = null;
}

// Resize functionality
function addResizeHandles(cell) {
    // Remove existing handles
    const existingHandles = cell.querySelectorAll('.resize-handle-col, .resize-handle-row, .resize-handle-corner');
    existingHandles.forEach(handle => handle.remove());

    // Add column resize handle
    const colHandle = document.createElement('div');
    colHandle.className = 'resize-handle-col';
    colHandle.addEventListener('mousedown', (e) => startResize(e, 'col', cell));
    cell.appendChild(colHandle);

    // Add row resize handle
    const rowHandle = document.createElement('div');
    rowHandle.className = 'resize-handle-row';
    rowHandle.addEventListener('mousedown', (e) => startResize(e, 'row', cell));
    cell.appendChild(rowHandle);

    // Add corner resize handle
    const cornerHandle = document.createElement('div');
    cornerHandle.className = 'resize-handle-corner';
    cornerHandle.addEventListener('mousedown', (e) => startResize(e, 'corner', cell));
    cell.appendChild(cornerHandle);
}

function startResize(e, type, cell) {
    e.preventDefault();
    e.stopPropagation();

    isResizing = true;
    resizeType = type;
    resizeTarget = cell;
    startX = e.clientX;
    startY = e.clientY;

    const rect = cell.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;

    document.body.classList.add('resizing');

    // Create resize line for visual feedback
    if (type === 'col' || type === 'corner') {
        resizeLine = document.createElement('div');
        resizeLine.className = 'resize-line vertical';
        resizeLine.style.left = e.clientX + 'px';
        document.body.appendChild(resizeLine);
    }
    if (type === 'row' || type === 'corner') {
        if (!resizeLine) {
            resizeLine = document.createElement('div');
            resizeLine.className = 'resize-line horizontal';
        } else {
            resizeLine.className += ' horizontal';
        }
        resizeLine.style.top = e.clientY + 'px';
        if (type === 'row') {
            document.body.appendChild(resizeLine);
        }
    }

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
}

function handleResize(e) {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (resizeType === 'col' || resizeType === 'corner') {
        const newWidth = Math.max(50, startWidth + deltaX);

        // Update resize line position
        if (resizeLine && resizeLine.classList.contains('vertical')) {
            resizeLine.style.left = e.clientX + 'px';
        }

        // Check if we have multiple selected cells
        if (selectedCells.length > 1) {
            // Apply width to all selected cells and their columns
            const affectedColumns = new Set();

            selectedCells.forEach(cell => {
                const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
                affectedColumns.add(cellIndex);
            });

            // Apply width to all affected columns
            const table = resizeTarget.closest('table');
            const allRowsInTable = table.querySelectorAll('tr');

            affectedColumns.forEach(columnIndex => {
                allRowsInTable.forEach(row => {
                    const cell = row.children[columnIndex];
                    if (cell) {
                        cell.style.width = newWidth + 'px';
                    }
                });
            });
        } else {
            // Original behavior: apply width to entire column
            resizeTarget.style.width = newWidth + 'px';
            const cellIndex = Array.from(resizeTarget.parentNode.children).indexOf(resizeTarget);
            const table = resizeTarget.closest('table');
            const allRowsInTable = table.querySelectorAll('tr');

            allRowsInTable.forEach(row => {
                const cell = row.children[cellIndex];
                if (cell) {
                    cell.style.width = newWidth + 'px';
                }
            });
        }
    }

    if (resizeType === 'row' || resizeType === 'corner') {
        const newHeight = Math.max(30, startHeight + deltaY);

        // Update resize line position
        if (resizeLine && (resizeLine.classList.contains('horizontal') || resizeType === 'row')) {
            resizeLine.style.top = e.clientY + 'px';
        }

        // Check if we have multiple selected cells
        if (selectedCells.length > 1) {
            // Apply height to all selected cells and their rows
            const affectedRows = new Set();

            selectedCells.forEach(cell => {
                affectedRows.add(cell.parentNode);
            });

            // Apply height to all affected rows
            affectedRows.forEach(row => {
                Array.from(row.children).forEach(cell => {
                    cell.style.height = newHeight + 'px';
                });
            });
        } else {
            // Original behavior: apply height to entire row
            const row = resizeTarget.parentNode;
            Array.from(row.children).forEach(cell => {
                cell.style.height = newHeight + 'px';
            });
        }
    }
}

function stopResize() {
    if (!isResizing) return;

    isResizing = false;
    resizeType = null;
    resizeTarget = null;

    document.body.classList.remove('resizing');

    // Remove resize line
    if (resizeLine) {
        resizeLine.remove();
        resizeLine = null;
    }

    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
}

function initializeResizeHandles() {
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
            addResizeHandles(cell);
        });
    });
}