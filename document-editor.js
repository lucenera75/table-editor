let selectedCells = [];
let selectedRow = null;
let selectedColumn = null;
let contextMenuTarget = null;
let currentCell = null; // Currently focused cell for keyboard navigation
let anchorCell = null; // Starting cell for range selection
let isEditMode = false; // Track if we're in edit mode

// Mouse drag selection variables
let isMouseSelecting = false;
let selectionStartCell = null;

// Counter for new cells
let newCellCounter = 0;

// Resize functionality variables
let isResizing = false;
let resizeType = null; // 'col', 'row', or 'corner'
let resizeTarget = null;
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let resizeLine = null;

// Store the current text selection when using the format menu
let savedSelection = null;
let isInputFocused = false;
let menuHideTimeout = null;

// Prevent mousedown on text format menu from clearing selection
document.addEventListener('mousedown', function(e) {
    if (e.target.closest('.text-format-menu')) {
        // Save current selection before interacting with menu
        const selection = window.getSelection();
        if (selection.rangeCount > 0 && !isInputFocused) {
            savedSelection = selection.getRangeAt(0).cloneRange();
        }

        // For inputs, allow normal behavior completely
        if (e.target.tagName === 'INPUT') {
            isInputFocused = true;
            return;
        }

        // Prevent default for buttons and other elements to preserve selection
        e.preventDefault();
    }
});

// When input loses focus, restore text selection
document.addEventListener('blur', function(e) {
    if (e.target.tagName === 'INPUT' && e.target.closest('.text-format-menu')) {
        isInputFocused = false;
    }
}, true);

// Keep selection visually highlighted while input is focused
document.addEventListener('focus', function(e) {
    if (e.target.tagName === 'INPUT' && e.target.closest('.text-format-menu')) {
        // Keep the visual selection in the background
        if (savedSelection) {
            // Selection will be used when applying format, but we don't force it visually
            // This allows the input to work normally
        }
    }
}, true);

document.addEventListener('click', function(e) {
    if (!e.target.closest('.context-menu')) {
        hideContextMenu();
    }

    // Only hide text format menu if clicking outside AND not on color picker dropdown
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
    const editableContent = e.target.closest('[contenteditable="true"]');
    const clickedCell = e.target.closest('td, th');

    if (editableContent && !clickedCell && selectedCells.length > 0) {
        clearSelection();
    }
});

// Show text format menu on right-click
document.addEventListener('contextmenu', function(e) {
    // Don't override context menu for table cells - they have their own
    if (e.target.closest('td, th')) {
        return;
    }

    // Check if we're in a contenteditable area
    const editableArea = e.target.closest('[contenteditable="true"]');
    if (!editableArea) {
        return;
    }

    e.preventDefault();

    // Save the selection
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
        savedSelection = selection.getRangeAt(0).cloneRange();
    }

    // Show the text format menu at the click position
    const menu = document.getElementById('textFormatMenu');
    if (!menu) return;

    menu.style.display = 'block';
    menu.style.left = e.pageX + 'px';
    menu.style.top = e.pageY + 'px';

    // Adjust position if menu goes off screen
    const menuRect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (menuRect.right > windowWidth) {
        menu.style.left = (e.pageX - menuRect.width) + 'px';
    }

    if (menuRect.bottom > windowHeight) {
        menu.style.top = (e.pageY - menuRect.height) + 'px';
    }

    // Set timeout to hide menu after 5 seconds
    if (menuHideTimeout) {
        clearTimeout(menuHideTimeout);
    }
    menuHideTimeout = setTimeout(() => {
        hideTextFormatMenu();
    }, 5000);
});

// Show text format menu on text selection
document.addEventListener('mouseup', function(e) {
    // Don't reposition if clicking inside the text format menu
    if (e.target.closest('.text-format-menu')) {
        // Cancel any pending hide timeout
        if (menuHideTimeout) {
            clearTimeout(menuHideTimeout);
            menuHideTimeout = null;
        }
        return;
    }

    // Small delay to ensure selection is complete
    setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection.toString();

        // Only show if there's selected text and not in a table cell context menu scenario
        if (selectedText && selectedText.trim().length > 0) {
            // Check if selection is not inside the context menu
            const range = selection.getRangeAt(0);
            const container = range.commonAncestorContainer;
            const isInContextMenu = container.nodeType === 3
                ? container.parentElement.closest('.context-menu')
                : container.closest('.context-menu');

            if (!isInContextMenu) {
                // Save the selection
                savedSelection = range.cloneRange();

                showTextFormatMenu();

                // Set timeout to hide menu after 5 seconds
                if (menuHideTimeout) {
                    clearTimeout(menuHideTimeout);
                }
                menuHideTimeout = setTimeout(() => {
                    hideTextFormatMenu();
                }, 5000);
            }
        } else {
            // No selection - hide immediately
            if (menuHideTimeout) {
                clearTimeout(menuHideTimeout);
                menuHideTimeout = null;
            }
            hideTextFormatMenu();
        }
    }, 10);
});

function showTextFormatMenu() {
    const menu = document.getElementById('textFormatMenu');
    if (!menu) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position menu at the end of selection
    menu.style.display = 'block';
    menu.style.left = (rect.right + window.scrollX) + 'px';
    menu.style.top = (rect.bottom + window.scrollY + 5) + 'px';

    // Adjust position if menu goes off screen
    const menuRect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (menuRect.right > windowWidth) {
        menu.style.left = (rect.left + window.scrollX) + 'px';
    }

    if (menuRect.bottom > windowHeight) {
        menu.style.top = (rect.top + window.scrollY - menuRect.height - 5) + 'px';
    }
}

function hideTextFormatMenu() {
    const menu = document.getElementById('textFormatMenu');
    if (menu) {
        menu.style.display = 'none';
    }
}

