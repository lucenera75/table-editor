import { selectedCells, savedSelection } from '../state/variables.js';
import { applyTextDecorationToSelection } from './applyTextDecorationToSelection.js';
import { updateFormatButtons } from './updateFormatButtons.js';
import { updateTextFormatControls } from '../text/showTextFormatMenu.js';

export function toggleUnderline() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allUnderlined = selectedCells.every(cell => {
            const span = cell.querySelector('span');
            const target = span || cell;
            return window.getComputedStyle(target).textDecoration.includes('underline');
        });

        selectedCells.forEach(cell => {
            const span = cell.querySelector('span');
            const target = span || cell;
            const currentDecoration = window.getComputedStyle(target).textDecoration;
            const hasStrike = currentDecoration.includes('line-through');

            if (allUnderlined) {
                target.style.textDecoration = hasStrike ? 'line-through' : 'none';
            } else {
                target.style.textDecoration = hasStrike ? 'underline line-through' : 'underline';
            }
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyTextDecorationToSelection('underline');
        // Update text format menu after applying
        setTimeout(() => updateTextFormatControls(), 10);
    }
}
