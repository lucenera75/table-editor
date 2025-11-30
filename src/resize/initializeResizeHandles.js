import { addResizeHandles } from './addResizeHandles.js';
import { addRowDragHandle } from '../drag/addRowDragHandle.js';
import { addColumnDragHandle } from '../drag/addColumnDragHandle.js';


export function initializeResizeHandles() {
    console.log('initializeResizeHandles called');

    // Only initialize resize handles for tables within editable-contents-area
    const container = document.getElementById('editable-contents-area');
    if (!container) {
        return;
    }

    const tables = container.querySelectorAll('table');
    console.log('Found tables:', tables.length);
    tables.forEach(table => {
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
            addResizeHandles(cell);
        });

        // Add drag handles to rows
        const rows = table.querySelectorAll('tbody tr');
        console.log('Found tbody rows:', rows.length);
        rows.forEach(row => {
            addRowDragHandle(row);
        });

        // Add drag handles to header columns
        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach((cell, index) => {
            addColumnDragHandle(cell, index);
        });
    });
}
