export function toggleNextPage() {
    // Find the context menu to determine what was right-clicked
    const contextMenu = document.getElementById('contextMenu');
    if (!contextMenu || contextMenu.style.display === 'none') {
        return;
    }

    // Try to find the page container from the event coordinates
    // We'll use the stored target or find it from the current selection
    let page = null;

    // Try to get from stored context target
    const storedTarget = window._contextMenuPageTarget;
    if (storedTarget) {
        page = storedTarget.closest('.portrait-content, .landscape-content');
        if (!page && (storedTarget.classList.contains('portrait-content') || storedTarget.classList.contains('landscape-content'))) {
            page = storedTarget;
        }
    }

    if (!page) {
        alert('Could not find page container');
        return;
    }

    // Toggle the next-page class
    const hasNextPage = page.classList.contains('next-page');

    if (hasNextPage) {
        page.classList.remove('next-page');
        console.log('Removed next-page class from page');
    } else {
        page.classList.add('next-page');
        console.log('Added next-page class to page');
    }

    // Update the button appearance immediately
    updateNextPageButton(page);

    // Trigger pagination to adjust content flow
    setTimeout(() => {
        if (window.handlePagination) {
            window.handlePagination();
        }
    }, 100);
}

export function updateNextPageButton(targetElement) {
    const page = targetElement?.closest('.portrait-content, .landscape-content') ||
                 (targetElement?.classList.contains('portrait-content') || targetElement?.classList.contains('landscape-content') ? targetElement : null);

    const toggleNextPageBtn = document.getElementById('toggleNextPageBtn');
    if (toggleNextPageBtn && page) {
        const hasNextPage = page.classList.contains('next-page');
        if (hasNextPage) {
            toggleNextPageBtn.innerHTML = '<span style="color: #2196F3;">✓</span> Page Break Active';
            toggleNextPageBtn.style.fontWeight = 'bold';
            toggleNextPageBtn.style.backgroundColor = '#e3f2fd';
        } else {
            toggleNextPageBtn.textContent = 'Add Page Break';
            toggleNextPageBtn.style.fontWeight = 'normal';
            toggleNextPageBtn.style.backgroundColor = '';
        }
    }
}
