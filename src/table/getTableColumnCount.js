

export function getTableColumnCount(table) {
    // Calculate total column count by finding the maximum across all rows
    const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
    if (!headerRow) return 0;

    let maxColumns = 0;
    Array.from(headerRow.children).forEach(cell => {
        maxColumns += cell.colSpan || 1;
    });
    return maxColumns;
}
