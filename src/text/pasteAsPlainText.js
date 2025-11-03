import { currentCell } from '../state/variables.js';

export async function pasteAsPlainText() {
    if (!currentCell) {
        alert('Please select a cell first');
        return;
    }

    try {
        // Try to read HTML from clipboard first, fallback to plain text
        const clipboardItems = await navigator.clipboard.read();
        let text = '';

        for (const item of clipboardItems) {
            if (item.types.includes('text/html')) {
                const blob = await item.getType('text/html');
                const html = await blob.text();
                // Strip HTML tags
                const temp = document.createElement('div');
                temp.innerHTML = html;
                text = temp.textContent || temp.innerText || '';
                break;
            } else if (item.types.includes('text/plain')) {
                const blob = await item.getType('text/plain');
                text = await blob.text();
                break;
            }
        }

        // Strip any remaining tags (HTML, XML, etc.) using regex
        text = text.replace(/<[^>]*>/g, '');

        const span = currentCell.querySelector('span');
        if (span) {
            span.textContent = text;
        } else {
            currentCell.textContent = text;
        }
    } catch (err) {
        // Fallback to simple readText if clipboard.read() fails
        try {
            let text = await navigator.clipboard.readText();
            // Strip any tags
            text = text.replace(/<[^>]*>/g, '');
            const span = currentCell.querySelector('span');
            if (span) {
                span.textContent = text;
            } else {
                currentCell.textContent = text;
            }
        } catch (fallbackErr) {
            alert('Failed to read clipboard. Please make sure you have granted clipboard permissions.');
        }
    }
}
