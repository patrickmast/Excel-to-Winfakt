/// <reference lib="webworker" />

import Papa from 'papaparse';

declare const self: DedicatedWorkerGlobalScope;

// Stats tracking
let stats = {
  totalRows: 0,
  exportedRows: 0,
  skippedRows: 0
};
let filename: string | null = null;
let headerSent = false;

// Store processed chunks for reuse
let processedChunks: any[] = [];
let header: Uint8Array | null = null;
let batchSize = 0;
let currentBatch: any[] = [];

const CHUNK_SIZE = 10000; // Process 10000 rows at a time for better performance

// Check if a row is empty (all values are empty strings or null/undefined)
const isRowEmpty = (row: any): boolean => {
  if (!row || typeof row !== 'object') {
    return true;
  }

  const isEmpty = Object.values(row).every(value => 
    value === null || 
    value === undefined || 
    value === '' || 
    (typeof value === 'string' && value.trim() === '')
  );

  return isEmpty;
};

const addTimestampToFilename = (filename: string): string => {
  const baseName = filename.replace(/\.[^/.]+$/, '');
  const extension = '.CSV';
  const timestamp = Math.floor(Date.now() / 1000);
  return `${baseName}-${timestamp}${extension}`;
};

// Handle messages from the main thread
self.onmessage = async (e) => {
  const { type, payload } = e.data;

  switch (type) {
    case 'START_PROCESS': {
      // Reset state for new processing
      stats = { totalRows: 0, exportedRows: 0, skippedRows: 0 };
      filename = addTimestampToFilename(payload.sourceFilename);
      headerSent = false;
      processedChunks = [];
      header = null;
      batchSize = 0;
      currentBatch = [];
      
      try {
        const { rows, metadata } = payload;
        
        // If we have metadata with skipped rows, use it
        if (metadata?.skippedRows !== undefined) {
          stats.skippedRows = metadata.skippedRows;
          stats.totalRows = metadata.totalRows;
          stats.exportedRows = rows.length;
        } else {
          // No metadata, count everything ourselves
          stats.totalRows = rows.length;
          stats.exportedRows = rows.length;
          stats.skippedRows = 0;
        }
        
        // Process each row - make sure we only get array data, not objects
        processedChunks = Array.isArray(rows) ? rows.filter(row => typeof row === 'object' && row !== null && !Array.isArray(row)) : [];
        
        // Send progress every 10k rows
        for (let i = 0; i < rows.length; i += 10000) {
          self.postMessage({
            type: 'PROGRESS',
            payload: {
              ...stats,
              exportedRows: Math.min(i + 10000, rows.length)
            }
          });
        }
        
        const csvData = Papa.unparse(processedChunks, {
          header: true,
          skipEmptyLines: true,
          quotes: false,
          delimiter: ';',
          encoding: 'UTF-8'
        });
        
        // Send final report
        self.postMessage({
          type: 'REPORT',
          payload: {
            ...stats,
            filename,
            csvData
          }
        });
        
        // Signal ready for download
        self.postMessage({
          type: 'DOWNLOAD_READY'
        });
      } catch (error) {
        self.postMessage({
          type: 'ERROR',
          payload: { error: String(error) }
        });
      }
      break;
    }
  }
};
