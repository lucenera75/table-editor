import { selectedCells, savedSelection } from '../state/variables.js';
import { applyStyleToSelection } from './applyStyleToSelection.js';
import { updateFormatButtons } from './updateFormatButtons.js';
import { updateTextFormatControls } from '../text/showTextFormatMenu.js';

export function toggleBold() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allBold = selectedCells.every(cell => {
            const span = cell.querySelector('span');
            const target = span || cell;
            const weight = window.getComputedStyle(target).fontWeight;
            return weight === 'bold' || weight === '700';
        });

        selectedCells.forEach(cell => {
            const span = cell.querySelector('span');
            const target = span || cell;
            target.style.fontWeight = allBold ? 'normal' : 'bold';
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyStyleToSelection('fontWeight', 'bold', 'normal');
        // Update text format menu after applying
        setTimeout(() => updateTextFormatControls(), 10);
    }
}
