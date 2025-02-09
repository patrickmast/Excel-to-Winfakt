import { describe, it, expect, beforeEach } from 'vitest';

// Generate test data
function generateTestData(size: number) {
  const data = [];
  for (let i = 0; i < size; i++) {
    if (i % 5 === 0) {
      // Every 5th row is empty
      data.push({
        id: '',
        description: '',
        price: ''
      });
    } else {
      data.push({
        id: i.toString(),
        description: `Product ${i}`,
        price: (Math.random() * 1000).toFixed(2)
      });
    }
  }
  return data;
}

describe('CSV Processing Test', () => {
  let testWorker: Worker;
  let testData: any[];
  const TEST_SIZE = 100000; // Match the actual file size

  beforeEach(() => {
    console.log('[TEST] Generating test data...');
    testData = generateTestData(TEST_SIZE);
    console.log('[TEST] Creating worker...');
    testWorker = new Worker(
      new URL('../workers/csv-worker.ts', import.meta.url),
      { type: 'module' }
    );
  });

  it('should process all rows correctly', { timeout: 30000 }, () => {
    return new Promise<void>((resolve, reject) => {
      let processedRows = 0;
      let validRows = 0;
      let emptyRows = 0;
      let lastUpdate = Date.now();

      testWorker.onmessage = (e) => {
        const { type, payload } = e.data;
        console.log('[TEST] Received message:', type);

        switch (type) {
          case 'READY': {
            console.log('[TEST] Worker ready, sending chunks...');
            const CHUNK_SIZE = 10; // Very small chunks for testing
            
            // Send chunks
            for (let i = 0; i < testData.length; i += CHUNK_SIZE) {
              const chunk = testData.slice(i, i + CHUNK_SIZE);
              console.log('[TEST] Sending chunk', i / CHUNK_SIZE + 1);
              e.ports[0].postMessage(chunk);
            }
            
            // Signal end of data
            console.log('[TEST] Sending end signal');
            e.ports[0].postMessage(null);
            break;
          }

          case 'PROGRESS': {
            processedRows = payload.totalRows;
            validRows = payload.exportedRows;
            emptyRows = payload.skippedRows;
            
            // Log progress every 100ms
            const now = Date.now();
            if (now - lastUpdate >= 100) {
              console.log('[TEST] Progress:', {
                processedRows,
                validRows,
                emptyRows,
                percentComplete: ((processedRows / TEST_SIZE) * 100).toFixed(1) + '%'
              });
              lastUpdate = now;
            }
            
            // Check if processing is complete
            if (processedRows === TEST_SIZE) {
              console.log('[TEST] Processing complete. Final stats:', {
                processedRows,
                validRows,
                emptyRows
              });

              try {
                // Verify results
                expect(processedRows).toBe(TEST_SIZE);
                expect(validRows + emptyRows).toBe(TEST_SIZE);
                expect(emptyRows).toBe(Math.floor(TEST_SIZE / 5)); // Every 5th row is empty
                
                testWorker.terminate();
                resolve();
              } catch (error) {
                reject(error);
              }
            }
            break;
          }

          case 'ERROR': {
            console.error('[TEST] Worker error:', payload.error);
            testWorker.terminate();
            reject(new Error(payload.error));
            break;
          }
        }
      };

      // Start processing
      console.log('[TEST] Starting test with', TEST_SIZE, 'rows');
      testWorker.postMessage({ 
        type: 'START_PROCESS',
        payload: { sourceFilename: 'test.csv' }
      });
    });
  });
});
