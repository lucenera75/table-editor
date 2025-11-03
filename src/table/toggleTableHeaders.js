import { contextMenuTarget } from '../state/variables.js';
import { selectCell } from '../selection/selectCell.js';
import { showContextMenu } from '../menus/showContextMenu.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';

export function toggleTableHeaders() {
    if (!contextMenuTarget) return;

    const table = contextMenuTarget.closest('table');
    if (!table) return;

    const thead = table.querySelector('thead');

    if (thead) {
        // Headers exist - hide or show them
        if (thead.style.display === 'none') {
            // Show headers
            thead.style.display = '';
        } else {
            // Hide headers
            thead.style.display = 'none';
        }
    } else {
        // No thead exists - convert first row to header
        const tbody = table.querySelector('tbody');
        if (!tbody) return;

        const firstRow = tbody.querySelector('tr');
        if (!firstRow) return;

        // Create thead and move first row to it
        const newThead = document.createElement('thead');

        // Convert td cells to th cells
        const cells = firstRow.querySelectorAll('td');
        cells.forEach(td => {
            const th = document.createElement('th');
            th.innerHTML = td.innerHTML;
            th.style.cssText = td.style.cssText;
            th.setAttribute('onmousedown', 'selectCell(this, event)');
            th.setAttribute('oncontextmenu', 'showContextMenu(event, this)');

            // Copy attributes
            Array.from(td.attributes).forEach(attr => {
                if (attr.name !== 'onmousedown' && attr.name !== 'oncontextmenu') {
                    th.setAttribute(attr.name, attr.value);
                }
            });

            firstRow.removeChild(td);
            firstRow.appendChild(th);
        });

        tbody.removeChild(firstRow);
        newThead.appendChild(firstRow);
        table.insertBefore(newThead, tbody);
    }

    hideContextMenu();
}
