// Main entry point - imports and initializes all modules

// Import initialization functions
import { setupEventListeners } from './events/listeners.js';
import { initializeUndoSystem } from './undo/initializeUndoSystem.js';
import { initializeResizeHandles } from './resize/initializeResizeHandles.js';
import { createMenuElements } from './menus/createMenuElements.js';
import { handlePagination } from './pagination/handlePagination.js';

// Import and export all state variables
export * from './state/variables.js';

// Import all functions
import { selectCell } from './selection/selectCell.js';
import { clearSelection } from './selection/clearSelection.js';
import { startMouseSelection } from './selection/startMouseSelection.js';
import { handleMouseOverCell } from './selection/handleMouseOverCell.js';
import { stopMouseSelection } from './selection/stopMouseSelection.js';
import { navigateToCell } from './selection/navigateToCell.js';
import { extendSelection } from './selection/extendSelection.js';
import { selectRange } from './selection/selectRange.js';

import { enterEditMode } from './edit/enterEditMode.js';
import { exitEditMode } from './edit/exitEditMode.js';

import { showContextMenu } from './menus/showContextMenu.js';
import { hideContextMenu } from './menus/hideContextMenu.js';
import { clearSelectionFromContext } from './menus/clearSelectionFromContext.js';

import { addRow } from './table/addRow.js';
import { addColumn } from './table/addColumn.js';
import { removeRow } from './table/removeRow.js';
import { removeColumn } from './table/removeColumn.js';
import { addRowAbove } from './table/addRowAbove.js';
import { addRowBelow } from './table/addRowBelow.js';
import { addColumnLeft } from './table/addColumnLeft.js';
import { addColumnRight } from './table/addColumnRight.js';
import { deleteSelectedRow } from './table/deleteSelectedRow.js';
import { deleteSelectedColumn } from './table/deleteSelectedColumn.js';
import { moveRowUp } from './table/moveRowUp.js';
import { moveRowDown } from './table/moveRowDown.js';
import { sortColumnAZ } from './table/sortColumnAZ.js';
import { sortColumnZA } from './table/sortColumnZA.js';
import { sortColumn } from './table/sortColumn.js';
import { getTableColumnCount } from './table/getTableColumnCount.js';
import { getCellsNeededForRow } from './table/getCellsNeededForRow.js';
import { getColumnPosition } from './table/getColumnPosition.js';
import { splitTable } from './table/splitTable.js';
import { joinTables } from './table/joinTables.js';
import { deleteTable } from './table/deleteTable.js';
import { deleteTableFromContext } from './table/deleteTableFromContext.js';
import { toggleTableHeaders } from './table/toggleTableHeaders.js';
import { initializeExistingTables } from './table/initializeExistingTables.js';

import { deleteCell } from './cells/deleteCell.js';
import { mergeSelectedCells } from './cells/mergeSelectedCells.js';
import { areSelectedCellsAdjacent } from './cells/areSelectedCellsAdjacent.js';
import { splitSelectedCell } from './cells/splitSelectedCell.js';
import { toggleCellInvisible } from './cells/toggleCellInvisible.js';
import { toggleVerticalText } from './cells/toggleVerticalText.js';

