import { isUndoRedoInProgress, lastSnapshot, setIsUndoRedoInProgress, setLastSnapshot } from '../state/variables.js';
import { normalizeHtmlForComparison } from './normalizeHtmlForComparison.js';
import { reinitializeAfterRestore } from './reinitializeAfterRestore.js';

export function restoreSnapshot(snapshot) {
    if (!snapshot) return;

    setIsUndoRedoInProgress(true);

    // Save scroll position before restoring (window)
    const scrollX = window.scrollX || window.pageXOffset;
    const scrollY = window.scrollY || window.pageYOffset;

    // Save scroll positions of all scrollable elements
    const scrollableElements = [];
    const allElements = document.querySelectorAll('*');

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
        // Restore the entire body
        document.body.innerHTML = snapshot.html;
        setLastSnapshot(normalizeHtmlForComparison(snapshot.html));
        console.log('Snapshot restored from', new Date(snapshot.timestamp).toLocaleTimeString());

        // Restore window scroll position
        window.scrollTo(scrollX, scrollY);

        // Restore scroll positions of scrollable elements
        scrollableElements.forEach(savedScroll => {
            let targetElement = null;

            // Try to find by ID first (most reliable)
            if (savedScroll.id) {
                targetElement = document.getElementById(savedScroll.id);
            }

            // If not found, try by class and tag
            if (!targetElement && savedScroll.className) {
                const candidates = document.querySelectorAll(`${savedScroll.tagName}.${savedScroll.className.split(' ')[0]}`);
                if (candidates.length > 0) {
                    targetElement = candidates[0];
                }
            }

            // If still not found, try by index (least reliable but better than nothing)
            if (!targetElement) {
                const allNewElements = document.querySelectorAll('*');
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

            scrollableElements.forEach(savedScroll => {
                let targetElement = null;

                if (savedScroll.id) {
                    targetElement = document.getElementById(savedScroll.id);
                }

                if (!targetElement && savedScroll.className) {
                    const candidates = document.querySelectorAll(`${savedScroll.tagName}.${savedScroll.className.split(' ')[0]}`);
                    if (candidates.length > 0) {
                        targetElement = candidates[0];
                    }
                }

                if (!targetElement) {
                    const allNewElements = document.querySelectorAll('*');
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
