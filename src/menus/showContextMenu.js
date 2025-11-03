import { anchorCell, contextMenuTarget, currentCell, selectedCells, setAnchorCell, setContextMenuTarget, setCurrentCell, setSelectedCells } from '../state/variables.js';
import { clearSelection } from '../selection/clearSelection.js';
import { updateFormatControls } from '../formatting/updateFormatControls.js';

export function showContextMenu(event, cell) {
    event.preventDefault();
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