import { updateFormatControls } from './formatting/updateFormatControls.js';
import { rgbToHex } from './formatting/rgbToHex.js';
import { applyAlignmentFromContext } from './formatting/applyAlignmentFromContext.js';
import { applyVerticalAlignmentFromContext } from './formatting/applyVerticalAlignmentFromContext.js';
import { applyFontSizeFromContext } from './formatting/applyFontSizeFromContext.js';
import { toggleBold } from './formatting/toggleBold.js';
import { toggleItalic } from './formatting/toggleItalic.js';
import { toggleUnderline } from './formatting/toggleUnderline.js';
import { toggleStrikethrough } from './formatting/toggleStrikethrough.js';
import { applyStyleToSelection } from './formatting/applyStyleToSelection.js';
import { applyTextDecorationToSelection } from './formatting/applyTextDecorationToSelection.js';
import { updateFormatButtons } from './formatting/updateFormatButtons.js';
import { toggleBgColorDropdown } from './formatting/toggleBgColorDropdown.js';
import { toggleTextColorDropdown } from './formatting/toggleTextColorDropdown.js';
import { selectBgColor } from './formatting/selectBgColor.js';
import { selectTextColor } from './formatting/selectTextColor.js';
import { applyBackgroundColorFromContext } from './formatting/applyBackgroundColorFromContext.js';
import { applyTextColorFromContext } from './formatting/applyTextColorFromContext.js';
import { resetFormatFromContext } from './formatting/resetFormatFromContext.js';
import { applyTextFontSize } from './formatting/applyTextFontSize.js';
import { increaseContextFontSize } from './formatting/increaseContextFontSize.js';
import { decreaseContextFontSize } from './formatting/decreaseContextFontSize.js';
import { increaseTextFontSize } from './formatting/increaseTextFontSize.js';
import { decreaseTextFontSize } from './formatting/decreaseTextFontSize.js';
import { selectTextMenuTextColor } from './formatting/selectTextMenuTextColor.js';
import { selectTextMenuBgColor } from './formatting/selectTextMenuBgColor.js';
import { toggleTextMenuTextColorDropdown } from './formatting/toggleTextMenuTextColorDropdown.js';
import { toggleTextMenuBgColorDropdown } from './formatting/toggleTextMenuBgColorDropdown.js';
import { applyBorderStyleFromContext } from './formatting/applyBorderStyleFromContext.js';
import { toggleBorderColorDropdown } from './formatting/toggleBorderColorDropdown.js';
import { selectBorderColor } from './formatting/selectBorderColor.js';
import { copyFormat } from './formatting/copyFormat.js';
import { pasteFormat } from './formatting/pasteFormat.js';

import { showTextFormatMenu } from './text/showTextFormatMenu.js';
import { hideTextFormatMenu } from './text/hideTextFormatMenu.js';
import { selectParentTag } from './text/selectParentTag.js';
import { clearTextFormat } from './text/clearTextFormat.js';
import { createTableFromMenu } from './text/createTableFromMenu.js';
import { pasteAsPlainText } from './text/pasteAsPlainText.js';

import { addResizeHandles } from './resize/addResizeHandles.js';
import { startResize } from './resize/startResize.js';
import { handleResize } from './resize/handleResize.js';
import { stopResize } from './resize/stopResize.js';

import { addRowDragHandle } from './drag/addRowDragHandle.js';
import { addColumnDragHandle } from './drag/addColumnDragHandle.js';

import { toggleNextPage } from './pagination/toggleNextPage.js';

import { toggleMode } from './mode/toggleMode.js';

import { saveUndoStackToStorage } from './undo/saveUndoStackToStorage.js';
import { captureSnapshot } from './undo/captureSnapshot.js';
import { normalizeHtmlForComparison } from './undo/normalizeHtmlForComparison.js';
import { startSnapshotTimer } from './undo/startSnapshotTimer.js';
import { stopSnapshotTimer } from './undo/stopSnapshotTimer.js';
import { restoreSnapshot } from './undo/restoreSnapshot.js';
import { reinitializeAfterRestore } from './undo/reinitializeAfterRestore.js';
import { undo } from './undo/undo.js';
import { redo } from './undo/redo.js';
import { enableRcPagination } from './pagination/rcPagination.js';

