import { setSnapshotIntervalId, snapshotIntervalId } from '../state/variables.js';

export function stopSnapshotTimer() {
    if (snapshotIntervalId) {
        clearInterval(snapshotIntervalId);
        setSnapshotIntervalId(null);
    }
}
