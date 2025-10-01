# CSV Import/Export Feature

## ✅ Implementation Complete

The CSV Import/Export feature is now fully functional, allowing users to bulk-add cards and backup their decks.

## Features

### Import
- **File Picker**: Select CSV files from device
- **Delimiter Options**: Comma, Tab, Semicolon, Pipe
- **Header Toggle**: Option to skip first row
- **Preview**: Shows first 5 cards before import
- **Validation**: Checks for errors and shows card count
- **Bulk Import**: Imports all valid cards at once

### Export
- **Delimiter Options**: Choose export format
- **Header Toggle**: Include/exclude header row
- **Web Download**: Automatic download on web
- **Filename**: Auto-generated with deck name and timestamp

## How to Use

### Importing Cards

1. Go to **Deck Detail** screen
2. Tap **Import Cards** button
3. Select delimiter (default: Comma)
4. Toggle "First row is header" if needed
5. Tap **Select CSV File**
6. Choose your CSV file
7. Review the preview
8. Tap **Import Cards**
9. Confirm the import

### Exporting Deck

1. Go to **Deck Detail** screen
2. Tap **Export Deck** button
3. Select delimiter (default: Comma)
4. Toggle "Include header row" if needed
5. Tap **Export CSV**
6. File downloads automatically (web)

## CSV Format

### Basic Format (Comma-separated)
```csv
Front,Back
What is 2+2?,4
Capital of France?,Paris
```

### With Header
```csv
Question,Answer
What is 2+2?,4
Capital of France?,Paris
```

### Tab-separated
```tsv
Front	Back
What is 2+2?	4
Capital of France?	Paris
```

### Semicolon-separated
```csv
Front;Back
What is 2+2?;4
Capital of France?;Paris
```

## Sample File

A sample CSV file is included: `sample_flashcards.csv`

Contains 10 general knowledge flashcards for testing.

## Technical Details

### Supported Delimiters
- `,` (Comma) - Default
- `\t` (Tab)
- `;` (Semicolon)
- `|` (Pipe)

### Validation
- Checks for empty files
- Validates column count
- Ensures front and back fields exist
- Reports errors with line numbers

### Features
- **Fuzzy Parsing**: Handles quoted fields
- **Escape Support**: Handles quotes within quotes
- **Error Handling**: Clear error messages
- **Preview**: Shows sample before import
- **Confirmation**: Asks before importing

### Platform Support
- ✅ **Web**: Full support (import + export)
- ⚠️ **Android**: Import works, export coming soon
- ⚠️ **iOS**: Import works, export coming soon

## File Structure

```
src/
├── components/
│   └── ImportExportModal.tsx    # Import/Export UI
├── utils/
│   └── csvImportExport.ts        # CSV parsing logic
└── screens/
    └── DeckDetailScreen.tsx      # Integration point
```

## Future Enhancements

- [ ] Mobile export with sharing
- [ ] Drag & drop import (web)
- [ ] Excel file support (.xlsx)
- [ ] Import from URL
- [ ] Batch export (multiple decks)
- [ ] Import with images
- [ ] Custom column mapping
- [ ] Import progress indicator

## Testing

1. **Create a test deck**
2. **Import sample_flashcards.csv**
3. **Verify 10 cards imported**
4. **Export the deck**
5. **Re-import to verify format**

## Notes

- CSV files must be UTF-8 encoded
- Maximum recommended: 1000 cards per import
- Large imports may take a few seconds
- Duplicate cards are not automatically detected
- Existing cards are not overwritten

---

**Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: October 1, 2025
