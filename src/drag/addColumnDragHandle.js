import { draggedColumn, setDraggedColumn } from '../state/variables.js';
import { clearSelection } from '../selection/clearSelection.js';

export function addColumnDragHandle(headerCell, columnIndex) {
    // Remove existing handle if any
    const existingHandle = headerCell.querySelector('.col-drag-handle');
    if (existingHandle) existingHandle.remove();

    const handle = document.createElement('div');
    handle.className = 'col-drag-handle';
    handle.draggable = true;
    handle.dataset.columnIndex = columnIndex;

    headerCell.appendChild(handle);

    // Prevent cell selection when clicking on drag handle
    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        clearSelection();
    });

    handle.addEventListener('dragstart', (e) => {
        setDraggedColumn(columnIndex);
        const table = headerCell.closest('table');
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cell = row.children[columnIndex];
            if (cell) cell.classList.add('col-dragging');
        });
        e.dataTransfer.effectAllowed = 'move';
    });

    handle.addEventListener('dragend', (e) => {
        const table = headerCell.closest('table');
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            Array.from(row.children).forEach(cell => {
                cell.classList.remove('col-dragging');
                cell.classList.remove('col-drag-over');
            });
        });
        setDraggedColumn(null);
    });
}
