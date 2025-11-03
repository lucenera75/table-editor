import { undoStack, redoStack } from '../state/variables.js';
import { saveUndoStackToStorage } from './saveUndoStackToStorage.js';
import { captureSnapshot } from './captureSnapshot.js';
import { restoreSnapshot } from './restoreSnapshot.js';

export function undo() {
    console.log('=== UNDO CALLED ===');
    console.log('Undo stack length:', undoStack.length);

    if (undoStack.length === 0) {
        console.log('Nothing to undo');
        return;
    }

    // Save current state to redo stack before undoing
    const currentState = captureSnapshot();
    if (currentState) {
        redoStack.push(currentState);
        console.log('Saved current state to redo stack');
    }

    // Pop and restore previous state
    const previousState = undoStack.pop();
    console.log('Restoring state from:', new Date(previousState.timestamp).toLocaleTimeString());
    restoreSnapshot(previousState);

    // Save updated stack
    saveUndoStackToStorage();

    console.log('Undo performed. Undo stack:', undoStack.length, 'Redo stack:', redoStack.length);
}
