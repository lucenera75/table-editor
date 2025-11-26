import { clearSelection } from '../selection/clearSelection.js';


export function deleteTable(button) {
    const table = button.closest('table');
    if (!table) return;

    // Confirm deletion
    if (confirm('Are you sure you want to delete this table?')) {
        table.remove();
        clearSelection();
    }
}
