import { selectedCells } from '../state/variables.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function deleteCell() {
    if (selectedCells.length === 0) {
        alert('Please select at least one cell');
        return;
    }

    selectedCells.forEach(cell => {
        // Hide borders and make transparent
        cell.style.border = 'none';
        cell.style.backgroundColor = 'transparent';

        // Clear content
        const span = cell.querySelector('span');
        if (span) {
            span.textContent = '';
        }
    });

    hideContextMenu();
}
