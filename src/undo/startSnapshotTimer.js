import { MAX_UNDO_STATES, SNAPSHOT_INTERVAL_MS, isUndoRedoInProgress, lastSnapshot, redoStack, setLastSnapshot, setRedoStack, setSnapshotIntervalId, snapshotIntervalId, undoStack } from '../state/variables.js';
import { saveUndoStackToStorage } from './saveUndoStackToStorage.js';
import { captureSnapshot } from './captureSnapshot.js';
import { normalizeHtmlForComparison } from './normalizeHtmlForComparison.js';

export function startSnapshotTimer() {
    // Take initial snapshot
    const initial = captureSnapshot();
    if (initial) {
        setLastSnapshot(normalizeHtmlForComparison(initial.html));
        undoStack.push(initial);
        saveUndoStackToStorage();
        console.log('Initial snapshot captured');
    }

    // Check for changes every second
    setSnapshotIntervalId(setInterval(() => {
        if (isUndoRedoInProgress) return;

        // Use the editable container if available, fall back to body
        const container = document.getElementById('editable-contents-area') || document.body;
        const current = normalizeHtmlForComparison(container.innerHTML);

        // Compare normalized HTML with last snapshot
        if (current !== lastSnapshot) {
            const snapshot = captureSnapshot();
            if (snapshot) {
                undoStack.push(snapshot);
                setLastSnapshot(current);
                // Limit stack size
                if (undoStack.length > MAX_UNDO_STATES) {
                    undoStack.shift();
                }

                // Clear redo stack when new change is made
                setRedoStack([]);
                // Save to localStorage
                saveUndoStackToStorage();

                console.log('Auto-snapshot taken. Undo stack size:', undoStack.length);
            }
        }
    }, SNAPSHOT_INTERVAL_MS));
}
