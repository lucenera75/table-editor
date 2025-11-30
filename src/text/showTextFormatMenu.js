

export function showTextFormatMenu() {
    const menu = document.getElementById('textFormatMenu');
    if (!menu) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    // Only show text format menu for selections within editable-contents-area
    const container = document.getElementById('editable-contents-area');
    const range = selection.getRangeAt(0);
    const selectedElement = range.commonAncestorContainer;
    const element = selectedElement.nodeType === 3 ? selectedElement.parentElement : selectedElement;

    if (!container || !container.contains(element)) {
        return;
    }

    const rect = range.getBoundingClientRect();

    // Update format controls based on selected text
    updateTextFormatControls();

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

export function updateTextFormatControls() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    // Get the element at the start of the selection
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;
    const element = container.nodeType === 3 ? container.parentElement : container;

    if (!element) return;

    // Get computed style
    const computedStyle = window.getComputedStyle(element);

    // Update font size display
    const fontSizeDisplay = document.getElementById('textFontSizeDisplay');
    if (fontSizeDisplay) {
        const fontSize = parseFloat(computedStyle.fontSize);
        fontSizeDisplay.textContent = Math.round(fontSize);
    }

    // Update bold button
    const boldBtn = document.getElementById('textBoldBtn');
    if (boldBtn) {
        const isBold = computedStyle.fontWeight === 'bold' || parseInt(computedStyle.fontWeight) >= 700;
        boldBtn.classList.toggle('active', isBold);
    }

    // Update italic button
    const italicBtn = document.getElementById('textItalicBtn');
    if (italicBtn) {
        const isItalic = computedStyle.fontStyle === 'italic';
        italicBtn.classList.toggle('active', isItalic);
    }

    // Update underline button
    const underlineBtn = document.getElementById('textUnderlineBtn');
    if (underlineBtn) {
        const isUnderlined = computedStyle.textDecoration.includes('underline');
        underlineBtn.classList.toggle('active', isUnderlined);
    }

    // Update strikethrough button
    const strikeBtn = document.getElementById('textStrikeBtn');
    if (strikeBtn) {
        const isStrikethrough = computedStyle.textDecoration.includes('line-through');
        strikeBtn.classList.toggle('active', isStrikethrough);
    }

    // Update text color
    const textColorPreview = document.getElementById('textMenuTextColorPreview');
    const textColorLabel = document.getElementById('textMenuTextColorLabel');
    if (textColorPreview && textColorLabel) {
        const color = computedStyle.color;
        textColorPreview.style.backgroundColor = color;
        textColorLabel.textContent = rgbToHex(color) || 'Black';
    }

    // Update background color
    const bgColorPreview = document.getElementById('textMenuBgColorPreview');
    const bgColorLabel = document.getElementById('textMenuBgColorLabel');
    if (bgColorPreview && bgColorLabel) {
        const bgColor = computedStyle.backgroundColor;
        const isTransparent = bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent';

        if (isTransparent) {
            bgColorPreview.style.backgroundColor = 'transparent';
            bgColorLabel.textContent = 'None';
        } else {
            bgColorPreview.style.backgroundColor = bgColor;
            bgColorLabel.textContent = rgbToHex(bgColor) || 'Color';
        }
    }
}

// Helper function to convert RGB to hex
function rgbToHex(rgb) {
    if (!rgb) return null;

    // Already hex
    if (rgb.startsWith('#')) return rgb.toUpperCase();

    // Parse rgb(r, g, b) or rgba(r, g, b, a)
    const match = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/);
    if (!match) return null;

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return '#' + [r, g, b].map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('').toUpperCase();
}
