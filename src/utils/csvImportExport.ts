import { Card } from '../types';

export interface CSVImportOptions {
  delimiter: string;
  hasHeader: boolean;
  frontColumnIndex: number;
  backColumnIndex: number;
}

export const DEFAULT_CSV_OPTIONS: CSVImportOptions = {
  delimiter: ',',
  hasHeader: true,
  frontColumnIndex: 0,
  backColumnIndex: 1,
};

/**
 * Parse CSV content into card data
 */
export const parseCSV = (
  content: string,
  options: CSVImportOptions = DEFAULT_CSV_OPTIONS
): { front: string; back: string }[] => {
  const lines = content.split('\n').filter((line) => line.trim());
  const startIndex = options.hasHeader ? 1 : 0;
  const cards: { front: string; back: string }[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = parseCSVLine(line, options.delimiter);
    
    if (
      columns.length > options.frontColumnIndex &&
      columns.length > options.backColumnIndex
    ) {
      const front = columns[options.frontColumnIndex].trim();
      const back = columns[options.backColumnIndex].trim();
      
      if (front && back) {
        cards.push({ front, back });
      }
    }
  }

  return cards;
};

/**
 * Parse a single CSV line, handling quoted values
 */
const parseCSVLine = (line: string, delimiter: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  // Remove surrounding quotes if present
  return result.map((field) => {
    const trimmed = field.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  });
};

/**
 * Export cards to CSV format
 */
export const exportToCSV = (
  cards: Card[],
  options: {
    delimiter: string;
    includeHeader: boolean;
    includeMetadata: boolean;
  } = {
    delimiter: ',',
    includeHeader: true,
    includeMetadata: false,
  }
): string => {
  const lines: string[] = [];

  // Add header
  if (options.includeHeader) {
    if (options.includeMetadata) {
      lines.push(
        ['Front', 'Back', 'State', 'Interval', 'Ease Factor', 'Repetitions']
          .join(options.delimiter)
      );
    } else {
      lines.push(['Front', 'Back'].join(options.delimiter));
    }
  }

  // Add cards
  for (const card of cards) {
    const front = escapeCSVField(card.front, options.delimiter);
    const back = escapeCSVField(card.back, options.delimiter);

    if (options.includeMetadata) {
      lines.push(
        [
          front,
          back,
          card.state,
          card.interval.toFixed(1),
          card.easeFactor.toFixed(2),
          card.repetitions.toString(),
        ].join(options.delimiter)
      );
    } else {
      lines.push([front, back].join(options.delimiter));
    }
  }

  return lines.join('\n');
};

/**
 * Escape CSV field if it contains special characters
 */
const escapeCSVField = (field: string, delimiter: string): string => {
  if (
    field.includes(delimiter) ||
    field.includes('"') ||
    field.includes('\n')
  ) {
    // Escape quotes by doubling them
    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
  return field;
};

/**
 * Save CSV content to file (mobile)
 */
export const saveCSVToFile = async (
  content: string,
  filename: string
): Promise<string> => {
  // Note: For web, this won't work. Use downloadCSVWeb instead.
  // For mobile, you'll need to use expo-document-picker or expo-sharing
  // This is a placeholder for the actual implementation
  const fileUri = filename; // Placeholder
  console.warn('saveCSVToFile: Not fully implemented. Use platform-specific file pickers.');
  return fileUri;
};

/**
 * Read CSV from file (mobile)
 */
export const readCSVFromFile = async (fileUri: string): Promise<string> => {
  // Note: This requires expo-document-picker for actual file selection
  // This is a placeholder for the actual implementation
  console.warn('readCSVFromFile: Not fully implemented. Use expo-document-picker.');
  return '';
};

/**
 * Download CSV for web
 */
export const downloadCSVWeb = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Validate CSV content
 */
export const validateCSV = (
  content: string,
  options: CSVImportOptions = DEFAULT_CSV_OPTIONS
): { valid: boolean; errors: string[]; cardCount: number } => {
  const errors: string[] = [];
  
  if (!content || content.trim().length === 0) {
    errors.push('CSV file is empty');
    return { valid: false, errors, cardCount: 0 };
  }

  const lines = content.split('\n').filter((line) => line.trim());
  const startIndex = options.hasHeader ? 1 : 0;
  
  if (lines.length <= startIndex) {
    errors.push('CSV file has no data rows');
    return { valid: false, errors, cardCount: 0 };
  }

  let validCards = 0;
  for (let i = startIndex; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i], options.delimiter);
    
    if (columns.length <= Math.max(options.frontColumnIndex, options.backColumnIndex)) {
      errors.push(`Line ${i + 1}: Not enough columns`);
      continue;
    }

    const front = columns[options.frontColumnIndex]?.trim();
    const back = columns[options.backColumnIndex]?.trim();

    if (!front || !back) {
      errors.push(`Line ${i + 1}: Empty front or back field`);
      continue;
    }

    validCards++;
  }

  return {
    valid: validCards > 0,
    errors,
    cardCount: validCards,
  };
};

/**
 * Auto-detect delimiter
 */
export const detectDelimiter = (content: string): string => {
  const firstLine = content.split('\n')[0];
  const delimiters = [',', '\t', ';', '|'];
  
  let maxCount = 0;
  let detectedDelimiter = ',';

  for (const delimiter of delimiters) {
    const count = (firstLine.match(new RegExp(`\\${delimiter}`, 'g')) || []).length;
    if (count > maxCount) {
      maxCount = count;
      detectedDelimiter = delimiter;
    }
  }

  return detectedDelimiter;
};
