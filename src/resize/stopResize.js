import { isResizing, resizeLine, resizeTarget, resizeType, setIsResizing, setResizeLine, setResizeTarget, setResizeType } from '../state/variables.js';

export function stopResize() {
    if (!isResizing) return;

    setIsResizing(false);
    setResizeType(null);
    setResizeTarget(null);
    document.body.classList.remove('resizing');

    // Remove resize line
    if (resizeLine) {
        resizeLine.remove();
        setResizeLine(null);
    }

    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
}
