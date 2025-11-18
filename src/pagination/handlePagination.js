// Handle automatic pagination following pseudocode_for_pagination.txt

let isPaginating = false;

export function handlePagination() {
    if (isPaginating) {
        console.log('Already paginating, skipping...');
        return;
    }

    console.log('=== Starting pagination ===');
    isPaginating = true;

    try {
        repaginate();
    } finally {
        isPaginating = false;
        console.log('=== Pagination complete ===');
    }
}

function repaginate() {
    const pageClasses = ["portrait-content", "landscape-content"];

    // Get all pages (containers with pageClasses)
    const pages = [];
    pageClasses.forEach(pageClass => {
        const containers = document.querySelectorAll(`.${pageClass}`);
        pages.push(...containers);
    });

    console.log(`Found ${pages.length} pages`);

    // Process each page
    pages.forEach((page, index) => {
        console.log(`\nProcessing page ${index}...`);
        processPage(page);
    });
}

function tryPullFromNextPage(currentPage, currentPageRect, currentPageHeight, currentStaticChildren, effectiveBottom) {
    // Check if there's a next page with same className
    const nextPage = currentPage.nextElementSibling;
    const hasMatchingNextPage = nextPage && (
        (currentPage.classList.contains('portrait-content') && nextPage.classList.contains('portrait-content')) ||
        (currentPage.classList.contains('landscape-content') && nextPage.classList.contains('landscape-content'))
    );

    if (!hasMatchingNextPage) {
        return; // No next page to pull from
    }

    // Get static children from next page
    const nextStaticChildren = Array.from(nextPage.children).filter(child => {
        const position = window.getComputedStyle(child).position;
        return position === 'static' || position === 'relative';
    });

    if (nextStaticChildren.length === 0) {
        return; // Nothing to pull
    }

    // Calculate available space in current page
    let currentContentBottom = currentPageRect.top;
    if (currentStaticChildren.length > 0) {
        const lastChild = currentStaticChildren[currentStaticChildren.length - 1];
        currentContentBottom = lastChild.getBoundingClientRect().bottom;
    }

    const availableSpace = (effectiveBottom - currentContentBottom) - 50; // 50px safety margin

    console.log(`  Available space in current page: ${availableSpace}px`);

    if (availableSpace <= 50) {
        return; // Not enough space
    }

    // Try to pull elements from next page
    let elementsToPull = [];
    let accumulatedHeight = 0;

    for (const nextChild of nextStaticChildren) {
        const childRect = nextChild.getBoundingClientRect();
        const childHeight = childRect.height;

        if (accumulatedHeight + childHeight <= availableSpace) {
            elementsToPull.push(nextChild);
            accumulatedHeight += childHeight;
        } else {
            break; // Can't fit any more
        }
    }

    if (elementsToPull.length > 0) {
        console.log(`  ← Pulling ${elementsToPull.length} elements from next page`);

        // Move elements to current page
        elementsToPull.forEach(el => {
            currentPage.appendChild(el);
        });

        // If next page is now empty (no static children), remove it
        const remainingNextStatic = Array.from(nextPage.children).filter(child => {
            const position = window.getComputedStyle(child).position;
            return position === 'static' || position === 'relative';
        });

        if (remainingNextStatic.length === 0) {
            console.log(`  Removing empty next page`);
            nextPage.remove();
        }
    }
}

