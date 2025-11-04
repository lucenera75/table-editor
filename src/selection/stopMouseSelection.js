import { currentCell, isMouseSelecting, selectedCells, setIsMouseSelecting } from '../state/variables.js';
import { handleMouseOverCell } from './handleMouseOverCell.js';

export function stopMouseSelection() {
    console.log('=== stopMouseSelection CALLED ===');
    console.log('isMouseSelecting:', isMouseSelecting);
    console.log('selectedCells.length:', selectedCells.length);

    if (!isMouseSelecting) return;

    setIsMouseSelecting(false);
    console.log('Removing mouseover and mouseup listeners');
    document.removeEventListener('mouseover', handleMouseOverCell);
    document.removeEventListener('mouseup', stopMouseSelection);

    console.log('Setting focus to current cell');
    // Set focus to the current cell for keyboard navigation
    if (currentCell) {
        currentCell.tabIndex = 0;
        currentCell.focus();
        console.log('Focus set to cell in table:', currentCell.closest('table')?.id || 'NO ID');
    }

    console.log('stopMouseSelection COMPLETE - selectedCells.length:', selectedCells.length);
}