// Export all functions
export {
    selectCell, clearSelection, startMouseSelection, handleMouseOverCell, stopMouseSelection,
    navigateToCell, extendSelection, selectRange,
    enterEditMode, exitEditMode,
    showContextMenu, hideContextMenu, clearSelectionFromContext,
    addRow, addColumn, removeRow, removeColumn, addRowAbove, addRowBelow,
    addColumnLeft, addColumnRight, deleteSelectedRow, deleteSelectedColumn,
    moveRowUp, moveRowDown, sortColumnAZ, sortColumnZA, sortColumn,
    getTableColumnCount, getCellsNeededForRow, getColumnPosition,
    splitTable, joinTables, deleteTable, deleteTableFromContext, toggleTableHeaders,
    initializeExistingTables,
    deleteCell, mergeSelectedCells, areSelectedCellsAdjacent, splitSelectedCell,
    toggleCellInvisible, toggleVerticalText,
    updateFormatControls, rgbToHex, applyAlignmentFromContext, applyVerticalAlignmentFromContext,
    applyFontSizeFromContext, toggleBold, toggleItalic, toggleUnderline, toggleStrikethrough,
    applyStyleToSelection, applyTextDecorationToSelection, updateFormatButtons,
    toggleBgColorDropdown, toggleTextColorDropdown, selectBgColor, selectTextColor,
    applyBackgroundColorFromContext, applyTextColorFromContext, resetFormatFromContext,
    applyTextFontSize, increaseContextFontSize, decreaseContextFontSize,
    increaseTextFontSize, decreaseTextFontSize,
    selectTextMenuTextColor, selectTextMenuBgColor,
    toggleTextMenuTextColorDropdown, toggleTextMenuBgColorDropdown,
    applyBorderStyleFromContext, toggleBorderColorDropdown, selectBorderColor,
    copyFormat, pasteFormat,
    showTextFormatMenu, hideTextFormatMenu, selectParentTag, clearTextFormat,
    createTableFromMenu, pasteAsPlainText,
    addResizeHandles, startResize, handleResize, stopResize,
    initializeResizeHandles,
    addRowDragHandle, addColumnDragHandle,
    toggleMode,
    initializeUndoSystem, saveUndoStackToStorage, captureSnapshot, normalizeHtmlForComparison,
    startSnapshotTimer, stopSnapshotTimer, restoreSnapshot, reinitializeAfterRestore,
    undo, redo,
    handlePagination, toggleNextPage,
    initPagination
};

