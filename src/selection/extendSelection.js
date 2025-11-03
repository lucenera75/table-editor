import { anchorCell, currentCell, setCurrentCell } from '../state/variables.js';
import { selectRange } from './selectRange.js';

export function extendSelection(direction) {
    if (!currentCell) return;

    // Get the table from the current cell instead of hardcoding mainTable
    const table = currentCell.closest('table');
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    const currentRow = currentCell.parentNode;
    const currentRowIndex = rows.indexOf(currentRow);
    const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell);

    let newCell = null;

    switch(direction) {
        case 'up':
            if (currentRowIndex > 0) {
                const targetRow = rows[currentRowIndex - 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'down':
            if (currentRowIndex < rows.length - 1) {
                const targetRow = rows[currentRowIndex + 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'left':
            if (currentCellIndex > 0) {
                newCell = currentRow.children[currentCellIndex - 1];
            }
            break;
        case 'right':
            if (currentCellIndex < currentRow.children.length - 1) {
                newCell = currentRow.children[currentCellIndex + 1];
            }
            break;
    }

    if (newCell) {
        // Update current cell
        setCurrentCell(newCell);
        newCell.tabIndex = 0;
        newCell.focus();

        // Select range from anchor to new cell
        selectRange(anchorCell, newCell);
    }
}
