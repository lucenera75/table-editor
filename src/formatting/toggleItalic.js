import { selectedCells, savedSelection } from '../state/variables.js';
import { applyStyleToSelection } from './applyStyleToSelection.js';
import { updateFormatButtons } from './updateFormatButtons.js';
import { updateTextFormatControls } from '../text/showTextFormatMenu.js';

export function toggleItalic() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allItalic = selectedCells.every(cell => {
            const span = cell.querySelector('span');
            const target = span || cell;
            return window.getComputedStyle(target).fontStyle === 'italic';
        });

        selectedCells.forEach(cell => {
            const span = cell.querySelector('span');
            const target = span || cell;
            target.style.fontStyle = allItalic ? 'normal' : 'italic';
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyStyleToSelection('fontStyle', 'italic', 'normal');
        // Update text format menu after applying
        setTimeout(() => updateTextFormatControls(), 10);
    }
}
