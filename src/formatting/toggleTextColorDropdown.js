

export function toggleTextColorDropdown() {
    const dropdown = document.getElementById('textColorDropdown');
    const bgDropdown = document.getElementById('bgColorDropdown');
    bgDropdown.classList.remove('show');
    dropdown.classList.toggle('show');
}
