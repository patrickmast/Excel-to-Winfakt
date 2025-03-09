# Translation Rules for CSV Transformer Hero

## Critical Rules

### 1. DO NOT Translate CSV Column Names

**IMPORTANT:** The column names in the exported CSV files must NEVER be translated. These column names are FIXED and cannot be changed, regardless of the UI language setting.

- ✅ **DO:** Translate UI elements like buttons, labels, menu items, and messages
- ❌ **DO NOT:** Translate any column names or data structure in the exported CSV files

### Technical Implementation

The application is designed to preserve the original column structure when exporting:

- The export process directly maps source columns to target columns without applying any translation functions
- CSV generation uses the original object keys (column names) directly
- Translation functions are only used for UI elements, not for data processing or column names

### Rationale

The exported CSV files need to maintain consistent column names for compatibility with external systems and data processing workflows. Translating these column names would break integrations and data pipelines that depend on specific column name formats.

## General Translation Guidelines

1. **UI Elements:** All user interface elements should be translated to provide a consistent experience in the selected language
2. **Error Messages:** Ensure all error and status messages are translated
3. **Documentation:** In-app help text and documentation should be translated
4. **Consistency:** Maintain consistent terminology across the application
5. **Menu Items:** Never allow menu item text to wrap to multiple lines
   - Keep translations concise and on a single line
   - Use CSS `white-space: nowrap` to prevent wrapping
   - Ensure the menu container has sufficient width for translated text

## Adding New Translations

When adding new UI elements:

1. Add the translation key to both language files (`en.json` and `nl.json`)
2. Use the translation function (`t()`) in the component
3. Test the UI in both languages to ensure proper display

## Testing Translations

Before submitting changes:

1. Switch between languages to verify all UI elements are properly translated
2. Verify that exported CSV files maintain the correct column names regardless of language setting
