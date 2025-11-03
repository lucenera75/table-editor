import { selectedCells } from '../state/variables.js';

export function applyVerticalAlignmentFromContext() {
    const alignment = document.getElementById('contextVerticalAlignSelect').value;
    selectedCells.forEach(cell => {
        cell.style.verticalAlign = alignment;
    });
}
