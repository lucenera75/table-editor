import { draggedRow, setDraggedRow } from '../state/variables.js';
import { clearSelection } from '../selection/clearSelection.js';

export function addRowDragHandle(row) {
    // Remove existing handle if any
    const existingHandle = row.querySelector('.row-drag-handle');
    if (existingHandle) existingHandle.remove();

    const handle = document.createElement('div');
    handle.className = 'row-drag-handle';
    handle.draggable = true;

    console.log('Adding drag handle to row:', row);

    // Make the first cell position relative to contain the handle
    const firstCell = row.querySelector('td, th');
    if (firstCell) {
        firstCell.style.position = 'relative';
        firstCell.appendChild(handle);
        console.log('Drag handle added to cell:', firstCell);
    } else {
        console.log('No first cell found in row');
    }

    // Prevent cell selection when clicking on drag handle
    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Prevent cell selection
        clearSelection(); // Clear any existing selection
    });

    handle.addEventListener('dragstart', (e) => {
        setDraggedRow(row);
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    handle.addEventListener('dragend', (e) => {
        row.classList.remove('dragging');
        document.querySelectorAll('tr.drag-over').forEach(r => r.classList.remove('drag-over'));
        setDraggedRow(null);
    });
}