function applyTextFontSize() {
    const fontSize = document.getElementById('textFontSize').value;
    if (selectedCells.length > 0) {
        // Apply to table cells
        selectedCells.forEach(cell => {
            cell.style.fontSize = fontSize + 'px';
        });
    } else {
        // Apply to selected text using the saved selection
        if (!savedSelection) return;

        // Check if the selection contains exactly one span that encompasses the entire selection
        const container = savedSelection.commonAncestorContainer;
        let targetSpan = null;

        if (container.nodeType === 3 && container.parentElement.tagName === 'SPAN') {
            // Text node inside a span
            const span = container.parentElement;
            const spanRange = document.createRange();
            spanRange.selectNodeContents(span);
            if (spanRange.toString() === savedSelection.toString()) {
                targetSpan = span;
            }
        } else if (container.nodeType === 1 && container.tagName === 'SPAN') {
            // Span element itself
            targetSpan = container;
        }

        if (targetSpan) {
            // Reuse existing span
            targetSpan.style.fontSize = fontSize + 'px';
        } else {
            // Create new span
            const span = document.createElement('span');
            span.style.fontSize = fontSize + 'px';

            try {
                savedSelection.surroundContents(span);
            } catch (e) {
                // If surroundContents fails (e.g., partial element selection), use extractContents
                const fragment = savedSelection.extractContents();
                span.appendChild(fragment);
                savedSelection.insertNode(span);
            }

            // Update saved selection to the new span
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            savedSelection = newRange;

            // Restore visual selection
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
}

// Text menu color picker functions
let currentTextMenuTextColor = '#000000';
let currentTextMenuBgColor = '';

function toggleTextMenuTextColorDropdown() {
    const dropdown = document.getElementById('textMenuTextColorDropdown');
    const bgDropdown = document.getElementById('textMenuBgColorDropdown');
    if (bgDropdown) bgDropdown.classList.remove('show');
    if (dropdown) dropdown.classList.toggle('show');
}

function toggleTextMenuBgColorDropdown() {
    const dropdown = document.getElementById('textMenuBgColorDropdown');
    const textDropdown = document.getElementById('textMenuTextColorDropdown');
    if (textDropdown) textDropdown.classList.remove('show');
    if (dropdown) dropdown.classList.toggle('show');
}

function selectTextMenuTextColor(color, label) {
    currentTextMenuTextColor = color;
    document.getElementById('textMenuTextColorPreview').style.backgroundColor = color;
    document.getElementById('textMenuTextColorLabel').textContent = label;
    document.getElementById('textMenuTextColorDropdown').classList.remove('show');

    // Apply immediately
    if (selectedCells.length > 0) {
        selectedCells.forEach(cell => {
            cell.style.color = color;
        });
    } else if (savedSelection) {
        // Check if we can reuse an existing span
        const container = savedSelection.commonAncestorContainer;
        let targetSpan = null;

        if (container.nodeType === 3 && container.parentElement.tagName === 'SPAN') {
            const span = container.parentElement;
            const spanRange = document.createRange();
            spanRange.selectNodeContents(span);
            if (spanRange.toString() === savedSelection.toString()) {
                targetSpan = span;
            }
        } else if (container.nodeType === 1 && container.tagName === 'SPAN') {
            targetSpan = container;
        }

        if (targetSpan) {
            // Reuse existing span
            targetSpan.style.color = color;
        } else {
            // Create new span
            const span = document.createElement('span');
            span.style.color = color;

            try {
                const contents = savedSelection.cloneContents();
                savedSelection.deleteContents();
                span.appendChild(contents);
                savedSelection.insertNode(span);
            } catch (e) {
                console.error('Error applying color:', e);
            }

            // Update saved selection
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            savedSelection = newRange;

            // Restore visual selection
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
}

function selectTextMenuBgColor(color, label) {
    currentTextMenuBgColor = color;
    document.getElementById('textMenuBgColorPreview').style.backgroundColor = color || 'transparent';
    document.getElementById('textMenuBgColorLabel').textContent = label;
    document.getElementById('textMenuBgColorDropdown').classList.remove('show');

    // Apply immediately
    if (selectedCells.length > 0) {
        selectedCells.forEach(cell => {
            cell.style.backgroundColor = color;
        });
    } else if (savedSelection) {
        // Check if we can reuse an existing span
        const container = savedSelection.commonAncestorContainer;
        let targetSpan = null;

        if (container.nodeType === 3 && container.parentElement.tagName === 'SPAN') {
            const span = container.parentElement;
            const spanRange = document.createRange();
            spanRange.selectNodeContents(span);
            if (spanRange.toString() === savedSelection.toString()) {
                targetSpan = span;
            }
        } else if (container.nodeType === 1 && container.tagName === 'SPAN') {
            targetSpan = container;
        }

        if (targetSpan) {
            // Reuse existing span
            targetSpan.style.backgroundColor = color;
        } else {
            // Create new span
            const span = document.createElement('span');
            span.style.backgroundColor = color;

            try {
                const contents = savedSelection.cloneContents();
                savedSelection.deleteContents();
                span.appendChild(contents);
                savedSelection.insertNode(span);
            } catch (e) {
                console.error('Error applying background color:', e);
            }

            // Update saved selection
            const newRange = document.createRange();
            newRange.selectNodeContents(span);
            savedSelection = newRange;

            // Restore visual selection
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(newRange);
        }
    }
}

function selectParentTag() {
    if (selectedCells.length > 0) {
        // For table cells, this doesn't apply
        return;
    }

    if (!savedSelection) return;

    const container = savedSelection.commonAncestorContainer;
    let currentElement = null;

    if (container.nodeType === 3) {
        // Text node - get its parent element
        currentElement = container.parentElement;
    } else if (container.nodeType === 1) {
        // Element node - use it directly
        currentElement = container;
    }

    // If we're already at a span, go to its parent span
    // Otherwise find the nearest span
    let parentElement = currentElement;

    if (parentElement && parentElement.tagName === 'SPAN') {
        // Already in a span, look for parent span
        parentElement = parentElement.parentElement;
        while (parentElement && parentElement.tagName !== 'SPAN' && parentElement.contentEditable !== 'true') {
            parentElement = parentElement.parentElement;
        }
    } else {
        // Not in a span, find nearest span
        while (parentElement && parentElement.tagName !== 'SPAN' && parentElement.contentEditable !== 'true') {
            parentElement = parentElement.parentElement;
        }
    }

    if (parentElement && (parentElement.tagName === 'SPAN' || parentElement.contentEditable === 'true')) {
        // Select the contents of the parent element
        const newRange = document.createRange();
        newRange.selectNodeContents(parentElement);
        savedSelection = newRange;

        // Update visual selection
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(newRange);

        // Reposition the menu
        showTextFormatMenu();
    }
}

function clearTextFormat() {
    if (selectedCells.length > 0) {
        // Clear format from table cells
        selectedCells.forEach(cell => {
            cell.style.fontWeight = '';
            cell.style.fontStyle = '';
            cell.style.textDecoration = '';
            cell.style.fontSize = '';
            cell.style.color = '';
            cell.style.backgroundColor = '';
        });
        updateFormatButtons();
    } else {
        // Clear format from selected text
        const range = savedSelection || (window.getSelection().rangeCount > 0 ? window.getSelection().getRangeAt(0) : null);
        if (range) {
            const fragment = range.extractContents();

            // Get plain text
            const tempDiv = document.createElement('div');
            tempDiv.appendChild(fragment);
            const plainText = tempDiv.textContent || tempDiv.innerText;

            // Insert plain text (no need to deleteContents - extractContents already removed it)
            range.insertNode(document.createTextNode(plainText));
        }
    }
    hideTextFormatMenu();
}

function createTableFromMenu() {
    // Prompt for table dimensions
    const rows = prompt('Number of rows:', '3');
    const cols = prompt('Number of columns:', '3');

    if (!rows || !cols || isNaN(rows) || isNaN(cols)) {
        return;
    }

    const numRows = parseInt(rows);
    const numCols = parseInt(cols);

    if (numRows < 1 || numCols < 1) {
        alert('Table must have at least 1 row and 1 column');
        return;
    }

    // Create table element
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.style.border = '1px solid #ddd';
    table.style.marginTop = '10px';
    table.style.marginBottom = '10px';

    // Create header row
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (let c = 0; c < numCols; c++) {
        const th = document.createElement('th');
        th.style.border = '1px solid #ddd';
        th.style.padding = '8px';
        th.style.position = 'relative';
        th.onmousedown = function(e) { selectCell(this, e); };
        th.oncontextmenu = function(e) { showContextMenu(e, this); };

        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = `Header ${c + 1}`;
        th.appendChild(span);

        headerRow.appendChild(th);
    }
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create body rows
    const tbody = document.createElement('tbody');
    for (let r = 0; r < numRows - 1; r++) {
        const row = document.createElement('tr');
        for (let c = 0; c < numCols; c++) {
            const td = document.createElement('td');
            td.style.border = '1px solid #ddd';
            td.style.padding = '8px';
            td.style.position = 'relative';
            td.onmousedown = function(e) { selectCell(this, e); };
            td.oncontextmenu = function(e) { showContextMenu(e, this); };

            const span = document.createElement('span');
            span.contentEditable = isDesignMode ? 'false' : 'true';
            span.textContent = `Cell ${r + 1}-${c + 1}`;
            td.appendChild(span);

            row.appendChild(td);
        }
        tbody.appendChild(row);
    }
    table.appendChild(tbody);

    // Insert table at cursor position or at the end of contenteditable area
    if (savedSelection) {
        savedSelection.deleteContents();
        savedSelection.insertNode(table);

        // Add line break after table for easier editing
        const br = document.createElement('br');
        table.parentNode.insertBefore(br, table.nextSibling);
    } else {
        // Find a contenteditable element and append to it
        const editableDiv = document.querySelector('[contenteditable="true"]');
        if (editableDiv) {
            editableDiv.appendChild(table);
            editableDiv.appendChild(document.createElement('br'));
        }
    }

    // Initialize resize handles for the new table
    setTimeout(() => {
        initializeResizeHandles();
    }, 10);

    hideTextFormatMenu();
}

// Handle double-click to enter edit mode
document.addEventListener('dblclick', function(e) {
    const cell = e.target.closest('td, th');
    if (cell && (cell.tagName === 'TD' || cell.tagName === 'TH')) {
        // Don't enter edit mode if clicking on handles or other controls
        if (e.target.closest('.resize-handle-col, .resize-handle-row, .resize-handle-corner, .row-drag-handle, .col-drag-handle')) {
            return;
        }

        currentCell = cell;
        enterEditMode();
    }
});

// Handle contenteditable focus events to detect edit mode
document.addEventListener('focusin', function(e) {
    const cell = e.target.closest('td, th');
    if (cell && (cell.tagName === 'TD' || cell.tagName === 'TH')) {
        // If cell gets focus and we're not in navigation mode, we might be in edit mode
        if (!isEditMode && currentCell === cell && window.getSelection().toString()) {
            isEditMode = true;
            cell.classList.add('editing-mode');
        }
    }
});

// Handle paste events to ensure content goes into the span
document.addEventListener('paste', function(e) {
    const cell = e.target.closest('td, th');
    if (!cell || (cell.tagName !== 'TD' && cell.tagName !== 'TH')) return;

    // If pasting into a cell (not already into a span), redirect to span
    if (e.target === cell) {
        e.preventDefault();
        const span = cell.querySelector('span');
        if (span) {
            span.focus();
            // Trigger paste again on the span
            const pasteEvent = new ClipboardEvent('paste', {
                clipboardData: e.clipboardData,
                bubbles: true,
                cancelable: true
            });
            span.dispatchEvent(pasteEvent);
        }
    }
});

// Keyboard navigation and edit mode
document.addEventListener('keydown', function(e) {
    // Handle formatting shortcuts (Ctrl/Cmd + B, I, U) regardless of table context
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

    // If in edit mode, only handle Escape
    if (isEditMode) {
        if (e.key === 'Escape') {
            exitEditMode();
            e.preventDefault();
        }
        return;
    }

    // Keyboard navigation
    switch(e.key) {
        case 'Escape':
            // Clear selection when not in edit mode
            clearSelection();
            e.preventDefault();
            break;
        case 'ArrowUp':
            if (e.shiftKey) {
                extendSelection('up');
            } else {
                navigateToCell('up');
            }
            e.preventDefault();
            break;
        case 'ArrowDown':
            if (e.shiftKey) {
                extendSelection('down');
            } else {
                navigateToCell('down');
            }
            e.preventDefault();
            break;
        case 'ArrowLeft':
            if (e.shiftKey) {
                extendSelection('left');
            } else {
                navigateToCell('left');
            }
            e.preventDefault();
            break;
        case 'ArrowRight':
            if (e.shiftKey) {
                extendSelection('right');
            } else {
                navigateToCell('right');
            }
            e.preventDefault();
            break;
        case 'Enter':
            enterEditMode();
            e.preventDefault();
            break;
    }
});

function selectCell(cell, event = null) {
    // Don't interfere if we're resizing
    if (isResizing) return;

    // If we're in edit mode and clicking on a different cell, exit edit mode first
    if (isEditMode && currentCell && currentCell !== cell) {
        exitEditMode();
    }

    // Check if this is a right-click (context menu) - preserve selection if cell is already selected
    if (event && event.button === 2) {
        if (selectedCells.includes(cell)) {
            // Cell is already selected, don't change selection
            return;
        }
    }

    // Handle mousedown events
    if (event && event.type === 'mousedown' && event.button === 0) {
        event.preventDefault();

        // Check if this is a Shift+click to select range
        if (event.shiftKey && anchorCell) {
            selectRange(anchorCell, cell);
            currentCell = cell;
            cell.tabIndex = 0;
            cell.focus();
            updateFormatControls(cell);
            return;
        }

        // Otherwise, start drag selection (for normal click without Shift)
        if (!event.ctrlKey && !event.metaKey) {
            startMouseSelection(cell);
            return;
        }
    }

    // Ignore click events that happen after drag selection - they would clear the selection
    if (event && event.type === 'click' && selectedCells.length > 1) {
        return;
    }

    // Handle Ctrl/Cmd+click for multi-select
    if (!event || (!event.ctrlKey && !event.metaKey)) {
        clearSelection();
    }

    cell.classList.add('cell-selected');
    if (!selectedCells.includes(cell)) {
        selectedCells.push(cell);
    }

    // Set as current cell for keyboard navigation
    currentCell = cell;
    anchorCell = cell; // Set anchor for range selection
    cell.tabIndex = 0; // Make it focusable
    cell.focus();

    updateFormatControls(cell);
}

function clearSelection() {
    selectedCells.forEach(cell => {
        cell.classList.remove('cell-selected');
        cell.removeAttribute('tabIndex'); // Remove tab focus
    });
    selectedCells = [];

    document.querySelectorAll('.row-selected').forEach(row => {
        row.classList.remove('row-selected');
    });

    document.querySelectorAll('.col-selected').forEach(cell => {
        cell.classList.remove('col-selected');
    });

    selectedRow = null;
    selectedColumn = null;
    currentCell = null;
    anchorCell = null;
}

// Mouse drag selection functions
function startMouseSelection(cell) {
    if (isResizing) return;

    isMouseSelecting = true;
    selectionStartCell = cell;

    clearSelection();

    // Set anchor AFTER clearing selection
    anchorCell = cell;

    cell.classList.add('cell-selected');
    selectedCells.push(cell);
    currentCell = cell;

    // Add event listeners for drag selection
    document.addEventListener('mouseover', handleMouseOverCell);
    document.addEventListener('mouseup', stopMouseSelection);

    updateFormatControls(cell);
}

function handleMouseOverCell(e) {
    if (!isMouseSelecting) return;

    const cell = e.target.closest('td, th');
    if (!cell || !selectionStartCell) return;

    // Check if the cell is in the same table
    if (cell.closest('table') !== selectionStartCell.closest('table')) return;

    // Select range from start to current cell
    selectRange(selectionStartCell, cell);
    currentCell = cell;
}

function stopMouseSelection() {
    if (!isMouseSelecting) return;

    isMouseSelecting = false;

    document.removeEventListener('mouseover', handleMouseOverCell);
    document.removeEventListener('mouseup', stopMouseSelection);

    // Set focus to the current cell for keyboard navigation
    if (currentCell) {
        currentCell.tabIndex = 0;
        currentCell.focus();
    }
}

// Navigation functions
function navigateToCell(direction) {
    if (!currentCell) return;

    // Get the table from the current cell instead of hardcoding mainTable
    const table = currentCell.closest('table');
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    const currentRow = currentCell.parentNode;
    const currentRowIndex = rows.indexOf(currentRow);
    const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell);

    let newCell = null;

    switch(direction) {
        case 'up':
            if (currentRowIndex > 0) {
                const targetRow = rows[currentRowIndex - 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'down':
            if (currentRowIndex < rows.length - 1) {
                const targetRow = rows[currentRowIndex + 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'left':
            if (currentCellIndex > 0) {
                newCell = currentRow.children[currentCellIndex - 1];
            }
            break;
        case 'right':
            if (currentCellIndex < currentRow.children.length - 1) {
                newCell = currentRow.children[currentCellIndex + 1];
            }
            break;
    }

    if (newCell) {
        selectCell(newCell);
    }
}

// Extended selection function for Shift+arrow keys
function extendSelection(direction) {
    if (!currentCell) return;

    // Get the table from the current cell instead of hardcoding mainTable
    const table = currentCell.closest('table');
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    const currentRow = currentCell.parentNode;
    const currentRowIndex = rows.indexOf(currentRow);
    const currentCellIndex = Array.from(currentRow.children).indexOf(currentCell);

    let newCell = null;

    switch(direction) {
        case 'up':
            if (currentRowIndex > 0) {
                const targetRow = rows[currentRowIndex - 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'down':
            if (currentRowIndex < rows.length - 1) {
                const targetRow = rows[currentRowIndex + 1];
                newCell = targetRow.children[Math.min(currentCellIndex, targetRow.children.length - 1)];
            }
            break;
        case 'left':
            if (currentCellIndex > 0) {
                newCell = currentRow.children[currentCellIndex - 1];
            }
            break;
        case 'right':
            if (currentCellIndex < currentRow.children.length - 1) {
                newCell = currentRow.children[currentCellIndex + 1];
            }
            break;
    }

    if (newCell) {
        // Update current cell
        currentCell = newCell;
        newCell.tabIndex = 0;
        newCell.focus();

        // Select range from anchor to new cell
        selectRange(anchorCell, newCell);
    }
}

// Select a range of cells from start to end
function selectRange(startCell, endCell) {
    if (!startCell || !endCell) return;

    // Get the table from the startCell instead of hardcoding mainTable
    const table = startCell.closest('table');
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));

    const startRow = startCell.parentNode;
    const endRow = endCell.parentNode;
    const startRowIndex = rows.indexOf(startRow);
    const endRowIndex = rows.indexOf(endRow);
    const startCellIndex = Array.from(startRow.children).indexOf(startCell);
    const endCellIndex = Array.from(endRow.children).indexOf(endCell);

    // Clear current selection
    clearSelection();

    // Determine the range bounds
    const minRow = Math.min(startRowIndex, endRowIndex);
    const maxRow = Math.max(startRowIndex, endRowIndex);
    const minCol = Math.min(startCellIndex, endCellIndex);
    const maxCol = Math.max(startCellIndex, endCellIndex);

    // Select all cells in the range
    for (let rowIndex = minRow; rowIndex <= maxRow; rowIndex++) {
        const row = rows[rowIndex];
        for (let colIndex = minCol; colIndex <= maxCol && colIndex < row.children.length; colIndex++) {
            const cell = row.children[colIndex];
            cell.classList.add('cell-selected');
            if (!selectedCells.includes(cell)) {
                selectedCells.push(cell);
            }
        }
    }

    // Restore anchor and current cell
    anchorCell = startCell;
    currentCell = endCell;
}

// Edit mode functions
function enterEditMode() {
    if (!currentCell || isEditMode) return;

    isEditMode = true;

    // Add a specific class to indicate edit mode
    currentCell.classList.add('editing-mode');

    // Find the span inside the cell
    const span = currentCell.querySelector('span');
    if (!span) return;

    // Make sure the span is editable (in case we're in DESIGN mode)
    span.contentEditable = 'true';
    span.focus();

    // Select all text in the span
    const range = document.createRange();
    range.selectNodeContents(span);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
}

function exitEditMode() {
    if (!isEditMode || !currentCell) return;

    isEditMode = false;

    // Remove edit mode class
    currentCell.classList.remove('editing-mode');

    // Find the span and restore its contentEditable state based on mode
    const span = currentCell.querySelector('span');
    if (span && isDesignMode) {
        span.contentEditable = 'false';
    }

    // Clear text selection and refocus cell for navigation
    window.getSelection().removeAllRanges();

    // Force blur and refocus to ensure we're back in navigation mode
    if (span) {
        span.blur();
    }
    currentCell.blur();
    setTimeout(() => {
        if (currentCell) {
            currentCell.focus();
        }
    }, 10);
}

function updateFormatControls(cell) {
    const computedStyle = window.getComputedStyle(cell);

    document.getElementById('contextAlignSelect').value = computedStyle.textAlign || 'left';
    document.getElementById('contextFontSizeInput').value = parseInt(computedStyle.fontSize) || 14;

    // Update background color picker
    const bgColor = computedStyle.backgroundColor;
    const bgColorHex = rgbToHex(bgColor);

    // Define color map for background
    const bgColorMap = {
        '#000000': 'Black',
        '#ffffff': 'White',
        '#4ac6e9': 'Light Blue',
        '#008aba': 'Blue',
        '#90639d': 'Light Purple',
        '#722a81': 'Purple',
        '#f26649': 'Orange',
        'yellow': 'Yellow',
        '#ffff00': 'Yellow' // Alternative hex for yellow
    };

    const bgLabel = bgColorMap[bgColorHex.toLowerCase()] || bgColorMap[bgColor] || 'None';
    const bgColorValue = bgColorMap[bgColorHex.toLowerCase()] || bgColorMap[bgColor] ? (bgColor === 'yellow' ? 'yellow' : bgColorHex) : '';

    currentBgColor = bgColorValue;
    document.getElementById('bgColorPreview').style.backgroundColor = bgColorValue || 'transparent';
    document.getElementById('bgColorLabel').textContent = bgLabel;

    // Update text color picker
    const textColor = computedStyle.color;
    const textColorHex = rgbToHex(textColor);

    // Define color map for text
    const textColorMap = {
        '#000000': 'Black',
        '#ffffff': 'White',
        '#4ac6e9': 'Light Blue',
        '#008aba': 'Blue',
        '#90639d': 'Light Purple',
        '#722a81': 'Purple',
        '#f26649': 'Orange',
        'yellow': 'Yellow',
        '#ffff00': 'Yellow' // Alternative hex for yellow
    };

    const textLabel = textColorMap[textColorHex.toLowerCase()] || textColorMap[textColor] || 'Black';
    const textColorValue = textColorMap[textColorHex.toLowerCase()] || textColorMap[textColor] ? (textColor === 'yellow' ? 'yellow' : textColorHex) : '#000000';

    currentTextColor = textColorValue;
    document.getElementById('textColorPreview').style.backgroundColor = textColorValue;
    document.getElementById('textColorLabel').textContent = textLabel;

    // Update format buttons state
    updateFormatButtons();
}

function rgbToHex(rgb) {
    if (rgb.startsWith('#')) return rgb;

    const result = rgb.match(/\d+/g);
    if (!result || result.length < 3) return '#000000';

    return '#' + result.slice(0, 3).map(x => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

function addRow() {
    // Get table from the first selected cell, or fallback to mainTable
    const table = (selectedCells.length > 0 && selectedCells[0].closest('table')) || document.getElementById('mainTable');
    if (!table) return;

    const tbody = table.querySelector('tbody');
    const cellsNeeded = getCellsNeededForRow(table, null);

    const newRow = document.createElement('tr');

    for (let i = 0; i < cellsNeeded; i++) {
        const cell = document.createElement('td');
        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = `New Cell ${++newCellCounter}`;
        cell.appendChild(span);
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        newRow.appendChild(cell);
    }

    tbody.appendChild(newRow);
}

function addColumn() {
    // Get table from the first selected cell, or fallback to mainTable
    const table = (selectedCells.length > 0 && selectedCells[0].closest('table')) || document.getElementById('mainTable');
    if (!table) return;

    const rows = table.querySelectorAll('tr');

    rows.forEach((row, rowIndex) => {
        const cell = document.createElement(rowIndex === 0 ? 'th' : 'td');
        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = rowIndex === 0 ? `Header ${row.children.length + 1}` : `Cell ${rowIndex},${row.children.length + 1}`;
        cell.appendChild(span);
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        row.appendChild(cell);
    });
}

function removeRow() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in the row you want to remove');
        return;
    }

    const row = selectedCells[0].parentNode;
    const tbody = row.parentNode;

    if (tbody.children.length <= 1) {
        alert('Cannot remove the last row');
        return;
    }

    row.remove();
    clearSelection();
}

function removeColumn() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in the column you want to remove');
        return;
    }

    const cellIndex = Array.from(selectedCells[0].parentNode.children).indexOf(selectedCells[0]);
    const table = selectedCells[0].closest('table');
    if (!table) return;

    const rows = table.querySelectorAll('tr');

    if (rows[0].children.length <= 1) {
        alert('Cannot remove the last column');
        return;
    }

    rows.forEach(row => {
        if (row.children[cellIndex]) {
            row.children[cellIndex].remove();
        }
    });

    clearSelection();
}

function getTableColumnCount(table) {
    // Calculate total column count by finding the maximum across all rows
    const headerRow = table.querySelector('thead tr') || table.querySelector('tr');
    if (!headerRow) return 0;

    let maxColumns = 0;
    Array.from(headerRow.children).forEach(cell => {
        maxColumns += cell.colSpan || 1;
    });
    return maxColumns;
}

function getCellsNeededForRow(table, insertBeforeRow) {
    // Calculate how many cell elements are needed for a new row
    // considering rowspans from rows above
    const totalColumns = getTableColumnCount(table);
    const allRows = Array.from(table.querySelectorAll('tr'));
    const insertIndex = insertBeforeRow ? allRows.indexOf(insertBeforeRow) : allRows.length;

    // Track which column positions are occupied by rowspan cells from above
    const occupiedColumns = new Set();

    for (let rowIdx = 0; rowIdx < insertIndex; rowIdx++) {
        const row = allRows[rowIdx];
        let colPosition = 0;

        Array.from(row.children).forEach(cell => {
            // Skip positions occupied by previous rowspans
            while (occupiedColumns.has(`${rowIdx}-${colPosition}`)) {
                colPosition++;
            }

            const colspan = cell.colSpan || 1;
            const rowspan = cell.rowSpan || 1;

            // Mark positions as occupied if rowspan extends to our new row
            if (rowspan > 1 && rowIdx + rowspan > insertIndex) {
                for (let r = rowIdx + 1; r < rowIdx + rowspan; r++) {
                    for (let c = 0; c < colspan; c++) {
                        occupiedColumns.add(`${r}-${colPosition + c}`);
                    }
                }
            }

            colPosition += colspan;
        });
    }

    // Count how many columns at our insert position are occupied
    let occupiedCount = 0;
    for (let c = 0; c < totalColumns; c++) {
        if (occupiedColumns.has(`${insertIndex}-${c}`)) {
            occupiedCount++;
        }
    }

    return totalColumns - occupiedCount;
}

function addRowAbove() {
    if (!contextMenuTarget) return;

    const currentRow = contextMenuTarget.parentNode;
    const table = contextMenuTarget.closest('table');
    const allRows = Array.from(table.querySelectorAll('tr'));
    const insertIndex = allRows.indexOf(currentRow);

    // First, increase rowspan for any cells from above that span through this position
    for (let rowIdx = 0; rowIdx < insertIndex; rowIdx++) {
        const row = allRows[rowIdx];
        Array.from(row.children).forEach(cell => {
            const rowspan = cell.rowSpan || 1;
            // If this cell spans down to or past our insert position, increase its rowspan
            if (rowIdx + rowspan > insertIndex) {
                cell.rowSpan = rowspan + 1;
            }
        });
    }

    const cellsNeeded = getCellsNeededForRow(table, currentRow);
    const newRow = document.createElement('tr');

    for (let i = 0; i < cellsNeeded; i++) {
        const cell = document.createElement('td');
        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = `New Cell ${++newCellCounter}`;
        cell.appendChild(span);
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        newRow.appendChild(cell);
    }

    currentRow.parentNode.insertBefore(newRow, currentRow);
    addRowDragHandle(newRow);
    hideContextMenu();
}

function addRowBelow() {
    if (!contextMenuTarget) return;

    const currentRow = contextMenuTarget.parentNode;
    const table = contextMenuTarget.closest('table');
    const allRows = Array.from(table.querySelectorAll('tr'));
    const currentIndex = allRows.indexOf(currentRow);

    // Find the actual last row that the clicked cell spans to
    const clickedCellRowSpan = contextMenuTarget.rowSpan || 1;
    const lastSpannedRowIndex = currentIndex + clickedCellRowSpan - 1;
    const lastSpannedRow = allRows[lastSpannedRowIndex];
    const insertIndex = lastSpannedRowIndex + 1;

    // First, increase rowspan for any cells from above (up to and including last spanned row) that span through this position
    for (let rowIdx = 0; rowIdx <= lastSpannedRowIndex; rowIdx++) {
        const row = allRows[rowIdx];
        Array.from(row.children).forEach(cell => {
            const rowspan = cell.rowSpan || 1;
            // If this cell spans down to or past our insert position, increase its rowspan
            if (rowIdx + rowspan > insertIndex) {
                cell.rowSpan = rowspan + 1;
            }
        });
    }

    const nextRow = lastSpannedRow ? lastSpannedRow.nextSibling : null;
    const cellsNeeded = getCellsNeededForRow(table, nextRow);
    const newRow = document.createElement('tr');

    for (let i = 0; i < cellsNeeded; i++) {
        const cell = document.createElement('td');
        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = `New Cell ${++newCellCounter}`;
        cell.appendChild(span);
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(cell);
        newRow.appendChild(cell);
    }

    if (lastSpannedRow) {
        lastSpannedRow.parentNode.insertBefore(newRow, lastSpannedRow.nextSibling);
    } else {
        currentRow.parentNode.appendChild(newRow);
    }
    addRowDragHandle(newRow);
    hideContextMenu();
}

function getColumnPosition(cell) {
    // Calculate the visual column position of a cell considering colspans
    const row = cell.parentNode;
    let colPosition = 0;

    for (let i = 0; i < row.children.length; i++) {
        if (row.children[i] === cell) {
            break;
        }
        colPosition += row.children[i].colSpan || 1;
    }

    return colPosition;
}

function addColumnLeft() {
    if (!contextMenuTarget) return;

    const table = contextMenuTarget.closest('table');
    const allRows = Array.from(table.querySelectorAll('tr'));

    // Get the visual column position where we want to insert
    const insertColPosition = getColumnPosition(contextMenuTarget);

    // Build a grid to track which cells occupy which positions (accounting for rowspan and colspan)
    const totalColumns = getTableColumnCount(table);
    const grid = [];

    allRows.forEach((row, rowIdx) => {
        if (!grid[rowIdx]) grid[rowIdx] = [];
        let colPos = 0;

        Array.from(row.children).forEach(cell => {
            // Skip positions already occupied by rowspan from above
            while (grid[rowIdx][colPos] !== undefined) {
                colPos++;
            }

            const colspan = cell.colSpan || 1;
            const rowspan = cell.rowSpan || 1;

            // Mark this cell in the grid
            for (let r = 0; r < rowspan; r++) {
                for (let c = 0; c < colspan; c++) {
                    if (!grid[rowIdx + r]) grid[rowIdx + r] = [];
                    grid[rowIdx + r][colPos + c] = cell;
                }
            }

            colPos += colspan;
        });
    });

    // First, increase colspan for cells that span across the insert position
    const processedCells = new Set();
    allRows.forEach((row, rowIdx) => {
        for (let colPos = 0; colPos < totalColumns; colPos++) {
            const cell = grid[rowIdx][colPos];
            if (cell && !processedCells.has(cell)) {
                processedCells.add(cell);
                const cellStartCol = getColumnPosition(cell);
                const cellColspan = cell.colSpan || 1;
                const cellEndCol = cellStartCol + cellColspan;

                // If this cell spans across our insert position, increase its colspan
                if (cellStartCol < insertColPosition && cellEndCol > insertColPosition) {
                    cell.colSpan = cellColspan + 1;
                }
            }
        }
    });

    // Now add new cells in rows where the insert position is not occupied
    allRows.forEach((row, rowIdx) => {
        // Check if this position is occupied in this row by a cell that starts BEFORE this position
        const occupyingCell = grid[rowIdx][insertColPosition];

        // Only skip if the cell occupying this position started before the insert position
        // (meaning it's a colspan/rowspan that extends into this position)
        if (occupyingCell) {
            // Find where this cell starts in the grid
            let occupyingCellStart = -1;
            for (let col = 0; col <= insertColPosition; col++) {
                if (grid[rowIdx][col] === occupyingCell) {
                    occupyingCellStart = col;
                    break;
                }
            }

            if (occupyingCellStart < insertColPosition) {
                // This position is occupied by a cell from before - skip this row
                return;
            }
        }

        // Find the correct insertion point
        let colPos = 0;
        let insertBeforeCell = null;

        for (let i = 0; i < row.children.length; i++) {
            const cell = row.children[i];

            // Skip positions occupied by rowspan from above
            while (grid[rowIdx][colPos] && grid[rowIdx][colPos] !== cell) {
                colPos++;
            }

            if (colPos >= insertColPosition) {
                insertBeforeCell = cell;
                break;
            }

            colPos += cell.colSpan || 1;
        }

        const newCell = document.createElement(rowIdx === 0 ? 'th' : 'td');
        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = rowIdx === 0 ? `New Header ${++newCellCounter}` : `New Cell ${++newCellCounter}`;
        newCell.appendChild(span);
        newCell.onmousedown = function(e) { selectCell(this, e); };
        newCell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(newCell);

        if (insertBeforeCell) {
            row.insertBefore(newCell, insertBeforeCell);
        } else {
            row.appendChild(newCell);
        }
    });

    hideContextMenu();
}

function addColumnRight() {
    if (!contextMenuTarget) return;

    const table = contextMenuTarget.closest('table');
    const allRows = Array.from(table.querySelectorAll('tr'));

    // Get the visual column position - insert after the last column this cell spans
    const clickedCellColSpan = contextMenuTarget.colSpan || 1;
    const startColPosition = getColumnPosition(contextMenuTarget);
    const insertColPosition = startColPosition + clickedCellColSpan;

    // Build a grid to track which cells occupy which positions (accounting for rowspan and colspan)
    const totalColumns = getTableColumnCount(table);
    const grid = [];

    allRows.forEach((row, rowIdx) => {
        if (!grid[rowIdx]) grid[rowIdx] = [];
        let colPos = 0;

        Array.from(row.children).forEach(cell => {
            // Skip positions already occupied by rowspan from above
            while (grid[rowIdx][colPos] !== undefined) {
                colPos++;
            }

            const colspan = cell.colSpan || 1;
            const rowspan = cell.rowSpan || 1;

            // Mark this cell in the grid
            for (let r = 0; r < rowspan; r++) {
                for (let c = 0; c < colspan; c++) {
                    if (!grid[rowIdx + r]) grid[rowIdx + r] = [];
                    grid[rowIdx + r][colPos + c] = cell;
                }
            }

            colPos += colspan;
        });
    });

    // First, increase colspan for cells that span across the insert position
    const processedCells = new Set();
    allRows.forEach((row, rowIdx) => {
        for (let colPos = 0; colPos < totalColumns; colPos++) {
            const cell = grid[rowIdx][colPos];
            if (cell && !processedCells.has(cell)) {
                processedCells.add(cell);
                const cellStartCol = getColumnPosition(cell);
                const cellColspan = cell.colSpan || 1;
                const cellEndCol = cellStartCol + cellColspan;

                // If this cell spans across our insert position, increase its colspan
                if (cellStartCol < insertColPosition && cellEndCol > insertColPosition) {
                    cell.colSpan = cellColspan + 1;
                }
            }
        }
    });

    // Now add new cells in rows where the insert position is not occupied
    allRows.forEach((row, rowIdx) => {
        // Check if this position is occupied in this row by a cell that starts BEFORE this position
        const occupyingCell = grid[rowIdx][insertColPosition];

        // Only skip if the cell occupying this position started before the insert position
        // (meaning it's a colspan/rowspan that extends into this position)
        if (occupyingCell) {
            // Find where this cell starts in the grid
            let occupyingCellStart = -1;
            for (let col = 0; col <= insertColPosition; col++) {
                if (grid[rowIdx][col] === occupyingCell) {
                    occupyingCellStart = col;
                    break;
                }
            }

            if (occupyingCellStart < insertColPosition) {
                // This position is occupied by a cell from before - skip this row
                return;
            }
        }

        // Find the correct insertion point
        let colPos = 0;
        let insertBeforeCell = null;

        for (let i = 0; i < row.children.length; i++) {
            const cell = row.children[i];

            // Skip positions occupied by rowspan from above
            while (grid[rowIdx][colPos] && grid[rowIdx][colPos] !== cell) {
                colPos++;
            }

            if (colPos >= insertColPosition) {
                insertBeforeCell = cell;
                break;
            }

            colPos += cell.colSpan || 1;
        }

        const newCell = document.createElement(rowIdx === 0 ? 'th' : 'td');
        const span = document.createElement('span');
        span.contentEditable = isDesignMode ? 'false' : 'true';
        span.textContent = rowIdx === 0 ? `New Header ${++newCellCounter}` : `New Cell ${++newCellCounter}`;
        newCell.appendChild(span);
        newCell.onmousedown = function(e) { selectCell(this, e); };
        newCell.oncontextmenu = function(e) { showContextMenu(e, this); };
        addResizeHandles(newCell);

        if (insertBeforeCell) {
            row.insertBefore(newCell, insertBeforeCell);
        } else {
            row.appendChild(newCell);
        }
    });

    hideContextMenu();
}

function deleteSelectedRow() {
    if (!contextMenuTarget) return;

    const row = contextMenuTarget.parentNode;
    const tbody = row.parentNode;

    if (tbody.children.length <= 1) {
        alert('Cannot remove the last row');
        return;
    }

    row.remove();
    hideContextMenu();
}

function moveRowUp() {
    if (!contextMenuTarget) return;

    const row = contextMenuTarget.parentNode;
    const previousRow = row.previousElementSibling;

    if (!previousRow) {
        alert('This is already the first row');
        return;
    }

    row.parentNode.insertBefore(row, previousRow);
    hideContextMenu();
}

function moveRowDown() {
    if (!contextMenuTarget) return;

    const row = contextMenuTarget.parentNode;
    const nextRow = row.nextElementSibling;

    if (!nextRow) {
        alert('This is already the last row');
        return;
    }

    row.parentNode.insertBefore(nextRow, row);
    hideContextMenu();
}

function sortColumnAZ() {
    if (!contextMenuTarget) return;
    sortColumn(true);
}

function sortColumnZA() {
    if (!contextMenuTarget) return;
    sortColumn(false);
}

function sortColumn(ascending) {
    const cell = contextMenuTarget;
    const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
    const table = cell.closest('table');
    const tbody = table.querySelector('tbody');
    const rows = Array.from(tbody.querySelectorAll('tr'));

    // Sort rows based on the column content
    rows.sort((rowA, rowB) => {
        const cellA = rowA.children[cellIndex];
        const cellB = rowB.children[cellIndex];

        if (!cellA || !cellB) return 0;

        const textA = cellA.textContent.trim();
        const textB = cellB.textContent.trim();

        // Check if values are numbers
        const numA = parseFloat(textA);
        const numB = parseFloat(textB);
        const isNumA = !isNaN(numA) && textA !== '';
        const isNumB = !isNaN(numB) && textB !== '';

        // Numbers come before letters
        if (isNumA && !isNumB) return ascending ? -1 : 1;
        if (!isNumA && isNumB) return ascending ? 1 : -1;

        // Both numbers - compare numerically
        if (isNumA && isNumB) {
            return ascending ? numA - numB : numB - numA;
        }

        // Both text - compare alphabetically (case insensitive)
        const compareResult = textA.toLowerCase().localeCompare(textB.toLowerCase());
        return ascending ? compareResult : -compareResult;
    });

    // Re-append rows in sorted order
    rows.forEach(row => tbody.appendChild(row));

    // Re-add drag handles
    rows.forEach(row => addRowDragHandle(row));

    hideContextMenu();
}

function deleteSelectedColumn() {
    if (!contextMenuTarget) return;

    const cellIndex = Array.from(contextMenuTarget.parentNode.children).indexOf(contextMenuTarget);
    const table = contextMenuTarget.closest('table');
    if (!table) return;

    const rows = table.querySelectorAll('tr');

    if (rows[0].children.length <= 1) {
        alert('Cannot remove the last column');
        return;
    }

    rows.forEach(row => {
        if (row.children[cellIndex]) {
            row.children[cellIndex].remove();
        }
    });

    hideContextMenu();
}

function mergeSelectedCells() {
    if (selectedCells.length < 2) {
        alert('Please select at least 2 cells to merge');
        return;
    }

    // Check if cells are adjacent (horizontally or vertically)
    if (!areSelectedCellsAdjacent()) {
        alert('Please select adjacent cells to merge (horizontally or vertically)');
        return;
    }

    const firstCell = selectedCells[0];
    let content = selectedCells.map(cell => cell.textContent.trim()).filter(text => text).join(' ');

    // Get cell positions
    const cellPositions = selectedCells.map(cell => {
        const row = cell.parentNode;
        const table = row.parentNode.parentNode;
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        const colIndex = Array.from(row.children).indexOf(cell);
        return { cell, rowIndex, colIndex };
    });

    // Find bounds
    let minRow = Math.min(...cellPositions.map(p => p.rowIndex));
    let maxRow = Math.max(...cellPositions.map(p => p.rowIndex));
    let minCol = Math.min(...cellPositions.map(p => p.colIndex));
    let maxCol = Math.max(...cellPositions.map(p => p.colIndex));

    const rowSpan = maxRow - minRow + 1;
    const colSpan = maxCol - minCol + 1;

    // Remove all cells except the first one
    selectedCells.forEach(cell => {
        if (cell !== firstCell) {
            cell.remove();
        }
    });

    // Set span attributes on the first cell
    if (rowSpan > 1) firstCell.rowSpan = rowSpan;
    if (colSpan > 1) firstCell.colSpan = colSpan;

    // Update the span content instead of the cell directly
    const span = firstCell.querySelector('span');
    if (span) {
        span.textContent = content;
    } else {
        // If no span exists, create one
        const newSpan = document.createElement('span');
        newSpan.contentEditable = isDesignMode ? 'false' : 'true';
        newSpan.textContent = content;
        firstCell.textContent = ''; // Clear cell
        firstCell.appendChild(newSpan);
    }

    // Re-add resize handles to the merged cell
    addResizeHandles(firstCell);

    clearSelection();
    hideContextMenu();
}

function areSelectedCellsAdjacent() {
    if (selectedCells.length < 2) return false;

    // Get positions of all selected cells
    const positions = selectedCells.map(cell => {
        const row = cell.parentNode;
        const table = row.parentNode.parentNode;
        const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);
        const colIndex = Array.from(row.children).indexOf(cell);
        return { rowIndex, colIndex };
    });

    // Check if cells form a continuous horizontal line
    const isHorizontalLine = () => {
        const row = positions[0].rowIndex;
        if (!positions.every(pos => pos.rowIndex === row)) return false;

        const cols = positions.map(pos => pos.colIndex).sort((a, b) => a - b);
        for (let i = 1; i < cols.length; i++) {
            if (cols[i] - cols[i-1] !== 1) return false;
        }
        return true;
    };

    // Check if cells form a continuous vertical line
    const isVerticalLine = () => {
        const col = positions[0].colIndex;
        if (!positions.every(pos => pos.colIndex === col)) return false;

        const rows = positions.map(pos => pos.rowIndex).sort((a, b) => a - b);
        for (let i = 1; i < rows.length; i++) {
            if (rows[i] - rows[i-1] !== 1) return false;
        }
        return true;
    };

    // Check if cells form a rectangular block
    const isRectangularBlock = () => {
        const minRow = Math.min(...positions.map(p => p.rowIndex));
        const maxRow = Math.max(...positions.map(p => p.rowIndex));
        const minCol = Math.min(...positions.map(p => p.colIndex));
        const maxCol = Math.max(...positions.map(p => p.colIndex));

        const expectedCells = (maxRow - minRow + 1) * (maxCol - minCol + 1);
        if (selectedCells.length !== expectedCells) return false;

        // Check that all positions in the rectangle are selected
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                if (!positions.some(pos => pos.rowIndex === row && pos.colIndex === col)) {
                    return false;
                }
            }
        }
        return true;
    };

    return isHorizontalLine() || isVerticalLine() || isRectangularBlock();
}

function splitSelectedCell() {
    if (selectedCells.length !== 1) {
        alert('Please select exactly one cell to split');
        return;
    }

    const cell = selectedCells[0];
    const rowSpan = parseInt(cell.rowSpan) || 1;
    const colSpan = parseInt(cell.colSpan) || 1;

    if (rowSpan === 1 && colSpan === 1) {
        alert('This cell cannot be split further');
        return;
    }

    const row = cell.parentNode;
    const table = row.parentNode.parentNode;
    const cellIndex = Array.from(row.children).indexOf(cell);
    const rowIndex = Array.from(table.querySelectorAll('tr')).indexOf(row);

    cell.rowSpan = 1;
    cell.colSpan = 1;

    for (let r = 0; r < rowSpan; r++) {
        for (let c = 0; c < colSpan; c++) {
            if (r === 0 && c === 0) continue;

            const targetRow = table.querySelectorAll('tr')[rowIndex + r];
            const newCell = document.createElement(targetRow.parentNode.tagName === 'THEAD' ? 'th' : 'td');
            const span = document.createElement('span');
            span.contentEditable = isDesignMode ? 'false' : 'true';
            span.textContent = '';
            newCell.appendChild(span);
            newCell.onmousedown = function(e) { selectCell(this, e); };
            newCell.oncontextmenu = function(e) { showContextMenu(e, this); };
            addResizeHandles(newCell);

            const insertIndex = cellIndex + c;
            if (targetRow.children[insertIndex]) {
                targetRow.insertBefore(newCell, targetRow.children[insertIndex]);
            } else {
                targetRow.appendChild(newCell);
            }
        }
    }

    clearSelection();
    hideContextMenu();
}

function applyAlignmentFromContext() {
    const alignment = document.getElementById('contextAlignSelect').value;
    selectedCells.forEach(cell => {
        cell.style.textAlign = alignment;
    });
}

function applyFontSizeFromContext() {
    const fontSize = document.getElementById('contextFontSizeInput').value;
    selectedCells.forEach(cell => {
        cell.style.fontSize = fontSize + 'px';
    });
}

function toggleBold() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allBold = selectedCells.every(cell => {
            const weight = window.getComputedStyle(cell).fontWeight;
            return weight === 'bold' || weight === '700';
        });

        selectedCells.forEach(cell => {
            cell.style.fontWeight = allBold ? 'normal' : 'bold';
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyStyleToSelection('fontWeight', 'bold', 'normal');
    }
}

function toggleItalic() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allItalic = selectedCells.every(cell => {
            return window.getComputedStyle(cell).fontStyle === 'italic';
        });

        selectedCells.forEach(cell => {
            cell.style.fontStyle = allItalic ? 'normal' : 'italic';
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyStyleToSelection('fontStyle', 'italic', 'normal');
    }
}

function toggleUnderline() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allUnderlined = selectedCells.every(cell => {
            return window.getComputedStyle(cell).textDecoration.includes('underline');
        });

        selectedCells.forEach(cell => {
            const currentDecoration = window.getComputedStyle(cell).textDecoration;
            const hasStrike = currentDecoration.includes('line-through');

            if (allUnderlined) {
                cell.style.textDecoration = hasStrike ? 'line-through' : 'none';
            } else {
                cell.style.textDecoration = hasStrike ? 'underline line-through' : 'underline';
            }
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyTextDecorationToSelection('underline');
    }
}

function toggleStrikethrough() {
    // If we have selected cells, apply to cells
    if (selectedCells.length > 0) {
        const allStrikethrough = selectedCells.every(cell => {
            return window.getComputedStyle(cell).textDecoration.includes('line-through');
        });

        selectedCells.forEach(cell => {
            const currentDecoration = window.getComputedStyle(cell).textDecoration;
            const hasUnderline = currentDecoration.includes('underline');

            if (allStrikethrough) {
                cell.style.textDecoration = hasUnderline ? 'underline' : 'none';
            } else {
                cell.style.textDecoration = hasUnderline ? 'underline line-through' : 'line-through';
            }
        });
        updateFormatButtons();
    } else if (savedSelection) {
        applyTextDecorationToSelection('line-through');
    }
}

// Helper function to apply simple style properties to selection
function applyStyleToSelection(property, activeValue, inactiveValue) {
    if (!savedSelection) return;

    const container = savedSelection.commonAncestorContainer;
    let targetSpan = null;

    if (container.nodeType === 3 && container.parentElement.tagName === 'SPAN') {
        const span = container.parentElement;
        const spanRange = document.createRange();
        spanRange.selectNodeContents(span);
        if (spanRange.toString() === savedSelection.toString()) {
            targetSpan = span;
        }
    } else if (container.nodeType === 1 && container.tagName === 'SPAN') {
        targetSpan = container;
    }

    if (targetSpan) {
        // Toggle on existing span
        const currentValue = targetSpan.style[property];
        targetSpan.style[property] = (currentValue === activeValue) ? inactiveValue : activeValue;
    } else {
        // Create new span
        const span = document.createElement('span');
        span.style[property] = activeValue;

        try {
            savedSelection.surroundContents(span);
        } catch (e) {
            const fragment = savedSelection.extractContents();
            span.appendChild(fragment);
            savedSelection.insertNode(span);
        }

        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        savedSelection = newRange;

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
}

// Helper function to apply text decoration (handles underline + strikethrough combinations)
function applyTextDecorationToSelection(decoration) {
    if (!savedSelection) return;

    const container = savedSelection.commonAncestorContainer;
    let targetSpan = null;

    if (container.nodeType === 3 && container.parentElement.tagName === 'SPAN') {
        const span = container.parentElement;
        const spanRange = document.createRange();
        spanRange.selectNodeContents(span);
        if (spanRange.toString() === savedSelection.toString()) {
            targetSpan = span;
        }
    } else if (container.nodeType === 1 && container.tagName === 'SPAN') {
        targetSpan = container;
    }

    if (targetSpan) {
        // Toggle on existing span
        const currentDecoration = targetSpan.style.textDecoration || '';
        const hasUnderline = currentDecoration.includes('underline');
        const hasStrike = currentDecoration.includes('line-through');

        if (decoration === 'underline') {
            if (hasUnderline) {
                targetSpan.style.textDecoration = hasStrike ? 'line-through' : 'none';
            } else {
                targetSpan.style.textDecoration = hasStrike ? 'underline line-through' : 'underline';
            }
        } else if (decoration === 'line-through') {
            if (hasStrike) {
                targetSpan.style.textDecoration = hasUnderline ? 'underline' : 'none';
            } else {
                targetSpan.style.textDecoration = hasUnderline ? 'underline line-through' : 'line-through';
            }
        }
    } else {
        // Create new span
        const span = document.createElement('span');
        span.style.textDecoration = decoration;

        try {
            savedSelection.surroundContents(span);
        } catch (e) {
            const fragment = savedSelection.extractContents();
            span.appendChild(fragment);
            savedSelection.insertNode(span);
        }

        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        savedSelection = newRange;

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(newRange);
    }
}

function updateFormatButtons() {
    if (selectedCells.length === 0) return;

    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const strikeBtn = document.getElementById('strikeBtn');

    // Check if all cells have each format
    const allBold = selectedCells.every(cell => {
        const weight = window.getComputedStyle(cell).fontWeight;
        return weight === 'bold' || weight === '700';
    });

    const allItalic = selectedCells.every(cell => {
        return window.getComputedStyle(cell).fontStyle === 'italic';
    });

    const allUnderlined = selectedCells.every(cell => {
        return window.getComputedStyle(cell).textDecoration.includes('underline');
    });

    const allStrikethrough = selectedCells.every(cell => {
        return window.getComputedStyle(cell).textDecoration.includes('line-through');
    });

    // Update button states - only show active if ALL cells have the format
    if (boldBtn) boldBtn.style.backgroundColor = allBold ? '#007bff' : '';
    if (italicBtn) italicBtn.style.backgroundColor = allItalic ? '#007bff' : '';
    if (underlineBtn) underlineBtn.style.backgroundColor = allUnderlined ? '#007bff' : '';
    if (strikeBtn) strikeBtn.style.backgroundColor = allStrikethrough ? '#007bff' : '';
}

// Custom color picker functions
let currentBgColor = '';
let currentTextColor = '#000000';

function toggleBgColorDropdown() {
    const dropdown = document.getElementById('bgColorDropdown');
    const textDropdown = document.getElementById('textColorDropdown');
    textDropdown.classList.remove('show');
    dropdown.classList.toggle('show');
}

function toggleTextColorDropdown() {
    const dropdown = document.getElementById('textColorDropdown');
    const bgDropdown = document.getElementById('bgColorDropdown');
    bgDropdown.classList.remove('show');
    dropdown.classList.toggle('show');
}

function selectBgColor(color, label) {
    currentBgColor = color;
    document.getElementById('bgColorPreview').style.backgroundColor = color || 'transparent';
    document.getElementById('bgColorLabel').textContent = label;
    document.getElementById('bgColorDropdown').classList.remove('show');
    applyBackgroundColorFromContext();
}

function selectTextColor(color, label) {
    currentTextColor = color;
    document.getElementById('textColorPreview').style.backgroundColor = color;
    document.getElementById('textColorLabel').textContent = label;
    document.getElementById('textColorDropdown').classList.remove('show');
    applyTextColorFromContext();
}

function applyBackgroundColorFromContext() {
    selectedCells.forEach(cell => {
        cell.style.backgroundColor = currentBgColor;
    });
}

function applyTextColorFromContext() {
    selectedCells.forEach(cell => {
        cell.style.color = currentTextColor;
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.color-picker-container') && !e.target.closest('.context-menu')) {
        document.getElementById('bgColorDropdown').classList.remove('show');
        document.getElementById('textColorDropdown').classList.remove('show');
    }
});

function resetFormatFromContext() {
    selectedCells.forEach(cell => {
        cell.style.textAlign = '';
        cell.style.fontSize = '';
        cell.style.backgroundColor = '';
        cell.style.color = '';
        cell.style.fontWeight = '';
        cell.style.fontStyle = '';
        cell.style.textDecoration = '';
    });

    document.getElementById('contextAlignSelect').value = 'left';
    document.getElementById('contextFontSizeInput').value = 14;

    // Reset background color picker
    const bgColorPreview = document.getElementById('bgColorPreview');
    const bgColorLabel = document.getElementById('bgColorLabel');
    if (bgColorPreview) bgColorPreview.style.backgroundColor = '#ffffff';
    if (bgColorLabel) bgColorLabel.textContent = 'None';

    // Reset text color picker
    const textColorPreview = document.getElementById('textColorPreview');
    const textColorLabel = document.getElementById('textColorLabel');
    if (textColorPreview) textColorPreview.style.backgroundColor = '#000000';
    if (textColorLabel) textColorLabel.textContent = 'Black';

    // Reset format buttons
    updateFormatButtons();
}

async function pasteAsPlainText() {
    if (!currentCell) {
        alert('Please select a cell first');
        return;
    }

    try {
        // Try to read HTML from clipboard first, fallback to plain text
        const clipboardItems = await navigator.clipboard.read();
        let text = '';

        for (const item of clipboardItems) {
            if (item.types.includes('text/html')) {
                const blob = await item.getType('text/html');
                const html = await blob.text();
                // Strip HTML tags
                const temp = document.createElement('div');
                temp.innerHTML = html;
                text = temp.textContent || temp.innerText || '';
                break;
            } else if (item.types.includes('text/plain')) {
                const blob = await item.getType('text/plain');
                text = await blob.text();
                break;
            }
        }

        // Strip any remaining tags (HTML, XML, etc.) using regex
        text = text.replace(/<[^>]*>/g, '');

        const span = currentCell.querySelector('span');
        if (span) {
            span.textContent = text;
        } else {
            currentCell.textContent = text;
        }
    } catch (err) {
        // Fallback to simple readText if clipboard.read() fails
        try {
            let text = await navigator.clipboard.readText();
            // Strip any tags
            text = text.replace(/<[^>]*>/g, '');
            const span = currentCell.querySelector('span');
            if (span) {
                span.textContent = text;
            } else {
                currentCell.textContent = text;
            }
        } catch (fallbackErr) {
            alert('Failed to read clipboard. Please make sure you have granted clipboard permissions.');
        }
    }
}

function splitTable() {
    if (selectedCells.length === 0) {
        alert('Please select a cell in the row where you want to split the table');
        return;
    }

    const selectedRow = selectedCells[0].parentNode;
    const table = selectedCells[0].closest('table');
    if (!table) return;
    const allRows = Array.from(table.querySelectorAll('tr'));
    const selectedRowIndex = allRows.indexOf(selectedRow);

    if (selectedRowIndex <= 0) {
        alert('Cannot split at header row');
        return;
    }

    const headerRow = table.querySelector('thead tr');
    const rowsToMove = allRows.slice(selectedRowIndex);

    const newTable = document.createElement('table');
    newTable.style.marginTop = '20px';

    const newThead = document.createElement('thead');
    const newHeaderRow = headerRow.cloneNode(true);
    Array.from(newHeaderRow.children).forEach(cell => {
        cell.onmousedown = function(e) { selectCell(this, e); };
        cell.oncontextmenu = function(e) { showContextMenu(e, this); };
    });
    newThead.appendChild(newHeaderRow);
    newTable.appendChild(newThead);

    const newTbody = document.createElement('tbody');
    rowsToMove.forEach(row => {
        Array.from(row.children).forEach(cell => {
            cell.onmousedown = function(e) { selectCell(this, e); };
            cell.oncontextmenu = function(e) { showContextMenu(e, this); };
        });
        newTbody.appendChild(row);
    });
    newTable.appendChild(newTbody);

    const tableContainer = document.querySelector('.table-container');
    const newContainer = document.createElement('div');
    newContainer.className = 'table-container';
    newContainer.style.marginTop = '20px';

    newContainer.appendChild(newTable);

    tableContainer.parentNode.insertBefore(newContainer, tableContainer.nextSibling);

    clearSelection();
}

function deleteTable(button) {
    const tableContainer = button.closest('.table-container');

    // Confirm deletion
    if (confirm('Are you sure you want to delete this table?')) {
        tableContainer.remove();
        clearSelection();
    }
}

function toggleTableHeaders() {
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

function deleteTableFromContext() {
    if (!contextMenuTarget) return;

    const tableContainer = contextMenuTarget.closest('.table-container');

    // Confirm deletion
    if (confirm('Are you sure you want to delete this table?')) {
        tableContainer.remove();
        clearSelection();
        hideContextMenu();
    }
}

function toggleMode(button) {
    isDesignMode = !isDesignMode;
    const table = button.closest('.table-container').querySelector('table');
    const spans = table.querySelectorAll('th > span, td > span');

    if (isDesignMode) {
        // Switch to DESIGN mode
        button.textContent = 'DESIGN';
        button.classList.remove('edit-mode');

        // Disable editing
        spans.forEach(span => {
            span.contentEditable = 'false';
        });

        // Show drag handles
        document.querySelectorAll('.row-drag-handle, .col-drag-handle').forEach(handle => {
            handle.style.display = 'flex';
        });
    } else {
        // Switch to EDIT mode
        button.textContent = 'EDIT';
        button.classList.add('edit-mode');

        // Enable editing
        spans.forEach(span => {
            span.contentEditable = 'true';
        });

        // Hide drag handles
        document.querySelectorAll('.row-drag-handle, .col-drag-handle').forEach(handle => {
            handle.style.display = 'none';
        });
    }
}

function showContextMenu(event, cell) {
    event.preventDefault();
    contextMenuTarget = cell;

    // Only change selection if right-clicking on a cell that's not already selected
    if (!selectedCells.includes(cell)) {
        clearSelection();
        cell.classList.add('cell-selected');
        selectedCells.push(cell);
        currentCell = cell;
        anchorCell = cell;
    }

    updateFormatControls(cell);

    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';

    const menuRect = contextMenu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (menuRect.right > windowWidth) {
        contextMenu.style.left = (event.pageX - menuRect.width) + 'px';
    }

    if (menuRect.bottom > windowHeight) {
        contextMenu.style.top = (event.pageY - menuRect.height) + 'px';
    }
}

function clearSelectionFromContext() {
    clearSelection();
    hideContextMenu();
}

function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    contextMenu.style.display = 'none';
    contextMenuTarget = null;
}

// Resize functionality
function addResizeHandles(cell) {
    // Remove existing handles
    const existingHandles = cell.querySelectorAll('.resize-handle-col, .resize-handle-row, .resize-handle-corner');
    existingHandles.forEach(handle => handle.remove());

    // Add column resize handle
    const colHandle = document.createElement('div');
    colHandle.className = 'resize-handle-col';
    colHandle.addEventListener('mousedown', (e) => startResize(e, 'col', cell));
    cell.appendChild(colHandle);

    // Add row resize handle
    const rowHandle = document.createElement('div');
    rowHandle.className = 'resize-handle-row';
    rowHandle.addEventListener('mousedown', (e) => startResize(e, 'row', cell));
    cell.appendChild(rowHandle);

    // Add corner resize handle
    const cornerHandle = document.createElement('div');
    cornerHandle.className = 'resize-handle-corner';
    cornerHandle.addEventListener('mousedown', (e) => startResize(e, 'corner', cell));
    cell.appendChild(cornerHandle);
}

function startResize(e, type, cell) {
    e.preventDefault();
    e.stopPropagation();

    isResizing = true;
    resizeType = type;
    resizeTarget = cell;
    startX = e.clientX;
    startY = e.clientY;

    const rect = cell.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;

    document.body.classList.add('resizing');

    // Create resize line for visual feedback
    if (type === 'col' || type === 'corner') {
        resizeLine = document.createElement('div');
        resizeLine.className = 'resize-line vertical';
        resizeLine.style.left = e.clientX + 'px';
        document.body.appendChild(resizeLine);
    }
    if (type === 'row' || type === 'corner') {
        if (!resizeLine) {
            resizeLine = document.createElement('div');
            resizeLine.className = 'resize-line horizontal';
        } else {
            resizeLine.className += ' horizontal';
        }
        resizeLine.style.top = e.clientY + 'px';
        if (type === 'row') {
            document.body.appendChild(resizeLine);
        }
    }

    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
}

function handleResize(e) {
    if (!isResizing) return;

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    if (resizeType === 'col' || resizeType === 'corner') {
        const newWidth = Math.max(50, startWidth + deltaX);

        // Update resize line position
        if (resizeLine && resizeLine.classList.contains('vertical')) {
            resizeLine.style.left = e.clientX + 'px';
        }

        // Check if we have multiple selected cells
        if (selectedCells.length > 1) {
            // Apply width to all selected cells and their columns
            const affectedColumns = new Set();

            selectedCells.forEach(cell => {
                const cellIndex = Array.from(cell.parentNode.children).indexOf(cell);
                affectedColumns.add(cellIndex);
            });

            // Apply width to all affected columns
            const table = resizeTarget.closest('table');
            const allRowsInTable = table.querySelectorAll('tr');

            affectedColumns.forEach(columnIndex => {
                allRowsInTable.forEach(row => {
                    const cell = row.children[columnIndex];
                    if (cell) {
                        cell.style.width = newWidth + 'px';
                    }
                });
            });
        } else {
            // Original behavior: apply width to entire column
            resizeTarget.style.width = newWidth + 'px';
            const cellIndex = Array.from(resizeTarget.parentNode.children).indexOf(resizeTarget);
            const table = resizeTarget.closest('table');
            const allRowsInTable = table.querySelectorAll('tr');

            allRowsInTable.forEach(row => {
                const cell = row.children[cellIndex];
                if (cell) {
                    cell.style.width = newWidth + 'px';
                }
            });
        }
    }

    if (resizeType === 'row' || resizeType === 'corner') {
        const newHeight = Math.max(30, startHeight + deltaY);

        // Update resize line position
        if (resizeLine && (resizeLine.classList.contains('horizontal') || resizeType === 'row')) {
            resizeLine.style.top = e.clientY + 'px';
        }

        // Check if we have multiple selected cells
        if (selectedCells.length > 1) {
            // Apply height to all selected cells and their rows
            const affectedRows = new Set();

            selectedCells.forEach(cell => {
                affectedRows.add(cell.parentNode);
            });

            // Apply height to all affected rows
            affectedRows.forEach(row => {
                Array.from(row.children).forEach(cell => {
                    cell.style.height = newHeight + 'px';
                });
            });
        } else {
            // Original behavior: apply height to entire row
            const row = resizeTarget.parentNode;
            Array.from(row.children).forEach(cell => {
                cell.style.height = newHeight + 'px';
            });
        }
    }
}

function stopResize() {
    if (!isResizing) return;

    isResizing = false;
    resizeType = null;
    resizeTarget = null;

    document.body.classList.remove('resizing');

    // Remove resize line
    if (resizeLine) {
        resizeLine.remove();
        resizeLine = null;
    }

    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', stopResize);
}

function initializeResizeHandles() {
    console.log('initializeResizeHandles called');
    const tables = document.querySelectorAll('table');
    console.log('Found tables:', tables.length);
    tables.forEach(table => {
        const cells = table.querySelectorAll('th, td');
        cells.forEach(cell => {
            addResizeHandles(cell);
        });

        // Add drag handles to rows
        const rows = table.querySelectorAll('tbody tr');
        console.log('Found tbody rows:', rows.length);
        rows.forEach(row => {
            addRowDragHandle(row);
        });

        // Add drag handles to header columns
        const headerCells = table.querySelectorAll('thead th');
        headerCells.forEach((cell, index) => {
            addColumnDragHandle(cell, index);
        });
    });
}

// Design/Edit mode
let isDesignMode = true; // Start in design mode

// Drag and drop functionality for rows and columns
let draggedRow = null;
let draggedColumn = null;

function addRowDragHandle(row) {
    // Remove existing handle if any
    const existingHandle = row.querySelector('.row-drag-handle');
    if (existingHandle) existingHandle.remove();

    const handle = document.createElement('div');
    handle.className = 'row-drag-handle';
    handle.draggable = true;

    console.log('Adding drag handle to row:', row);

    // Make the first cell position relative to contain the handle
    const firstCell = row.querySelector('td, th');
    if (firstCell) {
        firstCell.style.position = 'relative';
        firstCell.appendChild(handle);
        console.log('Drag handle added to cell:', firstCell);
    } else {
        console.log('No first cell found in row');
    }

    // Prevent cell selection when clicking on drag handle
    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation(); // Prevent cell selection
        clearSelection(); // Clear any existing selection
    });

    handle.addEventListener('dragstart', (e) => {
        draggedRow = row;
        row.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    });

    handle.addEventListener('dragend', (e) => {
        row.classList.remove('dragging');
        document.querySelectorAll('tr.drag-over').forEach(r => r.classList.remove('drag-over'));
        draggedRow = null;
    });
}

function addColumnDragHandle(headerCell, columnIndex) {
    // Remove existing handle if any
    const existingHandle = headerCell.querySelector('.col-drag-handle');
    if (existingHandle) existingHandle.remove();

    const handle = document.createElement('div');
    handle.className = 'col-drag-handle';
    handle.draggable = true;
    handle.dataset.columnIndex = columnIndex;

    headerCell.appendChild(handle);

    // Prevent cell selection when clicking on drag handle
    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        clearSelection();
    });

    handle.addEventListener('dragstart', (e) => {
        draggedColumn = columnIndex;
        const table = headerCell.closest('table');
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            const cell = row.children[columnIndex];
            if (cell) cell.classList.add('col-dragging');
        });
        e.dataTransfer.effectAllowed = 'move';
    });

    handle.addEventListener('dragend', (e) => {
        const table = headerCell.closest('table');
        const rows = table.querySelectorAll('tr');
        rows.forEach(row => {
            Array.from(row.children).forEach(cell => {
                cell.classList.remove('col-dragging');
                cell.classList.remove('col-drag-over');
            });
        });
        draggedColumn = null;
    });
}

