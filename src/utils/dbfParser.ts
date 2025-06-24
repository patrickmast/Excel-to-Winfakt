interface DBFHeader {
  version: number;
  recordCount: number;
  headerLength: number;
  recordLength: number;
}

interface DBFField {
  name: string;
  type: string;
  length: number;
  decimalCount: number;
}

export async function parseDBF(buffer: ArrayBuffer, memoBuffer?: ArrayBuffer): Promise<Record<string, any>[]> {
  console.log('parseDBF called with buffer size:', buffer.byteLength, 'bytes');
  if (memoBuffer) {
    console.log('Memo buffer provided, size:', memoBuffer.byteLength, 'bytes');
  }
  
  if (!buffer || buffer.byteLength === 0) {
    console.error('Invalid buffer: Buffer is empty or does not exist');
    throw new Error('Invalid buffer: Buffer is empty or does not exist');
  }

  // Minimum DBF file size check (header is at least 32 bytes)
  if (buffer.byteLength < 32) {
    console.error('Invalid DBF file: File is too small to contain a valid header');
    throw new Error('Invalid DBF file: File is too small (minimum 32 bytes required)');
  }

  try {
    const view = new DataView(buffer);
    console.log('Creating DataView successful');
    
    // Check DBF version byte (first byte should be a valid DBF version)
    const version = view.getUint8(0);
    console.log('DBF version byte:', version.toString(16));
    
    const header = readHeader(view);
    console.log('Header read successfully:', header);
    
    // Validate header
    if (header.recordCount === 0) {
      console.warn('DBF file contains no records');
      return [];
    }
    
    if (header.headerLength > buffer.byteLength) {
      throw new Error(`Invalid header length: ${header.headerLength} exceeds file size ${buffer.byteLength}`);
    }
    
    const fields = readFields(view, header.headerLength, buffer.byteLength);
    console.log('Fields read successfully, count:', fields.length);
    
    if (fields.length === 0) {
      console.error('No fields found in DBF file');
      throw new Error('No fields found in DBF file');
    }
    
    const records = readRecords(view, header, fields, buffer.byteLength);
    console.log('Records read successfully, count:', records.length);

    // If we have a memo file, process memo fields
    if (memoBuffer && memoBuffer.byteLength > 0) {
      processMemoFields(records, fields, memoBuffer);
      console.log('Memo fields processed');
    }

    return records;
  } catch (error) {
    console.error('Error in parseDBF:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(String(error));
  }
}

function readHeader(view: DataView): DBFHeader {
  try {
    const header = {
      version: view.getUint8(0),
      recordCount: view.getUint32(4, true),
      headerLength: view.getUint16(8, true),
      recordLength: view.getUint16(10, true)
    };
    
    // Log header details for debugging
    console.log('DBF Header Details:');
    console.log('  Version:', header.version, '(0x' + header.version.toString(16) + ')');
    console.log('  Record Count:', header.recordCount);
    console.log('  Header Length:', header.headerLength);
    console.log('  Record Length:', header.recordLength);
    
    return header;
  } catch (error) {
    console.error('Error reading header:', error);
    throw new Error('Failed to read DBF header: ' + String(error));
  }
}

function readFields(view: DataView, headerLength: number, bufferLength: number): DBFField[] {
  const fields: DBFField[] = [];
  let offset = 32; // Start after header

  console.log('Reading fields starting at offset:', offset);

  while (offset < headerLength - 1 && offset < bufferLength) {
    // Ensure we have enough bytes for a field descriptor (32 bytes)
    if (offset + 32 > bufferLength) {
      console.warn('Insufficient buffer for field descriptor at offset:', offset);
      break;
    }
    
    // Check for field terminator
    const firstByte = view.getUint8(offset);
    if (firstByte === 0x0D) {
      console.log('Found field terminator at offset:', offset);
      break;
    }

    try {
      const fieldNameBytes = new Uint8Array(view.buffer, view.byteOffset + offset, 11);
      const fieldName = readString(view, offset, 11).replace(/\x00/g, '').trim();
      
      if (!fieldName) {
        console.warn('Empty field name at offset:', offset, 'skipping...');
        offset += 32;
        continue;
      }

      const field: DBFField = {
        name: fieldName,
        type: String.fromCharCode(view.getUint8(offset + 11)),
        length: view.getUint8(offset + 16),
        decimalCount: view.getUint8(offset + 17)
      };

      console.log(`Field ${fields.length}: "${field.name}" Type: ${field.type} Length: ${field.length}`);
      
      // Validate field
      if (field.length === 0 || field.length > 255) {
        console.warn(`Invalid field length ${field.length} for field "${field.name}"`);
      }

      fields.push(field);
      offset += 32;
    } catch (error) {
      console.error('Error reading field at offset:', offset, error);
      break;
    }
  }

  console.log('Total fields found:', fields.length);
  return fields;
}

function readRecords(view: DataView, header: DBFHeader, fields: DBFField[], bufferLength: number): Record<string, any>[] {
  const records: Record<string, any>[] = [];
  let offset = header.headerLength;
  const recordSize = header.recordLength;

  console.log(`Reading ${header.recordCount} records starting at offset ${offset}`);
  console.log(`Each record is ${recordSize} bytes`);

  for (let i = 0; i < header.recordCount; i++) {
    // Check if we have enough buffer for this record
    if (offset + recordSize > bufferLength) {
      console.warn(`Insufficient buffer for record ${i} at offset ${offset}`);
      break;
    }

    try {
      // Check deleted flag
      const deletedFlag = view.getUint8(offset);
      const isDeleted = deletedFlag === 0x2A; // '*' character
      
      // Skip deleted records
      if (isDeleted) {
        offset += recordSize;
        continue;
      }

      // Move past the deleted flag
      let fieldOffset = offset + 1;
      const record: Record<string, any> = {};

      for (const field of fields) {
        // Ensure we don't read beyond the record boundary
        if (fieldOffset + field.length > offset + recordSize) {
          console.warn(`Field ${field.name} extends beyond record boundary`);
          record[field.name] = null;
          fieldOffset += field.length;
          continue;
        }

        try {
          const value = readFieldValue(view, fieldOffset, field, bufferLength);
          record[field.name] = value;
        } catch (error) {
          console.warn(`Error reading field ${field.name} at offset ${fieldOffset}:`, error);
          record[field.name] = null;
        }
        
        fieldOffset += field.length;
      }

      records.push(record);
      offset += recordSize;
      
      // Log progress every 1000 records
      if ((i + 1) % 1000 === 0) {
        console.log(`Processed ${i + 1} records...`);
      }
    } catch (error) {
      console.error(`Error reading record ${i} at offset ${offset}:`, error);
      // Skip this record and continue
      offset += recordSize;
    }
  }

  console.log(`Successfully read ${records.length} records`);
  return records;
}

function readFieldValue(view: DataView, offset: number, field: DBFField, bufferLength: number): any {
  // Ensure we don't read beyond buffer
  if (offset + field.length > bufferLength) {
    throw new Error(`Cannot read field value: offset ${offset} + length ${field.length} exceeds buffer`);
  }

  const value = readString(view, offset, field.length, bufferLength).trim();

  switch (field.type) {
    case 'C': // Character
      return value;
    case 'N': // Number
      if (value === '') return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    case 'F': // Float
      if (value === '') return null;
      const float = parseFloat(value);
      return isNaN(float) ? null : float;
    case 'L': // Logical
      const upper = value.toUpperCase();
      return upper === 'T' || upper === 'Y' || upper === '1' || upper === 'TRUE';
    case 'D': // Date
      if (value === '' || value.length < 8) return null;
      try {
        const year = parseInt(value.slice(0, 4));
        const month = parseInt(value.slice(4, 6)) - 1;
        const day = parseInt(value.slice(6, 8));
        if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
        const date = new Date(year, month, day);
        return isNaN(date.getTime()) ? null : date;
      } catch (e) {
        console.warn('Invalid date value:', value);
        return null;
      }
    case 'M': // Memo
      if (value === '') return null;
      const memoPtr = parseInt(value.trim());
      return isNaN(memoPtr) ? null : memoPtr;
    case 'B': // Double (8 bytes)
      // Binary double - needs special handling
      try {
        return view.getFloat64(offset, true);
      } catch (e) {
        return null;
      }
    case 'I': // Integer (4 bytes)  
      try {
        return view.getInt32(offset, true);
      } catch (e) {
        return null;
      }
    case 'T': // DateTime
      // DateTime stored as two 32-bit integers
      try {
        const julianDay = view.getInt32(offset, true);
        const milliseconds = view.getInt32(offset + 4, true);
        // Convert Julian day to JavaScript date
        const date = new Date((julianDay - 2440588) * 86400000 + milliseconds);
        return isNaN(date.getTime()) ? null : date;
      } catch (e) {
        return null;
      }
    default:
      console.warn(`Unknown field type '${field.type}' for field '${field.name}'`);
      return value;
  }
}

function readString(view: DataView, offset: number, length: number, bufferLength?: number): string {
  try {
    // Validate offset and length
    if (offset < 0 || length < 0) {
      throw new Error(`Invalid offset (${offset}) or length (${length})`);
    }
    
    const viewOffset = view.byteOffset + offset;
    const maxLength = bufferLength ? Math.min(length, bufferLength - offset) : length;
    
    // Additional safety check
    if (viewOffset + maxLength > view.buffer.byteLength) {
      throw new Error(`Read beyond buffer bounds: offset ${viewOffset} + length ${maxLength} > buffer ${view.buffer.byteLength}`);
    }
    
    const bytes = new Uint8Array(view.buffer, viewOffset, maxLength);
    
    // Try different encodings based on the content
    // First check if it's ASCII
    let isAscii = true;
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] > 127) {
        isAscii = false;
        break;
      }
    }
    
    if (isAscii) {
      // Use simple ASCII decoding for better performance
      return String.fromCharCode.apply(null, Array.from(bytes));
    } else {
      // Try Windows-1252 for Western European characters
      try {
        return new TextDecoder('windows-1252', { fatal: false }).decode(bytes);
      } catch (e) {
        // Fallback to ISO-8859-1 if windows-1252 fails
        try {
          return new TextDecoder('iso-8859-1', { fatal: false }).decode(bytes);
        } catch (e2) {
          // Final fallback: replace non-ASCII with ?
          return String.fromCharCode.apply(null, Array.from(bytes.map(b => b > 127 ? 63 : b)));
        }
      }
    }
  } catch (error) {
    console.error('Error reading string at offset', offset, 'length', length, error);
    return '';
  }
}

