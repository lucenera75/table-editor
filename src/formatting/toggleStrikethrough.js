import { selectedCells, savedSelection } from '../state/variables.js';
import { applyTextDecorationToSelection } from './applyTextDecorationToSelection.js';
import { updateFormatButtons } from './updateFormatButtons.js';
import { updateTextFormatControls } from '../text/showTextFormatMenu.js';

export function toggleStrikethrough() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allStrikethrough = selectedCells.every(cell => {
            const span = cell.querySelector('span');
            const target = span || cell;
            return window.getComputedStyle(target).textDecoration.includes('line-through');
        });

        selectedCells.forEach(cell => {
            const span = cell.querySelector('span');
            const target = span || cell;
            const currentDecoration = window.getComputedStyle(target).textDecoration;
            const hasUnderline = currentDecoration.includes('underline');

            if (allStrikethrough) {
                target.style.textDecoration = hasUnderline ? 'underline' : 'none';
            } else {
                target.style.textDecoration = hasUnderline ? 'underline line-through' : 'line-through';
            }
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyTextDecorationToSelection('line-through');
        // Update text format menu after applying
        setTimeout(() => updateTextFormatControls(), 10);
    }
}
