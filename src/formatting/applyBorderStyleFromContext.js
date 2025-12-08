import { selectedCells, currentBorderColor } from '../state/variables.js';

export function applyBorderStyleFromContext() {
    if (selectedCells.length === 0) return;

    const borderWidth = document.getElementById('borderWidthSelect').value;
    const borderStyle = document.getElementById('borderStyleSelect').value;
    const borderColor = currentBorderColor || '#dddddd';

    selectedCells.forEach(cell => {
        if (borderWidth === '0') {
            // Remove border
            cell.style.border = 'none';
        } else {
            // Apply border with width, style, and color
            cell.style.border = `${borderWidth}px ${borderStyle} ${borderColor}`;
        }
    });
}
