import { MAX_UNDO_STATES, SNAPSHOT_INTERVAL_MS, isUndoRedoInProgress, lastSnapshot, redoStack, setLastSnapshot, setRedoStack, setSnapshotIntervalId, snapshotIntervalId, undoStack } from '../state/variables.js';
import { saveUndoStackToStorage } from './saveUndoStackToStorage.js';
import { captureSnapshot } from './captureSnapshot.js';
import { normalizeHtmlForComparison } from './normalizeHtmlForComparison.js';
import { stopSnapshotTimer } from './stopSnapshotTimer.js';

// Store the observer globally so we can disconnect it if needed
let contentAreaObserver = null;

export function startSnapshotTimer() {
    // Check if editable-contents-area exists
    const container = document.getElementById('editable-contents-area');
    if (!container) {
        console.log('No editable-contents-area found, setting up observer to watch for it');
        setupContentAreaObserver();
        return;
    }

    // Stop any existing timer
    stopSnapshotTimer();

    // Stop any existing observer (we found the element)
    if (contentAreaObserver) {
        contentAreaObserver.disconnect();
        contentAreaObserver = null;
    }

    // Clear undo/redo stacks before starting
    undoStack.length = 0;
    setRedoStack([]);
    setLastSnapshot('');
    console.log('Undo/redo stacks cleared');

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

        // Check if editable-contents-area still exists
        const container = document.getElementById('editable-contents-area');
        if (!container) {
            console.log('editable-contents-area no longer exists, stopping snapshot timer');
            stopSnapshotTimer();
            // Set up observer to watch for it coming back
            setupContentAreaObserver();
            return;
        }

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

function setupContentAreaObserver() {
    // If observer already exists, don't create another one
    if (contentAreaObserver) {
        return;
    }

    // Create observer to watch for editable-contents-area being added
    contentAreaObserver = new MutationObserver(() => {
        // Check if editable-contents-area now exists
        const container = document.getElementById('editable-contents-area');
        if (container) {
            console.log('editable-contents-area detected, starting snapshot timer');
            startSnapshotTimer();
        }
    });

    // Observe the entire document for childList changes
    contentAreaObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    console.log('Observer set up to watch for editable-contents-area');
}
