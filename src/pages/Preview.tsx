import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

interface FileData {
  id: string;
  name: string;
  size: number;
  content: string;
  timestamp: number;
}

const Preview = () => {
  const [searchParams] = useSearchParams();
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fileId = searchParams.get('fileId');
    if (!fileId) {
      setError('No file ID provided');
      return;
    }

    const storedData = localStorage.getItem(`preview_${fileId}`);
    if (!storedData) {
      setError('File not found');
      return;
    }

    try {
      const parsedData = JSON.parse(storedData);
      setFileData(parsedData);
    } catch (e) {
      setError('Failed to load file data');
    }
  }, [searchParams]);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!fileData) {
    return (
      <div className="p-6">
        <div>Loading...</div>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    const kb = bytes / 1024;
    return `${kb.toFixed(2)} KB`;
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        Filename: {fileData.name} ({formatFileSize(fileData.size)})
      </div>
      <hr className="mb-4" />
      <pre className="whitespace-pre-wrap font-mono text-sm">
        {fileData.content}
      </pre>
    </div>
  );
};

export default Preview;