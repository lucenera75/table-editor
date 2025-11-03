import { selectedCells } from '../state/variables.js';
import { clearSelection } from '../selection/clearSelection.js';

export function removeColumn() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in the column you want to remove');
        return;
    }

    const cellIndex = Array.from(selectedCells[0].parentNode.children).indexOf(selectedCells[0]);
    const table = selectedCells[0].closest('table');
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

    clearSelection();
}
