import { selectedCells, currentBgColor } from '../state/variables.js';

export function applyBackgroundColorFromContext() {
    selectedCells.forEach(cell => {
        cell.style.backgroundColor = currentBgColor;
    });
}