function processPage(page) {
    const pageRect = page.getBoundingClientRect();
    const pageHeight = pageRect.height;

    // Get all direct children that are statically positioned
    const directChildren = Array.from(page.children);
    const staticChildren = directChildren.filter(child => {
        const position = window.getComputedStyle(child).position;
        return position === 'static' || position === 'relative';
    });

    console.log(`  Found ${staticChildren.length} static children`);

    // Find absolutely positioned headers and footers
    const absoluteChildren = directChildren.filter(child => {
        return window.getComputedStyle(child).position === 'absolute';
    });

    // Calculate effective page top (after header)
    let effectiveTop = pageRect.top;
    const headers = absoluteChildren.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.top <= pageRect.top + 50; // Header at top (within 50px of top)
    });
    if (headers.length > 0) {
        effectiveTop = Math.max(...headers.map(h => h.getBoundingClientRect().bottom));
    }

    // Calculate effective page bottom (before footer)
    let effectiveBottom = pageRect.bottom;
    const footers = absoluteChildren.filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.bottom >= pageRect.bottom - 50; // Footer at bottom (within 50px of bottom)
    });
    if (footers.length > 0) {
        effectiveBottom = Math.min(...footers.map(f => f.getBoundingClientRect().top));
    }

    console.log(`  Effective bounds: top=${effectiveTop}, bottom=${effectiveBottom}`);

    // First, try to pull elements from next page if this page has space
    tryPullFromNextPage(page, pageRect, pageHeight, staticChildren, effectiveBottom);

    // Re-get static children after potential pulls
    const updatedChildren = Array.from(page.children).filter(child => {
        const position = window.getComputedStyle(child).position;
        return position === 'static' || position === 'relative';
    });

    // Find first element that is not fully visible
    let cutIndex = -1;
    const effectivePageHeight = effectiveBottom - effectiveTop;

    for (let i = 0; i < updatedChildren.length; i++) {
        const child = updatedChildren[i];
        const childRect = child.getBoundingClientRect();
        const childHeight = childRect.height;

        // Check if element is fully visible (bottom within effective page bounds)
        const isFullyVisible = childRect.bottom <= effectiveBottom + 10; // 10px tolerance

        if (!isFullyVisible) {
            // Check if this single element is taller than the effective page height
            if (childHeight > effectivePageHeight - 50) { // 50px safety margin
                console.log(`  → Element ${i} is too tall for a single page (${childHeight}px > ${effectivePageHeight}px)`);

                // Skip this element but continue checking from next element
                // Move this oversized element to next page
                cutIndex = i;
                break;
            } else {
                cutIndex = i;
                console.log(`  → Element ${i} not fully visible, cutting from here`);
                break;
            }
        }
    }

    // If all elements are visible, nothing to do
    if (cutIndex === -1) {
        console.log(`  ✓ All elements visible`);
        return;
    }

    // Cut this element and all following elements
    const elementsToCut = updatedChildren.slice(cutIndex);
    console.log(`  Cutting ${elementsToCut.length} elements`);

    // Check if immediate next sibling has same className as current page
    const nextPage = page.nextElementSibling;
    const hasMatchingNextPage = nextPage && (
        (page.classList.contains('portrait-content') && nextPage.classList.contains('portrait-content')) ||
        (page.classList.contains('landscape-content') && nextPage.classList.contains('landscape-content'))
    );

    if (hasMatchingNextPage) {
        console.log(`  → Moving to existing next page`);
        // Add elements as first children in next page
        moveElementsToExistingPage(elementsToCut, nextPage);
    } else {
        console.log(`  → Creating new page`);
        // Create new page with same className and insert immediately after
        const newPage = createNewPage(page);
        page.after(newPage);

        // Move elements to new page
        elementsToCut.forEach(el => newPage.appendChild(el));
    }
}

function moveElementsToExistingPage(elements, targetPage) {
    // Find first statically positioned child in target page
    const targetChildren = Array.from(targetPage.children);
    const firstStatic = targetChildren.find(child => {
        const position = window.getComputedStyle(child).position;
        return position === 'static' || position === 'relative';
    });

    // Insert elements at the beginning
    elements.forEach((el, index) => {
        if (firstStatic && index === 0) {
            targetPage.insertBefore(el, firstStatic);
        } else if (index === 0) {
            // No static children yet, append
            targetPage.appendChild(el);
        } else {
            // Insert after previous element
            elements[index - 1].after(el);
        }
    });
}

function createNewPage(templatePage) {
    const newPage = document.createElement('div');

    // Copy all classes from template
    newPage.className = templatePage.className;

    // Copy attributes
    if (templatePage.hasAttribute('contenteditable')) {
        newPage.contentEditable = templatePage.contentEditable;
    }
    if (templatePage.hasAttribute('data-orientation')) {
        newPage.setAttribute('data-orientation', templatePage.getAttribute('data-orientation'));
    }
    if (templatePage.hasAttribute('style')) {
        newPage.setAttribute('style', templatePage.getAttribute('style'));
    }

    // Copy absolutely positioned elements (headers, footers, etc.)
    const absoluteElements = Array.from(templatePage.children).filter(child => {
        return window.getComputedStyle(child).position === 'absolute';
    });

    absoluteElements.forEach(absEl => {
        const clone = absEl.cloneNode(true);
        newPage.appendChild(clone);
    });

    return newPage;
}
