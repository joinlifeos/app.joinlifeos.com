"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface StarfieldProps {
  className?: string;
  starCount?: number;
  speed?: number;
}

export function Starfield({ className, starCount = 200, speed = 0.5 }: StarfieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Star class
    class Star {
      x: number;
      y: number;
      z: number;
      size: number;
      opacity: number;
      twinkleSpeed: number;
      twinklePhase: number;
      color: string;

      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.z = Math.random() * 1000;
        this.size = Math.random() * 1.5 + 0.3;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.twinkleSpeed = Math.random() * 0.015 + 0.008;
        this.twinklePhase = Math.random() * Math.PI * 2;
        // Color based on star size - dimmer, more subtle colors
        const colorChoice = Math.random();
        if (colorChoice < 0.7) {
          this.color = "#a5b4fc"; // Dimmer indigo
        } else if (colorChoice < 0.9) {
          this.color = "#818cf8"; // Dimmer purple-blue
        } else {
          this.color = "#6366f1"; // Subtle indigo
        }
      }

      update(canvasWidth: number, canvasHeight: number) {
        // Subtle parallax movement
        this.z -= speed;
        if (this.z <= 0) {
          this.z = 1000;
          this.x = Math.random() * canvasWidth;
          this.y = Math.random() * canvasHeight;
        }

        // Twinkling effect - more subtle
        this.twinklePhase += this.twinkleSpeed;
        const twinkle = Math.sin(this.twinklePhase) * 0.2 + 0.8;
        this.opacity = (Math.random() * 0.2 + 0.3) * twinkle;
      }

      draw(ctx: CanvasRenderingContext2D, canvasWidth: number, canvasHeight: number) {
        const x = (this.x - canvasWidth / 2) * (1000 / this.z) + canvasWidth / 2;
        const y = (this.y - canvasHeight / 2) * (1000 / this.z) + canvasHeight / 2;
        const size = (this.size * 1000) / this.z;

        if (x < 0 || x > canvasWidth || y < 0 || y > canvasHeight) {
          return;
        }

        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Add a subtle glow effect for brighter stars (more subtle)
        if (size > 1.2) {
          ctx.globalAlpha = this.opacity * 0.3;
          ctx.shadowBlur = size * 1.5;
          ctx.shadowColor = this.color;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Create stars
    const stars: Star[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star(canvas.width, canvas.height));
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.fillStyle = "rgba(8, 8, 16, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.update(canvas.width, canvas.height);
        star.draw(ctx, canvas.width, canvas.height);
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [starCount, speed]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ zIndex: 0 }}
    />
  );
}

