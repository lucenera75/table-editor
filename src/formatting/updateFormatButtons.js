import { selectedCells } from '../state/variables.js';

export function updateFormatButtons() {
    if (selectedCells.length === 0) return;

    const boldBtn = document.getElementById('boldBtn');
    const italicBtn = document.getElementById('italicBtn');
    const underlineBtn = document.getElementById('underlineBtn');
    const strikeBtn = document.getElementById('strikeBtn');

    // Check if all cells have each format (check span inside cell if it exists)
    const allBold = selectedCells.every(cell => {
        const span = cell.querySelector('span');
        const target = span || cell;
        const weight = window.getComputedStyle(target).fontWeight;
        return weight === 'bold' || weight === '700';
    });

    const allItalic = selectedCells.every(cell => {
        const span = cell.querySelector('span');
        const target = span || cell;
        return window.getComputedStyle(target).fontStyle === 'italic';
    });

    const allUnderlined = selectedCells.every(cell => {
        const span = cell.querySelector('span');
        const target = span || cell;
        return window.getComputedStyle(target).textDecoration.includes('underline');
    });

    const allStrikethrough = selectedCells.every(cell => {
        const span = cell.querySelector('span');
        const target = span || cell;
        return window.getComputedStyle(target).textDecoration.includes('line-through');
    });

    // Update button states - only show active if ALL cells have the format
    if (boldBtn) boldBtn.style.backgroundColor = allBold ? '#007bff' : '';
    if (italicBtn) italicBtn.style.backgroundColor = allItalic ? '#007bff' : '';
    if (underlineBtn) underlineBtn.style.backgroundColor = allUnderlined ? '#007bff' : '';
    if (strikeBtn) strikeBtn.style.backgroundColor = allStrikethrough ? '#007bff' : '';
}
