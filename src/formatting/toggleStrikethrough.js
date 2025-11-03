import { selectedCells, savedSelection } from '../state/variables.js';
import { applyTextDecorationToSelection } from './applyTextDecorationToSelection.js';
import { updateFormatButtons } from './updateFormatButtons.js';

export function toggleStrikethrough() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allStrikethrough = selectedCells.every(cell => {
            return window.getComputedStyle(cell).textDecoration.includes('line-through');
        });

        selectedCells.forEach(cell => {
            const currentDecoration = window.getComputedStyle(cell).textDecoration;
            const hasUnderline = currentDecoration.includes('underline');

            if (allStrikethrough) {
                cell.style.textDecoration = hasUnderline ? 'underline' : 'none';
            } else {
                cell.style.textDecoration = hasUnderline ? 'underline line-through' : 'line-through';
            }
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyTextDecorationToSelection('line-through');
    }
}
