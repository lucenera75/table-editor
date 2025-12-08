import { currentBgColor, currentTextColor, setCurrentBgColor, setCurrentTextColor, setCurrentBorderColor } from '../state/variables.js';
import { rgbToHex } from './rgbToHex.js';
import { updateFormatButtons } from './updateFormatButtons.js';

export function updateFormatControls(cell) {
    const computedStyle = window.getComputedStyle(cell);

    const alignSelect = document.getElementById('contextAlignSelect');
    if (alignSelect) alignSelect.value = computedStyle.textAlign || 'left';

    const verticalAlignSelect = document.getElementById('contextVerticalAlignSelect');
    if (verticalAlignSelect) verticalAlignSelect.value = computedStyle.verticalAlign || 'middle';

    const fontSizeDisplay = document.getElementById('contextFontSizeDisplay');
    if (fontSizeDisplay) fontSizeDisplay.textContent = parseInt(computedStyle.fontSize) || 14;

    // Update border controls
    const borderWidth = parseInt(computedStyle.borderWidth) || 1;
    const borderStyle = computedStyle.borderStyle || 'solid';
    const borderColor = computedStyle.borderColor;
    const borderColorHex = rgbToHex(borderColor);

    const borderWidthSelect = document.getElementById('borderWidthSelect');
    if (borderWidthSelect) borderWidthSelect.value = borderWidth;

    const borderStyleSelect = document.getElementById('borderStyleSelect');
    if (borderStyleSelect) borderStyleSelect.value = borderStyle;

    // Define color map for border
    const borderColorMap = {
        '#000000': 'Black',
        '#dddddd': 'Gray',
        '#ffffff': 'White',
        '#4ac6e9': 'Light Blue',
        '#008aba': 'Blue',
        '#90639d': 'Light Purple',
        '#722a81': 'Purple',
        '#f26649': 'Orange',
        'yellow': 'Yellow',
        '#ffff00': 'Yellow'
    };

    const borderLabel = borderColorMap[borderColorHex.toLowerCase()] || borderColorMap[borderColor] || 'Gray';
    const borderColorValue = borderColorMap[borderColorHex.toLowerCase()] || borderColorMap[borderColor] ? (borderColor === 'yellow' ? 'yellow' : borderColorHex) : '#dddddd';

    setCurrentBorderColor(borderColorValue);
    document.getElementById('borderColorPreview').style.backgroundColor = borderColorValue;
    document.getElementById('borderColorLabel').textContent = borderLabel;

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
