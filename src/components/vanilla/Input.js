export class Input extends HTMLElement {
  constructor() {
    super();
    this.input = document.createElement('input');

    // Copy attributes from custom element to input
    Array.from(this.attributes).forEach(attr => {
      if (attr.name !== 'class') {
        this.input.setAttribute(attr.name, attr.value);
      }
    });

    // Set initial classes
    this.updateClasses();

    // Forward common events
    ['change', 'input', 'focus', 'blur'].forEach(eventName => {
      this.input.addEventListener(eventName, (e) => {
        const event = new Event(eventName, { bubbles: true });
        // Add target property with value to the event
        Object.defineProperty(event, 'target', {
          writable: false,
          value: {
            value: this.input.value
          }
        });
        this.dispatchEvent(event);
      });
    });
  }

  updateClasses() {
    const allowedClasses = ['mb-4', 'w-full', 'sidebar-input'];
    const classes = ['vanilla-input'];

    if (this.hasAttribute('class')) {
      const customClasses = this.getAttribute('class').split(' ')
        .filter(cls => allowedClasses.includes(cls));
      classes.push(...customClasses);
    }

    this.input.className = classes.join(' ');
  }

  connectedCallback() {
    this.appendChild(this.input);
  }

  // Proxy common input properties
  get value() { return this.input.value; }
  set value(val) { this.input.value = val; }

  get disabled() { return this.input.disabled; }
  set disabled(val) { this.input.disabled = val; }

  get placeholder() { return this.input.placeholder; }
  set placeholder(val) { this.input.placeholder = val; }

  get type() { return this.input.type; }
  set type(val) { this.input.type = val; }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      if (name === 'class') {
        this.updateClasses();
      } else {
        this[name] = newValue;
      }
    }
  }
}

// Define the custom element
if (!customElements.get('vanilla-input')) {
  customElements.define('vanilla-input', Input);
}

// React wrapper
export const createReactInput = () => {
  class ReactInput extends Input {
    static get observedAttributes() {
      return ['value', 'disabled', 'placeholder', 'type', 'class'];
    }
  }

  if (!customElements.get('react-vanilla-input')) {
    customElements.define('react-vanilla-input', ReactInput);
  }

  return ReactInput;
};
