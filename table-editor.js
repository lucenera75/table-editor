let selectedCells = [];
let selectedRow = null;
let selectedColumn = null;
let contextMenuTarget = null;

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

function selectCell(cell) {
    if (!event.ctrlKey && !event.metaKey) {
        clearSelection();
    }

    cell.classList.add('cell-selected');
    if (!selectedCells.includes(cell)) {
        selectedCells.push(cell);
    }

    updateFormatControls(cell);
}

function clearSelection() {
    selectedCells.forEach(cell => {
        cell.classList.remove('cell-selected');
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
}

function updateFormatControls(cell) {
    const computedStyle = window.getComputedStyle(cell);

    document.getElementById('contextAlignSelect').value = computedStyle.textAlign || 'left';
    document.getElementById('contextFontSizeInput').value = parseInt(computedStyle.fontSize) || 14;

    const bgColor = computedStyle.backgroundColor;
    if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
        document.getElementById('contextBgColorInput').value = rgbToHex(bgColor);
    }

    const textColor = computedStyle.color;
    if (textColor) {
        document.getElementById('contextTextColorInput').value = rgbToHex(textColor);
    }
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
        cell.onclick = function() { selectCell(this); };
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
        cell.onclick = function() { selectCell(this); };
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
        cell.onclick = function() { selectCell(this); };
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
        cell.onclick = function() { selectCell(this); };
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
        cell.onclick = function() { selectCell(this); };
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
        cell.onclick = function() { selectCell(this); };
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
            newCell.onclick = function() { selectCell(this); };
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

function applyBackgroundColorFromContext() {
    const color = document.getElementById('contextBgColorInput').value;
    selectedCells.forEach(cell => {
        cell.style.backgroundColor = color;
    });
}

function applyTextColorFromContext() {
    const color = document.getElementById('contextTextColorInput').value;
    selectedCells.forEach(cell => {
        cell.style.color = color;
    });
}

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
        cell.onclick = function() { selectCell(this); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
    });
    newThead.appendChild(newHeaderRow);
    newTable.appendChild(newThead);

    const newTbody = document.createElement('tbody');
    rowsToMove.forEach(row => {
        Array.from(row.children).forEach(cell => {
            cell.onclick = function() { selectCell(this); };
            cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        });
        newTbody.appendChild(row);
    });
    newTable.appendChild(newTbody);

    const tableContainer = document.querySelector('.table-container');
    const newContainer = document.createElement('div');
    newContainer.className = 'table-container';
    newContainer.style.marginTop = '20px';
    newContainer.appendChild(newTable);

    tableContainer.parentNode.insertBefore(newContainer, tableContainer.nextSibling);

    clearSelection();
}

function showContextMenu(event, cell) {
    event.preventDefault();
    contextMenuTarget = cell;

    if (!selectedCells.includes(cell)) {
        selectCell(cell);
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
        resizeTarget.style.width = newWidth + 'px';

        // Update resize line position
        if (resizeLine && resizeLine.classList.contains('vertical')) {
            resizeLine.style.left = e.clientX + 'px';
        }

        // Apply width to entire column
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

    if (resizeType === 'row' || resizeType === 'corner') {
        const newHeight = Math.max(30, startHeight + deltaY);

        // Update resize line position
        if (resizeLine && (resizeLine.classList.contains('horizontal') || resizeType === 'row')) {
            resizeLine.style.top = e.clientY + 'px';
        }

        // Apply height to entire row
        const row = resizeTarget.parentNode;
        Array.from(row.children).forEach(cell => {
            cell.style.height = newHeight + 'px';
        });
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