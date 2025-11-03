import { isUndoRedoInProgress } from '../state/variables.js';

export function captureSnapshot() {
    if (isUndoRedoInProgress) return null;

    const body = document.body;
    if (!body) {
        console.error('Body not found');
        return null;
    }

    return {
        timestamp: Date.now(),
        html: body.innerHTML
    };
}
