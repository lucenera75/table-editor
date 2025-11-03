import { contextMenuTarget } from '../state/variables.js';
import { sortColumn } from './sortColumn.js';

export function sortColumnZA() {
    if (!contextMenuTarget) return;
    sortColumn(false);
}
