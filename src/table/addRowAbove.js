import { contextMenuTarget, isDesignMode, newCellCounter, setNewCellCounter } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';
import { getCellsNeededForRow } from './getCellsNeededForRow.js';
import { addResizeHandles } from '../resize/addResizeHandles.js';
import { addRowDragHandle } from '../drag/addRowDragHandle.js';

export function addRowAbove() {
    if (!contextMenuTarget) return;

    const currentRow = contextMenuTarget.parentNode;
    const table = contextMenuTarget.closest('table');
    const allRows = Array.from(table.querySelectorAll('tr'));
    const insertIndex = allRows.indexOf(currentRow);

    // First, increase rowspan for any cells from above that span through this position
    for (let rowIdx = 0; rowIdx < insertIndex; rowIdx++) {
        const row = allRows[rowIdx];
        Array.from(row.children).forEach(cell => {
            const rowspan = cell.rowSpan || 1;
            // If this cell spans down to or past our insert position, increase its rowspan
            if (rowIdx + rowspan > insertIndex) {
                cell.rowSpan = rowspan + 1;
            }
        });
    }

    const cellsNeeded = getCellsNeededForRow(table, currentRow);
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

    currentRow.parentNode.insertBefore(newRow, currentRow);
    addRowDragHandle(newRow);
    hideContextMenu();
}
