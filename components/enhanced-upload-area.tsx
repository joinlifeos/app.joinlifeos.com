'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { UploadAnimated, ClipboardAnimated } from '@/components/ui/animate-icons';
import { useAppStore } from '@/lib/store';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'motion/react';
import { cn } from '@/lib/utils';

export function EnhancedUploadArea() {
  const { currentImage, setCurrentImage } = useAppStore();
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 500, damping: 100 });
  const springY = useSpring(mouseY, { stiffness: 500, damping: 100 });

  const handleRemove = () => {
    setCurrentImage(null);
  };

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
    noClick: false,
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      {currentImage ? (
        <motion.div
          key="image-preview"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ 
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1]
          }}
          className="relative rounded-xl overflow-hidden bg-muted border border-border group shadow-lg hover:shadow-xl hover:shadow-primary/20 transition-shadow duration-300"
        >
          <img
            src={currentImage}
            alt="Preview"
            className="w-full max-h-[500px] object-contain bg-card"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ 
              duration: 0.2,
              ease: [0.4, 0, 0.2, 1],
              delay: 0.05
            }}
            className="absolute top-3 right-3 z-10"
          >
            <Button
              variant="destructive"
              size="icon"
              className="shadow-md hover:shadow-lg transition-shadow duration-200 hover:scale-110 active:scale-95"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          key="upload-area"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ 
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1]
          }}
        >
          {(() => {
            const isActive = isDragActive || isDragging || isHovering;
            const rootProps = getRootProps();

            return (
              <div
                {...rootProps}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => {
                  setIsHovering(false);
                  mouseX.set(0);
                  mouseY.set(0);
                }}
                className={cn(
                  'relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer overflow-hidden transition-all duration-200',
                  isActive
                    ? 'border-primary bg-primary/10 scale-[1.02]'
                    : 'border-border hover:border-primary/50 bg-muted/30 hover:scale-[1.01]'
                )}
              >
                <input {...getInputProps()} />

                {/* Animated background gradient on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 pointer-events-none"
                  animate={{
                    opacity: isActive ? 0.15 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  style={{
                    background: `radial-gradient(600px circle at ${springX}px ${springY}px, oklch(0.65 0.20 260 / 0.2), transparent 40%)`,
                  }}
                />

                <div className="relative z-10 space-y-6">
                  <motion.div
                    className="flex justify-center"
                    animate={{
                      y: isActive ? -4 : 0,
                      scale: isActive ? 1.05 : 1,
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <motion.div
                      className={cn(
                        'rounded-full p-4 transition-colors duration-200',
                        isActive
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted text-muted-foreground'
                      )}
                      animate={{
                        rotate: isActive ? [0, -10, 10, -10, 0] : 0,
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <UploadAnimated className="h-10 w-10" />
                    </motion.div>
                  </motion.div>

                  <motion.div
                    className="space-y-2"
                    animate={{
                      y: isActive ? -2 : 0,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="text-2xl font-semibold text-foreground">
                      Upload Screenshot
                    </h2>
                    <p className="text-muted-foreground">
                      Drag & drop an image or click to browse
                    </p>
                  </motion.div>

                  <motion.div
                    className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          open();
                        }}
                        size="lg"
                        className="group bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg hover:shadow-primary/30 transition-all inline-flex items-center"
                      >
                        <UploadAnimated className="mr-2 h-4 w-4" />
                        Browse Files
                      </Button>
                    </motion.div>

                    <motion.span
                      className="text-sm text-muted-foreground font-medium px-2"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      or
                    </motion.span>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePaste();
                        }}
                        size="lg"
                        className="group border-border hover:border-primary/50 hover:bg-muted transition-all inline-flex items-center"
                      >
                        <ClipboardAnimated className="mr-2 h-4 w-4" />
                        Paste from Clipboard
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
