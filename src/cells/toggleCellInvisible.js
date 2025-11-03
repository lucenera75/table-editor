import { selectedCells } from '../state/variables.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function toggleCellInvisible() {
    if (selectedCells.length === 0) {
        alert('Please select at least one cell');
        return;
    }

    selectedCells.forEach(cell => {
        // Check if cell is currently invisible
        const isInvisible = cell.style.border === 'none' || cell.style.border === '';

        if (isInvisible) {
            // Make visible - restore default styling
            cell.style.border = '';
            cell.style.backgroundColor = '';
        } else {
            // Make invisible - remove border and background
            cell.style.border = 'none';
            cell.style.backgroundColor = 'transparent';
        }
    });

    hideContextMenu();
}
