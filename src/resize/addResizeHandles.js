import { startResize } from './startResize.js';


export function addResizeHandles(cell) {
    // Remove existing handles
    const existingHandles = cell.querySelectorAll('.resize-handle-col, .resize-handle-row, .resize-handle-corner');
    existingHandles.forEach(handle => handle.remove());

    // Add column resize handle
    const colHandle = document.createElement('div');
    colHandle.className = 'resize-handle-col';
    colHandle.addEventListener('mousedown', (e) => startResize(e, 'col', cell));
    cell.appendChild(colHandle);

    // Add row resize handle
    const rowHandle = document.createElement('div');
    rowHandle.className = 'resize-handle-row';
    rowHandle.addEventListener('mousedown', (e) => startResize(e, 'row', cell));
    cell.appendChild(rowHandle);

    // Add corner resize handle
    const cornerHandle = document.createElement('div');
    cornerHandle.className = 'resize-handle-corner';
    cornerHandle.addEventListener('mousedown', (e) => startResize(e, 'corner', cell));
    cell.appendChild(cornerHandle);
}
