import { contextMenuTarget } from '../state/variables.js';
import { sortColumn } from './sortColumn.js';

export function sortColumnAZ() {
    if (!contextMenuTarget) return;
    sortColumn(true);
}
