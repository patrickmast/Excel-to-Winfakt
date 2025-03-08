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

  try {
    const view = new DataView(buffer);
    console.log('Creating DataView successful');
    
    const header = readHeader(view);
    console.log('Header read successfully:', header);
    
    const fields = readFields(view, header.headerLength);
    console.log('Fields read successfully, count:', fields.length);
    
    const records = readRecords(view, header, fields);
    console.log('Records read successfully, count:', records.length);

    // If we have a memo file, process memo fields
    if (memoBuffer) {
      processMemoFields(records, fields, memoBuffer);
      console.log('Memo fields processed');
    }

    return records;
  } catch (error) {
    console.error('Error in parseDBF:', error);
    throw error;
  }
}

function readHeader(view: DataView): DBFHeader {
  return {
    version: view.getUint8(0),
    recordCount: view.getUint32(4, true),
    headerLength: view.getUint16(8, true),
    recordLength: view.getUint16(10, true)
  };
}

function readFields(view: DataView, headerLength: number): DBFField[] {
  const fields: DBFField[] = [];
  let offset = 32; // Start after header

  while (offset < headerLength - 1) {
    // Check for field terminator
    if (view.getUint8(offset) === 0x0D) break;

    const field: DBFField = {
      name: readString(view, offset, 11).replace(/\x00/g, ''),
      type: String.fromCharCode(view.getUint8(offset + 11)),
      length: view.getUint8(offset + 16),
      decimalCount: view.getUint8(offset + 17)
    };

    fields.push(field);
    offset += 32;
  }

  return fields;
}

function readRecords(view: DataView, header: DBFHeader, fields: DBFField[]): Record<string, any>[] {
  const records: Record<string, any>[] = [];
  let offset = header.headerLength;

  for (let i = 0; i < header.recordCount; i++) {
    // Skip record deleted flag
    offset++;

    const record: Record<string, any> = {};

    for (const field of fields) {
      const value = readFieldValue(view, offset, field);
      record[field.name] = value;
      offset += field.length;
    }

    records.push(record);
  }

  return records;
}

function readFieldValue(view: DataView, offset: number, field: DBFField): any {
  const value = readString(view, offset, field.length).trim();

  switch (field.type) {
    case 'N': // Number
      return value === '' ? null : Number(value);
    case 'F': // Float
      return value === '' ? null : parseFloat(value);
    case 'L': // Logical
      return value.toUpperCase() === 'T' || value === 'Y' || value === '1';
    case 'D': // Date
      if (value === '') return null;
      const year = parseInt(value.slice(0, 4));
      const month = parseInt(value.slice(4, 6)) - 1;
      const day = parseInt(value.slice(6, 8));
      return new Date(year, month, day);
    case 'M': // Memo
      return value === '' ? null : parseInt(value); // This is a pointer to memo file
    default:
      return value;
  }
}

function readString(view: DataView, offset: number, length: number): string {
  const bytes = new Uint8Array(view.buffer, offset, length);
  return new TextDecoder('windows-1252').decode(bytes);
}

function processMemoFields(records: Record<string, any>[], fields: DBFField[], memoBuffer: ArrayBuffer): void {
  const memoView = new DataView(memoBuffer);
  const memoFields = fields.filter(f => f.type === 'M');

  if (memoFields.length === 0) return;

  // Process each record
  for (const record of records) {
    for (const field of memoFields) {
      const pointer = record[field.name];
      if (pointer !== null) {
        try {
          // Read memo block
          const blockSize = 512; // Standard memo block size
          const offset = pointer * blockSize;
          const length = findMemoLength(memoView, offset);
          record[field.name] = readString(memoView, offset, length);
        } catch (e) {
          console.warn(`Failed to read memo field ${field.name}`, e);
          record[field.name] = null;
        }
      }
    }
  }
}

function findMemoLength(view: DataView, offset: number): number {
  // Look for memo field terminator or end of buffer
  let length = 0;
  while (offset + length < view.byteLength) {
    if (view.getUint8(offset + length) === 0x1A) break;
    length++;
  }
  return length;
}