import { contextMenuTarget, setContextMenuTarget } from '../state/variables.js';

export function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';
    setContextMenuTarget(null);
}
