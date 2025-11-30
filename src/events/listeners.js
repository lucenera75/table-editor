// Event listeners setup
import { savedSelection, isInputFocused, menuHideTimeout, draggedRow, draggedColumn,
         selectedCells, currentCell, isEditMode,
         setIsInputFocused, setSavedSelection, setMenuHideTimeout, setCurrentCell, setIsEditMode } from '../state/variables.js';
import { undo } from '../undo/undo.js';
import { redo } from '../undo/redo.js';
import { hideContextMenu } from '../menus/hideContextMenu.js';
import { showTextFormatMenu } from '../text/showTextFormatMenu.js';
import { hideTextFormatMenu } from '../text/hideTextFormatMenu.js';
import { clearSelection } from '../selection/clearSelection.js';
import { enterEditMode } from '../edit/enterEditMode.js';
import { exitEditMode } from '../edit/exitEditMode.js';
import { toggleBold } from '../formatting/toggleBold.js';
import { toggleItalic } from '../formatting/toggleItalic.js';
import { toggleUnderline } from '../formatting/toggleUnderline.js';
import { initializeResizeHandles } from '../resize/initializeResizeHandles.js';

export function setupEventListeners() {
    // Prevent mousedown on text format menu from clearing selection
    document.addEventListener('mousedown', function(e) {
        if (e.target.closest('.text-format-menu')) {
            const selection = window.getSelection();
            if (selection.rangeCount > 0 && !isInputFocused) {
                setSavedSelection(selection.getRangeAt(0).cloneRange());
            }

            if (e.target.tagName === 'INPUT') {
                setIsInputFocused(true);
                return;
            }

            e.preventDefault();
        }
    });

    // When input loses focus, restore text selection
    document.addEventListener('blur', function(e) {
        if (e.target.tagName === 'INPUT' && e.target.closest('.text-format-menu')) {
            setIsInputFocused(false);
        }
    }, true);

    // Keep selection visually highlighted while input is focused
    document.addEventListener('focus', function(e) {
        if (e.target.tagName === 'INPUT' && e.target.closest('.text-format-menu')) {
            // Selection will be used when applying format
        }
    }, true);

    // Click handler
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.context-menu')) {
            hideContextMenu();
        }

        const clickedInMenu = e.target.closest('.text-format-menu');
        const clickedInTextDropdown = e.target.closest('#textMenuTextColorDropdown');
        const clickedInBgDropdown = e.target.closest('#textMenuBgColorDropdown');

        if (!clickedInMenu && !clickedInTextDropdown && !clickedInBgDropdown) {
            hideTextFormatMenu();
        }

        // Close text menu color dropdowns when clicking outside
        if (!e.target.closest('#textMenuTextColorPicker') && !e.target.closest('#textMenuTextColorDropdown')) {
            const dropdown = document.getElementById('textMenuTextColorDropdown');
            if (dropdown) dropdown.classList.remove('show');
        }
        if (!e.target.closest('#textMenuBgColorPicker') && !e.target.closest('#textMenuBgColorDropdown')) {
            const dropdown = document.getElementById('textMenuBgColorDropdown');
            if (dropdown) dropdown.classList.remove('show');
        }

        // Clear cell selection when clicking on other editable content
        if (selectedCells.length > 1) {
            return;
        }

        const editableContent = e.target.closest('[contenteditable="true"]');
        const clickedCell = e.target.closest('td, th');
        const editableInCell = editableContent && editableContent.closest('td, th');

        if (editableContent && !clickedCell && !editableInCell && selectedCells.length > 0) {
            clearSelection();
        }
    });

    // Context menu handler
    document.addEventListener('contextmenu', function(e) {
        // Only handle context menu within editable-contents-area
        const container = document.getElementById('editable-contents-area');
        if (!container || !container.contains(e.target)) {
            return;
        }

        if (e.target.closest('td, th')) {
            return;
        }

        const editableArea = e.target.closest('[contenteditable="true"]');
        if (!editableArea) {
            return;
        }

        e.preventDefault();

        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
            setSavedSelection(selection.getRangeAt(0).cloneRange());
        }

        const menu = document.getElementById('textFormatMenu');
        if (!menu) return;

        menu.style.display = 'block';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';

        const menuRect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        if (menuRect.right > windowWidth) {
            menu.style.left = (e.pageX - menuRect.width) + 'px';
        }

        if (menuRect.bottom > windowHeight) {
            menu.style.top = (e.pageY - menuRect.height) + 'px';
        }

        if (menuHideTimeout) {
            clearTimeout(menuHideTimeout);
        }
        setMenuHideTimeout(setTimeout(() => {
            hideTextFormatMenu();
        }, 5000));
    });

    // Mouse up handler for text selection
    document.addEventListener('mouseup', function(e) {
        if (e.target.closest('.text-format-menu')) {
            if (menuHideTimeout) {
                clearTimeout(menuHideTimeout);
                setMenuHideTimeout(null);
            }
            return;
        }

        // Only handle text selection within editable-contents-area
        const editableContainer = document.getElementById('editable-contents-area');
        if (!editableContainer || !editableContainer.contains(e.target)) {
            return;
        }

        setTimeout(() => {
            const selection = window.getSelection();
            const selectedText = selection.toString();

            if (selectedText && selectedText.trim().length > 0) {
                const range = selection.getRangeAt(0);
                const container = range.commonAncestorContainer;
                const isInContextMenu = container.nodeType === 3
                    ? container.parentElement.closest('.context-menu')
                    : container.closest('.context-menu');

                if (!isInContextMenu) {
                    setSavedSelection(range.cloneRange());
                    showTextFormatMenu();

                    if (menuHideTimeout) {
                        clearTimeout(menuHideTimeout);
                    }
                    setMenuHideTimeout(setTimeout(() => {
                        hideTextFormatMenu();
                    }, 5000));
                }
            } else {
                if (menuHideTimeout) {
                    clearTimeout(menuHideTimeout);
                    setMenuHideTimeout(null);
                }
                hideTextFormatMenu();
            }
        }, 10);
    });

    // Double-click handler
    document.addEventListener('dblclick', function(e) {
        // Only handle double-click within editable-contents-area
        const container = document.getElementById('editable-contents-area');
        if (!container || !container.contains(e.target)) {
            return;
        }

        const cell = e.target.closest('td, th');
        if (cell && (cell.tagName === 'TD' || cell.tagName === 'TH')) {
            if (e.target.closest('.resize-handle-col, .resize-handle-row, .resize-handle-corner, .row-drag-handle, .col-drag-handle')) {
                return;
            }
            setCurrentCell(cell);
            enterEditMode();
        }
    });

    // Focus handler
    document.addEventListener('focusin', function(e) {
        // Only handle focus within editable-contents-area
        const container = document.getElementById('editable-contents-area');
        if (!container || !container.contains(e.target)) {
            return;
        }

        const cell = e.target.closest('td, th');
        if (cell && (cell.tagName === 'TD' || cell.tagName === 'TH')) {
            if (!isEditMode && currentCell === cell && window.getSelection().toString()) {
                setIsEditMode(true);
                cell.classList.add('editing-mode');
            }
        }
    });

    // Paste handler
    document.addEventListener('paste', function(e) {
        // Only handle paste within editable-contents-area
        const container = document.getElementById('editable-contents-area');
        if (!container || !container.contains(e.target)) {
            return;
        }

        const cell = e.target.closest('td, th');
        if (!cell || (cell.tagName !== 'TD' && cell.tagName !== 'TH')) return;

        if (e.target === cell) {
            e.preventDefault();
            const span = cell.querySelector('span');
            if (span) {
                span.focus();
                const pasteEvent = new ClipboardEvent('paste', {
                    clipboardData: e.clipboardData,
                    bubbles: true,
                    cancelable: true
                });
                span.dispatchEvent(pasteEvent);
            }
        }
    });

    // Keyboard handler
    document.addEventListener('keydown', function(e) {
        // Handle undo/redo
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
            if (e.shiftKey) {
                redo();
            } else {
                undo();
            }
            e.preventDefault();
            return;
        }

        // Handle formatting shortcuts
        if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
            switch(e.key.toLowerCase()) {
                case 'b':
                    toggleBold();
                    e.preventDefault();
                    return;
                case 'i':
                    toggleItalic();
                    e.preventDefault();
                    return;
                case 'u':
                    toggleUnderline();
                    e.preventDefault();
                    return;
            }
        }

        if (!currentCell) return;

        if (isEditMode) {
            if (e.key === 'Escape') {
                exitEditMode();
                e.preventDefault();
            }
            return;
        }

        // Handle Enter key to enter edit mode
        if (e.key === 'Enter') {
            enterEditMode();
            e.preventDefault();
            return;
        }

        // Keyboard navigation would go here
        // (Omitted for brevity - would need imports for navigateToCell, extendSelection, etc.)
    });

    // Drag and drop handlers
    document.addEventListener('dragover', (e) => {
        // Only handle drag within editable-contents-area
        const container = document.getElementById('editable-contents-area');
        if (!container || !container.contains(e.target)) {
            return;
        }

        e.preventDefault();

        const row = e.target.closest('tbody tr');
        if (row && draggedRow && row !== draggedRow) {
            document.querySelectorAll('tr.drag-over').forEach(r => r.classList.remove('drag-over'));
            row.classList.add('drag-over');
        }

        const cell = e.target.closest('th, td');
        if (cell && draggedColumn !== null) {
            const table = cell.closest('table');
            const row = cell.parentNode;
            const cellIndex = Array.from(row.children).indexOf(cell);

            if (cellIndex !== draggedColumn) {
                table.querySelectorAll('.col-drag-over').forEach(c => c.classList.remove('col-drag-over'));

                const rows = table.querySelectorAll('tr');
                rows.forEach(r => {
                    const targetCell = r.children[cellIndex];
                    if (targetCell) targetCell.classList.add('col-drag-over');
                });
            }
        }
    });

    document.addEventListener('drop', (e) => {
        // Only handle drop within editable-contents-area
        const container = document.getElementById('editable-contents-area');
        if (!container || !container.contains(e.target)) {
            return;
        }

        e.preventDefault();

        const targetRow = e.target.closest('tbody tr');
        if (targetRow && draggedRow && targetRow !== draggedRow) {
            const tbody = targetRow.parentNode;
            const rows = Array.from(tbody.children);
            const draggedIndex = rows.indexOf(draggedRow);
            const targetIndex = rows.indexOf(targetRow);

            if (draggedIndex < targetIndex) {
                tbody.insertBefore(draggedRow, targetRow.nextSibling);
            } else {
                tbody.insertBefore(draggedRow, targetRow);
            }
        }

        const targetCell = e.target.closest('th, td');
        if (targetCell && draggedColumn !== null) {
            const table = targetCell.closest('table');
            const targetRow = targetCell.parentNode;
            const targetIndex = Array.from(targetRow.children).indexOf(targetCell);

            if (targetIndex !== draggedColumn && targetIndex !== -1) {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = Array.from(row.children);
                    const draggedCell = cells[draggedColumn];
                    const targetCell = cells[targetIndex];

                    if (draggedCell && targetCell) {
                        if (draggedColumn < targetIndex) {
                            row.insertBefore(draggedCell, targetCell.nextSibling);
                        } else {
                            row.insertBefore(draggedCell, targetCell);
                        }
                    }
                });

                initializeResizeHandles();
            }
        }

        document.querySelectorAll('tr.drag-over').forEach(r => r.classList.remove('drag-over'));
        document.querySelectorAll('.col-drag-over').forEach(c => c.classList.remove('col-drag-over'));
    });

    // Clear localStorage on page unload
    window.addEventListener('beforeunload', function() {
        localStorage.removeItem('documentEditorUndoStack');
    });

    // Color picker dropdown close handler
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.color-picker-container') && !e.target.closest('.context-menu')) {
            const bgDropdown = document.getElementById('bgColorDropdown');
            const textDropdown = document.getElementById('textColorDropdown');
            if (bgDropdown) bgDropdown.classList.remove('show');
            if (textDropdown) textDropdown.classList.remove('show');
        }
    });
}
