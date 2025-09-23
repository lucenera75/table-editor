/**
 * TableEditor - Standalone JavaScript Table Editor
 * Creates a full-featured table editor with context menu, resizing, formatting, etc.
 */
class TableEditor {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        this.options = {
            initialRows: 3,
            initialCols: 3,
            showHeaders: true,
            ...options
        };

        // Editor state
        this.selectedCells = [];
        this.selectedRow = null;
        this.selectedColumn = null;
        this.contextMenuTarget = null;

        // Resize state
        this.isResizing = false;
        this.resizeType = null;
        this.resizeTarget = null;
        this.startX = 0;
        this.startY = 0;
        this.startWidth = 0;
        this.startHeight = 0;
        this.resizeLine = null;

        // Generate unique ID for this editor instance
        this.editorId = 'table-editor-' + Math.random().toString(36).substr(2, 9);

        this.init();
    }

    init() {
        this.createStyles();
        this.createStructure();
        this.createContextMenu();
        this.bindEvents();
        this.initializeResizeHandles();
    }

    createStyles() {
        const styleId = this.editorId + '-styles';

        // Remove existing styles for this editor
        const existingStyle = document.getElementById(styleId);
        if (existingStyle) {
            existingStyle.remove();
        }

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .${this.editorId} {
                font-family: Arial, sans-serif;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                overflow: hidden;
            }

            .${this.editorId} .table-container {
                overflow: auto;
                border: 1px solid #ddd;
                border-radius: 6px;
            }

            .${this.editorId} table {
                width: 100%;
                border-collapse: collapse;
                background: white;
            }

            .${this.editorId} th,
            .${this.editorId} td {
                border: 1px solid #ddd;
                padding: 8px;
                text-align: left;
                position: relative;
                min-width: 100px;
                min-height: 30px;
                resize: both;
                overflow: hidden;
                outline: none;
            }

            .${this.editorId} th {
                background-color: #f8f9fa;
                font-weight: bold;
            }

            .${this.editorId} .cell-selected {
                border: 2px dashed #2196f3 !important;
                border-radius: 2px;
            }

            .${this.editorId} .row-selected {
                border-left: 3px dashed #ff9800 !important;
            }

            .${this.editorId} .col-selected {
                border-top: 3px dashed #ff9800 !important;
            }

            .${this.editorId} .resize-handle-col {
                position: absolute;
                top: 0;
                right: -3px;
                width: 6px;
                height: 100%;
                cursor: col-resize;
                background: transparent;
                z-index: 10;
            }

            .${this.editorId} .resize-handle-col:hover {
                background: rgba(0, 123, 255, 0.2);
            }

            .${this.editorId} .resize-handle-row {
                position: absolute;
                bottom: -3px;
                left: 0;
                height: 6px;
                width: 100%;
                cursor: row-resize;
                background: transparent;
                z-index: 10;
            }

            .${this.editorId} .resize-handle-row:hover {
                background: rgba(0, 123, 255, 0.2);
            }

            .${this.editorId} .resize-handle-corner {
                position: absolute;
                bottom: -3px;
                right: -3px;
                width: 6px;
                height: 6px;
                cursor: nw-resize;
                background: transparent;
                z-index: 15;
            }

            .${this.editorId} .resize-handle-corner:hover {
                background: rgba(0, 123, 255, 0.4);
            }

            .${this.editorId}.resizing {
                user-select: none;
            }

            .${this.editorId} .resize-line {
                position: absolute;
                background: #007bff;
                z-index: 1000;
                pointer-events: none;
            }

            .${this.editorId} .resize-line.vertical {
                width: 2px;
                height: 100vh;
                top: 0;
            }

            .${this.editorId} .resize-line.horizontal {
                height: 2px;
                width: 100vw;
                left: 0;
            }

            .${this.editorId} .context-menu {
                position: absolute;
                background: white;
                border: 1px solid #ccc;
                border-radius: 4px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 1000;
                display: none;
                min-width: 200px;
                max-height: 400px;
                overflow-y: auto;
            }

            .${this.editorId} .context-menu button {
                display: block;
                width: 100%;
                padding: 8px 12px;
                border: none;
                background: none;
                text-align: left;
                cursor: pointer;
                font-size: 14px;
            }

            .${this.editorId} .context-menu button:hover {
                background-color: #f0f0f0;
            }

            .${this.editorId} .context-menu .separator {
                height: 1px;
                background-color: #e0e0e0;
                margin: 5px 0;
            }

            .${this.editorId} .context-menu .format-section {
                padding: 8px 12px;
                border-bottom: 1px solid #e0e0e0;
            }

            .${this.editorId} .context-menu .format-group {
                display: flex;
                align-items: center;
                gap: 8px;
                margin: 5px 0;
            }

            .${this.editorId} .context-menu .format-group label {
                font-size: 12px;
                color: #666;
                min-width: 70px;
            }

            .${this.editorId} .context-menu input[type="number"],
            .${this.editorId} .context-menu select,
            .${this.editorId} .context-menu input[type="color"] {
                padding: 4px 6px;
                border: 1px solid #ddd;
                border-radius: 3px;
                font-size: 12px;
                flex: 1;
            }

            .${this.editorId} .context-menu input[type="color"] {
                width: 40px;
                height: 25px;
                padding: 2px;
            }

            .${this.editorId} .split-line {
                border-top: 3px solid #ff4444;
                margin: 10px 0;
            }
        `;

        document.head.appendChild(style);
    }

    createStructure() {
        this.container.className = this.editorId;

        const tableContainer = document.createElement('div');
        tableContainer.className = 'table-container';

        const table = document.createElement('table');
        table.id = this.editorId + '-table';

        // Create header if requested
        if (this.options.showHeaders) {
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');

            for (let i = 0; i < this.options.initialCols; i++) {
                const th = document.createElement('th');
                th.contentEditable = true;
                th.textContent = `Header ${i + 1}`;
                this.bindCellEvents(th);
                headerRow.appendChild(th);
            }

            thead.appendChild(headerRow);
            table.appendChild(thead);
        }

        // Create body rows
        const tbody = document.createElement('tbody');
        for (let i = 0; i < this.options.initialRows; i++) {
            const row = document.createElement('tr');

            for (let j = 0; j < this.options.initialCols; j++) {
                const td = document.createElement('td');
                td.contentEditable = true;
                td.textContent = `Cell ${i + 1},${j + 1}`;
                this.bindCellEvents(td);
                row.appendChild(td);
            }

            tbody.appendChild(row);
        }

        table.appendChild(tbody);
        tableContainer.appendChild(table);
        this.container.appendChild(tableContainer);

        this.table = table;
        this.tableContainer = tableContainer;
    }

    bindCellEvents(cell) {
        cell.addEventListener('click', (e) => this.selectCell(cell, e));
        cell.addEventListener('contextmenu', (e) => this.showContextMenu(e, cell));
        this.addResizeHandles(cell);
    }

    createContextMenu() {
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.id = this.editorId + '-context-menu';

        contextMenu.innerHTML = `
            <button onclick="window.tableEditors['${this.editorId}'].addRowAbove()">Add Row Above</button>
            <button onclick="window.tableEditors['${this.editorId}'].addRowBelow()">Add Row Below</button>
            <button onclick="window.tableEditors['${this.editorId}'].addColumnLeft()">Add Column Left</button>
            <button onclick="window.tableEditors['${this.editorId}'].addColumnRight()">Add Column Right</button>
            <div class="separator"></div>
            <button onclick="window.tableEditors['${this.editorId}'].deleteSelectedRow()">Delete Row</button>
            <button onclick="window.tableEditors['${this.editorId}'].deleteSelectedColumn()">Delete Column</button>
            <div class="separator"></div>
            <button onclick="window.tableEditors['${this.editorId}'].mergeSelectedCells()">Merge Cells</button>
            <button onclick="window.tableEditors['${this.editorId}'].splitSelectedCell()">Split Cell</button>
            <div class="separator"></div>
            <button onclick="window.tableEditors['${this.editorId}'].splitTable()">Split Table</button>
            <div class="separator"></div>

            <div class="format-section">
                <div class="format-group">
                    <label>Align:</label>
                    <select id="${this.editorId}-align-select" onchange="window.tableEditors['${this.editorId}'].applyAlignmentFromContext()">
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                        <option value="right">Right</option>
                    </select>
                </div>

                <div class="format-group">
                    <label>Font Size:</label>
                    <input type="number" id="${this.editorId}-font-size-input" min="8" max="72" value="14" onchange="window.tableEditors['${this.editorId}'].applyFontSizeFromContext()">
                </div>

                <div class="format-group">
                    <label>Background:</label>
                    <input type="color" id="${this.editorId}-bg-color-input" value="#ffffff" onchange="window.tableEditors['${this.editorId}'].applyBackgroundColorFromContext()">
                </div>

                <div class="format-group">
                    <label>Text Color:</label>
                    <input type="color" id="${this.editorId}-text-color-input" value="#000000" onchange="window.tableEditors['${this.editorId}'].applyTextColorFromContext()">
                </div>
            </div>

            <button onclick="window.tableEditors['${this.editorId}'].resetFormatFromContext()">Reset Format</button>
            <div class="separator"></div>
            <button onclick="window.tableEditors['${this.editorId}'].clearSelectionFromContext()">Clear Selection</button>
        `;

        document.body.appendChild(contextMenu);
        this.contextMenu = contextMenu;

        // Register this editor instance globally for onclick handlers
        if (!window.tableEditors) {
            window.tableEditors = {};
        }
        window.tableEditors[this.editorId] = this;
    }

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (!e.target.closest(`.${this.editorId} .context-menu`)) {
                this.hideContextMenu();
            }
        });

        document.addEventListener('mousemove', (e) => this.handleResize(e));
        document.addEventListener('mouseup', (e) => this.stopResize(e));
    }

    // Selection methods
    selectCell(cell, event) {
        if (!event.ctrlKey && !event.metaKey) {
            this.clearSelection();
        }

        cell.classList.add('cell-selected');
        if (!this.selectedCells.includes(cell)) {
            this.selectedCells.push(cell);
        }

        this.updateFormatControls(cell);
    }

    clearSelection() {
        this.selectedCells.forEach(cell => {
            cell.classList.remove('cell-selected');
        });
        this.selectedCells = [];

        document.querySelectorAll('.row-selected').forEach(row => {
            row.classList.remove('row-selected');
        });

        document.querySelectorAll('.col-selected').forEach(cell => {
            cell.classList.remove('col-selected');
        });

        this.selectedRow = null;
        this.selectedColumn = null;
    }

    clearSelectionFromContext() {
        this.clearSelection();
        this.hideContextMenu();
    }

    // Format control methods
    updateFormatControls(cell) {
        const computedStyle = window.getComputedStyle(cell);

        document.getElementById(this.editorId + '-align-select').value = computedStyle.textAlign || 'left';
        document.getElementById(this.editorId + '-font-size-input').value = parseInt(computedStyle.fontSize) || 14;

        const bgColor = computedStyle.backgroundColor;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
            document.getElementById(this.editorId + '-bg-color-input').value = this.rgbToHex(bgColor);
        }

        const textColor = computedStyle.color;
        if (textColor) {
            document.getElementById(this.editorId + '-text-color-input').value = this.rgbToHex(textColor);
        }
    }

    rgbToHex(rgb) {
        if (rgb.startsWith('#')) return rgb;

        const result = rgb.match(/\d+/g);
        if (!result || result.length < 3) return '#000000';

        return '#' + result.slice(0, 3).map(x => {
            const hex = parseInt(x).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    applyAlignmentFromContext() {
        const alignment = document.getElementById(this.editorId + '-align-select').value;
        this.selectedCells.forEach(cell => {
            cell.style.textAlign = alignment;
        });
    }

    applyFontSizeFromContext() {
        const fontSize = document.getElementById(this.editorId + '-font-size-input').value;
        this.selectedCells.forEach(cell => {
            cell.style.fontSize = fontSize + 'px';
        });
    }

    applyBackgroundColorFromContext() {
        const color = document.getElementById(this.editorId + '-bg-color-input').value;
        this.selectedCells.forEach(cell => {
            cell.style.backgroundColor = color;
        });
    }

    applyTextColorFromContext() {
        const color = document.getElementById(this.editorId + '-text-color-input').value;
        this.selectedCells.forEach(cell => {
            cell.style.color = color;
        });
    }

    resetFormatFromContext() {
        this.selectedCells.forEach(cell => {
            cell.style.textAlign = '';
            cell.style.fontSize = '';
            cell.style.backgroundColor = '';
            cell.style.color = '';
        });

        document.getElementById(this.editorId + '-align-select').value = 'left';
        document.getElementById(this.editorId + '-font-size-input').value = 14;
        document.getElementById(this.editorId + '-bg-color-input').value = '#ffffff';
        document.getElementById(this.editorId + '-text-color-input').value = '#000000';
    }

    // Table manipulation methods
    addRow() {
        const tbody = this.table.querySelector('tbody');
        const headerCount = this.table.querySelector('thead tr').children.length;

        const newRow = document.createElement('tr');

        for (let i = 0; i < headerCount; i++) {
            const cell = document.createElement('td');
            cell.contentEditable = true;
            cell.textContent = `New Cell ${tbody.children.length + 1},${i + 1}`;
            this.bindCellEvents(cell);
            newRow.appendChild(cell);
        }

        tbody.appendChild(newRow);
    }

    addColumn() {
        const rows = this.table.querySelectorAll('tr');

        rows.forEach((row, rowIndex) => {
            const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
            cell.contentEditable = true;
            cell.textContent = rowIndex === 0 ? `Header ${row.children.length + 1}` : `Cell ${rowIndex},${row.children.length + 1}`;
            this.bindCellEvents(cell);
            row.appendChild(cell);
        });
    }

    addRowAbove() {
        if (!this.contextMenuTarget) return;

        const currentRow = this.contextMenuTarget.parentNode;
        const headerCount = this.table.querySelector('thead tr').children.length;

        const newRow = document.createElement('tr');

        for (let i = 0; i < headerCount; i++) {
            const cell = document.createElement('td');
            cell.contentEditable = true;
            cell.textContent = `New Cell`;
            this.bindCellEvents(cell);
            newRow.appendChild(cell);
        }

        currentRow.parentNode.insertBefore(newRow, currentRow);
        this.hideContextMenu();
    }

    addRowBelow() {
        if (!this.contextMenuTarget) return;

        const currentRow = this.contextMenuTarget.parentNode;
        const headerCount = this.table.querySelector('thead tr').children.length;

        const newRow = document.createElement('tr');

        for (let i = 0; i < headerCount; i++) {
            const cell = document.createElement('td');
            cell.contentEditable = true;
            cell.textContent = `New Cell`;
            this.bindCellEvents(cell);
            newRow.appendChild(cell);
        }

        currentRow.parentNode.insertBefore(newRow, currentRow.nextSibling);
        this.hideContextMenu();
    }

    addColumnLeft() {
        if (!this.contextMenuTarget) return;

        const cellIndex = Array.from(this.contextMenuTarget.parentNode.children).indexOf(this.contextMenuTarget);
        const rows = this.table.querySelectorAll('tr');

        rows.forEach((row, rowIndex) => {
            const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
            cell.contentEditable = true;
            cell.textContent = rowIndex === 0 ? `New Header` : `New Cell`;
            this.bindCellEvents(cell);
            row.insertBefore(cell, row.children[cellIndex]);
        });

        this.hideContextMenu();
    }

    addColumnRight() {
        if (!this.contextMenuTarget) return;

        const cellIndex = Array.from(this.contextMenuTarget.parentNode.children).indexOf(this.contextMenuTarget);
        const rows = this.table.querySelectorAll('tr');

        rows.forEach((row, rowIndex) => {
            const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
            cell.contentEditable = true;
            cell.textContent = rowIndex === 0 ? `New Header` : `New Cell`;
            this.bindCellEvents(cell);

            const nextSibling = row.children[cellIndex + 1];
            if (nextSibling) {
                row.insertBefore(cell, nextSibling);
            } else {
                row.appendChild(cell);
            }
        });

        this.hideContextMenu();
    }

    deleteSelectedRow() {
        if (!this.contextMenuTarget) return;

        const row = this.contextMenuTarget.parentNode;
        const tbody = row.parentNode;

        if (tbody.children.length <= 1) {
            alert('Cannot remove the last row');
            return;
        }

        row.remove();
        this.hideContextMenu();
    }

    deleteSelectedColumn() {
        if (!this.contextMenuTarget) return;

        const cellIndex = Array.from(this.contextMenuTarget.parentNode.children).indexOf(this.contextMenuTarget);
        const rows = this.table.querySelectorAll('tr');

        if (rows[0].children.length <= 1) {
            alert('Cannot remove the last column');
            return;
        }

        rows.forEach(row => {
            if (row.children[cellIndex]) {
                row.children[cellIndex].remove();
            }
        });

        this.hideContextMenu();
    }

    // Cell merging and splitting
    mergeSelectedCells() {
        if (this.selectedCells.length < 2) {
            alert('Please select at least 2 cells to merge');
            return;
        }

        if (!this.areSelectedCellsAdjacent()) {
            alert('Please select adjacent cells to merge (horizontally or vertically)');
            return;
        }

        const firstCell = this.selectedCells[0];
        let content = this.selectedCells.map(cell => cell.textContent.trim()).filter(text => text).join(' ');

        const cellPositions = this.selectedCells.map(cell => {
            const row = cell.parentNode;
            const table = row.parentNode.parentNode;
            const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
            const colIndex = Array.from(row.children).indexOf(cell);
            return { cell, rowIndex, colIndex };
        });

        let minRow = Math.min(...cellPositions.map(p => p.rowIndex));
        let maxRow = Math.max(...cellPositions.map(p => p.rowIndex));
        let minCol = Math.min(...cellPositions.map(p => p.colIndex));
        let maxCol = Math.max(...cellPositions.map(p => p.colIndex));

        const rowSpan = maxRow - minRow + 1;
        const colSpan = maxCol - minCol + 1;

        this.selectedCells.forEach(cell => {
            if (cell !== firstCell) {
                cell.remove();
            }
        });

        if (rowSpan > 1) firstCell.rowSpan = rowSpan;
        if (colSpan > 1) firstCell.colSpan = colSpan;
        firstCell.textContent = content;

        this.clearSelection();
        this.hideContextMenu();
    }

    areSelectedCellsAdjacent() {
        if (this.selectedCells.length < 2) return false;

        const positions = this.selectedCells.map(cell => {
            const row = cell.parentNode;
            const table = row.parentNode.parentNode;
            const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
            const colIndex = Array.from(row.children).indexOf(cell);
            return { rowIndex, colIndex };
        });

        const isHorizontalLine = () => {
            const row = positions[0].rowIndex;
            if (!positions.every(pos => pos.rowIndex === row)) return false;

            const cols = positions.map(pos => pos.colIndex).sort((a, b) => a - b);
            for (let i = 1; i < cols.length; i++) {
                if (cols[i] - cols[i-1] !== 1) return false;
            }
            return true;
        };

        const isVerticalLine = () => {
            const col = positions[0].colIndex;
            if (!positions.every(pos => pos.colIndex === col)) return false;

            const rows = positions.map(pos => pos.rowIndex).sort((a, b) => a - b);
            for (let i = 1; i < rows.length; i++) {
                if (rows[i] - rows[i-1] !== 1) return false;
            }
            return true;
        };

        const isRectangularBlock = () => {
            const minRow = Math.min(...positions.map(p => p.rowIndex));
            const maxRow = Math.max(...positions.map(p => p.rowIndex));
            const minCol = Math.min(...positions.map(p => p.colIndex));
            const maxCol = Math.max(...positions.map(p => p.colIndex));

            const expectedCells = (maxRow - minRow + 1) * (maxCol - minCol + 1);
            if (this.selectedCells.length !== expectedCells) return false;

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

    splitSelectedCell() {
        if (this.selectedCells.length !== 1) {
            alert('Please select exactly one cell to split');
            return;
        }

        const cell = this.selectedCells[0];
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
                this.bindCellEvents(newCell);

                const insertIndex = cellIndex + c;
                if (targetRow.children[insertIndex]) {
                    targetRow.insertBefore(newCell, targetRow.children[insertIndex]);
                } else {
                    targetRow.appendChild(newCell);
                }
            }
        }

        this.clearSelection();
        this.hideContextMenu();
    }

    splitTable() {
        if (this.selectedCells.length === 0) {
            alert('Please select a cell in the row where you want to split the table');
            return;
        }

        const selectedRow = this.selectedCells[0].parentNode;
        const allRows = Array.from(this.table.querySelectorAll('tr'));
        const selectedRowIndex = allRows.indexOf(selectedRow);

        if (selectedRowIndex <= 0) {
            alert('Cannot split at header row');
            return;
        }

        const headerRow = this.table.querySelector('thead tr');
        const rowsToMove = allRows.slice(selectedRowIndex);

        const newTable = document.createElement('table');
        newTable.style.marginTop = '20px';

        const newThead = document.createElement('thead');
        const newHeaderRow = headerRow.cloneNode(true);
        Array.from(newHeaderRow.children).forEach(cell => {
            this.bindCellEvents(cell);
        });
        newThead.appendChild(newHeaderRow);
        newTable.appendChild(newThead);

        const newTbody = document.createElement('tbody');
        rowsToMove.forEach(row => {
            Array.from(row.children).forEach(cell => {
                this.bindCellEvents(cell);
            });
            newTbody.appendChild(row);
        });
        newTable.appendChild(newTbody);

        const newContainer = document.createElement('div');
        newContainer.className = 'table-container';
        newContainer.style.marginTop = '20px';
        newContainer.appendChild(newTable);

        this.container.appendChild(newContainer);

        this.clearSelection();
    }

    // Context menu methods
    showContextMenu(event, cell) {
        event.preventDefault();
        this.contextMenuTarget = cell;

        if (!this.selectedCells.includes(cell)) {
            this.selectCell(cell, event);
        }

        this.updateFormatControls(cell);

        this.contextMenu.style.display = 'block';
        this.contextMenu.style.left = event.pageX + 'px';
        this.contextMenu.style.top = event.pageY + 'px';

        const menuRect = this.contextMenu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (menuRect.right > windowWidth) {
            this.contextMenu.style.left = (event.pageX - menuRect.width) + 'px';
        }

        if (menuRect.bottom > windowHeight) {
            this.contextMenu.style.top = (event.pageY - menuRect.height) + 'px';
        }
    }

    hideContextMenu() {
        this.contextMenu.style.display = 'none';
        this.contextMenuTarget = null;
    }

    // Resize functionality
    addResizeHandles(cell) {
        const existingHandles = cell.querySelectorAll('.resize-handle-col, .resize-handle-row, .resize-handle-corner');
        existingHandles.forEach(handle => handle.remove());

        const colHandle = document.createElement('div');
        colHandle.className = 'resize-handle-col';
        colHandle.addEventListener('mousedown', (e) => this.startResize(e, 'col', cell));
        cell.appendChild(colHandle);

        const rowHandle = document.createElement('div');
        rowHandle.className = 'resize-handle-row';
        rowHandle.addEventListener('mousedown', (e) => this.startResize(e, 'row', cell));
        cell.appendChild(rowHandle);

        const cornerHandle = document.createElement('div');
        cornerHandle.className = 'resize-handle-corner';
        cornerHandle.addEventListener('mousedown', (e) => this.startResize(e, 'corner', cell));
        cell.appendChild(cornerHandle);
    }

    startResize(e, type, cell) {
        e.preventDefault();
        e.stopPropagation();

        this.isResizing = true;
        this.resizeType = type;
        this.resizeTarget = cell;
        this.startX = e.clientX;
        this.startY = e.clientY;

        const rect = cell.getBoundingClientRect();
        this.startWidth = rect.width;
        this.startHeight = rect.height;

        document.body.classList.add('resizing');

        if (type === 'col' || type === 'corner') {
            this.resizeLine = document.createElement('div');
            this.resizeLine.className = 'resize-line vertical';
            this.resizeLine.style.left = e.clientX + 'px';
            document.body.appendChild(this.resizeLine);
        }
        if (type === 'row' || type === 'corner') {
            if (!this.resizeLine) {
                this.resizeLine = document.createElement('div');
                this.resizeLine.className = 'resize-line horizontal';
            } else {
                this.resizeLine.className += ' horizontal';
            }
            this.resizeLine.style.top = e.clientY + 'px';
            if (type === 'row') {
                document.body.appendChild(this.resizeLine);
            }
        }
    }

    handleResize(e) {
        if (!this.isResizing) return;

        const deltaX = e.clientX - this.startX;
        const deltaY = e.clientY - this.startY;

        if (this.resizeType === 'col' || this.resizeType === 'corner') {
            const newWidth = Math.max(50, this.startWidth + deltaX);
            this.resizeTarget.style.width = newWidth + 'px';

            if (this.resizeLine && this.resizeLine.classList.contains('vertical')) {
                this.resizeLine.style.left = e.clientX + 'px';
            }

            const cellIndex = Array.from(this.resizeTarget.parentNode.children).indexOf(this.resizeTarget);
            const table = this.resizeTarget.closest('table');
            const allRowsInTable = table.querySelectorAll('tr');

            allRowsInTable.forEach(row => {
                const cell = row.children[cellIndex];
                if (cell) {
                    cell.style.width = newWidth + 'px';
                }
            });
        }

        if (this.resizeType === 'row' || this.resizeType === 'corner') {
            const newHeight = Math.max(30, this.startHeight + deltaY);

            if (this.resizeLine && (this.resizeLine.classList.contains('horizontal') || this.resizeType === 'row')) {
                this.resizeLine.style.top = e.clientY + 'px';
            }

            const row = this.resizeTarget.parentNode;
            Array.from(row.children).forEach(cell => {
                cell.style.height = newHeight + 'px';
            });
        }
    }

    stopResize() {
        if (!this.isResizing) return;

        this.isResizing = false;
        this.resizeType = null;
        this.resizeTarget = null;

        document.body.classList.remove('resizing');

        if (this.resizeLine) {
            this.resizeLine.remove();
            this.resizeLine = null;
        }
    }

    initializeResizeHandles() {
        const cells = this.table.querySelectorAll('th, td');
        cells.forEach(cell => {
            this.addResizeHandles(cell);
        });
    }

    // Public API methods
    destroy() {
        // Remove styles
        const styleElement = document.getElementById(this.editorId + '-styles');
        if (styleElement) {
            styleElement.remove();
        }

        // Remove context menu
        if (this.contextMenu) {
            this.contextMenu.remove();
        }

        // Remove from global registry
        if (window.tableEditors && window.tableEditors[this.editorId]) {
            delete window.tableEditors[this.editorId];
        }

        // Clear container
        this.container.innerHTML = '';
        this.container.className = '';
    }

    getTableData() {
        const data = [];
        const rows = this.table.querySelectorAll('tr');

        rows.forEach(row => {
            const rowData = [];
            Array.from(row.children).forEach(cell => {
                rowData.push({
                    content: cell.textContent,
                    styles: {
                        textAlign: cell.style.textAlign,
                        fontSize: cell.style.fontSize,
                        backgroundColor: cell.style.backgroundColor,
                        color: cell.style.color
                    },
                    rowSpan: cell.rowSpan || 1,
                    colSpan: cell.colSpan || 1
                });
            });
            data.push(rowData);
        });

        return data;
    }

    setTableData(data) {
        // Clear existing table
        this.table.innerHTML = '';

        data.forEach((rowData, rowIndex) => {
            const row = document.createElement('tr');
            const isHeader = rowIndex === 0 && this.options.showHeaders;

            if (isHeader && !this.table.querySelector('thead')) {
                const thead = document.createElement('thead');
                this.table.appendChild(thead);
            }

            if (!isHeader && !this.table.querySelector('tbody')) {
                const tbody = document.createElement('tbody');
                this.table.appendChild(tbody);
            }

            rowData.forEach(cellData => {
                const cell = document.createElement(isHeader ? 'th' : 'td');
                cell.contentEditable = true;
                cell.textContent = cellData.content;

                if (cellData.styles) {
                    Object.assign(cell.style, cellData.styles);
                }

                if (cellData.rowSpan > 1) cell.rowSpan = cellData.rowSpan;
                if (cellData.colSpan > 1) cell.colSpan = cellData.colSpan;

                this.bindCellEvents(cell);
                row.appendChild(cell);
            });

            const targetParent = isHeader ? this.table.querySelector('thead') : this.table.querySelector('tbody');
            targetParent.appendChild(row);
        });

        this.initializeResizeHandles();
    }
}

// Helper function to create a table editor
function createTableEditor(container, options) {
    return new TableEditor(container, options);
}
}