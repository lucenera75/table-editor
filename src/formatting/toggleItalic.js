import { selectedCells, savedSelection } from '../state/variables.js';
import { applyStyleToSelection } from './applyStyleToSelection.js';
import { updateFormatButtons } from './updateFormatButtons.js';

export function toggleItalic() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allItalic = selectedCells.every(cell => {
            return window.getComputedStyle(cell).fontStyle === 'italic';
        });

        selectedCells.forEach(cell => {
            cell.style.fontStyle = allItalic ? 'normal' : 'italic';
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyStyleToSelection('fontStyle', 'italic', 'normal');
    }
}
