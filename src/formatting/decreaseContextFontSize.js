// Decreases the font size for the context menu

import { applyFontSizeFromContext } from './applyFontSizeFromContext.js';

export function decreaseContextFontSize() {
    const display = document.getElementById('contextFontSizeDisplay');
    if (!display) return;

    let currentSize = parseInt(display.textContent) || 14;
    let newSize = currentSize - 1;

    // Clamp between 8 and 72
    if (newSize < 8) newSize = 8;

    display.textContent = newSize;
    applyFontSizeFromContext();
}
