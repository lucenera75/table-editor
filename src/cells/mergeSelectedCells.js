import { selectedCells, isDesignMode } from '../state/variables.js';
import { clearSelection } from '../selection/clearSelection.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';
import { areSelectedCellsAdjacent } from './areSelectedCellsAdjacent.js';
import { addResizeHandles } from '../resize/addResizeHandles.js';

export function mergeSelectedCells() {
    if (selectedCells.length < 2) {
        alert('Please select at least 2 cells to merge');
        return;
    }

    // Check if cells are adjacent (horizontally or vertically)
    if (!areSelectedCellsAdjacent()) {
        alert('Please select adjacent cells to merge (horizontally or vertically)');
        return;
    }

    const firstCell = selectedCells[0];
    let content = selectedCells.map(cell => cell.textContent.trim()).filter(text => text).join(' ');

    // Get cell positions
    const cellPositions = selectedCells.map(cell => {
        const row = cell.parentNode;
        const table = row.parentNode.parentNode;
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        const colIndex = Array.from(row.children).indexOf(cell);
        return { cell, rowIndex, colIndex };
    });

    // Find bounds
    let minRow = Math.min(...cellPositions.map(p => p.rowIndex));
    let maxRow = Math.max(...cellPositions.map(p => p.rowIndex));
    let minCol = Math.min(...cellPositions.map(p => p.colIndex));
    let maxCol = Math.max(...cellPositions.map(p => p.colIndex));

    const rowSpan = maxRow - minRow + 1;
    const colSpan = maxCol - minCol + 1;

    // Remove all cells except the first one
    selectedCells.forEach(cell => {
        if (cell !== firstCell) {
            cell.remove();
        }
    });

    // Set span attributes on the first cell
    if (rowSpan > 1) firstCell.rowSpan = rowSpan;
    if (colSpan > 1) firstCell.colSpan = colSpan;

    // Update the span content instead of the cell directly
    const span = firstCell.querySelector('span');
    if (span) {
        span.textContent = content;
    } else {
        // If no span exists, create one
        const newSpan = document.createElement('span');
        newSpan.contentEditable = isDesignMode ? 'false' : 'true';
        newSpan.textContent = content;
        firstCell.textContent = ''; // Clear cell
        firstCell.appendChild(newSpan);
    }

    // Re-add resize handles to the merged cell
    addResizeHandles(firstCell);

    clearSelection();
    hideContextMenu();
}
