

export function getColumnPosition(cell) {
    // Calculate the visual column position of a cell considering colspans
    const row = cell.parentNode;
    let colPosition = 0;

    for (let i = 0; i < row.children.length; i++) {
        if (row.children[i] === cell) {
            break;
        }
        colPosition += row.children[i].colSpan || 1;
    }

    return colPosition;
}
