import { isUndoRedoInProgress } from '../state/variables.js';

export function captureSnapshot() {
    if (isUndoRedoInProgress) return null;

    // Try to find the editable-contents-area container, fall back to body
    const container = document.getElementById('editable-contents-area') || document.body;
    if (!container) {
        console.error('Container not found');
        return null;
    }

    return {
        timestamp: Date.now(),
        html: container.innerHTML
    };
}
