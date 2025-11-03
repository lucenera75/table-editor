import { contextMenuTarget } from '../state/variables.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function moveRowUp() {
    if (!contextMenuTarget) return;

    const row = contextMenuTarget.parentNode;
    const previousRow = row.previousElementSibling;

    if (!previousRow) {
        alert('This is already the first row');
        return;
    }

    row.parentNode.insertBefore(row, previousRow);
    hideContextMenu();
}
