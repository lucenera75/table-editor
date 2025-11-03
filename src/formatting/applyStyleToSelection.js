import { savedSelection, setSavedSelection } from '../state/variables.js';

export function applyStyleToSelection(property, activeValue, inactiveValue) {
    if (!savedSelection) return;

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
        // Toggle on existing span
        const currentValue = targetSpan.style[property];
        targetSpan.style[property] = (currentValue === activeValue) ? inactiveValue : activeValue;
    } else {
        // Create new span
        const span = document.createElement('span');
        span.style[property] = activeValue;

        try {
            savedSelection.surroundContents(span);
        } catch (e) {
            const fragment = savedSelection.extractContents();
            span.appendChild(fragment);
            savedSelection.insertNode(span);
        }

        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        setSavedSelection(newRange);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
}
