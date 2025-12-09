import { anchorCell, contextMenuTarget, currentCell, selectedCells, setAnchorCell, setContextMenuTarget, setCurrentCell, setSelectedCells } from '../state/variables.js';
import { clearSelection } from '../selection/clearSelection.js';
import { updateFormatControls } from '../formatting/updateFormatControls.js';
import { updateNextPageButton } from '../pagination/toggleNextPage.js';

export function showContextMenu(event, cell) {
    // Only show context menu for cells within editable-contents-area
    const container = document.getElementById('editable-contents-area');
    if (!container || !container.contains(cell)) {
        return;
    }

    event.preventDefault();

    // Store the target for page-level operations
    window._contextMenuPageTarget = cell;

    setContextMenuTarget(cell);
    // Only change selection if right-clicking on a cell that's not already selected
    if (!selectedCells.includes(cell)) {
        clearSelection();
        cell.classList.add('cell-selected');
        setSelectedCells([cell]);
        setCurrentCell(cell);
        setAnchorCell(cell);
    }

    updateFormatControls(cell);

    const contextMenu = document.getElementById('contextMenu');

    // Check if the table has a split-group-id to show/hide Join Tables button
    const table = cell.closest('table');
    const joinTablesBtn = document.getElementById('joinTablesBtn');
    if (joinTablesBtn) {
        if (table && table.getAttribute('data-split-group-id')) {
            joinTablesBtn.style.display = 'block';
        } else {
            joinTablesBtn.style.display = 'none';
        }
    }

    // Update the next-page button state
    updateNextPageButton(cell);

    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    const menuRect = contextMenu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (menuRect.right > windowWidth) {
        contextMenu.style.left = (event.pageX - menuRect.width) + 'px';
    }

    if (menuRect.bottom > windowHeight) {
        contextMenu.style.top = (event.pageY - menuRect.height) + 'px';
    }
}
