

export function toggleTextMenuTextColorDropdown() {
    const dropdown = document.getElementById('textMenuTextColorDropdown');
    const bgDropdown = document.getElementById('textMenuBgColorDropdown');
    if (bgDropdown) bgDropdown.classList.remove('show');
    if (dropdown) dropdown.classList.toggle('show');
}
