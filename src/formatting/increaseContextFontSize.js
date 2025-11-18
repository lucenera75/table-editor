// Increases the font size for the context menu

import { applyFontSizeFromContext } from './applyFontSizeFromContext.js';

export function increaseContextFontSize() {
    const display = document.getElementById('contextFontSizeDisplay');
    if (!display) return;

    let currentSize = parseInt(display.textContent) || 14;
    let newSize = currentSize + 1;

    // Clamp between 8 and 72
    if (newSize > 72) newSize = 72;

    display.textContent = newSize;
    applyFontSizeFromContext();
}
