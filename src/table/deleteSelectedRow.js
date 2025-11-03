import { contextMenuTarget } from '../state/variables.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function deleteSelectedRow() {
    if (!contextMenuTarget) return;

    const row = contextMenuTarget.parentNode;
    const tbody = row.parentNode;

    if (tbody.children.length <= 1) {
        alert('Cannot remove the last row');
        return;
    }

    row.remove();
    hideContextMenu();
}