function processMemoFields(records: Record<string, any>[], fields: DBFField[], memoBuffer: ArrayBuffer): void {
  try {
    const memoView = new DataView(memoBuffer);
    const memoFields = fields.filter(f => f.type === 'M');

    if (memoFields.length === 0) {
      console.log('No memo fields found');
      return;
    }

    console.log(`Processing ${memoFields.length} memo fields`);

    // Check memo file header to determine block size
    let blockSize = 512; // Default block size
    
    if (memoBuffer.byteLength >= 8) {
      // Try to read the block size from header
      // Some memo formats store block size at offset 6-7
      const headerBlockSize = memoView.getUint16(6, true);
      if (headerBlockSize > 0 && headerBlockSize <= 8192) {
        blockSize = headerBlockSize;
        console.log('Detected memo block size:', blockSize);
      }
    }

    // Process each record
    let memoFieldsProcessed = 0;
    for (const record of records) {
      for (const field of memoFields) {
        const pointer = record[field.name];
        if (pointer !== null && pointer > 0) {
          try {
            // Calculate offset
            const offset = pointer * blockSize;
            
            // Check if offset is within bounds
            if (offset >= memoBuffer.byteLength) {
              console.warn(`Memo pointer ${pointer} for field ${field.name} is out of bounds`);
              record[field.name] = null;
              continue;
            }
            
            const length = findMemoLength(memoView, offset, memoBuffer.byteLength);
            if (length > 0) {
              record[field.name] = readString(memoView, offset, length, memoBuffer.byteLength);
              memoFieldsProcessed++;
            } else {
              record[field.name] = '';
            }
          } catch (e) {
            console.warn(`Failed to read memo field ${field.name} at pointer ${pointer}:`, e);
            record[field.name] = null;
          }
        }
      }
    }
    
    console.log(`Processed ${memoFieldsProcessed} memo field values`);
  } catch (error) {
    console.error('Error processing memo fields:', error);
  }
}

function findMemoLength(view: DataView, offset: number, bufferLength: number): number {
  // Look for memo field terminator or end of buffer
  let length = 0;
  const maxLength = Math.min(65535, bufferLength - offset); // Max memo field size
  
  while (length < maxLength) {
    try {
      const byte = view.getUint8(offset + length);
      // Check for EOF marker (0x1A) or double EOF (0x1A1A)
      if (byte === 0x1A) {
        // Check if next byte is also 0x1A (some formats use double EOF)
        if (length + 1 < maxLength && view.getUint8(offset + length + 1) === 0x1A) {
          break;
        }
        // Single EOF might be part of content in some formats, continue
      }
      // Also check for null terminator
      if (byte === 0x00) {
        // Check if we have multiple nulls (likely end of content)
        let nullCount = 0;
        for (let i = 0; i < 4 && length + i < maxLength; i++) {
          if (view.getUint8(offset + length + i) === 0x00) nullCount++;
        }
        if (nullCount >= 4) break;
      }
      length++;
    } catch (e) {
      // Reached end of buffer
      break;
    }
  }
  
  return length;
}