import { currentCell, isMouseSelecting, selectedCells, selectionStartCell, setCurrentCell } from '../state/variables.js';
import { selectRange } from './selectRange.js';

export function handleMouseOverCell(e) {
    if (!isMouseSelecting) return;

    const cell = e.target.closest('td, th');
    if (!cell || !selectionStartCell) return;

    // Check if the cell is in the same table
    if (cell.closest('table') !== selectionStartCell.closest('table')) return;

    console.log('=== handleMouseOverCell - dragging to cell ===');
    console.log('Cell:', cell);
    console.log('selectedCells.length before selectRange:', selectedCells.length);

    // Select range from start to current cell
    selectRange(selectionStartCell, cell);
    setCurrentCell(cell);
    console.log('selectedCells.length after selectRange:', selectedCells.length);
}
