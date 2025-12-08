import { contextMenuTarget, isDesignMode, newCellCounter, setNewCellCounter } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';
import { getCellsNeededForRow } from './getCellsNeededForRow.js';
import { addResizeHandles } from '../resize/addResizeHandles.js';
import { addRowDragHandle } from '../drag/addRowDragHandle.js';

export function addRowBelow() {
    if (!contextMenuTarget) return;

    const currentRow = contextMenuTarget.parentNode;
    const table = contextMenuTarget.closest('table');
    const allRows = Array.from(table.querySelectorAll('tr'));
    const currentIndex = allRows.indexOf(currentRow);

    // Find the actual last row that the clicked cell spans to
    const clickedCellRowSpan = contextMenuTarget.rowSpan || 1;
    const lastSpannedRowIndex = currentIndex + clickedCellRowSpan - 1;
    const lastSpannedRow = allRows[lastSpannedRowIndex];
    const insertIndex = lastSpannedRowIndex + 1;

    // First, increase rowspan for any cells from above (up to and including last spanned row) that span through this position
    for (let rowIdx = 0; rowIdx <= lastSpannedRowIndex; rowIdx++) {
        const row = allRows[rowIdx];
        Array.from(row.children).forEach(cell => {
            const rowspan = cell.rowSpan || 1;
            // If this cell spans down to or past our insert position, increase its rowspan
            if (rowIdx + rowspan > insertIndex) {
                cell.rowSpan = rowspan + 1;
            }
        });
    }

    const nextRow = lastSpannedRow ? lastSpannedRow.nextSibling : null;
    const cellsNeeded = getCellsNeededForRow(table, nextRow);
    const newRow = document.createElement('tr');

    // Copy classes and styles from the current row to the new row
    if (currentRow.className) {
        newRow.className = currentRow.className;
    }
    if (currentRow.style.cssText) {
        newRow.style.cssText = currentRow.style.cssText;
    }

    // Get cells from current row for reference (excluding cells that span from above)
    const currentRowCells = Array.from(currentRow.children);

    for (let i = 0; i < cellsNeeded; i++) {
        const cell = document.createElement('td');

        // Copy styles and classes from corresponding cell in current row if available
        const referenceCell = currentRowCells[Math.min(i, currentRowCells.length - 1)];
        if (referenceCell) {
            if (referenceCell.className) {
                cell.className = referenceCell.className;
            }
            // Copy relevant inline styles
            if (referenceCell.style.border) cell.style.border = referenceCell.style.border;
            if (referenceCell.style.backgroundColor) cell.style.backgroundColor = referenceCell.style.backgroundColor;
            if (referenceCell.style.width) cell.style.width = referenceCell.style.width;
            if (referenceCell.style.height) cell.style.height = referenceCell.style.height;
            if (referenceCell.style.textAlign) cell.style.textAlign = referenceCell.style.textAlign;
            if (referenceCell.style.verticalAlign) cell.style.verticalAlign = referenceCell.style.verticalAlign;
            if (referenceCell.style.padding) cell.style.padding = referenceCell.style.padding;
        } else {
            cell.style.border = '1px solid #ddd';
        }

        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        const nextCounter = newCellCounter + 1;
        setNewCellCounter(nextCounter);
        span.textContent = `New Cell ${nextCounter}`;
        cell.appendChild(span);
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        newRow.appendChild(cell);
    }

    if (lastSpannedRow) {
        lastSpannedRow.parentNode.insertBefore(newRow, lastSpannedRow.nextSibling);
    } else {
        currentRow.parentNode.appendChild(newRow);
    }
    addRowDragHandle(newRow);
    hideContextMenu();
}
