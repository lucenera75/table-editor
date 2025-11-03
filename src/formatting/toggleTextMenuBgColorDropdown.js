

export function toggleTextMenuBgColorDropdown() {
    const dropdown = document.getElementById('textMenuBgColorDropdown');
    const textDropdown = document.getElementById('textMenuTextColorDropdown');
    if (textDropdown) textDropdown.classList.remove('show');
    if (dropdown) dropdown.classList.toggle('show');
}
