import { currentBgColor, setCurrentBgColor } from '../state/variables.js';
import { applyBackgroundColorFromContext } from './applyBackgroundColorFromContext.js';

export function selectBgColor(color, label) {
    setCurrentBgColor(color);
    document.getElementById('bgColorPreview').style.backgroundColor = color || 'transparent';
    document.getElementById('bgColorLabel').textContent = label;
    document.getElementById('bgColorDropdown').classList.remove('show');
    applyBackgroundColorFromContext();
}
