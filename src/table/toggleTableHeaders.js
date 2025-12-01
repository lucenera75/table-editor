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
        if (!tbody) {
            // Table has no tbody - check for direct tr children
            const firstRow = table.querySelector('tr');
            if (!firstRow) return;

            // Create both thead and tbody
            const newThead = document.createElement('thead');
            const newTbody = document.createElement('tbody');

            // Move all rows to tbody first
            const allRows = Array.from(table.querySelectorAll('tr'));
            allRows.forEach(row => newTbody.appendChild(row));

            // Move first row to thead
            const headerRow = newTbody.querySelector('tr');
            if (headerRow) {
                const cells = headerRow.querySelectorAll('td');
                cells.forEach(td => {
                    const th = document.createElement('th');
                    th.innerHTML = td.innerHTML;
                    th.style.cssText = td.style.cssText;
                    th.onmousedown = function(e) { selectCell(this, e); };
                    th.oncontextmenu = function(e) { showContextMenu(e, this); };
                    th.style.position = 'relative';

                    Array.from(td.attributes).forEach(attr => {
                        if (!attr.name.startsWith('on')) {
                            th.setAttribute(attr.name, attr.value);
                        }
                    });

                    headerRow.removeChild(td);
                    headerRow.appendChild(th);
                });

                newTbody.removeChild(headerRow);
                newThead.appendChild(headerRow);
            }

            table.appendChild(newThead);
            table.appendChild(newTbody);
            hideContextMenu();
            return;
        }

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

            // Attach event handlers properly
            th.onmousedown = function(e) { selectCell(this, e); };
            th.oncontextmenu = function(e) { showContextMenu(e, this); };
            th.style.position = 'relative';

            // Copy attributes except event handlers
            Array.from(td.attributes).forEach(attr => {
                if (!attr.name.startsWith('on')) {
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
