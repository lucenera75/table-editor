import { selectedCells, savedSelection } from '../state/variables.js';
import { applyStyleToSelection } from './applyStyleToSelection.js';
import { updateFormatButtons } from './updateFormatButtons.js';

export function toggleBold() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allBold = selectedCells.every(cell => {
            const weight = window.getComputedStyle(cell).fontWeight;
            return weight === 'bold' || weight === '700';
        });

        selectedCells.forEach(cell => {
            cell.style.fontWeight = allBold ? 'normal' : 'bold';
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyStyleToSelection('fontWeight', 'bold', 'normal');
    }
}
