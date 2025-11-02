'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Upload, Clipboard, X } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export function EnhancedUploadArea() {
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative rounded-xl overflow-hidden bg-slate-50 border border-slate-200 group"
      >
        <img
          src={currentImage}
          alt="Preview"
          className="w-full max-h-[500px] object-contain bg-white"
        />
        <Button
          variant="destructive"
          size="icon"
          className="absolute top-3 right-3 shadow-md hover:shadow-lg transition-shadow"
          onClick={() => setCurrentImage(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer',
        isDragActive || isDragging
          ? 'border-blue-500 bg-blue-50/50'
          : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
      )}
    >
      <input {...getInputProps()} />

      <div className="space-y-6">
        <div className="flex justify-center">
          <div
            className={cn(
              'rounded-full p-4 transition-colors duration-200',
              isDragActive || isDragging
                ? 'bg-blue-100 text-blue-600'
                : 'bg-slate-100 text-slate-400'
            )}
          >
            <Upload className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-900">
            Upload Event Screenshot
          </h2>
          <p className="text-slate-600">
            Drag & drop an image or click to browse
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              open();
            }}
            size="lg"
            className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow transition-all"
          >
            <Upload className="mr-2 h-4 w-4" />
            Browse Files
          </Button>

          <span className="text-sm text-slate-500 font-medium px-2">or</span>

          <Button
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              handlePaste();
            }}
            size="lg"
            className="border-slate-300 hover:border-slate-400 hover:bg-slate-50 transition-all"
          >
            <Clipboard className="mr-2 h-4 w-4" />
            Paste from Clipboard
          </Button>
        </div>
      </div>
    </div>
  );
}
