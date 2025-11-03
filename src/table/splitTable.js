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

    newContainer.appendChild(newTable);

    tableContainer.parentNode.insertBefore(newContainer, tableContainer.nextSibling);

    clearSelection();
}
