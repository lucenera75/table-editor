

export function showTextFormatMenu() {
    const menu = document.getElementById('textFormatMenu');
    if (!menu) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    // Position menu at the end of selection
    menu.style.display = 'block';
    menu.style.left = (rect.right + window.scrollX) + 'px';
    menu.style.top = (rect.bottom + window.scrollY + 5) + 'px';

    // Adjust position if menu goes off screen
    const menuRect = menu.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    if (menuRect.right > windowWidth) {
        menu.style.left = (rect.left + window.scrollX) + 'px';
    }

    if (menuRect.bottom > windowHeight) {
        menu.style.top = (rect.top + window.scrollY - menuRect.height - 5) + 'px';
    }
}
