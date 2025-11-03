import { clearSelection } from '../selection/clearSelection.js';
import { hideContextMenu } from './hideContextMenu.js';


export function clearSelectionFromContext() {
    clearSelection();
    hideContextMenu();
}
