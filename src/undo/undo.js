import { undoStack, redoStack, lastSnapshot } from '../state/variables.js';
import { saveUndoStackToStorage } from './saveUndoStackToStorage.js';
import { captureSnapshot } from './captureSnapshot.js';
import { restoreSnapshot } from './restoreSnapshot.js';
import { normalizeHtmlForComparison } from './normalizeHtmlForComparison.js';

export function undo() {
    console.log('=== UNDO CALLED ===');
    console.log('Undo stack length:', undoStack.length);

    if (undoStack.length === 0) {
        console.log('Nothing to undo');
        return;
    }

    // Check if there are unsaved changes since last snapshot
    const container = document.getElementById('editable-contents-area') || document.body;
    const currentNormalized = normalizeHtmlForComparison(container.innerHTML);
    const hasUnsavedChanges = currentNormalized !== lastSnapshot;

    if (hasUnsavedChanges) {
        console.log('Detected unsaved changes, capturing current state first');
        // Capture current state and add to undo stack
        const currentState = captureSnapshot();
        if (currentState) {
            undoStack.push(currentState);
        }
    }

    // Need at least 2 states to undo (current + previous)
    if (undoStack.length < 2) {
        console.log('Not enough history to undo');
        return;
    }

    // Current state is now at the top of undo stack, move it to redo
    const currentState = undoStack.pop();
    redoStack.push(currentState);
    console.log('Moved current state to redo stack');

    // Pop and restore previous state
    const previousState = undoStack.pop();
    console.log('Restoring state from:', new Date(previousState.timestamp).toLocaleTimeString());
    restoreSnapshot(previousState);

    // Save updated stack
    saveUndoStackToStorage();

    console.log('Undo performed. Undo stack:', undoStack.length, 'Redo stack:', redoStack.length);
}
