import { getTableColumnCount } from './getTableColumnCount.js';


export function getCellsNeededForRow(table, insertBeforeRow) {
    // Calculate how many cell elements are needed for a new row
    // considering rowspans from rows above
    const totalColumns = getTableColumnCount(table);
    const allRows = Array.from(table.querySelectorAll('tr'));
    const insertIndex = insertBeforeRow ? allRows.indexOf(insertBeforeRow) : allRows.length;

    // Track which column positions are occupied by rowspan cells from above
    const occupiedColumns = new Set();

    for (let rowIdx = 0; rowIdx < insertIndex; rowIdx++) {
        const row = allRows[rowIdx];
        let colPosition = 0;

        Array.from(row.children).forEach(cell => {
            // Skip positions occupied by previous rowspans
            while (occupiedColumns.has(`${rowIdx}-${colPosition}`)) {
                colPosition++;
            }

            const colspan = cell.colSpan || 1;
            const rowspan = cell.rowSpan || 1;

            // Mark positions as occupied if rowspan extends to our new row
            if (rowspan > 1 && rowIdx + rowspan > insertIndex) {
                for (let r = rowIdx + 1; r < rowIdx + rowspan; r++) {
                    for (let c = 0; c < colspan; c++) {
                        occupiedColumns.add(`${r}-${colPosition + c}`);
                    }
                }
            }

            colPosition += colspan;
        });
    }

    // Count how many columns at our insert position are occupied
    let occupiedCount = 0;
    for (let c = 0; c < totalColumns; c++) {
        if (occupiedColumns.has(`${insertIndex}-${c}`)) {
            occupiedCount++;
        }
    }

    return totalColumns - occupiedCount;
}
