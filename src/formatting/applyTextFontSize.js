import { savedSelection, selectedCells, setSavedSelection } from '../state/variables.js';

export function applyTextFontSize() {
    const fontSize = document.getElementById('textFontSize').value;
    if (selectedCells.length > 0) {
        // Apply to table cells
        selectedCells.forEach(cell => {
            cell.style.fontSize = fontSize + 'px';
        });
    } else {
        // Apply to selected text using the saved selection
        if (!savedSelection) return;

        // Check if the selection contains exactly one span that encompasses the entire selection
        const container = savedSelection.commonAncestorContainer;
        let targetSpan = null;

        if (container.nodeType === 3 && container.parentElement.tagName === 'SPAN') {
            // Text node inside a span
            const span = container.parentElement;
            const spanRange = document.createRange();
            spanRange.selectNodeContents(span);
            if (spanRange.toString() === savedSelection.toString()) {
                targetSpan = span;
            }
        } else if (container.nodeType === 1 && container.tagName === 'SPAN') {
            // Span element itself
            targetSpan = container;
        }

        if (targetSpan) {
            // Reuse existing span
            targetSpan.style.fontSize = fontSize + 'px';
        } else {
            // Create new span
            const span = document.createElement('span');
            span.style.fontSize = fontSize + 'px';

            try {
                savedSelection.surroundContents(span);
            } catch (e) {
                // If surroundContents fails (e.g., partial element selection), use extractContents
                const fragment = savedSelection.extractContents();
                span.appendChild(fragment);
                savedSelection.insertNode(span);
            }

            // Update saved selection to the new span
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            setSavedSelection(newRange);
            // Restore visual selection
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
}
