

export function normalizeHtmlForComparison(html) {
    // Create a temporary div to parse and clean the HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;

    // Remove UI-only classes from all elements
    const allElements = temp.querySelectorAll('*');
    allElements.forEach(el => {
        // Remove selection and navigation classes
        el.classList.remove('cell-selected', 'editing-mode', 'drag-over', 'col-drag-over');

        // If no classes left, remove the class attribute entirely
        if (el.classList.length === 0) {
            el.removeAttribute('class');
        }
    });

    return temp.innerHTML;
}
