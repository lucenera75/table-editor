import { anchorCell, currentCell, isEditMode, isMouseSelecting, isResizing, selectedCells, setAnchorCell, setCurrentCell, setSelectedCells } from '../state/variables.js';
import { clearSelection } from './clearSelection.js';
import { startMouseSelection } from './startMouseSelection.js';
import { selectRange } from './selectRange.js';
import { exitEditMode } from '../edit/exitEditMode.js';
import { updateFormatControls } from '../formatting/updateFormatControls.js';

export function selectCell(cell, event = null) {
    console.log('=== selectCell CALLED ===');
    console.log('Cell:', cell);
    console.log('Cell table ID:', cell.closest('table')?.id || 'NO ID');
    console.log('Event:', event);
    console.log('Event type:', event?.type);
    console.log('Event button:', event?.button);
    console.log('Current selectedCells.length:', selectedCells.length);
    console.log('isResizing:', isResizing);
    console.log('isMouseSelecting:', isMouseSelecting);

    // Don't interfere if we're resizing
    if (isResizing) {
        console.log('RETURN: isResizing');
        return;
    }

    // Don't clear multi-selection if we're just finishing a drag operation
    // This can happen when click/focus events fire after mouseup
    if (selectedCells.length > 1 && !event) {
        console.log('RETURN: multi-selection without event');
        return;
    }

    // If we're in edit mode and clicking on a different cell, exit edit mode first
    if (isEditMode && currentCell && currentCell !== cell) {
        console.log('Exiting edit mode');
        exitEditMode();
    }

    // Check if this is a right-click (context menu) - preserve selection if cell is already selected
    if (event && event.button === 2) {
        console.log('Right-click detected');
        if (selectedCells.includes(cell)) {
            console.log('RETURN: right-click on already selected cell');
            // Cell is already selected, don't change selection
            return;
        }
    }

    // Handle mousedown events
    if (event && event.type === 'mousedown' && event.button === 0) {
        console.log('Mousedown detected');
        event.preventDefault();

        // Check if this is a Shift+click to select range
        if (event.shiftKey && anchorCell) {
            console.log('RETURN: Shift+click range selection');
            selectRange(anchorCell, cell);
            setCurrentCell(cell);
            cell.tabIndex = 0;
            cell.focus();
            updateFormatControls(cell);
            return;
        }

        // Otherwise, start drag selection (for normal click without Shift)
        if (!event.ctrlKey && !event.metaKey) {
            console.log('RETURN: Starting drag selection');
            startMouseSelection(cell);
            return;
        }
    }

    // Ignore click events that happen after drag selection - they would clear the selection
    // Also ignore any events that aren't mousedown when we already have multiple cells selected
    if (event && selectedCells.length > 1) {
        console.log('Multi-selection exists, checking event type');
        if (event.type === 'click') {
            console.log('RETURN: Ignoring click event with multi-selection');
            return;
        }
        // If it's not a mousedown event and we have multiple cells selected, preserve selection
        if (event.type !== 'mousedown') {
            console.log('RETURN: Ignoring non-mousedown event with multi-selection');
            return;
        }
    }

    // Handle Ctrl/Cmd+click for multi-select
    console.log('Checking if should clear selection');
    if (!event || (!event.ctrlKey && !event.metaKey)) {
        console.log('CLEARING SELECTION');
        clearSelection();
    } else {
        console.log('NOT clearing selection (Ctrl/Cmd held)');
    }

    cell.classList.add('cell-selected');
    if (!selectedCells.includes(cell)) {
        setSelectedCells([...selectedCells, cell]);
    }

    // Set as current cell for keyboard navigation
    setCurrentCell(cell);
    setAnchorCell(cell); // Set anchor for range selection
    cell.tabIndex = 0; // Make it focusable
    cell.focus();

    updateFormatControls(cell);
}
