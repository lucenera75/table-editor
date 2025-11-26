import { contextMenuTarget } from '../state/variables.js';
import { clearSelection } from '../selection/clearSelection.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function deleteTableFromContext() {
    if (!contextMenuTarget) return;

    const table = contextMenuTarget.closest('table');
    if (!table) return;

    // Confirm deletion
    if (confirm('Are you sure you want to delete this table?')) {
        table.remove();
        clearSelection();
        hideContextMenu();
    }
}
