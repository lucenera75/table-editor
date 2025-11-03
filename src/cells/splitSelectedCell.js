import { selectedCells, isDesignMode } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { clearSelection } from '../selection/clearSelection.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';
import { addResizeHandles } from '../resize/addResizeHandles.js';

export function splitSelectedCell() {
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
            newCell.style.border = '1px solid #ddd';
            const span = document.createElement('span');
            span.contentEditable = isDesignMode ? 'false' : 'true';
            span.textContent = '';
            newCell.appendChild(span);
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
