import { anchorCell, currentCell, isMouseSelecting, isResizing, selectedCells, selectionStartCell, setAnchorCell, setCurrentCell, setIsMouseSelecting, setSelectionStartCell, setSelectedCells } from '../state/variables.js';
import { clearSelection } from './clearSelection.js';
import { updateFormatControls } from '../formatting/updateFormatControls.js';

export function startMouseSelection(cell) {
    console.log('=== startMouseSelection CALLED ===');
    console.log('Cell:', cell);
    console.log('Cell table ID:', cell.closest('table')?.id || 'NO ID');

    if (isResizing) return;

    setIsMouseSelecting(true);
    setSelectionStartCell(cell);
    clearSelection();

    // Set anchor AFTER clearing selection
    setAnchorCell(cell);
    cell.classList.add('cell-selected');
    setSelectedCells([cell]);
    setCurrentCell(cell);
    console.log('Added mouseover and mouseup listeners');
    // Add event listeners for drag selection
    document.addEventListener('mouseover', handleMouseOverCell);
    document.addEventListener('mouseup', stopMouseSelection);

    updateFormatControls(cell);
}