// Add drag over and drop handlers to table rows
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('dragover', (e) => {
        e.preventDefault();

        // Handle row drag over
        const row = e.target.closest('tbody tr');
        if (row && draggedRow && row !== draggedRow) {
            document.querySelectorAll('tr.drag-over').forEach(r => r.classList.remove('drag-over'));
            row.classList.add('drag-over');
        }

        // Handle column drag over
        const cell = e.target.closest('th, td');
        if (cell && draggedColumn !== null) {
            const table = cell.closest('table');
            const row = cell.parentNode;
            const cellIndex = Array.from(row.children).indexOf(cell);

            if (cellIndex !== draggedColumn) {
                // Remove previous drag-over
                table.querySelectorAll('.col-drag-over').forEach(c => c.classList.remove('col-drag-over'));

                // Add drag-over to all cells in this column
                const rows = table.querySelectorAll('tr');
                rows.forEach(r => {
                    const targetCell = r.children[cellIndex];
                    if (targetCell) targetCell.classList.add('col-drag-over');
                });
            }
        }
    });

    document.addEventListener('drop', (e) => {
        e.preventDefault();

        // Handle row drop
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

        // Handle column drop
        const targetCell = e.target.closest('th, td');
        if (targetCell && draggedColumn !== null) {
            const table = targetCell.closest('table');
            const targetRow = targetCell.parentNode;
            const targetIndex = Array.from(targetRow.children).indexOf(targetCell);

            if (targetIndex !== draggedColumn && targetIndex !== -1) {
                // Move all cells in the dragged column to the target position
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

                // Re-initialize drag handles with new column positions
                initializeResizeHandles();
            }
        }

        document.querySelectorAll('tr.drag-over').forEach(r => r.classList.remove('drag-over'));
        document.querySelectorAll('.col-drag-over').forEach(c => c.classList.remove('col-drag-over'));
    });
});