import { selectedCells, savedSelection } from '../state/variables.js';
import { updateFormatButtons } from '../formatting/updateFormatButtons.js';
import { hideTextFormatMenu } from './hideTextFormatMenu.js';

export function clearTextFormat() {
    if (selectedCells.length > 0) {
        // Clear format from table cells
        selectedCells.forEach(cell => {
            cell.style.fontWeight = '';
            cell.style.fontStyle = '';
            cell.style.textDecoration = '';
            cell.style.fontSize = '';
            cell.style.color = '';
            cell.style.backgroundColor = '';
        });
        updateFormatButtons();
    } else {
        // Clear format from selected text
        const range = savedSelection || (window.getSelection().rangeCount > 0 ? window.getSelection().getRangeAt(0) : null);
        if (range) {
            const fragment = range.extractContents();

            // Get plain text
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(fragment);
            const plainText = tempDiv.textContent || tempDiv.innerText;

            // Insert plain text (no need to deleteContents - extractContents already removed it)
            range.insertNode(document.createTextNode(plainText));
        }
    }
    hideTextFormatMenu();
}
