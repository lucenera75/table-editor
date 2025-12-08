import { selectedCells, setCopiedFormat } from '../state/variables.js';

export function copyFormat() {
    if (selectedCells.length === 0) {
        alert('Please select a cell to copy its format');
        return;
    }

    // Get the first selected cell as the source
    const sourceCell = selectedCells[0];
    const computedStyle = window.getComputedStyle(sourceCell);

    // Capture all relevant formatting properties
    const format = {
        // Class names
        className: sourceCell.className,

        // Cell styles
        backgroundColor: sourceCell.style.backgroundColor || computedStyle.backgroundColor,
        border: sourceCell.style.border || `${computedStyle.borderWidth} ${computedStyle.borderStyle} ${computedStyle.borderColor}`,
        borderTop: sourceCell.style.borderTop || computedStyle.borderTop,
        borderRight: sourceCell.style.borderRight || computedStyle.borderRight,
        borderBottom: sourceCell.style.borderBottom || computedStyle.borderBottom,
        borderLeft: sourceCell.style.borderLeft || computedStyle.borderLeft,
        width: sourceCell.style.width,
        height: sourceCell.style.height,
        padding: sourceCell.style.padding || computedStyle.padding,
        textAlign: sourceCell.style.textAlign || computedStyle.textAlign,
        verticalAlign: sourceCell.style.verticalAlign || computedStyle.verticalAlign,

        // Get the span inside the cell for text formatting
        span: null
    };

    // Capture span formatting if exists
    const span = sourceCell.querySelector('span');
    if (span) {
        const spanComputedStyle = window.getComputedStyle(span);
        format.span = {
            color: span.style.color || spanComputedStyle.color,
            fontWeight: span.style.fontWeight || spanComputedStyle.fontWeight,
            fontStyle: span.style.fontStyle || spanComputedStyle.fontStyle,
            textDecoration: span.style.textDecoration || spanComputedStyle.textDecoration,
            fontSize: span.style.fontSize || spanComputedStyle.fontSize,
            backgroundColor: span.style.backgroundColor || spanComputedStyle.backgroundColor
        };
    }

    // Store the copied format in state
    setCopiedFormat(format);

    console.log('Format copied from cell:', format);
    alert('Format copied! Right-click on other cells to paste.');
}
