import { currentBgColor, currentTextColor, setCurrentBgColor, setCurrentTextColor } from '../state/variables.js';
import { rgbToHex } from './rgbToHex.js';
import { updateFormatButtons } from './updateFormatButtons.js';

export function updateFormatControls(cell) {
    const computedStyle = window.getComputedStyle(cell);

    const alignSelect = document.getElementById('contextAlignSelect');
    if (alignSelect) alignSelect.value = computedStyle.textAlign || 'left';

    const verticalAlignSelect = document.getElementById('contextVerticalAlignSelect');
    if (verticalAlignSelect) verticalAlignSelect.value = computedStyle.verticalAlign || 'middle';

    const fontSizeInput = document.getElementById('contextFontSizeInput');
    if (fontSizeInput) fontSizeInput.value = parseInt(computedStyle.fontSize) || 14;

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

    setCurrentBgColor(bgColorValue);
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

    setCurrentTextColor(textColorValue);
    document.getElementById('textColorPreview').style.backgroundColor = textColorValue;
    document.getElementById('textColorLabel').textContent = textLabel;

    // Update format buttons state
    updateFormatButtons();
}
