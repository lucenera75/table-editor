import { currentTextColor, setCurrentTextColor } from '../state/variables.js';
import { applyTextColorFromContext } from './applyTextColorFromContext.js';

export function selectTextColor(color, label) {
    setCurrentTextColor(color);
    document.getElementById('textColorPreview').style.backgroundColor = color;
    document.getElementById('textColorLabel').textContent = label;
    document.getElementById('textColorDropdown').classList.remove('show');
    applyTextColorFromContext();
}
