import { contextMenuTarget } from '../state/variables.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function moveRowDown() {
    if (!contextMenuTarget) return;

    const row = contextMenuTarget.parentNode;
    const nextRow = row.nextElementSibling;

    if (!nextRow) {
        alert('This is already the last row');
        return;
    }

    row.parentNode.insertBefore(nextRow, row);
    hideContextMenu();
}
