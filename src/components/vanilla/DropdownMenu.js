class DropdownMenu {
  constructor(element) {
    this.dropdown = element;
    this.button = element.querySelector('[data-dropdown-trigger]');
    this.menu = element.querySelector('.dropdown__menu');
    this.isOpen = false;

    this.init();
  }

  init() {
    // Toggle menu on button click
    this.button.addEventListener('click', () => this.toggle());

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.dropdown.contains(e.target)) {
        this.close();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menu.classList.add('dropdown__menu--open');
    this.button.setAttribute('aria-expanded', 'true');
  }

  close() {
    this.isOpen = false;
    this.menu.classList.remove('dropdown__menu--open');
    this.button.setAttribute('aria-expanded', 'false');
  }

  static initializeAll() {
    document.querySelectorAll('[data-component="dropdown"]').forEach(element => {
      new DropdownMenu(element);
    });
  }
}

// Auto-initialize if the script is loaded after DOM content
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DropdownMenu.initializeAll());
} else {
  DropdownMenu.initializeAll();
}

export default DropdownMenu;