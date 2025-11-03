import { setUndoStack, undoStack } from '../state/variables.js';
import { startSnapshotTimer } from './startSnapshotTimer.js';

export function initializeUndoSystem() {
    try {
        const saved = localStorage.getItem('documentEditorUndoStack');
        if (saved) {
            setUndoStack(JSON.parse(saved));
            console.log('Loaded undo history:', undoStack.length, 'states');
        }
    } catch (e) {
        console.error('Failed to load undo history:', e);
        setUndoStack([]);
    }

    // Start the automatic snapshot timer
    startSnapshotTimer();
}
