import { anchorCell, currentCell, selectedCells, selectedColumn, selectedRow, setAnchorCell, setCurrentCell, setSelectedCells, setSelectedColumn, setSelectedRow } from '../state/variables.js';

export function clearSelection() {
    console.log('=== clearSelection CALLED ===');
    console.log('Clearing', selectedCells.length, 'cells');

    selectedCells.forEach(cell => {
        cell.classList.remove('cell-selected');
        cell.removeAttribute('tabIndex'); // Remove tab focus
    });
    setSelectedCells([]);
    document.querySelectorAll('.row-selected').forEach(row => {
        row.classList.remove('row-selected');
    });

    document.querySelectorAll('.col-selected').forEach(cell => {
        cell.classList.remove('col-selected');
    });

    setSelectedRow(null);
    setSelectedColumn(null);
    setCurrentCell(null);
    setAnchorCell(null);
}
