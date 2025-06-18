# PM7 Dialog Analysis - Button Configurations

## Overview
This document provides a comprehensive analysis of all dialog implementations in the Excel-to-Winfakt codebase, focusing on their button configurations and identifying which dialogs need migration to PM7Dialog components.

## PM7Dialog Implementations (Already Migrated)

### 1. SaveConfigDialog.tsx
- **Location**: `src/components/dialogs/SaveConfigDialog.tsx`
- **Footer Buttons**:
  - Left: "Annuleren" (variant="outline")
  - Right: "Opslaan" (default variant) - **PRIMARY ACTION**
- **Footer Classes**: `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2`

### 2. LoadConfigDialog.tsx
- **Location**: `src/components/dialogs/LoadConfigDialog.tsx`
- **Footer Buttons**:
  - Left: "Annuleren" (variant="outline")
  - Right: "Laden" (default variant) - **PRIMARY ACTION**
- **Footer Classes**: `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2`

### 3. DeleteConfigDialog.tsx
- **Location**: `src/components/dialogs/DeleteConfigDialog.tsx`
- **Footer Buttons**:
  - Left: "Annuleren" (variant="outline")
  - Right: "X verwijderen" (variant="destructive") - **PRIMARY ACTION**
- **Footer Classes**: `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2`
- **Note**: Also includes a nested AlertDialog for confirmation

### 4. UnsavedChangesDialog.tsx
- **Location**: `src/components/dialogs/UnsavedChangesDialog.tsx`
- **Footer Buttons**:
  - Far Left: "Annuleren" (variant="outline", className="mr-auto")
  - Center: "Verwijderen" (variant="destructive")
  - Right: "Opslaan" (default variant) - **PRIMARY ACTION**
- **Footer Classes**: `flex flex-row justify-end space-x-2 bg-gray-50 px-6 py-4 border-t`
- **Special**: Three-button layout with cancel on far left

### 5. NewConfirmDialog.tsx
- **Location**: `src/components/dialogs/NewConfirmDialog.tsx`
- **Footer Buttons**:
  - Left: "Annuleren" (variant="outline")
  - Right: "Bevestigen" (custom blue style) - **PRIMARY ACTION**
- **Footer Classes**: None (default PM7DialogFooter)
- **Custom Styling**: Right button uses inline style for blue color

### 6. DocumentationDialog.tsx
- **Location**: `src/components/dialogs/DocumentationDialog.tsx`
- **Footer Buttons**: None (documentation only, no footer)
- **Special**: Large content dialog with scrollable body

### 7. LogDialog.tsx
- **Location**: `src/components/column-mapper/LogDialog.tsx`
- **Footer Buttons**:
  - Left: "Close" (variant="outline")
  - Right: "Download CSV" (default variant) - **PRIMARY ACTION**
- **Footer Classes**: None (default PM7DialogFooter)

## Dialogs Still Using Old Dialog Component (Need Migration)

### 1. SavedConfigDialog.tsx
- **Location**: `src/components/column-mapper/SavedConfigDialog.tsx`
- **Current Implementation**: Uses old Dialog from ui/dialog
- **Footer**: No DialogFooter - buttons are in the content
- **Buttons**: Copy button within content area
- **Migration Priority**: Low (simple notification dialog)

### 2. InfoDialog.tsx
- **Location**: `src/components/column-mapper/InfoDialog.tsx`
- **Current Implementation**: Uses old Dialog from ui/dialog
- **Footer**: Custom footer with language selector and close button
- **Buttons**: 
  - Language selector (dropdown)
  - "Close" button (custom blue styling)
- **Footer Classes**: Custom footer div with gray background
- **Migration Priority**: Medium (custom footer layout)

### 3. ColumnSettingsDialog.tsx
- **Location**: `src/components/column-mapper/ColumnSettingsDialog.tsx`
- **Current Implementation**: Uses old Dialog from ui/dialog
- **Footer**: Custom footer div
- **Buttons**:
  - Left: "Cancel" (variant="outline")
  - Right: "Save" (custom blue styling) - **PRIMARY ACTION**
- **Footer Classes**: `p-5 bg-gray-50 flex justify-end gap-3`
- **Migration Priority**: High (complex dialog with tabs)

### 4. FilterDialog.tsx
- **Location**: `src/components/column-mapper/FilterDialog.tsx`
- **Current Implementation**: Uses old Dialog from ui/dialog
- **Footer**: Custom DialogFooter
- **Buttons**:
  - Far Left: "Clear Filter" (variant="outline", mr-auto)
  - Center-Left: "Test Expression" (conditional, variant="outline")
  - Center-Right: "Cancel" (variant="outline")
  - Right: "Apply Filter" (blue styling) - **PRIMARY ACTION**
- **Footer Classes**: `p-5 bg-gray-50 flex justify-end gap-3 -mx-6 -mb-6 rounded-b-lg`
- **Migration Priority**: High (complex dialog with multiple modes)

## Common Patterns Observed

### Button Positioning
1. **Standard Pattern**: Cancel/Secondary on left, Primary action on right
2. **Three-Button Pattern**: Cancel far left (mr-auto), Destructive center, Primary right
3. **Special Cases**: Clear/Reset buttons positioned far left with mr-auto

### Button Variants
- **Primary Actions**: Usually default variant or custom blue styling
- **Cancel/Close**: Always variant="outline"
- **Destructive Actions**: variant="destructive" (delete, discard)
- **Secondary Actions**: variant="outline" or variant="ghost"

### Footer Styling
- **PM7DialogFooter Default**: Handles responsive layout automatically
- **Custom Classes Used**:
  - `flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2` (responsive)
  - `bg-gray-50 px-6 py-4 border-t` (custom background and padding)
  - `-mx-6 -mb-6 rounded-b-lg` (extend to dialog edges)

### Primary Action Identification
- Primary actions are always positioned on the right
- Usually have default variant or custom blue styling
- Represent the main affirmative action (Save, Load, Apply, Download)

## Recommendations for Migration

1. **Maintain Consistency**: Keep button positioning consistent (Cancel left, Primary right)
2. **Use PM7 Variants**: Leverage PM7Dialog's built-in button variants
3. **Preserve Special Layouts**: Three-button layouts and far-left positioning for special actions
4. **Custom Styling**: Where custom blue buttons exist, consider if PM7 has equivalent styling
5. **Footer Classes**: Use PM7DialogFooter's default responsive classes where possible