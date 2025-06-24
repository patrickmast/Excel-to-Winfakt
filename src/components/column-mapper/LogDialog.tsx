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
import { useTranslation } from 'react-i18next';

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
  const [report, setReport] = useState<string>('');
  const [downloadReady, setDownloadReady] = useState(false);
  const processedRef = useRef(false);
  const workerRef = useRef<Worker | null>(null);
  const streamRef = useRef<ReadableStream | null>(null);
  const portRef = useRef<MessagePort | null>(null);
  const csvDataRef = useRef<{ data: string | null; filename: string | null }>({ data: null, filename: null });
  const { t } = useTranslation();

  // Format numbers with thousand separator
  const formatNumber = (num: number): string => {
    return num.toLocaleString('nl-NL');
  };

  // Cleanup worker when dialog closes or component unmounts
  useEffect(() => {
    // Only cleanup when dialog is closing or component unmounts
    if (!open) {
      // Cleanup worker
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
      // Cleanup message port
      if (portRef.current) {
        portRef.current.close();
        portRef.current = null;
      }
      // Clear other refs
      streamRef.current = null;
      csvDataRef.current = { data: null, filename: null };
      // Reset state
      setProcessing(false);
      setProgress(null);
      setReport('');
      setDownloadReady(false);
    }
    
    // Cleanup on unmount
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
  }, [open]);

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
    setReport(t('export.processingExport'));
    
    // Clean up any existing worker before creating new one
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    try {
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
            const dateTimeStr = now.toLocaleDateString('nl-NL', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }) + ', ' + now.toLocaleTimeString('nl-NL', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            });

            // Generate final report
            const finalReport = [
              `${t('export.reportFrom')} ${dateTimeStr}`,
              '',
              `${t('export.sourceFile')}: ${sourceFilename}`,
              worksheetName ? `${t('export.worksheet')}: ${worksheetName}` : null,
              `${t('export.totalRowsProcessed')}: ${formatNumber(payload.totalRows)}`,
              `${t('export.successfullyExported')}: ${formatNumber(payload.exportedRows)}`,
              `${t('export.skippedEmptyRows')}: ${formatNumber(payload.skippedRows)}`,
              `${t('export.exportFilename')}: ${payload.filename}`
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

      // Set up error handler
      worker.onerror = (error) => {
        console.error('Worker error:', error);
        setReport(`Worker error: ${error.message}`);
        setProcessing(false);
        
        // Clean up worker on error
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
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
    } catch (error) {
      console.error('Error creating worker:', error);
      setReport(`Error creating worker: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setProcessing(false);
      
      // Ensure worker is cleaned up on error
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    }
  };

  const handleDownload = async () => {
    if (!csvDataRef.current || !csvDataRef.current.data || !csvDataRef.current.filename) {
      console.error('No CSV data available for download');
      return;
    }

    // Create blob and download with proper cleanup
    let url: string | null = null;
    try {
      const { data, filename } = csvDataRef.current;
      const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
      url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      
      // Small delay before cleanup to ensure download starts
      setTimeout(() => {
        document.body.removeChild(a);
        if (url) {
          URL.revokeObjectURL(url);
        }
      }, 100);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  };

  return (
    <PM7Dialog open={open} onOpenChange={onOpenChange}>
      <PM7DialogContent className="sm:max-w-[700px]">
        <PM7DialogHeader>
          <PM7DialogTitle>{t('export.reportTitle')}</PM7DialogTitle>
          <PM7DialogDescription>
            {processing 
              ? t('export.processing')
              : downloadReady 
                ? t('export.complete')
                : t('export.reportDescription')
            }
          </PM7DialogDescription>
        </PM7DialogHeader>

        <div className="py-4">
          <pre id="export-report-content" className="font-mono text-sm text-slate-700 whitespace-pre-wrap bg-gray-50 p-6 rounded-md overflow-x-auto">
            {report}
          </pre>
        </div>

        <PM7DialogFooter>
          <PM7Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            {t('dialogs.close')}
          </PM7Button>
          <PM7Button
            variant="primary"
            onClick={handleDownload}
            disabled={processing || !workerRef.current || !downloadReady}
          >
            {t('export.downloadCSV')}
          </PM7Button>
        </PM7DialogFooter>
      </PM7DialogContent>
    </PM7Dialog>
  );
};

export default LogDialog;
