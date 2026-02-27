'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/lib/store';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  status: 'uploading' | 'success' | 'error';
  progress: number;
}

interface FileUploaderProps {
  onFilesSelected?: (files: File[]) => void;
  maxFiles?: number;
  acceptedFormats?: string[];
}

export function FileUploader({
  onFilesSelected,
  maxFiles = 5,
  acceptedFormats = ['.pdf', '.docx', '.xlsx'],
}: FileUploaderProps) {
  const { showToast } = useAppStore();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    processFiles(selectedFiles);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    processFiles(droppedFiles);
  };

  const processFiles = (selectedFiles: File[]) => {
    if (files.length + selectedFiles.length > maxFiles) {
      showToast(`Maximum ${maxFiles} files allowed`, 'error');
      return;
    }

    const newFiles = selectedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'uploading' as const,
      progress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);
    onFilesSelected?.(selectedFiles);

    // Simulate upload progress
    newFiles.forEach((file) => {
      setTimeout(() => {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === file.id ? { ...f, status: 'success', progress: 100 } : f
          )
        );
      }, 1500);
    });

    showToast(`${selectedFiles.length} file(s) uploaded successfully!`, 'success');
  };

  const removeFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          accept={acceptedFormats.join(',')}
          className="hidden"
        />

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => inputRef.current?.click()}
          className="cursor-pointer"
        >
          <Upload className="w-12 h-12 text-primary mx-auto mb-3" />
          <h3 className="font-semibold text-foreground mb-1">Drop files here or click to upload</h3>
          <p className="text-sm text-muted-foreground">
            Supported: {acceptedFormats.join(', ')} ({maxFiles} files max)
          </p>
        </motion.div>
      </motion.div>

      {files.length > 0 && (
        <Card className="p-4">
          <h4 className="text-sm font-semibold text-foreground mb-3">Uploaded Files</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 p-3 bg-muted rounded-lg"
              >
                <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                {file.status === 'uploading' && (
                  <div className="w-16 h-1 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${file.progress}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                )}

                {file.status === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="ml-auto"
                >
                  <X className="w-4 h-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
