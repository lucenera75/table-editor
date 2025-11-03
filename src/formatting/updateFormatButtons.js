import { selectedCells } from '../state/variables.js';

export function updateFormatButtons() {
    if (selectedCells.length === 0) return;

    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const strikeBtn = document.getElementById('strikeBtn');

    // Check if all cells have each format
    const allBold = selectedCells.every(cell => {
        const weight = window.getComputedStyle(cell).fontWeight;
        return weight === 'bold' || weight === '700';
    });

    const allItalic = selectedCells.every(cell => {
        return window.getComputedStyle(cell).fontStyle === 'italic';
    });

    const allUnderlined = selectedCells.every(cell => {
        return window.getComputedStyle(cell).textDecoration.includes('underline');
    });

    const allStrikethrough = selectedCells.every(cell => {
        return window.getComputedStyle(cell).textDecoration.includes('line-through');
    });

    // Update button states - only show active if ALL cells have the format
    if (boldBtn) boldBtn.style.backgroundColor = allBold ? '#007bff' : '';
    if (italicBtn) italicBtn.style.backgroundColor = allItalic ? '#007bff' : '';
    if (underlineBtn) underlineBtn.style.backgroundColor = allUnderlined ? '#007bff' : '';
    if (strikeBtn) strikeBtn.style.backgroundColor = allStrikethrough ? '#007bff' : '';
}
