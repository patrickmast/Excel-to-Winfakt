import './Dialog.css';

export class Dialog {
  constructor(options = {}) {
    this.options = {
      title: options.title || '',
      onClose: options.onClose || (() => {}),
      ...options
    };

    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleClickOutside = this.handleClickOutside.bind(this);
    this.close = this.close.bind(this);

    this.createDialog();
    this.addEventListeners();
  }

  createDialog() {
    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = 'dialog-overlay';

    // Create dialog
    this.dialog = document.createElement('div');
    this.dialog.className = 'dialog';
    this.dialog.setAttribute('role', 'dialog');
    this.dialog.setAttribute('aria-modal', 'true');
    if (this.options.title) {
      this.dialog.setAttribute('aria-labelledby', 'dialog-title');
    }

    // Create header
    const header = document.createElement('div');
    header.className = 'dialog-header';

    // Create title if provided
    if (this.options.title) {
      const title = document.createElement('h2');
      title.id = 'dialog-title';
      title.className = 'dialog-title';
      title.textContent = this.options.title;
      header.appendChild(title);
    }

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.className = 'dialog-close';
    closeButton.setAttribute('aria-label', 'Close dialog');
    closeButton.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"/>
      </svg>
    `;
    closeButton.addEventListener('click', this.close);
    header.appendChild(closeButton);

    // Create content container
    this.content = document.createElement('div');
    this.content.className = 'dialog-content';

    // Assemble dialog
    this.dialog.appendChild(header);
    this.dialog.appendChild(this.content);
    this.overlay.appendChild(this.dialog);
  }

  addEventListeners() {
    document.addEventListener('keydown', this.handleKeyDown);
    this.overlay.addEventListener('click', this.handleClickOutside);
  }

  removeEventListeners() {
    document.removeEventListener('keydown', this.handleKeyDown);
    this.overlay.removeEventListener('click', this.handleClickOutside);
  }

  handleKeyDown(event) {
    if (event.key === 'Escape') {
      this.close();
    }
  }

  handleClickOutside(event) {
    if (event.target === this.overlay) {
      this.close();
    }
  }

  setContent(content) {
    if (typeof content === 'string') {
      this.content.innerHTML = content;
    } else if (content instanceof Node) {
      this.content.innerHTML = '';
      this.content.appendChild(content);
    }
  }

  open() {
    document.body.appendChild(this.overlay);
    this.dialog.focus();
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.removeEventListeners();
    this.overlay.remove();
    document.body.style.overflow = '';
    if (this.options.onClose) {
      this.options.onClose();
    }
  }

  destroy() {
    this.removeEventListeners();
    if (this.overlay.parentNode) {
      this.overlay.remove();
    }
  }
}
