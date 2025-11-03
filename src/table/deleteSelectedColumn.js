import { contextMenuTarget } from '../state/variables.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function deleteSelectedColumn() {
    if (!contextMenuTarget) return;

    const cellIndex = Array.from(contextMenuTarget.parentNode.children).indexOf(contextMenuTarget);
    const table = contextMenuTarget.closest('table');
    if (!table) return;

    const rows = table.querySelectorAll('tr');

    if (rows[0].children.length <= 1) {
        alert('Cannot remove the last column');
        return;
    }

    rows.forEach(row => {
        if (row.children[cellIndex]) {
            row.children[cellIndex].remove();
        }
    });

    hideContextMenu();
}
