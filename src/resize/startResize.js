import { isResizing, resizeLine, resizeTarget, resizeType, setIsResizing, setResizeLine, setResizeTarget, setResizeType, setStartHeight, setStartWidth, setStartX, setStartY, startHeight, startWidth, startX, startY } from '../state/variables.js';
import { handleResize } from './handleResize.js';
import { stopResize } from './stopResize.js';

export function startResize(e, type, cell) {
    e.preventDefault();
    e.stopPropagation();

    setIsResizing(true);
    setResizeType(type);
    setResizeTarget(cell);
    setStartX(e.clientX);
    setStartY(e.clientY);
    const rect = cell.getBoundingClientRect();
    setStartWidth(rect.width);
    setStartHeight(rect.height);
    document.body.classList.add('resizing');

    // Create resize line for visual feedback
    if (type === 'col' || type === 'corner') {
        setResizeLine(document.createElement('div'));
        resizeLine.className = 'resize-line vertical';
        resizeLine.style.left = e.clientX + 'px';
        document.body.appendChild(resizeLine);
    }
    if (type === 'row' || type === 'corner') {
        if (!resizeLine) {
            setResizeLine(document.createElement('div'));
            resizeLine.className = 'resize-line horizontal';
        } else {
            resizeLine.className += ' horizontal';
        }
        resizeLine.style.top = e.clientY + 'px';
        if (type === 'row') {
            document.body.appendChild(resizeLine);
        }
    }

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
}
