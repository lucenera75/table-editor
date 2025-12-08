export function toggleBorderColorDropdown() {
    const dropdown = document.getElementById('borderColorDropdown');
    dropdown.classList.toggle('show');

    // Close other dropdowns
    document.getElementById('bgColorDropdown').classList.remove('show');
    document.getElementById('textColorDropdown').classList.remove('show');
}
