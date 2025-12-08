// Creates the context menu and text format menu DOM elements dynamically

export function createMenuElements() {
    // Check if menus already exist
    if (document.getElementById('contextMenu') || document.getElementById('textFormatMenu')) {
        console.log('Menus already exist, skipping creation');
        return;
    }

    // Inject CSS styles
    injectMenuStyles();

    // Create context menu
    const contextMenu = createContextMenu();
    document.body.appendChild(contextMenu);

    // Create text format menu
    const textFormatMenu = createTextFormatMenu();
    document.body.appendChild(textFormatMenu);

    console.log('Menu elements created');
}

function injectMenuStyles() {
    // Check if styles already injected
    if (document.getElementById('editor-menu-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'editor-menu-styles';
    style.textContent = `
        /* Document Editor Styles */
        .context-menu {
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            display: none;
            min-width: 200px;
            max-height: 400px;
            overflow-y: auto;
        }

        .text-format-menu {
            position: absolute;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            z-index: 1000;
            display: none;
            padding: 5px;
        }

        .text-format-menu button {
            padding: 6px 10px;
            margin: 2px;
            border: 1px solid #ddd;
            background: white;
            cursor: pointer;
            font-size: 14px;
            border-radius: 3px;
        }

        .text-format-menu button:hover {
            background-color: #f0f0f0;
        }

        .text-format-menu button.active {
            background-color: #007bff;
            color: white;
        }

        .context-menu button {
            display: block;
            width: 100%;
            padding: 8px 12px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            font-size: 14px;
        }

        .context-menu button:hover {
            background-color: #f0f0f0;
        }

        .context-menu .separator {
            height: 1px;
            background-color: #e0e0e0;
            margin: 5px 0;
        }

        .context-menu .format-section {
            padding: 8px 12px;
            border-bottom: 1px solid #e0e0e0;
        }

        .context-menu .format-group {
            display: flex;
            align-items: center;
            gap: 8px;
            margin: 5px 0;
        }

        .context-menu .format-group label {
            font-size: 12px;
            color: #666;
            min-width: 70px;
        }

        .context-menu input[type="number"],
        .context-menu select {
            padding: 4px 6px;
            border: 1px solid #ddd;
            border-radius: 3px;
            font-size: 12px;
            flex: 1;
        }

        /* Custom color picker styling */
        .color-picker-container {
            position: relative;
            flex: 1;
        }

        .color-picker-selected {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
            background: white;
            cursor: pointer;
            font-size: 12px;
        }

        .color-picker-selected:hover {
            border-color: #999;
        }

        .color-preview {
            width: 20px;
            height: 20px;
            border: 1px solid #ccc;
            border-radius: 2px;
            flex-shrink: 0;
        }

        .color-picker-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ccc;
            border-radius: 3px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 1000;
            margin-top: 2px;
            max-height: 200px;
            overflow-y: auto;
        }

        .color-picker-dropdown.show {
            display: block;
        }

        .color-option {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 8px;
            cursor: pointer;
            font-size: 12px;
        }

        .color-option:hover {
            background-color: #f0f0f0;
        }

        /* Drag handles */
        .row-drag-handle {
            position: absolute;
            left: -20px;
            top: 0;
            height: 100%;
            width: 20px;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s;
            user-select: none;
            color: #999;
        }

        tr:hover .row-drag-handle {
            opacity: 1;
        }

        .row-drag-handle:hover {
            color: #007bff;
        }

        .row-drag-handle::before {
            content: '⋮⋮';
            font-size: 12px;
            letter-spacing: -2px;
        }

        .col-drag-handle {
            position: absolute;
            top: -20px;
            left: 0;
            width: 100%;
            height: 20px;
            cursor: grab;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.2s;
            user-select: none;
            color: #999;
        }

        th:hover .col-drag-handle,
        td:hover .col-drag-handle {
            opacity: 1;
        }

        .col-drag-handle:hover {
            color: #007bff;
        }

        .col-drag-handle::before {
            content: '⋮⋮';
            font-size: 12px;
            letter-spacing: -2px;
            transform: rotate(90deg);
        }

        /* Resize handles */
        .resize-handle-col {
            position: absolute;
            top: 0;
            right: -3px;
            width: 6px;
            height: 100%;
            cursor: col-resize;
            background: transparent;
            z-index: 10;
        }

        .resize-handle-col::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 2px;
            height: 20px;
            background: #007bff;
            border-radius: 1px;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .resize-handle-col:hover::after {
            opacity: 1;
        }

        .resize-handle-col:hover {
            background: rgba(0, 123, 255, 0.1);
        }

        .resize-handle-row {
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 100%;
            height: 6px;
            cursor: row-resize;
            background: transparent;
            z-index: 10;
        }

        .resize-handle-row::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 2px;
            background: #007bff;
            border-radius: 1px;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .resize-handle-row:hover::after {
            opacity: 1;
        }

        .resize-handle-row:hover {
            background: rgba(0, 123, 255, 0.1);
        }

        .resize-handle-corner {
            position: absolute;
            bottom: -3px;
            right: -3px;
            width: 8px;
            height: 8px;
            cursor: nwse-resize;
            background: transparent;
            z-index: 15;
        }

        .resize-handle-corner::after {
            content: '';
            position: absolute;
            bottom: 1px;
            right: 1px;
            width: 4px;
            height: 4px;
            background: #ccc;
            border-radius: 50%;
            opacity: 0;
            transition: opacity 0.2s;
        }

        .resize-handle-corner:hover::after {
            opacity: 1;
            background: #007bff;
        }

        .resize-handle-corner:hover {
            background: rgba(0, 123, 255, 0.2);
        }

        /* Cell selection styles */
        .cell-selected {
            background-color: #e3f2fd !important;
            outline: 2px solid #2196F3;
            outline-offset: -2px;
        }

        .editing-mode {
            outline: 2px solid #4CAF50 !important;
        }

        /* Drag and drop styles */
        .drag-over {
            border-top: 3px solid #007bff !important;
        }

        .col-drag-over {
            border-left: 3px solid #007bff !important;
        }

        /* Enhanced cursor visibility */
        [contenteditable="true"] {
            caret-color: #2196F3;
        }

        [contenteditable="true"]:focus {
            caret-color: #1565C0;
        }

        /* Blink animation for better visibility */
        @keyframes blink-caret {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        /* Apply blinking to focused editable areas */
        [contenteditable="true"]:focus::after {
            animation: blink-caret 1s step-end infinite;
        }

        /* Make text selection more visible */
        [contenteditable="true"]::selection {
            background-color: #64B5F6;
            color: white;
        }

        [contenteditable="true"]::-moz-selection {
            background-color: #64B5F6;
            color: white;
        }
    `;

    document.head.appendChild(style);
}

function createContextMenu() {
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.id = 'contextMenu';

    menu.innerHTML = `
        <button onclick="addRowAbove()">Add Row Above</button>
        <button onclick="addRowBelow()">Add Row Below</button>
        <button onclick="addColumnLeft()">Add Column Left</button>
        <button onclick="addColumnRight()">Add Column Right</button>
        <div class="separator"></div>
        <button onclick="deleteCell()">Delete Cell</button>
        <button onclick="deleteSelectedRow()">Delete Row</button>
        <button onclick="deleteSelectedColumn()">Delete Column</button>
        <div class="separator"></div>
        <button onclick="moveRowUp()">Move Row Up</button>
        <button onclick="moveRowDown()">Move Row Down</button>
        <div class="separator"></div>
        <button onclick="sortColumnAZ()">Sort Column A→Z</button>
        <button onclick="sortColumnZA()">Sort Column Z→A</button>
        <div class="separator"></div>
        <button onclick="mergeSelectedCells()">Merge Cells</button>
        <button onclick="splitSelectedCell()">Split Cell</button>
        <div class="separator"></div>
        <button onclick="toggleCellInvisible()">Toggle Invisible</button>
        <button onclick="toggleVerticalText()">Toggle Vertical Text</button>
        <div class="separator"></div>
        <button onclick="pasteAsPlainText()">Paste as Plain Text</button>
        <div class="separator"></div>
        <button onclick="toggleTableHeaders()">Toggle Headers</button>
        <div class="separator"></div>
        <button onclick="splitTable()">Split Table</button>
        <button id="joinTablesBtn" onclick="joinTables()">Join Tables</button>
        <button onclick="deleteTableFromContext()">Delete Table</button>
        <div class="separator"></div>
        <button onclick="copyFormat()">Copy Format</button>
        <button onclick="pasteFormat()">Paste Format</button>
        <div class="separator"></div>

        <div class="format-section">
            <div class="format-group">
                <label>H-Align:</label>
                <select id="contextAlignSelect" onchange="applyAlignmentFromContext()">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>
            </div>

            <div class="format-group">
                <label>V-Align:</label>
                <select id="contextVerticalAlignSelect" onchange="applyVerticalAlignmentFromContext()">
                    <option value="top">Top</option>
                    <option value="middle">Middle</option>
                    <option value="bottom">Bottom</option>
                </select>
            </div>

            <div class="format-group">
                <label>Font Size:</label>
                <div style="display: flex; gap: 5px; align-items: center; flex: 1;">
                    <button onclick="decreaseContextFontSize()" style="width: 30px; padding: 4px 8px; font-weight: bold;">−</button>
                    <span id="contextFontSizeDisplay" style="min-width: 30px; text-align: center; font-weight: bold;">14</span>
                    <button onclick="increaseContextFontSize()" style="width: 30px; padding: 4px 8px; font-weight: bold;">+</button>
                </div>
            </div>

            <div class="format-group">
                <label>Style:</label>
                <div style="display: flex; gap: 5px;">
                    <button id="boldBtn" onclick="toggleBold()" style="font-weight: bold; width: 30px; padding: 4px 8px;">B</button>
                    <button id="italicBtn" onclick="toggleItalic()" style="font-style: italic; width: 30px; padding: 4px 8px;">I</button>
                    <button id="underlineBtn" onclick="toggleUnderline()" style="text-decoration: underline; width: 30px; padding: 4px 8px;">U</button>
                    <button id="strikeBtn" onclick="toggleStrikethrough()" style="text-decoration: line-through; width: 30px; padding: 4px 8px;">S</button>
                </div>
            </div>

            <div class="format-group">
                <label>Background:</label>
                <div class="color-picker-container">
                    <div class="color-picker-selected" id="bgColorPicker" onclick="toggleBgColorDropdown()">
                        <div class="color-preview" id="bgColorPreview" style="background-color: #ffffff;"></div>
                        <span id="bgColorLabel">None</span>
                    </div>
                    <div class="color-picker-dropdown" id="bgColorDropdown">
                        ${createColorOptions('selectBgColor', [
                            { color: '', label: 'None', transparent: true },
                            { color: '#000000', label: 'Black' },
                            { color: '#FFFFFF', label: 'White' },
                            { color: '#4ac6e9', label: 'Light Blue' },
                            { color: '#008aba', label: 'Blue' },
                            { color: '#90639d', label: 'Light Purple' },
                            { color: '#722a81', label: 'Purple' },
                            { color: '#f26649', label: 'Orange' },
                            { color: 'yellow', label: 'Yellow' }
                        ])}
                    </div>
                </div>
            </div>

            <div class="format-group">
                <label>Text Color:</label>
                <div class="color-picker-container">
                    <div class="color-picker-selected" id="textColorPicker" onclick="toggleTextColorDropdown()">
                        <div class="color-preview" id="textColorPreview" style="background-color: #000000;"></div>
                        <span id="textColorLabel">Black</span>
                    </div>
                    <div class="color-picker-dropdown" id="textColorDropdown">
                        ${createColorOptions('selectTextColor', [
                            { color: '#000000', label: 'Black' },
                            { color: '#FFFFFF', label: 'White', border: true },
                            { color: '#4ac6e9', label: 'Light Blue' },
                            { color: '#008aba', label: 'Blue' },
                            { color: '#90639d', label: 'Light Purple' },
                            { color: '#722a81', label: 'Purple' },
                            { color: '#f26649', label: 'Orange' },
                            { color: 'yellow', label: 'Yellow' }
                        ])}
                    </div>
                </div>
            </div>

            <div class="format-group">
                <label>Border Width:</label>
                <select id="borderWidthSelect" onchange="applyBorderStyleFromContext()">
                    <option value="0">None</option>
                    <option value="1" selected>1px</option>
                    <option value="2">2px</option>
                    <option value="3">3px</option>
                    <option value="4">4px</option>
                    <option value="5">5px</option>
                </select>
            </div>

            <div class="format-group">
                <label>Border Style:</label>
                <select id="borderStyleSelect" onchange="applyBorderStyleFromContext()">
                    <option value="solid" selected>Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                    <option value="double">Double</option>
                </select>
            </div>

            <div class="format-group">
                <label>Border Color:</label>
                <div class="color-picker-container">
                    <div class="color-picker-selected" id="borderColorPicker" onclick="toggleBorderColorDropdown()">
                        <div class="color-preview" id="borderColorPreview" style="background-color: #dddddd;"></div>
                        <span id="borderColorLabel">Gray</span>
                    </div>
                    <div class="color-picker-dropdown" id="borderColorDropdown">
                        ${createColorOptions('selectBorderColor', [
                            { color: '#000000', label: 'Black' },
                            { color: '#dddddd', label: 'Gray' },
                            { color: '#FFFFFF', label: 'White', border: true },
                            { color: '#4ac6e9', label: 'Light Blue' },
                            { color: '#008aba', label: 'Blue' },
                            { color: '#90639d', label: 'Light Purple' },
                            { color: '#722a81', label: 'Purple' },
                            { color: '#f26649', label: 'Orange' },
                            { color: 'yellow', label: 'Yellow' }
                        ])}
                    </div>
                </div>
            </div>
        </div>

        <button onclick="resetFormatFromContext()">Reset Format</button>
        <div class="separator"></div>
        <button onclick="clearSelectionFromContext()">Clear Selection</button>
    `;

    return menu;
}

function createTextFormatMenu() {
    const menu = document.createElement('div');
    menu.className = 'text-format-menu';
    menu.id = 'textFormatMenu';

    menu.innerHTML = `
        <div style="display: flex; gap: 3px; margin-bottom: 5px;">
            <button id="textBoldBtn" onclick="toggleBold()" style="font-weight: bold;" title="Bold (Ctrl+B)">B</button>
            <button id="textItalicBtn" onclick="toggleItalic()" style="font-style: italic;" title="Italic (Ctrl+I)">I</button>
            <button id="textUnderlineBtn" onclick="toggleUnderline()" style="text-decoration: underline;" title="Underline (Ctrl+U)">U</button>
            <button id="textStrikeBtn" onclick="toggleStrikethrough()" style="text-decoration: line-through;" title="Strikethrough">S</button>
        </div>
        <div style="display: flex; gap: 5px; align-items: center; padding: 3px 0; border-top: 1px solid #ddd; padding-top: 5px;">
            <label style="font-size: 11px; margin: 0; min-width: 35px;">Size:</label>
            <button onclick="decreaseTextFontSize()" style="width: 28px; padding: 3px; font-weight: bold; font-size: 14px;">−</button>
            <span id="textFontSizeDisplay" style="min-width: 30px; text-align: center; font-weight: bold; font-size: 13px;">14</span>
            <button onclick="increaseTextFontSize()" style="width: 28px; padding: 3px; font-weight: bold; font-size: 14px;">+</button>
        </div>
        <div style="display: flex; gap: 5px; align-items: center; padding: 3px 0;">
            <label style="font-size: 11px; margin: 0; min-width: 35px;">Text:</label>
            <div class="color-picker-container" style="position: relative;">
                <div class="color-picker-selected" id="textMenuTextColorPicker" onclick="toggleTextMenuTextColorDropdown()" style="cursor: pointer; padding: 3px 8px; border: 1px solid #ddd; border-radius: 3px; display: flex; align-items: center; gap: 5px; min-width: 100px;">
                    <div class="color-preview" id="textMenuTextColorPreview" style="width: 20px; height: 20px; border: 1px solid #ccc; background-color: #000000;"></div>
                    <span id="textMenuTextColorLabel" style="font-size: 11px;">Black</span>
                </div>
                <div class="color-picker-dropdown" id="textMenuTextColorDropdown" style="position: absolute; top: 100%; left: 0; z-index: 2000;">
                    ${createColorOptions('selectTextMenuTextColor', [
                        { color: '#000000', label: 'Black' },
                        { color: '#FFFFFF', label: 'White', border: true },
                        { color: '#4ac6e9', label: 'Light Blue' },
                        { color: '#008aba', label: 'Blue' },
                        { color: '#90639d', label: 'Light Purple' },
                        { color: '#722a81', label: 'Purple' },
                        { color: '#f26649', label: 'Orange' },
                        { color: 'yellow', label: 'Yellow' }
                    ])}
                </div>
            </div>
        </div>
        <div style="display: flex; gap: 5px; align-items: center; padding: 3px 0;">
            <label style="font-size: 11px; margin: 0; min-width: 35px;">Back:</label>
            <div class="color-picker-container" style="position: relative;">
                <div class="color-picker-selected" id="textMenuBgColorPicker" onclick="toggleTextMenuBgColorDropdown()" style="cursor: pointer; padding: 3px 8px; border: 1px solid #ddd; border-radius: 3px; display: flex; align-items: center; gap: 5px; min-width: 100px;">
                    <div class="color-preview" id="textMenuBgColorPreview" style="width: 20px; height: 20px; border: 1px solid #ccc; background-color: transparent;"></div>
                    <span id="textMenuBgColorLabel" style="font-size: 11px;">None</span>
                </div>
                <div class="color-picker-dropdown" id="textMenuBgColorDropdown" style="position: absolute; top: 100%; left: 0; z-index: 2000;">
                    ${createColorOptions('selectTextMenuBgColor', [
                        { color: '', label: 'None', transparent: true },
                        { color: '#000000', label: 'Black' },
                        { color: '#FFFFFF', label: 'White' },
                        { color: '#4ac6e9', label: 'Light Blue' },
                        { color: '#008aba', label: 'Blue' },
                        { color: '#90639d', label: 'Light Purple' },
                        { color: '#722a81', label: 'Purple' },
                        { color: '#f26649', label: 'Orange' },
                        { color: 'yellow', label: 'Yellow' }
                    ])}
                </div>
            </div>
        </div>
        <div style="border-top: 1px solid #ddd; margin-top: 5px; padding-top: 5px;">
            <button onclick="selectParentTag()" style="width: 100%; padding: 5px; font-size: 12px; margin-bottom: 3px;">Select Parent Tag</button>
            <button onclick="clearTextFormat()" style="width: 100%; padding: 5px; font-size: 12px; margin-bottom: 3px;">Clear Format</button>
            <button onclick="createTableFromMenu()" style="width: 100%; padding: 5px; font-size: 12px;">Create Table</button>
        </div>
    `;

    return menu;
}

function createColorOptions(functionName, colors) {
    return colors.map(({ color, label, transparent, border }) => {
        const bgStyle = transparent
            ? 'background-color: transparent; border: 1px solid #ccc;'
            : border
            ? `background-color: ${color}; border: 1px solid #ccc;`
            : `background-color: ${color};`;

        return `
            <div class="color-option" onclick="${functionName}('${color}', '${label}')">
                <div class="color-preview" style="${bgStyle}"></div>
                <span>${label}</span>
            </div>
        `;
    }).join('');
}
