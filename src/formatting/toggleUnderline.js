import { selectedCells, savedSelection } from '../state/variables.js';
import { applyTextDecorationToSelection } from './applyTextDecorationToSelection.js';
import { updateFormatButtons } from './updateFormatButtons.js';

export function toggleUnderline() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allUnderlined = selectedCells.every(cell => {
            return window.getComputedStyle(cell).textDecoration.includes('underline');
        });

        selectedCells.forEach(cell => {
            const currentDecoration = window.getComputedStyle(cell).textDecoration;
            const hasStrike = currentDecoration.includes('line-through');

            if (allUnderlined) {
                cell.style.textDecoration = hasStrike ? 'line-through' : 'none';
            } else {
                cell.style.textDecoration = hasStrike ? 'underline line-through' : 'underline';
            }
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyTextDecorationToSelection('underline');
    }
}
