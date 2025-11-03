import { selectedCells } from '../state/variables.js';
import { clearSelection } from '../selection/clearSelection.js';

export function removeRow() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in the row you want to remove');
        return;
    }

    const row = selectedCells[0].parentNode;
    const tbody = row.parentNode;

    if (tbody.children.length <= 1) {
        alert('Cannot remove the last row');
        return;
    }

    row.remove();
    clearSelection();
}
