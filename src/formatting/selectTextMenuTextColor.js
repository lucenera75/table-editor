import { currentTextMenuTextColor, savedSelection, selectedCells, setCurrentTextMenuTextColor, setSavedSelection } from '../state/variables.js';

export function selectTextMenuTextColor(color, label) {
    setCurrentTextMenuTextColor(color);
    document.getElementById('textMenuTextColorPreview').style.backgroundColor = color;
    document.getElementById('textMenuTextColorLabel').textContent = label;
    document.getElementById('textMenuTextColorDropdown').classList.remove('show');

    // Apply immediately
    if (selectedCells.length > 0) {
        selectedCells.forEach(cell => {
            cell.style.color = color;
        });
    } else if (savedSelection) {
        // Check if we can reuse an existing span
        const container = savedSelection.commonAncestorContainer;
        let targetSpan = null;

        if (container.nodeType === 3 && container.parentElement.tagName === 'SPAN') {
            const span = container.parentElement;
            const spanRange = document.createRange();
            spanRange.selectNodeContents(span);
            if (spanRange.toString() === savedSelection.toString()) {
                targetSpan = span;
            }
        } else if (container.nodeType === 1 && container.tagName === 'SPAN') {
            targetSpan = container;
        }

        if (targetSpan) {
            // Reuse existing span
            targetSpan.style.color = color;
        } else {
            // Create new span
            const span = document.createElement('span');
            span.style.color = color;

            try {
                const contents = savedSelection.cloneContents();
                savedSelection.deleteContents();
                span.appendChild(contents);
                savedSelection.insertNode(span);
            } catch (e) {
                console.error('Error applying color:', e);
            }

            // Update saved selection
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
