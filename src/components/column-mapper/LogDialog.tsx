import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Resizable } from 're-resizable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { addTimestampToFilename } from '@/utils/csvUtils';
import './LogDialog.css';

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
  const [dialogWidth, setDialogWidth] = useState(700);
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

  // Reset width when dialog opens
  useEffect(() => {
    if (open) {
      setDialogWidth(700);
    }
  }, [open]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!p-0 !m-0 !max-w-none !border-0 !bg-transparent flex items-center justify-center !shadow-none">
        <Resizable
          size={{ width: dialogWidth, height: 'auto' }}
          minWidth={400}
          maxWidth={2000}
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false
          }}
          handleStyles={{
            right: {
              width: '8px',
              right: '-4px'
            }
          }}
          handleClasses={{
            right: 'hover:bg-blue-100 transition-colors'
          }}
          onResizeStop={(_e, _direction, ref) => {
            setDialogWidth(ref.offsetWidth);
          }}
          className="!bg-white rounded-lg overflow-hidden !shadow-none"
          style={{ position: 'relative', margin: '0 auto' }}
        >
          <div className="bg-slate-700 p-6 rounded-t-lg">
            <DialogTitle className="text-white m-0 text-xl font-semibold">Export report</DialogTitle>
            <DialogDescription className="text-white/70 text-sm mt-1">
              {processing 
                ? "Please wait while the export is being processed..."
                : downloadReady 
                  ? "Export complete! You can now download your CSV file."
                  : "Export report"
              }
            </DialogDescription>
          </div>

          <div className="py-3 px-6">
            <pre id="export-report-content" className="font-mono text-sm text-slate-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-md">
              {report}
            </pre>
          </div>

          <DialogFooter className="p-6 bg-gray-50">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onOpenChange.bind(null, false)}
                className="!shadow-none rounded-md px-6"
              >
                Close
              </Button>
              <Button
                onClick={handleDownload}
                disabled={processing || !workerRef.current || !downloadReady}
                className="bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0 !shadow-none rounded-md px-6"
              >
                Download CSV
              </Button>
            </div>
          </DialogFooter>
        </Resizable>
      </DialogContent>
    </Dialog>
  );
};

export default LogDialog;
