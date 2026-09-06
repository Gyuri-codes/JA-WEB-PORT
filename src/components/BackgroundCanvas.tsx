import { useEffect, useRef } from 'react';
import { ThemeId } from '../types';

interface BackgroundCanvasProps {
  theme: ThemeId;
  reducedMotion?: boolean;
}

export function BackgroundCanvas({ theme, reducedMotion = false }: BackgroundCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle setup based on theme
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      alpha: number;
      life?: number;
      maxLife?: number;
      pulse?: number;
    }

    const particles: Particle[] = [];
    const count = reducedMotion ? 15 : 45;

    const createParticle = (initialRandomY = false): Particle => {
      const y = initialRandomY ? Math.random() * height : height + 10;
      const x = Math.random() * width;

      switch (theme) {
        case 'artistic':
          return {
            x,
            y,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.3,
            speedY: -(Math.random() * 0.4 + 0.15),
            color: Math.random() > 0.4 ? '#C5A059' : '#e0e0e0',
            alpha: Math.random() * 0.5 + 0.15,
            pulse: Math.random() * Math.PI * 2,
          };
        case 'immortal':
          return {
            x,
            y,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 0.6,
            speedY: -(Math.random() * 0.6 + 0.3),
            color: Math.random() > 0.4 ? '#06b6d4' : '#c084fc',
            alpha: Math.random() * 0.7 + 0.2,
            pulse: Math.random() * Math.PI * 2,
          };
        case 'pixel':
          return {
            x: Math.floor(x / 8) * 8,
            y: Math.floor(y / 8) * 8,
            size: Math.floor(Math.random() * 3 + 1) * 4,
            speedX: (Math.floor(Math.random() * 3) - 1) * 0.5,
            speedY: -(Math.random() * 0.5 + 0.3),
            color: Math.random() > 0.5 ? '#10b981' : '#38bdf8',
            alpha: 0.4,
          };
        case 'tactical':
          return {
            x,
            y: initialRandomY ? Math.random() * height : Math.random() * height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.4,
            speedY: (Math.random() - 0.5) * 0.4,
            color: '#f43f5e',
            alpha: Math.random() * 0.5 + 0.2,
          };
        case 'legendary':
          return {
            x,
            y,
            size: Math.random() * 3.5 + 1,
            speedX: (Math.random() - 0.5) * 0.7,
            speedY: -(Math.random() * 0.8 + 0.4),
            color: Math.random() > 0.3 ? '#f59e0b' : '#fbbf24',
            alpha: Math.random() * 0.8 + 0.2,
          };
        case 'clash':
          return {
            x,
            y: initialRandomY ? Math.random() * height : height + 10,
            size: Math.random() * 4 + 2,
            speedX: Math.sin(Math.random()) * 0.4,
            speedY: -(Math.random() * 0.6 + 0.3),
            color: Math.random() > 0.5 ? '#eab308' : '#a855f7',
            alpha: 0.5,
          };
        case 'mythic':
        default:
          return {
            x,
            y,
            size: Math.random() * 2.5 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: -(Math.random() * 0.7 + 0.2),
            color: Math.random() > 0.5 ? '#ef4444' : '#eab308',
            alpha: Math.random() * 0.6 + 0.3,
          };
      }
    };

    for (let i = 0; i < count; i++) {
      particles.push(createParticle(true));
    }

    let scanlineY = 0;
    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Distinct atmospheric backdrop rendering per theme
      if (theme === 'artistic') {
        const grad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.2,
          50,
          width * 0.5,
          height * 0.2,
          width * 0.8
        );
        grad.addColorStop(0, 'rgba(197, 160, 89, 0.045)');
        grad.addColorStop(1, 'rgba(15, 15, 15, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'tactical') {
        // High-tech grid overlay
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.035)';
        ctx.lineWidth = 1;
        const gridSize = 48;
        for (let x = 0; x < width; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Tactical horizontal radar scanner
        if (!reducedMotion) {
          scanlineY = (scanlineY + 1.2) % height;
          const gradient = ctx.createLinearGradient(0, scanlineY - 40, 0, scanlineY + 40);
          gradient.addColorStop(0, 'rgba(244, 63, 94, 0)');
          gradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.06)');
          gradient.addColorStop(1, 'rgba(244, 63, 94, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, scanlineY - 40, width, 80);
        }
      } else if (theme === 'immortal') {
        // Flowing ethereal cosmic clouds
        const grad1 = ctx.createRadialGradient(
          width * 0.3 + Math.sin(time * 0.5) * 100,
          height * 0.3,
          20,
          width * 0.3,
          height * 0.3,
          width * 0.6
        );
        grad1.addColorStop(0, 'rgba(6, 182, 212, 0.07)');
        grad1.addColorStop(0.6, 'rgba(192, 132, 252, 0.03)');
        grad1.addColorStop(1, 'transparent');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'pixel') {
        // Chunky pixel scan dots
        ctx.fillStyle = 'rgba(16, 185, 129, 0.025)';
        for (let x = 0; x < width; x += 32) {
          for (let y = 0; y < height; y += 32) {
            ctx.fillRect(x, y, 4, 4);
          }
        }
      } else if (theme === 'legendary') {
        // Regal golden halo
        const grad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.2,
          10,
          width * 0.5,
          height * 0.2,
          width * 0.7
        );
        grad.addColorStop(0, 'rgba(245, 158, 11, 0.08)');
        grad.addColorStop(0.5, 'rgba(217, 119, 6, 0.03)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      } else if (theme === 'mythic') {
        // Celestial crimson & gold swirls
        const grad = ctx.createRadialGradient(
          width * 0.7 + Math.cos(time * 0.4) * 80,
          height * 0.4,
          20,
          width * 0.7,
          height * 0.4,
          width * 0.6
        );
        grad.addColorStop(0, 'rgba(220, 38, 38, 0.08)');
        grad.addColorStop(0.5, 'rgba(234, 179, 8, 0.04)');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw and animate particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reducedMotion) {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.pulse !== undefined) {
            p.pulse += 0.03;
          }

          // Boundary checks
          if (p.y < -20 || p.x < -20 || p.x > width + 20) {
            particles[i] = createParticle(false);
          }
        }

        ctx.save();
        ctx.globalAlpha = p.alpha * (p.pulse ? Math.sin(p.pulse) * 0.3 + 0.7 : 1);
        ctx.fillStyle = p.color;

        if (theme === 'pixel') {
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), p.size, p.size);
        } else if (theme === 'tactical') {
          // Sharp crosshair or diamond particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000"
    />
  );
}
