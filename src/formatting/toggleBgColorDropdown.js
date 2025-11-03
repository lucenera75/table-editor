

export function toggleBgColorDropdown() {
    const dropdown = document.getElementById('bgColorDropdown');
    const textDropdown = document.getElementById('textColorDropdown');
    textDropdown.classList.remove('show');
    dropdown.classList.toggle('show');
}
