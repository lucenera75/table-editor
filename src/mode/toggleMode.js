import { isDesignMode, setIsDesignMode } from '../state/variables.js';

export function toggleMode(button) {
    setIsDesignMode(!isDesignMode);
    const table = button.closest('table');
    if (!table) return;

    const spans = table.querySelectorAll('th > span, td > span');

    if (isDesignMode) {
        // Switch to DESIGN mode
        button.textContent = 'DESIGN';
        button.classList.remove('edit-mode');

        // Disable editing
        spans.forEach(span => {
            span.contentEditable = 'false';
        });

        // Show drag handles
        document.querySelectorAll('.row-drag-handle, .col-drag-handle').forEach(handle => {
            handle.style.display = 'flex';
        });
    } else {
        // Switch to EDIT mode
        button.textContent = 'EDIT';
        button.classList.add('edit-mode');

        // Enable editing
        spans.forEach(span => {
            span.contentEditable = 'true';
        });

        // Hide drag handles
        document.querySelectorAll('.row-drag-handle, .col-drag-handle').forEach(handle => {
            handle.style.display = 'none';
        });
    }
}
