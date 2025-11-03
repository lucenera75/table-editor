import { clearSelection } from '../selection/clearSelection.js';


export function deleteTable(button) {
    const tableContainer = button.closest('.table-container');

    // Confirm deletion
    if (confirm('Are you sure you want to delete this table?')) {
        tableContainer.remove();
        clearSelection();
    }
}
