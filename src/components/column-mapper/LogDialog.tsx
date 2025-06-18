import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  PM7Dialog,
  PM7DialogContent,
  PM7DialogHeader,
  PM7DialogTitle,
  PM7DialogDescription,
  PM7DialogFooter,
  PM7Button,
} from 'pm7-ui-style-guide';

interface LogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: any[] | null;
  sourceFilename: string | null;
  sourceFileSize?: number;
  worksheetName?: string;
  onExportComplete: (report: string, exportedData: any[], metadata?: any) => void;
}

const LogDialog = ({
  open,
  onOpenChange,
  data,
  sourceFilename,
  sourceFileSize,
  worksheetName,
  onExportComplete
}: LogDialogProps) => {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<{
    totalRows: number;
    exportedRows: number;
    skippedRows: number;
  } | null>(null);
  const [report, setReport] = useState<string>('Processing export...');
  const [downloadReady, setDownloadReady] = useState(false);
  const processedRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);
  const streamRef = useRef<ReadableStream | null>(null);
  const portRef = useRef<MessagePort | null>(null);
  const csvDataRef = useRef<{ data: string | null; filename: string | null }>({ data: null, filename: null });

  // Format numbers with thousand separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('nl-NL');
  };

  // Initial cleanup effect
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      if (portRef.current) {
        portRef.current.close();
        portRef.current = null;
      }
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (open && data && sourceFilename && !processing && !processedRef.current) {
      processedRef.current = true;
      setProcessing(true);
      handleExport(data, data.metadata);
    }

    return () => {
      if (!open) {
        processedRef.current = false;
      }
    };
  }, [open, data, sourceFilename]);

  const handleExport = useCallback((data: any[], metadata?: any) => {
    // Use metadata from either source
    const effectiveMetadata = metadata || data.metadata;
    processExport(data, sourceFilename, effectiveMetadata);
  }, [sourceFilename]);

  const processExport = async (data: any[], sourceFilename: string, metadata?: any) => {
    setProcessing(true);
    setDownloadReady(false);
    
    // Create new worker
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    // Create and store worker reference
    const worker = new Worker(
      new URL('@/workers/csv-worker.ts', import.meta.url),
      { type: 'module' }
    );
    workerRef.current = worker;

    // Set up message handler
    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      
      switch (type) {
        case 'PROGRESS': {
          const newProgress = {
            totalRows: payload.totalRows,
            exportedRows: payload.exportedRows,
            skippedRows: payload.skippedRows
          };
          setProgress(newProgress);
          break;
        }

        case 'REPORT': {
          // Get current date/time at completion
          const now = new Date();
          const dateTimeStr = now.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) + ', ' + now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          });

          // Generate final report
          const finalReport = [
            `Export report from ${dateTimeStr}`,
            '',
            `Source file: ${sourceFilename}`,
            worksheetName ? `Worksheet: ${worksheetName}` : null,
            `Total rows processed: ${formatNumber(payload.totalRows)}`,
            `Successfully exported rows: ${formatNumber(payload.exportedRows)}`,
            `Skipped empty rows: ${formatNumber(payload.skippedRows)}`,
            `Export filename: ${payload.filename}`
          ].filter(line => line !== null).join('\n');

          setReport(finalReport);
          setProcessing(false);
          onExportComplete(finalReport, payload, metadata);
          
          // Store CSV data and filename for download
          csvDataRef.current = {
            data: payload.csvData,
            filename: payload.filename
          };
          break;
        }

        case 'DOWNLOAD_READY': {
          setDownloadReady(true);
          break;
        }

        case 'ERROR': {
          setReport(`Error: ${payload.error}`);
          setProcessing(false);
          break;
        }
      }
    };
    
    // Start processing with all data
    worker.postMessage({
      type: 'START_PROCESS',
      payload: {
        sourceFilename,
        rows: data,
        metadata
      }
    });
  };

  const handleDownload = async () => {
    if (!workerRef.current || !csvDataRef.current) {
      return;
    }

    // Create blob and download
    const { data, filename } = csvDataRef.current;
    const blob = new Blob([data], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <PM7Dialog open={open} onOpenChange={onOpenChange}>
      <PM7DialogContent className="sm:max-w-[700px]">
        <PM7DialogHeader>
          <PM7DialogTitle>Export report</PM7DialogTitle>
          <PM7DialogDescription>
            {processing 
              ? "Please wait while the export is being processed..."
              : downloadReady 
                ? "Export complete! You can now download your CSV file."
                : "Export report"
            }
          </PM7DialogDescription>
        </PM7DialogHeader>

        <div className="py-3">
          <pre id="export-report-content" className="font-mono text-sm text-slate-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-md">
            {report}
          </pre>
        </div>

        <PM7DialogFooter>
          <PM7Button
            className="pm7-button-ghost"
            onClick={() => onOpenChange(false)}
          >
            Close
          </PM7Button>
          <PM7Button
            onClick={handleDownload}
            disabled={processing || !workerRef.current || !downloadReady}
          >
            Download CSV
          </PM7Button>
        </PM7DialogFooter>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default LogDialog;
