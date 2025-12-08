import { selectedCells, copiedFormat } from '../state/variables.js';

export function pasteFormat() {
    if (selectedCells.length === 0) {
        alert('Please select cells to paste the format to');
        return;
    }

    if (!copiedFormat) {
        alert('No format copied. Please copy a format first.');
        return;
    }

    selectedCells.forEach(cell => {
        // Apply class names
        if (copiedFormat.className) {
            cell.className = copiedFormat.className;
        }

        // Apply cell-level styles
        if (copiedFormat.backgroundColor) {
            cell.style.backgroundColor = copiedFormat.backgroundColor;
        }
        if (copiedFormat.border) {
            cell.style.border = copiedFormat.border;
        }
        if (copiedFormat.borderTop) {
            cell.style.borderTop = copiedFormat.borderTop;
        }
        if (copiedFormat.borderRight) {
            cell.style.borderRight = copiedFormat.borderRight;
        }
        if (copiedFormat.borderBottom) {
            cell.style.borderBottom = copiedFormat.borderBottom;
        }
        if (copiedFormat.borderLeft) {
            cell.style.borderLeft = copiedFormat.borderLeft;
        }
        if (copiedFormat.width) {
            cell.style.width = copiedFormat.width;
        }
        if (copiedFormat.height) {
            cell.style.height = copiedFormat.height;
        }
        if (copiedFormat.padding) {
            cell.style.padding = copiedFormat.padding;
        }
        if (copiedFormat.textAlign) {
            cell.style.textAlign = copiedFormat.textAlign;
        }
        if (copiedFormat.verticalAlign) {
            cell.style.verticalAlign = copiedFormat.verticalAlign;
        }

        // Apply span-level styles if they exist in the copied format
        if (copiedFormat.span) {
            const span = cell.querySelector('span');
            if (span) {
                if (copiedFormat.span.color) {
                    span.style.color = copiedFormat.span.color;
                }
                if (copiedFormat.span.fontWeight) {
                    span.style.fontWeight = copiedFormat.span.fontWeight;
                }
                if (copiedFormat.span.fontStyle) {
                    span.style.fontStyle = copiedFormat.span.fontStyle;
                }
                if (copiedFormat.span.textDecoration) {
                    span.style.textDecoration = copiedFormat.span.textDecoration;
                }
                if (copiedFormat.span.fontSize) {
                    span.style.fontSize = copiedFormat.span.fontSize;
                }
                if (copiedFormat.span.backgroundColor) {
                    span.style.backgroundColor = copiedFormat.span.backgroundColor;
                }
            }
        }
    });

    console.log('Format pasted to', selectedCells.length, 'cells');
}
