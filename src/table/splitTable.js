import { selectedCells, selectedRow } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { clearSelection } from '../selection/clearSelection.js';
import { showContextMenu } from '../menus/showContextMenu.js';

export function splitTable() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in the row where you want to split the table');
        return;
    }

    const selectedRow = selectedCells[0].parentNode;
    const table = selectedCells[0].closest('table');
    if (!table) return;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');

    // Get all tbody rows only (exclude header rows)
    const tbodyRows = tbody ? Array.from(tbody.querySelectorAll('tr')) : Array.from(table.querySelectorAll('tr'));
    const selectedRowIndex = tbodyRows.indexOf(selectedRow);

    if (selectedRowIndex < 0) {
        alert('Cannot split at header row');
        return;
    }

    if (selectedRowIndex === 0 && tbodyRows.length === 1) {
        alert('Cannot split - only one row remaining');
        return;
    }

    // Generate a unique split group ID (or use existing one if table was already split)
    const splitGroupId = table.getAttribute('data-split-group-id') || `split-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    // Mark the original table with the split group ID
    table.setAttribute('data-split-group-id', splitGroupId);

    const headerRow = table.querySelector('thead tr');
    const rowsToMove = tbodyRows.slice(selectedRowIndex);

    const newTable = document.createElement('table');
    newTable.style.marginTop = '20px';

    // Mark the new table with the same split group ID
    newTable.setAttribute('data-split-group-id', splitGroupId);

    // Only create thead if original table has one
    if (headerRow) {
        const newThead = document.createElement('thead');
        const newHeaderRow = headerRow.cloneNode(true);
        Array.from(newHeaderRow.children).forEach(cell => {
            cell.onmousedown = function(e) { selectCell(this, e); };
            cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        });
        newThead.appendChild(newHeaderRow);
        newTable.appendChild(newThead);
    }

    const newTbody = document.createElement('tbody');
    rowsToMove.forEach(row => {
        Array.from(row.children).forEach(cell => {
            cell.onmousedown = function(e) { selectCell(this, e); };
            cell.oncontextmenu = function(e) { showContextMenu(e, this); };
            cell.style.position = 'relative'; // Required for resize handles
        });
        newTbody.appendChild(row);
    });
    newTable.appendChild(newTbody);

    // Copy table styles from original
    newTable.style.borderCollapse = table.style.borderCollapse || 'collapse';
    newTable.style.marginTop = '20px';

    // Insert the new table after the original table
    // Try to maintain the same parent structure
    if (table.nextSibling) {
        table.parentNode.insertBefore(newTable, table.nextSibling);
    } else {
        table.parentNode.appendChild(newTable);
    }

    clearSelection();
}
