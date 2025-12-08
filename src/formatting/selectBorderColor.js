import { setCurrentBorderColor } from '../state/variables.js';
import { applyBorderStyleFromContext } from './applyBorderStyleFromContext.js';

export function selectBorderColor(color, label) {
    // Update the state
    setCurrentBorderColor(color);

    // Update the UI
    const preview = document.getElementById('borderColorPreview');
    const labelElement = document.getElementById('borderColorLabel');

    preview.style.backgroundColor = color || '#dddddd';
    labelElement.textContent = label;

    // Close the dropdown
    document.getElementById('borderColorDropdown').classList.remove('show');

    // Apply the border with the new color
    applyBorderStyleFromContext();
}
