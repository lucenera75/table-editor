import { selectedCells } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { clearSelection } from '../selection/clearSelection.js';

export function joinTables() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in a table that was previously split');
        return;
    }

    const table = selectedCells[0].closest('table');
    if (!table) return;

    const splitGroupId = table.getAttribute('data-split-group-id');
    if (!splitGroupId) {
        alert('This table was not created from a split operation');
        return;
    }

    // Find the next table with the same split group ID
    let nextTable = table.nextElementSibling;

    // Skip non-table elements
    while (nextTable && nextTable.tagName !== 'TABLE') {
        nextTable = nextTable.nextElementSibling;
    }

    // Check if the next table has the same split group ID
    if (!nextTable || nextTable.getAttribute('data-split-group-id') !== splitGroupId) {
        alert('No adjacent table found with the same split group ID. Tables must be directly adjacent to be joined.');
        return;
    }

    // Get the tbody from both tables
    const tbody1 = table.querySelector('tbody');
    const tbody2 = nextTable.querySelector('tbody');

    if (!tbody1 || !tbody2) {
        alert('Cannot join tables: missing tbody element');
        return;
    }

    // Move all rows from the second table's tbody to the first table's tbody
    const rowsToMove = Array.from(tbody2.querySelectorAll('tr'));
    rowsToMove.forEach(row => {
        // Ensure event handlers are attached to cells
        Array.from(row.children).forEach(cell => {
            cell.onmousedown = function(e) { selectCell(this, e); };
            cell.oncontextmenu = function(e) { showContextMenu(e, this); };
            cell.style.position = 'relative'; // Required for resize handles
        });
        tbody1.appendChild(row);
    });

    // Remove the second table
    nextTable.remove();

    // Keep the split-group-id on the joined table so it can be split again
    // (The ID is preserved on table)

    clearSelection();

    console.log(`Joined tables with split group ID: ${splitGroupId}`);
}
