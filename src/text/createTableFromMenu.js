import { savedSelection, isDesignMode } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { hideTextFormatMenu } from './hideTextFormatMenu.js';
import { initializeResizeHandles } from '../resize/initializeResizeHandles.js';

export function createTableFromMenu() {
    // Prompt for table dimensions
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');

    if (!rows || !cols || isNaN(rows) || isNaN(cols)) {
        return;
    }

    const numRows = parseInt(rows);
    const numCols = parseInt(cols);

    if (numRows < 1 || numCols < 1) {
        alert('Table must have at least 1 row and 1 column');
        return;
    }

    // Create table element
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.marginTop = '10px';
    table.style.marginBottom = '10px';

    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (let c = 0; c < numCols; c++) {
        const th = document.createElement('th');
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.position = 'relative';
        th.onmousedown = function(e) { selectCell(this, e); };
        th.oncontextmenu = function(e) { showContextMenu(e, this); };

        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = `Header ${c + 1}`;
        th.appendChild(span);

        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body rows
    const tbody = document.createElement('tbody');
    for (let r = 0; r < numRows - 1; r++) {
        const row = document.createElement('tr');
        for (let c = 0; c < numCols; c++) {
            const td = document.createElement('td');
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px';
            td.style.position = 'relative';
            td.onmousedown = function(e) { selectCell(this, e); };
            td.oncontextmenu = function(e) { showContextMenu(e, this); };

            const span = document.createElement('span');
            span.contentEditable = isDesignMode ? 'false' : 'true';
            span.textContent = `Cell ${r + 1}-${c + 1}`;
            td.appendChild(span);

            row.appendChild(td);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    // Insert table at cursor position or at the end of contenteditable area
    if (savedSelection) {
        savedSelection.deleteContents();
        savedSelection.insertNode(table);

        // Add line break after table for easier editing
        const br = document.createElement('br');
        table.parentNode.insertBefore(br, table.nextSibling);
    } else {
        // Find a contenteditable element and append to it
        const editableDiv = document.querySelector('[contenteditable="true"]');
        if (editableDiv) {
            editableDiv.appendChild(table);
            editableDiv.appendChild(document.createElement('br'));
        }
    }

    // Initialize resize handles for the new table
    setTimeout(() => {
        initializeResizeHandles();
    }, 10);

    hideTextFormatMenu();
}
