# Document Editor - Modular Structure

This is the modular version of the document editor where each function is in its own file.

## Directory Structure

```
src/
├── state/
│   └── variables.js         # All global state variables with getters/setters
├── undo/
│   ├── initializeUndoSystem.js
│   ├── saveUndoStackToStorage.js
│   ├── captureSnapshot.js
│   ├── normalizeHtmlForComparison.js
│   ├── startSnapshotTimer.js
│   ├── stopSnapshotTimer.js
│   ├── restoreSnapshot.js
│   ├── reinitializeAfterRestore.js
│   ├── undo.js
│   └── redo.js
├── selection/
│   ├── selectCell.js
│   ├── clearSelection.js
│   ├── startMouseSelection.js
│   ├── handleMouseOverCell.js
│   ├── stopMouseSelection.js
│   ├── navigateToCell.js
│   ├── extendSelection.js
│   └── selectRange.js
├── edit/
│   ├── enterEditMode.js
│   └── exitEditMode.js
├── table/
│   ├── addRow.js
│   ├── addColumn.js
│   ├── removeRow.js
│   ├── removeColumn.js
│   ├── addRowAbove.js
│   ├── addRowBelow.js
│   ├── addColumnLeft.js
│   ├── addColumnRight.js
│   ├── deleteSelectedRow.js
│   ├── deleteSelectedColumn.js
│   ├── moveRowUp.js
│   ├── moveRowDown.js
│   ├── sortColumnAZ.js
│   ├── sortColumnZA.js
│   ├── sortColumn.js
│   ├── getTableColumnCount.js
│   ├── getCellsNeededForRow.js
│   ├── getColumnPosition.js
│   ├── splitTable.js
│   ├── deleteTable.js
│   ├── deleteTableFromContext.js
│   └── toggleTableHeaders.js
├── cells/
│   ├── deleteCell.js
│   ├── mergeSelectedCells.js
│   ├── areSelectedCellsAdjacent.js
│   ├── splitSelectedCell.js
│   ├── toggleCellInvisible.js
│   └── toggleVerticalText.js
├── formatting/
│   ├── updateFormatControls.js
│   ├── rgbToHex.js
│   ├── applyAlignmentFromContext.js
│   ├── applyVerticalAlignmentFromContext.js
│   ├── applyFontSizeFromContext.js
│   ├── toggleBold.js
│   ├── toggleItalic.js
│   ├── toggleUnderline.js
│   ├── toggleStrikethrough.js
│   ├── applyStyleToSelection.js
│   ├── applyTextDecorationToSelection.js
│   ├── updateFormatButtons.js
│   ├── toggleBgColorDropdown.js
│   ├── toggleTextColorDropdown.js
│   ├── selectBgColor.js
│   ├── selectTextColor.js
│   ├── applyBackgroundColorFromContext.js
│   ├── applyTextColorFromContext.js
│   ├── resetFormatFromContext.js
│   ├── applyTextFontSize.js
│   ├── selectTextMenuTextColor.js
│   ├── selectTextMenuBgColor.js
│   ├── toggleTextMenuTextColorDropdown.js
│   └── toggleTextMenuBgColorDropdown.js
├── text/
│   ├── showTextFormatMenu.js
│   ├── hideTextFormatMenu.js
│   ├── selectParentTag.js
│   ├── clearTextFormat.js
│   ├── createTableFromMenu.js
│   └── pasteAsPlainText.js
├── menus/
│   ├── showContextMenu.js
│   ├── hideContextMenu.js
│   └── clearSelectionFromContext.js
├── resize/
│   ├── addResizeHandles.js
│   ├── startResize.js
│   ├── handleResize.js
│   ├── stopResize.js
│   └── initializeResizeHandles.js
├── drag/
│   ├── addRowDragHandle.js
│   └── addColumnDragHandle.js
├── mode/
│   └── toggleMode.js
├── events/
│   └── listeners.js          # All event listener setup
└── main.js                    # Main entry point

```

## Usage

### In HTML (with module script)

```html
<script type="module" src="src/main.js"></script>
```

The main.js file will:
1. Initialize the undo system
2. Initialize resize handles
3. Setup all event listeners
4. Make all functions available globally for onclick handlers in HTML

### Module Imports

Each function can be imported individually:

```javascript
import { selectCell } from './selection/selectCell.js';
import { undo, redo } from './undo/undo.js';
import { toggleBold } from './formatting/toggleBold.js';
```

### State Management

All global variables are in `state/variables.js`. To modify state from other modules:

```javascript
import { selectedCells, setSelectedCells } from './state/variables.js';

// Read state
console.log(selectedCells);

// Modify state
setSelectedCells([]);
```

## Features

- **Undo/Redo**: Full document history with localStorage persistence
- **Cell Selection**: Single and multi-cell selection with keyboard navigation
- **Table Operations**: Add/remove rows/columns, merge/split cells, sort, etc.
- **Formatting**: Bold, italic, underline, colors, alignment, font size
- **Drag & Drop**: Reorder rows and columns
- **Resize**: Resize rows and columns with handles
- **Modes**: Design mode (drag/drop enabled) vs Edit mode (text editing)

## Development

### Adding a New Function

1. Create a new file in the appropriate category folder
2. Export the function
3. Import any needed state variables from `state/variables.js`
4. Import any needed functions from other modules
5. Add the export to `main.js` if it needs to be globally available

### Modifying State

Always use the setter functions from `state/variables.js`:

```javascript
import { setCurrentCell } from '../state/variables.js';

setCurrentCell(myCell);
```

## Notes

- Generated using `generate-modules.js` script
- Each function is in its own file for maximum modularity
- Cross-function dependencies are handled via ES6 imports
- Functions are made globally available for HTML onclick handlers
