import { beforeAll } from 'vitest';

// Mock Web Worker
class MockWorker {
  onmessage: ((e: MessageEvent) => void) | null = null;
  private messageChannel: MessageChannel;
  private dataProcessor: DataProcessor;

  constructor() {
    this.messageChannel = new MessageChannel();
    this.dataProcessor = new DataProcessor();
  }

  postMessage(data: any) {
    if (this.onmessage) {
      if (data.type === 'START_PROCESS') {
        // Send READY message with ports
        this.onmessage({
          data: {
            type: 'READY',
            payload: {
              stream: new ReadableStream(),
              port: this.messageChannel.port1
            }
          },
          ports: [this.messageChannel.port1]
        } as MessageEvent);
      }
    }
  }

  terminate() {
    // Cleanup
    this.messageChannel.port1.close();
    this.messageChannel.port2.close();
  }
}

// Data processor to handle CSV data
class DataProcessor {
  private processedRows = 0;
  private validRows = 0;
  private skippedRows = 0;

  processChunk(data: any[] | null, onProgress: (stats: any) => void) {
    if (data === null) {
      // End of stream, send final stats
      onProgress({
        totalRows: this.processedRows,
        exportedRows: this.validRows,
        skippedRows: this.skippedRows
      });
      return;
    }

    // Process chunk
    const chunkSize = data.length;
    this.processedRows += chunkSize;

    // Count valid and skipped rows
    const chunkValidRows = data.filter(row => {
      // A row is empty if all its values are empty strings
      return !Object.values(row).every(v => v === '');
    }).length;

    this.validRows += chunkValidRows;
    this.skippedRows += (chunkSize - chunkValidRows);

    // Send progress update
    onProgress({
      totalRows: this.processedRows,
      exportedRows: this.validRows,
      skippedRows: this.skippedRows
    });
  }

  reset() {
    this.processedRows = 0;
    this.validRows = 0;
    this.skippedRows = 0;
  }
}

// Mock MessageChannel
class MockMessageChannel {
  port1: any;
  port2: any;
  private dataProcessor: DataProcessor;

  constructor() {
    this.dataProcessor = new DataProcessor();

    this.port1 = {
      postMessage: (data: any) => {
        // Process data synchronously for testing
        this.dataProcessor.processChunk(data, (stats) => {
          // Send progress update to the worker's onmessage handler
          const worker = (global as any).currentWorker;
          if (worker && worker.onmessage) {
            worker.onmessage({
              data: {
                type: 'PROGRESS',
                payload: stats
              }
            } as MessageEvent);
          }
        });
      },
      close: () => {
        this.dataProcessor.reset();
      }
    };

    this.port2 = {
      postMessage: () => {},
      close: () => {}
    };
  }
}

// Add mocks to global scope
beforeAll(() => {
  (global as any).Worker = class extends MockWorker {
    constructor(...args: any[]) {
      super();
      (global as any).currentWorker = this;
    }
  };
  (global as any).MessageChannel = MockMessageChannel;
  (global as any).ReadableStream = class {};
});
