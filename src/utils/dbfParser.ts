export interface DBFField {
  name: string;
  type: string;
  length: number;
  decimals: number;
}

export interface DBFHeader {
  version: number;
  lastUpdate: Date;
  recordCount: number;
  headerLength: number;
  recordLength: number;
  fields: DBFField[];
}

export async function parseDBF(input: File | ArrayBuffer, memoBuffer?: ArrayBuffer): Promise<{ headers: string[]; data: string[][] }> {
  return new Promise((resolve, reject) => {
    const processBuffer = (buffer: ArrayBuffer) => {
      try {
        const view = new DataView(buffer);
        
        // Minimum file size check
        if (buffer.byteLength < 32) {
          throw new Error('File too small to be a valid DBF file');
        }
        
        // Read header
        const header = readDBFHeader(view, buffer);
        console.log('DBF Header:', header);
        
        // Read records
        const records = readDBFRecords(view, buffer, header);
        console.log(`Read ${records.length} records from DBF file`);
        
        // Extract headers from fields
        const headers = header.fields.map(field => field.name);
        
        resolve({ headers, data: records });
      } catch (error) {
        console.error('Error parsing DBF file:', error);
        reject(error);
      }
    };
    
    if (input instanceof ArrayBuffer) {
      processBuffer(input);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        processBuffer(buffer);
      };
      reader.onerror = () => reject(new Error('Failed to read DBF file'));
      reader.readAsArrayBuffer(input);
    }
  });
}

function readDBFHeader(view: DataView, buffer: ArrayBuffer): DBFHeader {
  // DBF file type and version
  const version = view.getUint8(0);
  
  // Last update date (YY MM DD)
  const yearByte = view.getUint8(1);
  // DBF dates after 2000 use YY + 100
  const year = yearByte >= 100 ? 1900 + yearByte : 2000 + yearByte;
  const month = view.getUint8(2) - 1;
  const day = view.getUint8(3);
  const lastUpdate = new Date(year, month, day);
  
  // Number of records
  const recordCount = view.getUint32(4, true);
  
  // Header length
  const headerLength = view.getUint16(8, true);
  
  // Record length
  const recordLength = view.getUint16(10, true);
  
  // Read field descriptors
  const fields: DBFField[] = [];
  let offset = 32; // Field descriptors start at byte 32
  
  while (offset < headerLength - 1 && offset < buffer.byteLength) {
    const fieldByte = view.getUint8(offset);
    if (fieldByte === 0x0D) break; // Field terminator
    
    // Check if we have enough bytes for a field descriptor (32 bytes)
    if (offset + 32 > buffer.byteLength) {
      console.warn('Unexpected end of file while reading field descriptors');
      break;
    }
    
    // Field name (11 bytes, null-terminated)
    const nameBytes: number[] = [];
    for (let i = 0; i < 11 && offset + i < buffer.byteLength; i++) {
      const byte = view.getUint8(offset + i);
      if (byte === 0) break;
      nameBytes.push(byte);
    }
    const name = String.fromCharCode(...nameBytes).trim();
    
    if (!name) {
      offset += 32;
      continue;
    }
    
    // Field type (1 byte at offset + 11)
    const type = String.fromCharCode(view.getUint8(offset + 11));
    
    // Field length (1 byte at offset + 16)
    const length = view.getUint8(offset + 16);
    
    // Decimal places (1 byte at offset + 17)
    const decimals = view.getUint8(offset + 17);
    
    fields.push({ name, type, length, decimals });
    console.log(`Field: ${name}, Type: ${type}, Length: ${length}, Decimals: ${decimals}`);
    
    offset += 32; // Each field descriptor is 32 bytes
  }
  
  return {
    version,
    lastUpdate,
    recordCount,
    headerLength,
    recordLength,
    fields
  };
}

function readDBFRecords(view: DataView, buffer: ArrayBuffer, header: DBFHeader): string[][] {
  const records: string[][] = [];
  let offset = header.headerLength;
  let recordsRead = 0;
  
  while (offset < buffer.byteLength && recordsRead < header.recordCount) {
    // Check if we have enough bytes for a record
    if (offset + header.recordLength > buffer.byteLength) {
      console.warn(`Unexpected end of file at record ${recordsRead + 1}`);
      break;
    }
    
    // Check deletion flag
    const deletionFlag = view.getUint8(offset);
    if (deletionFlag === 0x2A) { // Record is marked as deleted (*)
      offset += header.recordLength;
      recordsRead++;
      continue;
    }
    
    const record: string[] = [];
    let fieldOffset = offset + 1; // Skip deletion flag
    
    for (const field of header.fields) {
      // Check bounds
      if (fieldOffset + field.length > buffer.byteLength) {
        console.warn(`Field ${field.name} extends beyond file boundary`);
        record.push('');
        continue;
      }
      
      const value = readFieldValue(view, fieldOffset, field);
      record.push(value);
      fieldOffset += field.length;
    }
    
    records.push(record);
    offset += header.recordLength;
    recordsRead++;
    
    // Log progress for large files
    if (recordsRead % 1000 === 0) {
      console.log(`Read ${recordsRead} records...`);
    }
  }
  
  return records;
}

function readFieldValue(view: DataView, offset: number, field: DBFField): string {
  const bytes: number[] = [];
  
  for (let i = 0; i < field.length; i++) {
    bytes.push(view.getUint8(offset + i));
  }
  
  // Convert bytes to string based on field type
  let value = '';
  
  switch (field.type) {
    case 'C': // Character
      value = decodeString(bytes).trim();
      break;
      
    case 'N': // Numeric
    case 'F': // Float
      value = decodeString(bytes).trim();
      break;
      
    case 'D': // Date (YYYYMMDD)
      const dateStr = decodeString(bytes).trim();
      if (dateStr.length === 8) {
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        value = `${year}-${month}-${day}`;
      } else {
        value = dateStr;
      }
      break;
      
    case 'L': // Logical
      const logicalChar = String.fromCharCode(bytes[0]);
      value = logicalChar === 'T' || logicalChar === 't' || logicalChar === 'Y' || logicalChar === 'y' ? 'true' : 'false';
      break;
      
    case 'M': // Memo
      value = decodeString(bytes).trim();
      break;
      
    case 'B': // Binary/Double
      if (field.length === 8) {
        const doubleValue = view.getFloat64(offset, true);
        value = doubleValue.toString();
      } else {
        value = decodeString(bytes).trim();
      }
      break;
      
    case 'I': // Integer
      if (field.length === 4) {
        const intValue = view.getInt32(offset, true);
        value = intValue.toString();
      } else {
        value = decodeString(bytes).trim();
      }
      break;
      
    case 'T': // DateTime
      value = decodeString(bytes).trim();
      break;
      
    default:
      value = decodeString(bytes).trim();
  }
  
  return value;
}

function decodeString(bytes: number[]): string {
  // First try to detect if it's pure ASCII
  const isAscii = bytes.every(byte => byte < 128);
  
  if (isAscii) {
    return String.fromCharCode(...bytes);
  }
  
  // Try different encodings
  try {
    // Try Windows-1252 (common for DBF files)
    const decoder = new TextDecoder('windows-1252', { fatal: false });
    return decoder.decode(new Uint8Array(bytes));
  } catch {
    try {
      // Fallback to ISO-8859-1
      const decoder = new TextDecoder('iso-8859-1', { fatal: false });
      return decoder.decode(new Uint8Array(bytes));
    } catch {
      // Final fallback to ASCII with replacement
      return bytes.map(byte => byte < 128 ? String.fromCharCode(byte) : '?').join('');
    }
  }
}