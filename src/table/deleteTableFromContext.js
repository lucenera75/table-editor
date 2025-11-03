import { contextMenuTarget } from '../state/variables.js';
import { clearSelection } from '../selection/clearSelection.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function deleteTableFromContext() {
    if (!contextMenuTarget) return;

    const tableContainer = contextMenuTarget.closest('.table-container');

    // Confirm deletion
    if (confirm('Are you sure you want to delete this table?')) {
        tableContainer.remove();
        clearSelection();
        hideContextMenu();
    }
}
