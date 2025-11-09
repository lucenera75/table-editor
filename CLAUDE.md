# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Document Editor with Advanced Table Support

A browser-based document editor with sophisticated table editing, built as a fully modular ES6 codebase. Zero dependencies, all functionality injected dynamically via JavaScript.

## Commands

```bash
# Run automated tests (Puppeteer-based)
npm test

# Serve the application locally
npx serve .
# Then open http://localhost:3000/index.html or testsanta.html
```

## Architecture Overview

### Core Design Principles

1. **Fully Self-Contained**: The editor injects ALL required UI elements and CSS dynamically via JavaScript
2. **Modular ES6**: Each function lives in its own file with explicit imports
3. **Centralized State**: All global state managed through `src/state/variables.js` with getter/setter pattern
4. **Event Handler Injection**: Tables are initialized with event handlers dynamically (not inline HTML)

### Initialization Flow

When `src/main.js` loads, it executes this sequence:

```
1. createMenuElements()       → Injects CSS + creates context/text menus in DOM
2. initializeExistingTables() → Attaches onmousedown/oncontextmenu to all td/th
3. initializeUndoSystem()     → Sets up localStorage-based undo/redo
4. initializeResizeHandles()  → Adds resize handles + drag handles to cells
5. setupEventListeners()      → Global document listeners for keyboard, paste, etc.
```

### State Management Pattern

**CRITICAL**: Never directly modify state variables. Always use setters:

```javascript
// ❌ WRONG
import { selectedCells } from '../state/variables.js';
selectedCells.push(cell); // Modifies exported reference

// ✅ CORRECT
import { selectedCells, setSelectedCells } from '../state/variables.js';
setSelectedCells([...selectedCells, cell]);
```

State categories:
- **Selection**: `selectedCells`, `currentCell`, `anchorCell`
- **Editing**: `isEditMode`, `savedSelection`
- **Resize**: `isResizing`, `resizeType`, `resizeTarget`
- **Undo**: `undoStack`, `redoStack`, `isUndoRedoInProgress`
- **Drag**: `draggedRow`, `draggedColumn`

### Dynamic UI Injection

The `createMenuElements()` function in `src/menus/createMenuElements.js`:
1. Checks if menus already exist (idempotent)
2. Injects `<style>` tag with all editor CSS into `<head>`
3. Creates context menu DOM structure with inline `onclick` handlers
4. Creates text format menu DOM structure
5. Appends both to `document.body`

**Why this matters**: When adding new menu functionality, update BOTH:
- The HTML string in `createMenuElements.js`
- The corresponding function export in `main.js` (window.functionName assignment)

### Event Handler Architecture

Tables use **function reference handlers** (not event delegation):

```javascript
// When initializing a table cell:
cell.onmousedown = function(e) { selectCell(this, e); };
cell.oncontextmenu = function(e) { showContextMenu(e, this); };
```

**Important for undo/redo**: After restoring HTML from undo stack, ALL event handlers are lost. The `reinitializeAfterRestore()` function must re-attach handlers to every cell.

## Module Dependency Patterns

### Common Import Mistakes

When a module uses functions in event listeners, imports are required:

```javascript
// ❌ Missing imports cause ReferenceError at runtime
export function startMouseSelection(cell) {
    document.addEventListener('mouseover', handleMouseOverCell); // ERROR
}

// ✅ Import the function
import { handleMouseOverCell } from './handleMouseOverCell.js';
export function startMouseSelection(cell) {
    document.addEventListener('mouseover', handleMouseOverCell);
}
```

**Common culprits**: `startMouseSelection.js`, `stopMouseSelection.js`, `startResize.js`, `stopResize.js`

### Module Categories

- **`state/`**: Single source of truth for all variables
- **`menus/`**: Context menu, text format menu, UI creation
- **`selection/`**: Cell selection, multi-select, mouse drag
- **`table/`**: Row/column operations (add, delete, move, sort)
- **`cells/`**: Cell-level operations (merge, split, delete, invisible)
- **`formatting/`**: Text styling, alignment, colors
- **`resize/`**: Drag-to-resize handles for rows/columns
- **`drag/`**: Drag-and-drop row/column reordering
- **`undo/`**: Snapshot-based undo/redo with localStorage
- **`edit/`**: Enter/exit edit mode for cells
- **`text/`**: Text format menu, table creation
- **`events/`**: Global event listeners setup

## Key Implementation Details

### Undo/Redo System

- **Snapshot-based**: Captures entire `document.body.innerHTML` every 1 second
- **Normalization**: Strips UI classes (`cell-selected`, `editing-mode`) before comparison
- **Persistence**: Stores up to 25 states in `localStorage` (cleared on page unload)
- **Reinitialization**: After restore, must call `reinitializeAfterRestore()` to reattach handlers

### Table Initialization

Two scenarios:
1. **Existing tables** (in HTML): `initializeExistingTables()` scans and attaches handlers
2. **New tables** (via menu): `createTableFromMenu()` creates with handlers pre-attached

**CRITICAL**: All table cells must have their content wrapped in a `<span>` element:
- The span must have `contentEditable="true"` (or "false" in design mode)
- This allows formatting operations (vertical text, colors, etc.) to work properly
- `initializeExistingTables()` automatically wraps unwrapped content

When creating new cells programmatically:
```javascript
cell.onmousedown = function(e) { selectCell(this, e); };
cell.oncontextmenu = function(e) { showContextMenu(e, this); };
cell.style.position = 'relative'; // Required for resize handles

// Wrap content in span
const span = document.createElement('span');
span.contentEditable = 'true';
span.textContent = 'Cell content';
cell.appendChild(span);
```

### Resize Handles

Three handle types per cell:
- **Column resize** (right edge): `.resize-handle-col`
- **Row resize** (bottom edge): `.resize-handle-row`
- **Corner resize** (bottom-right): `.resize-handle-corner`

All handles are invisible until hover (CSS `opacity: 0` → `opacity: 1`).

### Drag Handles

- **Row drag**: `.row-drag-handle` (left side, tbody rows only)
- **Column drag**: `.col-drag-handle` (top side, thead cells only)

Both use native HTML5 drag-and-drop API with `draggable="true"`.

## Adding New Functionality

### Adding a New Module

1. Create file in appropriate `src/` subdirectory
2. Export function with explicit imports
3. Add to exports in `src/main.js`
4. Add to `window.*` assignments in `main.js` (if needed for HTML onclick)
5. If UI is needed, update `createMenuElements.js`

### Adding a Menu Item

```javascript
// In createMenuElements.js, add button to context menu HTML:
<button onclick="myNewFunction()">My Action</button>

// In main.js, expose globally:
window.myNewFunction = myNewFunction;

// Import at top of main.js:
import { myNewFunction } from './path/myNewFunction.js';
```

## Testing

The test suite (`test-suite.html` + `run-tests.js`):
- Uses Puppeteer to run browser tests
- Loads modular version with special wrapper to expose modules globally
- Tests selection, table operations, formatting, keyboard navigation

When tests fail due to missing imports, check that the test HTML includes the module loading wrapper.

## Version

Current version: **0.0.128** (in package.json)
