/**
 * Utility functions for safe blob URL management to prevent memory leaks
 */

export interface BlobDownloadOptions {
  filename: string;
  mimeType?: string;
  delay?: number;
}

/**
 * Creates a blob URL and automatically cleans it up after use
 * @param data The data to create a blob from
 * @param options Download options
 * @returns Promise that resolves when download is initiated
 */
export const safeBlobDownload = (
  data: BlobPart,
  options: BlobDownloadOptions
): Promise<void> => {
  return new Promise((resolve, reject) => {
    let url: string | null = null;
    let link: HTMLAnchorElement | null = null;

    try {
      // Create blob with specified mime type
      const blob = new Blob([data], { 
        type: options.mimeType || 'application/octet-stream' 
      });
      
      // Create object URL
      url = URL.createObjectURL(blob);
      
      // Create and configure download link
      link = document.createElement('a');
      link.href = url;
      link.download = options.filename;
      link.style.display = 'none';
      
      // Add to DOM and trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup after delay to ensure download starts
      const cleanupDelay = options.delay || 100;
      setTimeout(() => {
        cleanup();
        resolve();
      }, cleanupDelay);
      
    } catch (error) {
      cleanup();
      reject(error);
    }
    
    function cleanup() {
      // Remove link from DOM
      if (link && link.parentNode) {
        link.parentNode.removeChild(link);
      }
      
      // Revoke object URL to free memory
      if (url) {
        URL.revokeObjectURL(url);
      }
    }
  });
};

/**
 * Wrapper for FileReader with proper error handling and cleanup
 * @param file The file to read
 * @param readMethod The FileReader method to use
 * @returns Promise with the file contents
 */
export const safeFileRead = <T = string | ArrayBuffer>(
  file: File,
  readMethod: 'readAsText' | 'readAsArrayBuffer' | 'readAsDataURL' = 'readAsText'
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    // Set up event handlers
    reader.onload = (event) => {
      const result = event.target?.result;
      if (result !== null && result !== undefined) {
        resolve(result as T);
      } else {
        reject(new Error('Failed to read file: empty result'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${reader.error?.message || 'Unknown error'}`));
    };
    
    reader.onabort = () => {
      reject(new Error('File reading was aborted'));
    };
    
    // Start reading based on method
    try {
      switch (readMethod) {
        case 'readAsText':
          reader.readAsText(file);
          break;
        case 'readAsArrayBuffer':
          reader.readAsArrayBuffer(file);
          break;
        case 'readAsDataURL':
          reader.readAsDataURL(file);
          break;
        default:
          reject(new Error(`Unknown read method: ${readMethod}`));
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Creates a managed blob URL that auto-revokes after a timeout
 * @param blob The blob to create URL for
 * @param timeout Timeout in milliseconds before auto-revoke (default: 5 minutes)
 * @returns Object with URL and manual revoke function
 */
export const createManagedBlobUrl = (
  blob: Blob,
  timeout: number = 5 * 60 * 1000
): { url: string; revoke: () => void } => {
  const url = URL.createObjectURL(blob);
  
  // Auto-revoke after timeout
  const timeoutId = setTimeout(() => {
    URL.revokeObjectURL(url);
  }, timeout);
  
  // Manual revoke function
  const revoke = () => {
    clearTimeout(timeoutId);
    URL.revokeObjectURL(url);
  };
  
  return { url, revoke };
};