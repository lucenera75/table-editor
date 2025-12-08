import { selectedCells } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { clearSelection } from '../selection/clearSelection.js';

export function joinTables() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in a table that was previously split');
        return;
    }

    const selectedTable = selectedCells[0].closest('table');
    if (!selectedTable) return;

    const splitGroupId = selectedTable.getAttribute('data-split-group-id');
    if (!splitGroupId) {
        alert('This table was not created from a split operation');
        return;
    }

    // Find ALL tables in the document with the same split group ID
    const allTables = Array.from(document.querySelectorAll(`table[data-split-group-id="${splitGroupId}"]`));

    if (allTables.length <= 1) {
        alert('No other tables found with the same split group ID to join');
        return;
    }

    // Sort tables by their position in the document (DOM order)
    allTables.sort((a, b) => {
        const position = a.compareDocumentPosition(b);
        if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
            return -1; // a comes before b
        } else if (position & Node.DOCUMENT_POSITION_PRECEDING) {
            return 1; // a comes after b
        }
        return 0;
    });

    // The first table in document order is the "original" table
    const originalTable = allTables[0];
    const originalTbody = originalTable.querySelector('tbody');

    if (!originalTbody) {
        alert('Cannot join tables: original table missing tbody element');
        return;
    }

    // Join all other tables into the first one
    let totalRowsMerged = 0;
    for (let i = 1; i < allTables.length; i++) {
        const tableToMerge = allTables[i];
        const tbody = tableToMerge.querySelector('tbody');

        if (!tbody) {
            console.warn('Skipping table without tbody:', tableToMerge);
            continue;
        }

        // Move all rows from this table to the original table
        const rowsToMove = Array.from(tbody.querySelectorAll('tr'));
        rowsToMove.forEach(row => {
            // Ensure event handlers are attached to cells
            Array.from(row.children).forEach(cell => {
                cell.onmousedown = function(e) { selectCell(this, e); };
                cell.oncontextmenu = function(e) { showContextMenu(e, this); };
                cell.style.position = 'relative'; // Required for resize handles
            });
            originalTbody.appendChild(row);
            totalRowsMerged++;
        });

        // Remove the merged table
        tableToMerge.remove();
    }

    // Keep the split-group-id on the joined table so it can be split again
    // (The ID is already on originalTable)

    clearSelection();

    // Trigger pagination to handle the joined table
    // Use setTimeout to ensure the DOM has updated
    setTimeout(() => {
        if (window.handlePagination) {
            window.handlePagination();
        }
    }, 100);

    console.log(`Joined ${allTables.length} tables with split group ID: ${splitGroupId}`);
    console.log(`Total rows merged: ${totalRowsMerged}`);
    alert(`Successfully joined ${allTables.length} tables (${totalRowsMerged} rows merged)`);
}
