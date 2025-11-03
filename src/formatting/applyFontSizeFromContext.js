import { selectedCells } from '../state/variables.js';

export function applyFontSizeFromContext() {
    const fontSize = document.getElementById('contextFontSizeInput').value;
    selectedCells.forEach(cell => {
        cell.style.fontSize = fontSize + 'px';
    });
}
