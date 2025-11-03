import { selectedCells } from '../state/variables.js';

export function areSelectedCellsAdjacent() {
    if (selectedCells.length < 2) return false;

    // Get positions of all selected cells
    const positions = selectedCells.map(cell => {
        const row = cell.parentNode;
        const table = row.parentNode.parentNode;
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        const colIndex = Array.from(row.children).indexOf(cell);
        return { rowIndex, colIndex };
    });

    // Check if cells form a continuous horizontal line
    const isHorizontalLine = () => {
        const row = positions[0].rowIndex;
        if (!positions.every(pos => pos.rowIndex === row)) return false;

        const cols = positions.map(pos => pos.colIndex).sort((a, b) => a - b);
        for (let i = 1; i < cols.length; i++) {
            if (cols[i] - cols[i-1] !== 1) return false;
        }
        return true;
    };

    // Check if cells form a continuous vertical line
    const isVerticalLine = () => {
        const col = positions[0].colIndex;
        if (!positions.every(pos => pos.colIndex === col)) return false;

        const rows = positions.map(pos => pos.rowIndex).sort((a, b) => a - b);
        for (let i = 1; i < rows.length; i++) {
            if (rows[i] - rows[i-1] !== 1) return false;
        }
        return true;
    };

    // Check if cells form a rectangular block
    const isRectangularBlock = () => {
        const minRow = Math.min(...positions.map(p => p.rowIndex));
        const maxRow = Math.max(...positions.map(p => p.rowIndex));
        const minCol = Math.min(...positions.map(p => p.colIndex));
        const maxCol = Math.max(...positions.map(p => p.colIndex));

        const expectedCells = (maxRow - minRow + 1) * (maxCol - minCol + 1);
        if (selectedCells.length !== expectedCells) return false;

        // Check that all positions in the rectangle are selected
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                if (!positions.some(pos => pos.rowIndex === row && pos.colIndex === col)) {
                    return false;
                }
            }
        }
        return true;
    };

    return isHorizontalLine() || isVerticalLine() || isRectangularBlock();
}
