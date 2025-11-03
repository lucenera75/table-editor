import { savedSelection, setSavedSelection } from '../state/variables.js';

export function applyTextDecorationToSelection(decoration) {
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
        const currentDecoration = targetSpan.style.textDecoration || '';
        const hasUnderline = currentDecoration.includes('underline');
        const hasStrike = currentDecoration.includes('line-through');

        if (decoration === 'underline') {
            if (hasUnderline) {
                targetSpan.style.textDecoration = hasStrike ? 'line-through' : 'none';
            } else {
                targetSpan.style.textDecoration = hasStrike ? 'underline line-through' : 'underline';
            }
        } else if (decoration === 'line-through') {
            if (hasStrike) {
                targetSpan.style.textDecoration = hasUnderline ? 'underline' : 'none';
            } else {
                targetSpan.style.textDecoration = hasUnderline ? 'underline line-through' : 'line-through';
            }
        }
    } else {
        // Create new span
        const span = document.createElement('span');
        span.style.textDecoration = decoration;

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
