import { selectedCells } from '../state/variables.js';

export function applyAlignmentFromContext() {
    const alignment = document.getElementById('contextAlignSelect').value;
    selectedCells.forEach(cell => {
        cell.style.textAlign = alignment;
    });
}
