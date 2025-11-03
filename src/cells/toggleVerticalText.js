import { selectedCells } from '../state/variables.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function toggleVerticalText() {
    if (selectedCells.length === 0) {
        alert('Please select at least one cell');
        return;
    }

    selectedCells.forEach(cell => {
        const span = cell.querySelector('span');
        if (!span) return;

        // Check if text is currently vertical
        const isVertical = span.style.writingMode === 'vertical-rl' ||
                          span.style.transform === 'rotate(90deg)';

        if (isVertical) {
            // Make horizontal - restore normal
            span.style.writingMode = '';
            span.style.transform = '';
            span.style.textOrientation = '';
        } else {
            // Make vertical - rotate 90 degrees
            span.style.writingMode = 'vertical-rl';
            span.style.textOrientation = 'mixed';
        }
    });

    hideContextMenu();
}
