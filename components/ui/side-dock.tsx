'use client';

import { cn } from "@/lib/utils";
import {
  AnimatePresence,
  MotionValue,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface DockItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface SideDockProps {
  items: DockItem[];
  className?: string;
  position?: 'left' | 'right';
}

export const SideDock = ({
  items,
  className,
  position = 'left',
}: SideDockProps) => {
  const pathname = usePathname();
  const mouseY = useMotionValue(Infinity);

  // Mark items as active based on current pathname
  const itemsWithActive = items.map(item => ({
    ...item,
    active: item.href === pathname || item.active,
  }));

  return (
    <motion.div
      onMouseMove={(e) => mouseY.set(e.pageY)}
      onMouseLeave={() => mouseY.set(Infinity)}
      className={cn(
        "fixed top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col items-center gap-4 rounded-2xl bg-card/80 backdrop-blur-md border border-border/50 px-3 py-4 shadow-2xl",
        position === 'left' ? 'left-4' : 'right-4',
        className,
      )}
    >
      {itemsWithActive.map((item) => (
        <DockIconContainer
          mouseY={mouseY}
          key={item.title}
          {...item}
        />
      ))}
    </motion.div>
  );
};

function DockIconContainer({
  mouseY,
  title,
  icon,
  href,
  onClick,
  active = false,
}: {
  mouseY: MotionValue;
  title: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const distance = useTransform(mouseY, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { y: 0, height: 0 };
    return val - bounds.y - bounds.height / 2;
  });

  const widthTransform = useTransform(distance, [-150, 0, 150], [48, 64, 48]);
  const heightTransform = useTransform(distance, [-150, 0, 150], [48, 64, 48]);

  const widthTransformIcon = useTransform(distance, [-150, 0, 150], [24, 32, 24]);
  const heightTransformIcon = useTransform(distance, [-150, 0, 150], [24, 32, 24]);

  const width = useSpring(widthTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const height = useSpring(heightTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const widthIcon = useSpring(widthTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  const heightIcon = useSpring(heightTransformIcon, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  const iconContent = (
    <>
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: -10, y: "-50%" }}
            animate={{ opacity: 1, x: -8, y: "-50%" }}
            exit={{ opacity: 0, x: -5, y: "-50%" }}
            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 w-fit rounded-md border border-border bg-card px-3 py-1.5 text-sm whitespace-pre text-foreground shadow-lg z-50 pointer-events-none"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        style={{ width: widthIcon, height: heightIcon }}
        className={cn(
          "flex items-center justify-center",
          active ? "text-primary" : "text-foreground/70"
        )}
      >
        {icon}
      </motion.div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        <motion.div
          ref={ref}
          style={{ width, height }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          className={cn(
            "relative flex aspect-square items-center justify-center rounded-full transition-all cursor-pointer",
            active
              ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20"
              : "bg-muted/50 hover:bg-muted border-2 border-border hover:border-primary/50"
          )}
        >
          {iconContent}
        </motion.div>
      </Link>
    );
  }

  return (
    <motion.div
      ref={ref}
      style={{ width, height }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-full transition-all cursor-pointer",
        active
          ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20"
          : "bg-muted/50 hover:bg-muted border-2 border-border hover:border-primary/50"
      )}
    >
      {iconContent}
    </motion.div>
  );
}

