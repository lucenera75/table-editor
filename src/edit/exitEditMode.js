import { currentCell, isDesignMode, isEditMode, setIsEditMode } from '../state/variables.js';

export function exitEditMode() {
    if (!isEditMode || !currentCell) return;

    setIsEditMode(false);
    // Remove edit mode class
    currentCell.classList.remove('editing-mode');

    // Find the span and restore its contentEditable state based on mode
    const span = currentCell.querySelector('span');
    if (span && isDesignMode) {
        span.contentEditable = 'false';
    }

    // Clear text selection and refocus cell for navigation
    window.getSelection().removeAllRanges();

    // Force blur and refocus to ensure we're back in navigation mode
    if (span) {
        span.blur();
    }
    currentCell.blur();
    setTimeout(() => {
        if (currentCell) {
            currentCell.focus();
        }
    }, 10);
}
