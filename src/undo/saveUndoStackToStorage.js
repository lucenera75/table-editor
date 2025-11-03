import { undoStack } from '../state/variables.js';

export function saveUndoStackToStorage() {
    try {
        const serialized = JSON.stringify(undoStack);
        localStorage.setItem('documentEditorUndoStack', serialized);
    } catch (e) {
        // Handle quota exceeded error
        if (e.name === 'QuotaExceededError' || e.code === 22) {
            console.warn('LocalStorage quota exceeded. Removing oldest undo states...');
            // Remove oldest states until it fits
            while (undoStack.length > 5) {
                undoStack.shift();
                try {
                    localStorage.setItem('documentEditorUndoStack', JSON.stringify(undoStack));
                    console.log('Successfully saved after reducing to', undoStack.length, 'states');
                    return;
                } catch (e2) {
                    // Keep trying with fewer states
                }
            }
            console.error('Could not save undo history even with minimal states');
        } else {
            console.error('Failed to save undo history:', e);
        }
    }
}
