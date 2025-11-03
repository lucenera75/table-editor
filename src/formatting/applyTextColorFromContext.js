import { selectedCells, currentTextColor } from '../state/variables.js';

export function applyTextColorFromContext() {
    selectedCells.forEach(cell => {
        cell.style.color = currentTextColor;
    });
}
