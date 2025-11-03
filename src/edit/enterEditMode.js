import { currentCell, isEditMode, setIsEditMode } from '../state/variables.js';

export function enterEditMode() {
    if (!currentCell || isEditMode) return;

    setIsEditMode(true);
    // Add a specific class to indicate edit mode
    currentCell.classList.add('editing-mode');

    // Find the span inside the cell
    const span = currentCell.querySelector('span');
    if (!span) return;

    // Make sure the span is editable (in case we're in DESIGN mode)
    span.contentEditable = 'true';
    span.focus();

    // Select all text in the span
    const range = document.createRange();
    range.selectNodeContents(span);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}
