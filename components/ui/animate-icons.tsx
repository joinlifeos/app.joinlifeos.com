'use client';

import { Upload, Clipboard } from 'lucide-react';

export function UploadAnimated({ className }: { className?: string }) {
  return (
    <span className="inline-flex transition-transform duration-200 group-hover:-translate-y-0.5">
      <Upload className={className} />
    </span>
  );
}

export function ClipboardAnimated({ className }: { className?: string }) {
  return (
    <span className="inline-flex transition-transform duration-200 group-hover:-rotate-6">
      <Clipboard className={className} />
    </span>
  );
}


