// Increases the font size for the text format menu

import { applyTextFontSize } from './applyTextFontSize.js';

export function increaseTextFontSize() {
    const display = document.getElementById('textFontSizeDisplay');
    if (!display) return;

    let currentSize = parseInt(display.textContent) || 14;
    let newSize = currentSize + 1;

    // Clamp between 8 and 72
    if (newSize > 72) newSize = 72;

    display.textContent = newSize;
    applyTextFontSize();
}