// Helper function to create a dynamic table
export function createDynamicTable(rows, cols) {
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';

    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (let c = 0; c < cols; c++) {
        const th = document.createElement('th');
        th.style.border = '1px solid #ddd';
        th.style.position = 'relative';
        const span = document.createElement('span');
        span.contentEditable = 'false';
        span.textContent = `H${c + 1}`;
        th.appendChild(span);
        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    for (let r = 0; r < rows; r++) {
        const row = document.createElement('tr');
        for (let c = 0; c < cols; c++) {
            const td = document.createElement('td');
            td.style.border = '1px solid #ddd';
            td.style.position = 'relative';
            const span = document.createElement('span');
            span.contentEditable = 'false';
            span.textContent = `R${r + 1}C${c + 1}`;
            td.appendChild(span);
            row.appendChild(td);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    return table;
}

// Helper function to initialize pagination for dynamically loaded content
function initPagination() {
    initializeExistingTables()
    enableRcPagination();
    // Run pagination immediately
    handlePagination();

    // Disconnect existing observer if any
    if (window.paginationObserver) {
        window.paginationObserver.disconnect();
    }

    // Set up new pagination observer
    let paginationTimeout;
    const paginationObserver = new MutationObserver(() => {
        // Debounce: wait 1 second after last edit
        clearTimeout(paginationTimeout);
        paginationTimeout = setTimeout(() => {
            console.log('Content changed, running pagination...');
            handlePagination();
        }, 1000);
    });

    // Observe all page containers for changes
    const pages = document.querySelectorAll('.portrait-content, .landscape-content');
    console.log(`Setting up pagination observer for ${pages.length} pages`);
    pages.forEach(page => {
        paginationObserver.observe(page, {
            childList: true,
            subtree: true,
            characterData: true,
            attributes: false
        });
    });

    // Store observer globally
    window.paginationObserver = paginationObserver;

    return pages.length;
}

// Expose all functions globally for inline event handlers IMMEDIATELY
// This must happen before DOM is ready so inline handlers can find them
if (typeof window !== 'undefined') {
    window.selectCell = selectCell;
    window.clearSelection = clearSelection;
    window.showContextMenu = showContextMenu;
    window.hideContextMenu = hideContextMenu;
    window.addRowAbove = addRowAbove;
    window.addRowBelow = addRowBelow;
    window.addColumnLeft = addColumnLeft;
    window.addColumnRight = addColumnRight;
    window.deleteCell = deleteCell;
    window.deleteSelectedRow = deleteSelectedRow;
    window.deleteSelectedColumn = deleteSelectedColumn;
    window.moveRowUp = moveRowUp;
    window.moveRowDown = moveRowDown;
    window.sortColumnAZ = sortColumnAZ;
    window.sortColumnZA = sortColumnZA;
    window.mergeSelectedCells = mergeSelectedCells;
    window.splitSelectedCell = splitSelectedCell;
    window.toggleCellInvisible = toggleCellInvisible;
    window.toggleVerticalText = toggleVerticalText;
    window.pasteAsPlainText = pasteAsPlainText;
    window.toggleTableHeaders = toggleTableHeaders;
    window.splitTable = splitTable;
    window.joinTables = joinTables;
    window.deleteTableFromContext = deleteTableFromContext;
    window.applyAlignmentFromContext = applyAlignmentFromContext;
    window.applyVerticalAlignmentFromContext = applyVerticalAlignmentFromContext;
    window.applyFontSizeFromContext = applyFontSizeFromContext;
    window.toggleBold = toggleBold;
    window.toggleItalic = toggleItalic;
    window.toggleUnderline = toggleUnderline;
    window.toggleStrikethrough = toggleStrikethrough;
    window.selectBgColor = selectBgColor;
    window.selectTextColor = selectTextColor;
    window.toggleBgColorDropdown = toggleBgColorDropdown;
    window.toggleTextColorDropdown = toggleTextColorDropdown;
    window.resetFormatFromContext = resetFormatFromContext;
    window.clearSelectionFromContext = clearSelectionFromContext;
    window.applyTextFontSize = applyTextFontSize;
    window.increaseContextFontSize = increaseContextFontSize;
    window.decreaseContextFontSize = decreaseContextFontSize;
    window.increaseTextFontSize = increaseTextFontSize;
    window.decreaseTextFontSize = decreaseTextFontSize;
    window.selectTextMenuTextColor = selectTextMenuTextColor;
    window.selectTextMenuBgColor = selectTextMenuBgColor;
    window.toggleTextMenuTextColorDropdown = toggleTextMenuTextColorDropdown;
    window.toggleTextMenuBgColorDropdown = toggleTextMenuBgColorDropdown;
    window.applyBorderStyleFromContext = applyBorderStyleFromContext;
    window.toggleBorderColorDropdown = toggleBorderColorDropdown;
    window.selectBorderColor = selectBorderColor;
    window.copyFormat = copyFormat;
    window.pasteFormat = pasteFormat;
    window.selectParentTag = selectParentTag;
    window.clearTextFormat = clearTextFormat;
    window.createTableFromMenu = createTableFromMenu;
    window.deleteTable = deleteTable;
    window.toggleMode = toggleMode;
    window.createDynamicTable = createDynamicTable;
    window.initializeExistingTables = initializeExistingTables;
    window.handlePagination = handlePagination;
    window.toggleNextPage = toggleNextPage;
    window.initPagination = initPagination;
    window.enableRcPagination = initPagination
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

function initialize() {
    // Create menu elements
    createMenuElements();

    // Initialize existing tables with event handlers
    initializeExistingTables();

    // Initialize undo system
    initializeUndoSystem();

    // Initialize resize handles
    initializeResizeHandles();

    // Setup all event listeners
    setupEventListeners();

    // Initialize pagination (with observer)
    setTimeout(() => initPagination(), 2000);

    console.log(
        '%c✨ Document Editor Initialized %c v2.1.15 %c\n%c📝 Modular ES6 • Table Support • Auto Pagination',
        'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-weight: bold; font-size: 16px; padding: 8px 16px; border-radius: 4px 4px 0 0;',
        'background: #f7fafc; color: #667eea; font-weight: bold; font-size: 14px; padding: 8px 12px; border-radius: 0 0 0 0;',
        '',
        'background: #2d3748; color: #a0aec0; font-size: 12px; padding: 6px 16px; border-radius: 0 0 4px 4px; font-style: italic;'
    );
}