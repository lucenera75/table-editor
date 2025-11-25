import { isUndoRedoInProgress, lastSnapshot, setIsUndoRedoInProgress, setLastSnapshot } from '../state/variables.js';
import { normalizeHtmlForComparison } from './normalizeHtmlForComparison.js';
import { reinitializeAfterRestore } from './reinitializeAfterRestore.js';

export function restoreSnapshot(snapshot) {
    if (!snapshot) return;

    setIsUndoRedoInProgress(true);

    // Find the editable container, fall back to body
    const container = document.getElementById('editable-contents-area') || document.body;

    // Save scroll position before restoring (window)
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Save scroll position of the container itself if it's scrollable
    const containerScrollTop = container.scrollTop || 0;
    const containerScrollLeft = container.scrollLeft || 0;

    // Save scroll positions of all scrollable elements within the container
    const scrollableElements = [];
    const allElements = container.querySelectorAll('*');

    allElements.forEach((element, index) => {
        if (element.scrollTop > 0 || element.scrollLeft > 0) {
            // Store scroll position along with a way to identify the element
            const tagName = element.tagName.toLowerCase();
            const className = element.className;
            const id = element.id;

            scrollableElements.push({
                index,
                tagName,
                className,
                id,
                scrollTop: element.scrollTop,
                scrollLeft: element.scrollLeft
            });
        }
    });

    try {
        // Restore the container's innerHTML
        container.innerHTML = snapshot.html;
        setLastSnapshot(normalizeHtmlForComparison(snapshot.html));
        console.log('Snapshot restored from', new Date(snapshot.timestamp).toLocaleTimeString());

        // Restore window scroll position
        window.scrollTo(scrollX, scrollY);

        // Restore container's scroll position
        container.scrollTop = containerScrollTop;
        container.scrollLeft = containerScrollLeft;

        // Restore scroll positions of scrollable elements
        scrollableElements.forEach(savedScroll => {
            let targetElement = null;

            // Try to find by ID first (most reliable)
            if (savedScroll.id) {
                targetElement = document.getElementById(savedScroll.id);
            }

            // If not found, try by class and tag within the container
            if (!targetElement && savedScroll.className) {
                const candidates = container.querySelectorAll(`${savedScroll.tagName}.${savedScroll.className.split(' ')[0]}`);
                if (candidates.length > 0) {
                    targetElement = candidates[0];
                }
            }

            // If still not found, try by index (least reliable but better than nothing)
            if (!targetElement) {
                const allNewElements = container.querySelectorAll('*');
                if (allNewElements[savedScroll.index]) {
                    const candidate = allNewElements[savedScroll.index];
                    if (candidate.tagName.toLowerCase() === savedScroll.tagName) {
                        targetElement = candidate;
                    }
                }
            }

            if (targetElement) {
                targetElement.scrollTop = savedScroll.scrollTop;
                targetElement.scrollLeft = savedScroll.scrollLeft;
            }
        });

        // Reinitialize everything after restoration
        setTimeout(() => {
            reinitializeAfterRestore();

            // Restore scroll positions again after reinitialize (in case they changed)
            window.scrollTo(scrollX, scrollY);

            // Restore container's scroll position again
            const restoredContainer = document.getElementById('editable-contents-area') || document.body;
            restoredContainer.scrollTop = containerScrollTop;
            restoredContainer.scrollLeft = containerScrollLeft;

            scrollableElements.forEach(savedScroll => {
                let targetElement = null;

                if (savedScroll.id) {
                    targetElement = document.getElementById(savedScroll.id);
                }

                if (!targetElement && savedScroll.className) {
                    const candidates = restoredContainer.querySelectorAll(`${savedScroll.tagName}.${savedScroll.className.split(' ')[0]}`);
                    if (candidates.length > 0) {
                        targetElement = candidates[0];
                    }
                }

                if (!targetElement) {
                    const allNewElements = restoredContainer.querySelectorAll('*');
                    if (allNewElements[savedScroll.index]) {
                        const candidate = allNewElements[savedScroll.index];
                        if (candidate.tagName.toLowerCase() === savedScroll.tagName) {
                            targetElement = candidate;
                        }
                    }
                }

                if (targetElement) {
                    targetElement.scrollTop = savedScroll.scrollTop;
                    targetElement.scrollLeft = savedScroll.scrollLeft;
                }
            });
        }, 10);
    } finally {
        setTimeout(() => {
            setIsUndoRedoInProgress(false);
        }, 50);
    }
}
