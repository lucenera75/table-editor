import { contextMenuTarget, isDesignMode, newCellCounter, setNewCellCounter } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';
import { getTableColumnCount } from './getTableColumnCount.js';
import { getColumnPosition } from './getColumnPosition.js';
import { addResizeHandles } from '../resize/addResizeHandles.js';

export function addColumnRight() {
    if (!contextMenuTarget) return;

    const table = contextMenuTarget.closest('table');
    const allRows = Array.from(table.querySelectorAll('tr'));

    // Get the visual column position - insert after the last column this cell spans
    const clickedCellColSpan = contextMenuTarget.colSpan || 1;
    const startColPosition = getColumnPosition(contextMenuTarget);
    const insertColPosition = startColPosition + clickedCellColSpan;

    // Build a grid to track which cells occupy which positions (accounting for rowspan and colspan)
    const totalColumns = getTableColumnCount(table);
    const grid = [];

    allRows.forEach((row, rowIdx) => {
        if (!grid[rowIdx]) grid[rowIdx] = [];
        let colPos = 0;

        Array.from(row.children).forEach(cell => {
            // Skip positions already occupied by rowspan from above
            while (grid[rowIdx][colPos] !== undefined) {
                colPos++;
            }

            const colspan = cell.colSpan || 1;
            const rowspan = cell.rowSpan || 1;

            // Mark this cell in the grid
            for (let r = 0; r < rowspan; r++) {
                for (let c = 0; c < colspan; c++) {
                    if (!grid[rowIdx + r]) grid[rowIdx + r] = [];
                    grid[rowIdx + r][colPos + c] = cell;
                }
            }

            colPos += colspan;
        });
    });

    // First, increase colspan for cells that span across the insert position
    const processedCells = new Set();
    allRows.forEach((row, rowIdx) => {
        for (let colPos = 0; colPos < totalColumns; colPos++) {
            const cell = grid[rowIdx][colPos];
            if (cell && !processedCells.has(cell)) {
                processedCells.add(cell);
                const cellStartCol = getColumnPosition(cell);
                const cellColspan = cell.colSpan || 1;
                const cellEndCol = cellStartCol + cellColspan;

                // If this cell spans across our insert position, increase its colspan
                if (cellStartCol < insertColPosition && cellEndCol > insertColPosition) {
                    cell.colSpan = cellColspan + 1;
                }
            }
        }
    });

    // Now add new cells in rows where the insert position is not occupied
    allRows.forEach((row, rowIdx) => {
        // Check if this position is occupied in this row by a cell that starts BEFORE this position
        const occupyingCell = grid[rowIdx][insertColPosition];

        // Only skip if the cell occupying this position started before the insert position
        // (meaning it's a colspan/rowspan that extends into this position)
        if (occupyingCell) {
            // Find where this cell starts in the grid
            let occupyingCellStart = -1;
            for (let col = 0; col <= insertColPosition; col++) {
                if (grid[rowIdx][col] === occupyingCell) {
                    occupyingCellStart = col;
                    break;
                }
            }

            if (occupyingCellStart < insertColPosition) {
                // This position is occupied by a cell from before - skip this row
                return;
            }
        }

        // Find the correct insertion point
        let colPos = 0;
        let insertBeforeCell = null;

        for (let i = 0; i < row.children.length; i++) {
            const cell = row.children[i];

            // Skip positions occupied by rowspan from above
            while (grid[rowIdx][colPos] && grid[rowIdx][colPos] !== cell) {
                colPos++;
            }

            if (colPos >= insertColPosition) {
                insertBeforeCell = cell;
                break;
            }

            colPos += cell.colSpan || 1;
        }

        const newCell = document.createElement(rowIdx === 0 ? 'th' : 'td');
        newCell.style.border = '1px solid #ddd';
        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        const nextCounter = newCellCounter + 1;
        setNewCellCounter(nextCounter);
        span.textContent = rowIdx === 0 ? `New Header ${nextCounter}` : `New Cell ${nextCounter}`;
        newCell.appendChild(span);
        newCell.onmousedown = function(e) { selectCell(this, e); };
        newCell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(newCell);

        if (insertBeforeCell) {
            row.insertBefore(newCell, insertBeforeCell);
        } else {
            row.appendChild(newCell);
        }
    });

    hideContextMenu();
}
