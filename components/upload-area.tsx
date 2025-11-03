'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, Clipboard } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export function UploadArea() {
  const { currentImage, setCurrentImage } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setCurrentImage(result);
        };
        reader.readAsDataURL(file);
      }
    },
    [setCurrentImage]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    noClick: true,
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  });

  const handlePaste = async () => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imgType = item.types.find((t) => t.startsWith('image/'));
        if (imgType) {
          const blob = await item.getType(imgType);
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setCurrentImage(result);
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    } catch (error) {
      console.error('Clipboard access failed:', error);
    }
  };

  if (currentImage) {
    return (
      <div className="relative rounded-xl overflow-hidden shadow-lg border">
        <img
          src={currentImage}
          alt="Preview"
          className="w-full max-h-[500px] object-contain bg-muted"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-4 right-4"
          onClick={() => setCurrentImage(null)}
        >
          ×
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
        isDragActive || isDragging
          ? 'border-primary bg-primary/5'
          : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-4 h-16 w-16 text-primary" />
      <h2 className="text-2xl font-semibold mb-2">Upload Screenshot</h2>
      <p className="text-muted-foreground mb-6">
        Drag & drop an image or click to browse
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button onClick={open} size="lg">
          Browse Files
        </Button>
        <div className="text-sm text-muted-foreground">OR</div>
        <Button variant="outline" onClick={handlePaste} size="lg">
          <Clipboard className="mr-2 h-4 w-4" />
          Paste from Clipboard
        </Button>
      </div>
    </div>
  );
}

