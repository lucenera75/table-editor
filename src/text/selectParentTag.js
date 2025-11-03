import { savedSelection, selectedCells, setSavedSelection } from '../state/variables.js';
import { showTextFormatMenu } from './showTextFormatMenu.js';

export function selectParentTag() {
    if (selectedCells.length > 0) {
        // For table cells, this doesn't apply
        return;
    }

    if (!savedSelection) return;

    const container = savedSelection.commonAncestorContainer;
    let currentElement = null;

    if (container.nodeType === 3) {
        // Text node - get its parent element
        currentElement = container.parentElement;
    } else if (container.nodeType === 1) {
        // Element node - use it directly
        currentElement = container;
    }

    // If we're already at a span, go to its parent span
    // Otherwise find the nearest span
    let parentElement = currentElement;

    if (parentElement && parentElement.tagName === 'SPAN') {
        // Already in a span, look for parent span
        parentElement = parentElement.parentElement;
        while (parentElement && parentElement.tagName !== 'SPAN' && parentElement.contentEditable !== 'true') {
            parentElement = parentElement.parentElement;
        }
    } else {
        // Not in a span, find nearest span
        while (parentElement && parentElement.tagName !== 'SPAN' && parentElement.contentEditable !== 'true') {
            parentElement = parentElement.parentElement;
        }
    }

    if (parentElement && (parentElement.tagName === 'SPAN' || parentElement.contentEditable === 'true')) {
        // Select the contents of the parent element
        const newRange = document.createRange();
        newRange.selectNodeContents(parentElement);
        setSavedSelection(newRange);
        // Update visual selection
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(newRange);

        // Reposition the menu
        showTextFormatMenu();
    }
}
