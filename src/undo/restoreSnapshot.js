import { isUndoRedoInProgress, lastSnapshot, setIsUndoRedoInProgress, setLastSnapshot } from '../state/variables.js';
import { normalizeHtmlForComparison } from './normalizeHtmlForComparison.js';
import { reinitializeAfterRestore } from './reinitializeAfterRestore.js';

export function restoreSnapshot(snapshot) {
    if (!snapshot) return;

    setIsUndoRedoInProgress(true);

    // Save scroll position before restoring
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    try {
        // Restore the entire body
        document.body.innerHTML = snapshot.html;
        setLastSnapshot(normalizeHtmlForComparison(snapshot.html));
        console.log('Snapshot restored from', new Date(snapshot.timestamp).toLocaleTimeString());

        // Restore scroll position
        window.scrollTo(scrollX, scrollY);

        // Reinitialize everything after restoration
        setTimeout(() => {
            reinitializeAfterRestore();
            // Restore scroll position again after reinitialize (in case it changed)
            window.scrollTo(scrollX, scrollY);
        }, 10);
    } finally {
        setTimeout(() => {
            setIsUndoRedoInProgress(false);
        }, 50);
    }
}
