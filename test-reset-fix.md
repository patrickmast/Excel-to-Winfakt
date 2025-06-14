# Test Script for Reset State Fix

## The Problem
When clicking "New" and confirming, the green connected column cards in ConnectedColumns component were not being cleared, despite the RESET_STATE action being called.

## Root Cause
The ColumnMapper component was using its own instance of `useMappingReducer()`, creating a separate state that wasn't synchronized with the one in Index.tsx. When Index.tsx called `resetState()`, it only reset its own instance, not the one inside ColumnMapper.

## The Fix
1. Removed the duplicate `useMappingReducer()` call from ColumnMapper
2. Made ColumnMapper use only the props passed from the parent component
3. Added local UI state management for transient UI states (search, selected columns)
4. Updated the updateState function to properly communicate state changes back to the parent
5. Added proper connectionCounter management through props and callbacks

## Testing Steps
1. Start the development server: `npm run dev`
2. Upload a CSV file
3. Create some column mappings by connecting source columns to target columns
4. Click the "New" button
5. Confirm the action in the dialog
6. **Expected Result**: All green connected column cards should disappear
7. The source columns list should be empty
8. The file upload area should be shown again

## What Changed
- `src/components/ColumnMapper.tsx`: Removed duplicate state management, uses props only
- `src/hooks/use-mapping-reducer.ts`: Added INCREMENT_CONNECTION_COUNTER action
- `src/components/column-mapper/types.ts`: Added connectionCounter and onConnectionCounterUpdate props
- `src/pages/Index.tsx`: Added incrementConnectionCounter handler

## Key Insight
The issue was a classic React anti-pattern: having multiple sources of truth for the same state. By consolidating state management to a single location (Index.tsx) and passing it down as props, we ensure consistency across all components.