# UI Rules for Excel to Winfakt

## Menu Items

### 1. No Text Wrapping in Menu Items

**IMPORTANT:** Menu item text should NEVER wrap to multiple lines. This creates a poor user experience and inconsistent UI appearance.

- u2705 **DO:** Keep menu item text concise and on a single line
- u274c **DO NOT:** Allow menu item text to wrap to multiple lines
- u2705 **DO:** Use CSS to prevent wrapping with `white-space: nowrap`

### Implementation

To prevent text wrapping in menu items:

```css
.menu-item {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
```

### Examples

**Good:**
- "Export CSV"
- "Select File"

**Avoid:**
- "Export CSV with all selected columns"
- "Select File from your computer"

## General UI Guidelines

1. **Consistency:** Maintain consistent styling across all menu items
2. **Brevity:** Keep menu item text brief and descriptive
3. **Clarity:** Use clear, action-oriented language
4. **Icons:** Use icons to complement text and improve visual recognition

## Translation Considerations

When translating menu items:

1. Keep translations concise to avoid wrapping issues
2. Test UI in all supported languages to ensure proper display
3. Consider using abbreviations if necessary to maintain single-line display
4. Ensure the menu container has sufficient width to accommodate longer translated text
