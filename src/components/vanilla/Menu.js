import './Menu.css';

export class Menu {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      align: options.align || 'end',
      onChange: options.onChange || null,
      ...options
    };

    this.isOpen = false;
    this.button = container.querySelector('button[data-component="button"]');
    this.menu = container.querySelector('.menu');

    this.handleButtonClick = this.handleButtonClick.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleItemClick = this.handleItemClick.bind(this);

    this.setupMenu();
  }

  setupMenu() {
    // Set up button click handler
    this.button.addEventListener('click', this.handleButtonClick);

    // Set up menu alignment
    if (this.options.align === 'end') {
      this.menu.style.right = '0';
    } else {
      this.menu.style.left = '0';
    }

    // Set up item click handlers
    const items = this.menu.querySelectorAll('.menu__item');
    items.forEach(item => {
      item.addEventListener('click', this.handleItemClick);
    });
  }

  handleButtonClick() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  handleClickOutside(event) {
    if (!this.container.contains(event.target)) {
      this.close();
    }
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  handleItemClick(event) {
    const item = event.currentTarget;
    const value = item.dataset.value;

    if (this.options.onChange && value) {
      this.options.onChange(value);
    }

    this.close();
  }

  open() {
    if (this.isOpen) return;

    this.isOpen = true;
    this.button.setAttribute('aria-expanded', 'true');
    this.menu.classList.add('menu--open');

    // Add global event listeners
    document.addEventListener('click', this.handleClickOutside);
    document.addEventListener('keydown', this.handleKeyDown);
  }

  close() {
    if (!this.isOpen) return;

    this.isOpen = false;
    this.button.setAttribute('aria-expanded', 'false');
    this.menu.classList.remove('menu--open');

    // Remove global event listeners
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  destroy() {
    // Remove event listeners
    this.button.removeEventListener('click', this.handleButtonClick);
    document.removeEventListener('click', this.handleClickOutside);
    document.removeEventListener('keydown', this.handleKeyDown);

    const items = this.menu.querySelectorAll('.menu__item');
    items.forEach(item => {
      item.removeEventListener('click', this.handleItemClick);
    });

    // Close menu if open
    if (this.isOpen) {
      this.close();
    }
  }
}