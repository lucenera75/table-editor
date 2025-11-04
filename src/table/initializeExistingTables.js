// Initialize event handlers for existing tables in the document

import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';

export function initializeExistingTables() {
    // Find all table cells (td and th) in the document
    const cells = document.querySelectorAll('table td, table th');

    cells.forEach(cell => {
        // Only add handlers if they don't already exist
        if (!cell.onmousedown) {
            cell.onmousedown = function(e) { selectCell(this, e); };
        }
        if (!cell.oncontextmenu) {
            cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        }

        // Ensure cell has position: relative for resize handles
        if (!cell.style.position) {
            cell.style.position = 'relative';
        }
    });

    console.log(`Initialized ${cells.length} table cells`);
}
