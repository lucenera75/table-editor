import { contextMenuTarget } from '../state/variables.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';
import { addRowDragHandle } from '../drag/addRowDragHandle.js';

export function sortColumn(ascending) {
    const cell = contextMenuTarget;
    const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
    const table = cell.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Sort rows based on the column content
    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[cellIndex];
        const cellB = rowB.children[cellIndex];

        if (!cellA || !cellB) return 0;

        const textA = cellA.textContent.trim();
        const textB = cellB.textContent.trim();

        // Check if values are numbers
        const numA = parseFloat(textA);
        const numB = parseFloat(textB);
        const isNumA = !isNaN(numA) && textA !== '';
        const isNumB = !isNaN(numB) && textB !== '';

        // Numbers come before letters
        if (isNumA && !isNumB) return ascending ? -1 : 1;
        if (!isNumA && isNumB) return ascending ? 1 : -1;

        // Both numbers - compare numerically
        if (isNumA && isNumB) {
            return ascending ? numA - numB : numB - numA;
        }

        // Both text - compare alphabetically (case insensitive)
        const compareResult = textA.toLowerCase().localeCompare(textB.toLowerCase());
        return ascending ? compareResult : -compareResult;
    });

    // Re-append rows in sorted order
    rows.forEach(row => tbody.appendChild(row));

    // Re-add drag handles
    rows.forEach(row => addRowDragHandle(row));

    hideContextMenu();
}
