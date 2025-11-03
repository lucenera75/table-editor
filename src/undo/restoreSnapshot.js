import { isUndoRedoInProgress, lastSnapshot, setIsUndoRedoInProgress, setLastSnapshot } from '../state/variables.js';
import { normalizeHtmlForComparison } from './normalizeHtmlForComparison.js';
import { reinitializeAfterRestore } from './reinitializeAfterRestore.js';

export function restoreSnapshot(snapshot) {
    if (!snapshot) return;

    setIsUndoRedoInProgress(true);
    try {
        // Restore the entire body
        document.body.innerHTML = snapshot.html;
        setLastSnapshot(normalizeHtmlForComparison(snapshot.html));
        console.log('Snapshot restored from', new Date(snapshot.timestamp).toLocaleTimeString());

        // Reinitialize everything after restoration
        setTimeout(() => {
            reinitializeAfterRestore();
        }, 10);
    } finally {
        setTimeout(() => {
            setIsUndoRedoInProgress(false);
        }, 50);
    }
}
