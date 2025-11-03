import { selectedCells, isResizing, resizeType, resizeTarget, startX, startY, startWidth, startHeight, resizeLine } from '../state/variables.js';

export function handleResize(e) {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (resizeType === 'col' || resizeType === 'corner') {
        const newWidth = Math.max(50, startWidth + deltaX);

        // Update resize line position
        if (resizeLine && resizeLine.classList.contains('vertical')) {
            resizeLine.style.left = e.clientX + 'px';
        }

        // Check if we have multiple selected cells
        if (selectedCells.length > 1) {
            // Apply width to all selected cells and their columns
            const affectedColumns = new Set();

            selectedCells.forEach(cell => {
                const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
                affectedColumns.add(cellIndex);
            });

            // Apply width to all affected columns
            const table = resizeTarget.closest('table');
            const allRowsInTable = table.querySelectorAll('tr');

            affectedColumns.forEach(columnIndex => {
                allRowsInTable.forEach(row => {
                    const cell = row.children[columnIndex];
                    if (cell) {
                        cell.style.width = newWidth + 'px';
                    }
                });
            });
        } else {
            // Original behavior: apply width to entire column
            resizeTarget.style.width = newWidth + 'px';
            const cellIndex = Array.from(resizeTarget.parentNode.children).indexOf(resizeTarget);
            const table = resizeTarget.closest('table');
            const allRowsInTable = table.querySelectorAll('tr');

            allRowsInTable.forEach(row => {
                const cell = row.children[cellIndex];
                if (cell) {
                    cell.style.width = newWidth + 'px';
                }
            });
        }
    }

    if (resizeType === 'row' || resizeType === 'corner') {
        const newHeight = Math.max(30, startHeight + deltaY);

        // Update resize line position
        if (resizeLine && (resizeLine.classList.contains('horizontal') || resizeType === 'row')) {
            resizeLine.style.top = e.clientY + 'px';
        }

        // Check if we have multiple selected cells
        if (selectedCells.length > 1) {
            // Apply height to all selected cells and their rows
            const affectedRows = new Set();

            selectedCells.forEach(cell => {
                affectedRows.add(cell.parentNode);
            });

            // Apply height to all affected rows
            affectedRows.forEach(row => {
                Array.from(row.children).forEach(cell => {
                    cell.style.height = newHeight + 'px';
                });
            });
        } else {
            // Original behavior: apply height to entire row
            const row = resizeTarget.parentNode;
            Array.from(row.children).forEach(cell => {
                cell.style.height = newHeight + 'px';
            });
        }
    }
}
