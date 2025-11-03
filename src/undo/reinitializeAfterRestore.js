import { anchorCell, currentCell, selectedCells, setAnchorCell, setCurrentCell, setSelectedCells } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';
import { hideTextFormatMenu } from '../text/hideTextFormatMenu.js';
import { initializeResizeHandles } from '../resize/initializeResizeHandles.js';

export function reinitializeAfterRestore() {
    // Reinitialize all table cell event handlers
    const tables = document.querySelectorAll('table');
    tables.forEach(table => {
        const cells = table.querySelectorAll('td, th');
        cells.forEach(cell => {
            // Reattach event handlers
            cell.onmousedown = function(e) { selectCell(this, e); };
            cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        });
    });

    // Reinitialize resize handles
    initializeResizeHandles();

    // Clear any selections
    setSelectedCells([]);
    setCurrentCell(null);
    setAnchorCell(null);
    // Hide any open menus
    hideContextMenu();
    hideTextFormatMenu();

    console.log('Event handlers reinitialized after restore');
}
