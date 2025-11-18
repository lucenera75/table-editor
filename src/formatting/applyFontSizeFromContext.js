import { selectedCells } from '../state/variables.js';

export function applyFontSizeFromContext() {
    const display = document.getElementById('contextFontSizeDisplay');
    if (!display) return;

    const fontSize = parseInt(display.textContent) || 14;
    selectedCells.forEach(cell => {
        cell.style.fontSize = fontSize + 'px';
    });
}
