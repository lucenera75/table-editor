// Initialize event handlers for existing tables in the document

import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { isDesignMode } from '../state/variables.js';

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

        // Wrap content in span if not already wrapped
        // Check if cell's first child is a span with contentEditable attribute
        const hasProperSpan = cell.firstElementChild?.tagName === 'SPAN' &&
                             cell.firstElementChild.hasAttribute('contenteditable');

        if (!hasProperSpan) {
            // Get all current content
            const currentContent = cell.innerHTML;

            // Create a span to wrap the content
            const span = document.createElement('span');
            span.contentEditable = isDesignMode ? 'false' : 'true';
            span.innerHTML = currentContent;

            // Clear cell and add the span
            cell.innerHTML = '';
            cell.appendChild(span);
        }
    });

    console.log(`Initialized ${cells.length} table cells`);
}
