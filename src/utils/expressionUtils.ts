// No preprocessing needed - let JavaScript handle the syntax naturally

// Convert Excel column letter to index (A -> 0, B -> 1, etc.)
export const excelColumnToIndex = (column: string): number => {
  let index = 0;
  for (let i = 0; i < column.length; i++) {
    index = index * 26 + (column.charCodeAt(i) - 65 + 1);
  }
  return index - 1;
};

// Create a proxy object that supports different column access patterns
export const createColumnProxy = (rowData: any, sourceColumns: string[]) => {
  return new Proxy(rowData, {
    get(target, prop) {
      const propStr = String(prop);
      
      // Priority 1: Direct property access with exact column name match
      if (prop in target) {
        return target[prop as string];
      }
      
      // Priority 2: Numeric column index (1-based, as used by Excel letters)
      const numProp = Number(prop);
      if (!isNaN(numProp) && numProp >= 0) {
        if (numProp < sourceColumns.length) {
          const columnName = sourceColumns[numProp];
          return target[columnName];
        }
      }
      
      // Priority 3: Check if it's a letter (for col["A"] syntax - explicit string)
      if (typeof prop === 'string' && /^[A-Z]+$/i.test(propStr)) {
        const columnIndex = excelColumnToIndex(propStr.toUpperCase());
        if (columnIndex < sourceColumns.length) {
          const columnName = sourceColumns[columnIndex];
          return target[columnName];
        }
      }
      
      // Priority 4: Exact column name match (case sensitive)
      const exactMatch = sourceColumns.find(colName => colName === propStr);
      if (exactMatch && exactMatch in target) {
        return target[exactMatch];
      }
      
      // Priority 5: Case-insensitive column name match (fallback)
      const caseInsensitiveMatch = sourceColumns.find(colName => 
        colName.toLowerCase() === propStr.toLowerCase()
      );
      if (caseInsensitiveMatch && caseInsensitiveMatch in target) {
        return target[caseInsensitiveMatch];
      }
      
      return undefined;
    }
  });
};

// Create wrapper function with all case variations and Excel letter variables
export const createExpressionWrapper = (expression: string, sourceColumns: string[]) => {
  // Generate Excel letter variables (A, B, C, ... Z, AA, AB, etc.)
  const excelLetters = [];
  const maxColumns = Math.max(26, sourceColumns.length);
  
  for (let i = 0; i < maxColumns; i++) {
    const letter = getExcelColumnLetter(i + 1);
    excelLetters.push(`const ${letter} = ${i};`);
    excelLetters.push(`const ${letter.toLowerCase()} = ${i};`);
  }
  
  return new Function('_col', '_value', `
    const col = _col;
    const Col = _col;
    const COL = _col;
    const value = _value;
    const Value = _value;
    const VALUE = _value;
    
    // Make Excel letters available as variables
    ${excelLetters.join('\n    ')}
    
    return ${expression}
  `);
};

// Helper function to convert number to Excel column letter
const getExcelColumnLetter = (columnNumber: number): string => {
  let dividend = columnNumber;
  let columnName = '';
  let modulo;

  while (dividend > 0) {
    modulo = (dividend - 1) % 26;
    columnName = String.fromCharCode(65 + modulo) + columnName;
    dividend = Math.floor((dividend - modulo) / 26);
  }

  return columnName;
};