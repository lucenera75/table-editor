import { selectedCells, isDesignMode } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { addResizeHandles } from '../resize/addResizeHandles.js';

export function addColumn() {
    // Get table from the first selected cell, or fallback to mainTable
    const table = (selectedCells.length > 0 && selectedCells[0].closest('table')) || document.getElementById('mainTable');
    if (!table) return;

    const rows = table.querySelectorAll('tr');

    rows.forEach((row, rowIndex) => {
        const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
        cell.style.border = '1px solid #ddd';
        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = rowIndex === 0 ? `Header ${row.children.length + 1}` : `Cell ${rowIndex},${row.children.length + 1}`;
        cell.appendChild(span);
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        row.appendChild(cell);
    });
}
