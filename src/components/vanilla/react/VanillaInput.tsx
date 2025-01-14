import React, { useEffect, useRef, forwardRef } from 'react';
import { createReactInput } from '../Input';
import '../Input.css';

// Create the React-specific web component
createReactInput();

// Declare the custom element type with proper input attributes
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'react-vanilla-input': React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
        class?: string;
      };
    }
  }
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const VanillaInput = forwardRef<HTMLInputElement, InputProps>(
  ({ className, onChange, ...props }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Forward the ref to the actual input element inside the web component
    useEffect(() => {
      if (ref && 'current' in ref && inputRef.current) {
        ref.current = inputRef.current.querySelector('input') || null;
      }
    }, [ref]);

    // Handle input events
    useEffect(() => {
      const input = inputRef.current;
      if (!input) return;

      const handleInput = (e: Event) => {
        if (onChange) {
          const customEvent = e as CustomEvent;
          const syntheticEvent = {
            target: customEvent.target,
            currentTarget: customEvent.target
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }
      };

      input.addEventListener('input', handleInput);
      return () => input.removeEventListener('input', handleInput);
    }, [onChange]);

    // Only use vanilla CSS classes
    const allowedClasses = ['mb-4', 'w-full', 'sidebar-input'];
    const classes = className?.split(' ')
      .filter(cls => allowedClasses.includes(cls)) || [];

    return (
      <react-vanilla-input
        {...props}
        ref={inputRef}
        class={classes.join(' ')}
      />
    );
  }
);

VanillaInput.displayName = 'VanillaInput';

export { VanillaInput };