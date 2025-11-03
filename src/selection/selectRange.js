import { anchorCell, currentCell, selectedCells, setAnchorCell, setCurrentCell, setSelectedCells } from '../state/variables.js';
import { clearSelection } from './clearSelection.js';

export function selectRange(startCell, endCell) {
    if (!startCell || !endCell) return;

    // Get the table from the startCell instead of hardcoding mainTable
    const table = startCell.closest('table');
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));

    const startRow = startCell.parentNode;
    const endRow = endCell.parentNode;
    const startRowIndex = rows.indexOf(startRow);
    const endRowIndex = rows.indexOf(endRow);
    const startCellIndex = Array.from(startRow.children).indexOf(startCell);
    const endCellIndex = Array.from(endRow.children).indexOf(endCell);

    // Clear current selection
    clearSelection();

    // Determine the range bounds
    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startCellIndex, endCellIndex);
    const maxCol = Math.max(startCellIndex, endCellIndex);

    // Collect all cells in the range
    const newSelectedCells = [];
    for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
        const row = rows[rowIndex];
        for (let colIndex = minCol; colIndex <= maxCol && colIndex < row.children.length; colIndex++) {
            const cell = row.children[colIndex];
            cell.classList.add('cell-selected');
            if (!newSelectedCells.includes(cell)) {
                newSelectedCells.push(cell);
            }
        }
    }

    // Update selected cells using setter
    setSelectedCells(newSelectedCells);

    // Restore anchor and current cell
    setAnchorCell(startCell);
    setCurrentCell(endCell);
}
