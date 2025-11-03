import { selectedCells, isDesignMode, newCellCounter } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { getCellsNeededForRow } from './getCellsNeededForRow.js';
import { addResizeHandles } from '../resize/addResizeHandles.js';

export function addRow() {
    // Get table from the first selected cell, or fallback to mainTable
    const table = (selectedCells.length > 0 && selectedCells[0].closest('table')) || document.getElementById('mainTable');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const cellsNeeded = getCellsNeededForRow(table, null);

    const newRow = document.createElement('tr');

    for (let i = 0; i < cellsNeeded; i++) {
        const cell = document.createElement('td');
        cell.style.border = '1px solid #ddd';
        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = `New Cell ${(setNewCellCounter(newCellCounter + 1), newCellCounter)}`;
        cell.appendChild(span);
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        newRow.appendChild(cell);
    }

    tbody.appendChild(newRow);
}
