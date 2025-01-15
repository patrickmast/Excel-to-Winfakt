class Dropdown {
  static openDropdown = null;

  constructor(element) {
    this.dropdown = element;
    this.button = element.querySelector('[data-dropdown-trigger]');
    this.menu = element.querySelector('.dropdown__menu');
    this.isOpen = false;

    // Bind methods
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleEscape = this.handleEscape.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);

    this.init();
  }

  init() {
    // Toggle menu on button click
    this.button.addEventListener('click', (e) => {
      e.stopPropagation();

      // If there's another dropdown open, close it first
      if (Dropdown.openDropdown && Dropdown.openDropdown !== this) {
        Dropdown.openDropdown.close();
      }

      this.toggle();
    });

    // Handle item selection
    this.menu.addEventListener('click', this.handleItemClick);

    // Close menu when clicking outside
    document.addEventListener('click', this.handleClickOutside);

    // Close menu on Escape key
    document.addEventListener('keydown', this.handleEscape);
  }

  handleItemClick(e) {
    const item = e.target.closest('.dropdown__item');
    if (!item || item.disabled) return;

    const value = item.dataset.value;

    // For selection-style dropdowns (with data-value)
    if (value) {
      const event = new CustomEvent('change', {
        detail: { value }
      });
      this.dropdown.dispatchEvent(event);
    }

    // For menu-style dropdowns (with onClick handlers)
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window
    });
    item.dispatchEvent(clickEvent);

    this.close();
  }

  handleClickOutside(e) {
    if (!this.dropdown.contains(e.target)) {
      this.close();
    }
  }

  handleEscape(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  open() {
    this.isOpen = true;
    this.menu.classList.add('dropdown__menu--open');
    this.button.setAttribute('aria-expanded', 'true');
    Dropdown.openDropdown = this;
  }

  close() {
    this.isOpen = false;
    this.menu.classList.remove('dropdown__menu--open');
    this.button.setAttribute('aria-expanded', 'false');
    if (Dropdown.openDropdown === this) {
      Dropdown.openDropdown = null;
    }
  }

  destroy() {
    if (Dropdown.openDropdown === this) {
      Dropdown.openDropdown = null;
    }
    this.menu.removeEventListener('click', this.handleItemClick);
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleEscape);
  }
}

export default Dropdown;