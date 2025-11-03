import { selectedCells } from '../state/variables.js';
import { updateFormatButtons } from './updateFormatButtons.js';

export function resetFormatFromContext() {
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
