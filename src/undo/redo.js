import { undoStack, redoStack } from '../state/variables.js';
import { saveUndoStackToStorage } from './saveUndoStackToStorage.js';
import { captureSnapshot } from './captureSnapshot.js';
import { restoreSnapshot } from './restoreSnapshot.js';

export function redo() {
    if (redoStack.length === 0) {
        console.log('Nothing to redo');
        return;
    }

    // Save current state to undo stack before redoing
    const currentState = captureSnapshot();
    if (currentState) {
        undoStack.push(currentState);
    }

    // Pop and restore next state
    const nextState = redoStack.pop();
    restoreSnapshot(nextState);

    // Save updated stack
    saveUndoStackToStorage();

    console.log('Redo performed. Undo stack:', undoStack.length, 'Redo stack:', redoStack.length);
}
