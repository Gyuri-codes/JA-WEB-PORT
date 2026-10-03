import { useEffect, useRef } from 'react';

interface MythicDynastyBackgroundProps {
  reducedMotion?: boolean;
}

interface GoldenParticle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  alpha: number;
  baseAlpha: number;
  pulsePhase: number;
  pulseSpeed: number;
  color: string;
  glowSize: number;
}

interface MistLayer {
  yFraction: number;
  amplitude: number;
  frequency: number;
  speed: number;
  phase: number;
  baseHeight: number;
  opacity: number;
  color: string;
}

interface FloatingLantern {
  xRatio: number;
  yRatio: number;
  radius: number;
  baseAlpha: number;
  swayPhase: number;
  swaySpeed: number;
  swayDist: number;
  pulsePhase: number;
  pulseSpeed: number;
  colorCore: string;
  colorGlow: string;
}

export function MythicDynastyBackground({ reducedMotion = false }: MythicDynastyBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let time = 0;

    // High-DPI canvas setup
    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 1. Golden Particles (Spirit Motes / Celestial Gold Embers)
    const particleCount = reducedMotion ? 20 : 50;
    const particles: GoldenParticle[] = [];

    const createParticle = (randomY = false): GoldenParticle => {
      const colors = ['#f59e0b', '#fbbf24', '#fef08a', '#eab308', '#d97706'];
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + 15,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: -(Math.random() * 0.45 + 0.15),
        alpha: Math.random() * 0.4 + 0.2,
        baseAlpha: Math.random() * 0.4 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.025 + 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
        glowSize: Math.random() * 8 + 4,
      };
    };

    for (let i = 0; i < particleCount; i++) {
      particles.push(createParticle(true));
    }

    // 2. Multi-tier Flowing Mist Banks
    const mistLayers: MistLayer[] = [
      {
        yFraction: 0.85,
        amplitude: 35,
        frequency: 0.002,
        speed: 0.0006,
        phase: 0,
        baseHeight: 180,
        opacity: 0.07,
        color: '220, 180, 140', // warm earthen mist
      },
      {
        yFraction: 0.72,
        amplitude: 45,
        frequency: 0.0016,
        speed: -0.00045,
        phase: Math.PI / 3,
        baseHeight: 160,
        opacity: 0.05,
        color: '180, 40, 50', // subtle crimson mountain haze
      },
      {
        yFraction: 0.58,
        amplitude: 55,
        frequency: 0.0012,
        speed: 0.0003,
        phase: Math.PI,
        baseHeight: 140,
        opacity: 0.04,
        color: '120, 100, 130', // twilight purple mist
      },
      {
        yFraction: 0.42,
        amplitude: 40,
        frequency: 0.001,
        speed: -0.0002,
        phase: Math.PI * 1.5,
        baseHeight: 110,
        opacity: 0.03,
        color: '210, 175, 120', // distant celestial haze
      },
    ];

    // 3. Palace Lanterns placed gracefully across the architectural scenery
    const lanterns: FloatingLantern[] = [
      {
        xRatio: 0.14,
        yRatio: 0.63,
        radius: 3.5,
        baseAlpha: 0.85,
        swayPhase: 0,
        swaySpeed: 0.015,
        swayDist: 4,
        pulsePhase: 0.4,
        pulseSpeed: 0.03,
        colorCore: '#fff7ed',
        colorGlow: 'rgba(245, 158, 11, 0.4)',
      },
      {
        xRatio: 0.22,
        yRatio: 0.69,
        radius: 3,
        baseAlpha: 0.75,
        swayPhase: 1.2,
        swaySpeed: 0.018,
        swayDist: 3,
        pulsePhase: 1.8,
        pulseSpeed: 0.025,
        colorCore: '#fef08a',
        colorGlow: 'rgba(239, 68, 68, 0.35)',
      },
      {
        xRatio: 0.48,
        yRatio: 0.59,
        radius: 4,
        baseAlpha: 0.9,
        swayPhase: 2.1,
        swaySpeed: 0.013,
        swayDist: 5,
        pulsePhase: 0.9,
        pulseSpeed: 0.02,
        colorCore: '#fffbeb',
        colorGlow: 'rgba(245, 158, 11, 0.45)',
      },
      {
        xRatio: 0.78,
        yRatio: 0.61,
        radius: 3.5,
        baseAlpha: 0.8,
        swayPhase: 3.4,
        swaySpeed: 0.016,
        swayDist: 4,
        pulsePhase: 2.5,
        pulseSpeed: 0.028,
        colorCore: '#fef3c7',
        colorGlow: 'rgba(220, 38, 38, 0.4)',
      },
      {
        xRatio: 0.88,
        yRatio: 0.67,
        radius: 3,
        baseAlpha: 0.7,
        swayPhase: 4.5,
        swaySpeed: 0.02,
        swayDist: 3.5,
        pulsePhase: 3.2,
        pulseSpeed: 0.032,
        colorCore: '#fff7ed',
        colorGlow: 'rgba(245, 158, 11, 0.35)',
      },
    ];

    // Helper: Draw Traditional Chinese Upturned Roof Eaves (飞檐 - Feiyan)
    const drawChineseEaves = (
      centerX: number,
      eaveY: number,
      halfWidth: number,
      tierHeight: number,
      curveLift: number
    ) => {
      ctx.beginPath();
      // Start at left upturned tip
      ctx.moveTo(centerX - halfWidth, eaveY - curveLift);
      // Gentle drooping curve to center ridge, then sweeping up to right tip
      ctx.quadraticCurveTo(centerX, eaveY + 4, centerX + halfWidth, eaveY - curveLift);
      // Eave thickness / underside
      ctx.lineTo(centerX + halfWidth - 6, eaveY + 5);
      ctx.quadraticCurveTo(centerX, eaveY + 11, centerX - halfWidth + 6, eaveY + 5);
      ctx.closePath();
      ctx.fill();

      // Ridge crest peak ornament (Chiwen / ridge decoration)
      ctx.beginPath();
      ctx.moveTo(centerX - 4, eaveY - tierHeight + 3);
      ctx.lineTo(centerX, eaveY - tierHeight - 8);
      ctx.lineTo(centerX + 4, eaveY - tierHeight + 3);
      ctx.closePath();
      ctx.fill();
    };

    // Helper: Draw Multi-tiered Imperial Chinese Pagoda / Palace Pavilion
    const drawPagoda = (
      baseX: number,
      baseY: number,
      scale: number,
      tiers: number,
      fillColor: string
    ) => {
      ctx.save();
      ctx.fillStyle = fillColor;

      let currentWidth = 70 * scale;
      let currentY = baseY;

      // Foundation terrace / balustrade
      ctx.fillRect(baseX - currentWidth * 0.7, currentY - 8 * scale, currentWidth * 1.4, 10 * scale);

      for (let t = 0; t < tiers; t++) {
        const tierHeight = 22 * scale;
        const eaveWidth = currentWidth * 0.65;
        const roofY = currentY - tierHeight;

        // Pavilion body / pillars
        const bodyWidth = currentWidth * 0.45;
        ctx.fillRect(baseX - bodyWidth, roofY, bodyWidth * 2, tierHeight);

        // Intricate upturned Chinese eave
        const curveLift = 8 * scale;
        drawChineseEaves(baseX, roofY, eaveWidth, tierHeight, curveLift);

        currentY = roofY;
        currentWidth *= 0.82; // Taper upwards gracefully
      }

      // Spire / finial on top of pagoda
      ctx.beginPath();
      ctx.moveTo(baseX - 2 * scale, currentY);
      ctx.lineTo(baseX, currentY - 18 * scale);
      ctx.lineTo(baseX + 2 * scale, currentY);
      ctx.closePath();
      ctx.fill();

      // Jewel / lotus finial bead
      ctx.beginPath();
      ctx.arc(baseX, currentY - 14 * scale, 3 * scale, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    // Helper: Draw Traditional Shan Shui Distant Mountain Ridges
    const drawMountainRange = (
      baseHeightFraction: number,
      peakHeight: number,
      color: string,
      roughness: number,
      seedOffset: number
    ) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.beginPath();

      const startY = height * baseHeightFraction;
      ctx.moveTo(0, height);
      ctx.lineTo(0, startY);

      const segments = 24;
      const step = width / segments;

      for (let i = 0; i <= segments; i++) {
        const x = i * step;
        const s = i + seedOffset;
        // Layered harmonic sine for natural mountain peaks
        const elevation =
          Math.sin(s * 0.8) * 0.5 +
          Math.sin(s * 1.7 + 1.2) * 0.3 +
          Math.sin(s * 3.1) * 0.2;
        const y = startY - elevation * peakHeight * roughness;
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Helper: Draw Traditional Stylized Auspicious Cloud (祥云 - Xiangyun)
    const drawAuspiciousCloud = (
      cx: number,
      cy: number,
      scale: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = 'rgba(235, 205, 160, 0.08)';
      ctx.strokeStyle = 'rgba(245, 215, 170, 0.12)';
      ctx.lineWidth = 1 * scale;

      ctx.beginPath();
      // Multi-lobed rolling cloud puff
      ctx.arc(cx, cy, 14 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 12 * scale, cy - 6 * scale, 11 * scale, 0, Math.PI * 2);
      ctx.arc(cx + 26 * scale, cy - 2 * scale, 13 * scale, 0, Math.PI * 2);
      ctx.arc(cx - 14 * scale, cy + 2 * scale, 10 * scale, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Delicate trailing spiral tail
      ctx.beginPath();
      ctx.moveTo(cx - 18 * scale, cy + 4 * scale);
      ctx.quadraticCurveTo(cx - 30 * scale, cy + 12 * scale, cx - 40 * scale, cy + 10 * scale);
      ctx.stroke();

      ctx.restore();
    };

    // Main Animation Render Loop
    const render = () => {
      time += reducedMotion ? 0.003 : 0.012;
      ctx.clearRect(0, 0, width, height);

      // --- 1. BASE CELESTIAL IMPERIAL SKY GRADIENT ---
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      skyGrad.addColorStop(0, '#090507'); // deep obsidian midnight
      skyGrad.addColorStop(0.35, '#13080e'); // imperial lacquer wine
      skyGrad.addColorStop(0.7, '#1b0d15'); // subtle crimson twilight
      skyGrad.addColorStop(1, '#0c070a'); // deep base foundation
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // --- 2. CELESTIAL MOON / HORIZON AURA ---
      const moonX = width * 0.72 + Math.sin(time * 0.2) * 15;
      const moonY = height * 0.22;
      const moonGrad = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, width * 0.45);
      moonGrad.addColorStop(0, 'rgba(254, 240, 138, 0.08)');
      moonGrad.addColorStop(0.35, 'rgba(245, 158, 11, 0.04)');
      moonGrad.addColorStop(0.7, 'rgba(185, 28, 28, 0.025)');
      moonGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = moonGrad;
      ctx.fillRect(0, 0, width, height);

      // --- 3. DISTANT SHAN SHUI MOUNTAINS (Background) ---
      drawMountainRange(0.68, 110, 'rgba(26, 14, 22, 0.75)', 1.0, 2.5);
      drawMountainRange(0.74, 90, 'rgba(20, 11, 18, 0.88)', 0.9, 7.8);

      // --- 4. HIGH MIST & AUSPICIOUS CLOUDS (Upper / Mid) ---
      const cloudOffset1 = (time * 12) % (width + 200) - 100;
      const cloudOffset2 = ((time * 8 + 300) % (width + 260)) - 130;
      drawAuspiciousCloud(cloudOffset1, height * 0.28, 1.2, 0.6);
      drawAuspiciousCloud(width - cloudOffset2, height * 0.38, 0.9, 0.45);
      drawAuspiciousCloud((cloudOffset1 * 0.7 + width * 0.4) % width, height * 0.18, 0.75, 0.4);

      // --- 5. IMPERIAL PALACE & PAGODA SILHOUETTES ---
      // We position pagodas at majestic focal intervals across screen width
      const pagodaBaseY = height * 0.82;
      // Grand Imperial Pavilion Center-Right
      drawPagoda(width * 0.78, pagodaBaseY, Math.min(width / 1100, 1.2) * 1.1, 4, '#0d070b');
      // Twin Lookout Pagoda Left
      drawPagoda(width * 0.18, pagodaBaseY + 15, Math.min(width / 1100, 1.2) * 0.85, 3, '#0b0609');
      // Midground Distant Pagoda
      drawPagoda(width * 0.48, pagodaBaseY - 20, Math.min(width / 1100, 1.2) * 0.65, 3, 'rgba(16, 9, 14, 0.92)');

      // Palace Pavilion Rooftop Wall Silhouette across lower horizon
      ctx.save();
      ctx.fillStyle = '#0a0508';
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(0, pagodaBaseY + 25);
      // Sweeping imperial wall & courtyard eaves
      ctx.quadraticCurveTo(width * 0.25, pagodaBaseY + 15, width * 0.5, pagodaBaseY + 28);
      ctx.quadraticCurveTo(width * 0.75, pagodaBaseY + 12, width, pagodaBaseY + 24);
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // --- 6. IMPERIAL PALACE LANTERNS WITH FLICKERING GLOWS ---
      lanterns.forEach((lantern) => {
        const sway = Math.sin(lantern.swayPhase + time * (reducedMotion ? 0.3 : 1)) * lantern.swayDist;
        const lx = lantern.xRatio * width + sway;
        const ly = lantern.yRatio * height;

        const pulse = Math.sin(lantern.pulsePhase + time * 2) * 0.15 + 0.85;
        const currentAlpha = lantern.baseAlpha * pulse;

        // Lantern cord / wire
        ctx.save();
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lx, ly - 14);
        ctx.lineTo(lx, ly);
        ctx.stroke();

        // Warm radial lantern halo aura
        const glowRadius = lantern.radius * 9 * pulse;
        const lanternGlow = ctx.createRadialGradient(lx, ly, lantern.radius, lx, ly, glowRadius);
        lanternGlow.addColorStop(0, lantern.colorGlow);
        lanternGlow.addColorStop(0.4, 'rgba(245, 158, 11, 0.12)');
        lanternGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = lanternGlow;
        ctx.beginPath();
        ctx.arc(lx, ly, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Lantern oval body
        ctx.fillStyle = lantern.colorCore;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.ellipse(lx, ly, lantern.radius, lantern.radius * 1.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Small top & bottom wooden caps
        ctx.fillStyle = '#451a03';
        ctx.fillRect(lx - lantern.radius * 0.6, ly - lantern.radius * 1.45, lantern.radius * 1.2, 1.8);
        ctx.fillRect(lx - lantern.radius * 0.5, ly + lantern.radius * 1.35, lantern.radius * 1.0, 1.8);

        // Lower decorative tassel
        ctx.strokeStyle = 'rgba(220, 38, 38, 0.6)';
        ctx.beginPath();
        ctx.moveTo(lx, ly + lantern.radius * 1.4);
        ctx.lineTo(lx + sway * 0.3, ly + lantern.radius * 2.4);
        ctx.stroke();

        ctx.restore();
      });

      // --- 7. MULTI-LAYERED FLOWING MIST & ROLLING FOG ---
      mistLayers.forEach((layer, idx) => {
        ctx.save();
        ctx.fillStyle = `rgba(${layer.color}, ${layer.opacity})`;

        const currentPhase = layer.phase + time * (reducedMotion ? 0.2 : 1) * (idx % 2 === 0 ? 1 : -1);
        const baseY = height * layer.yFraction;

        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, baseY);

        // Smooth sinusoidal flowing mist ribbon
        const step = 30;
        for (let x = 0; x <= width + step; x += step) {
          const wave1 = Math.sin(x * layer.frequency + currentPhase) * layer.amplitude;
          const wave2 = Math.cos(x * layer.frequency * 1.6 - currentPhase * 0.8) * (layer.amplitude * 0.4);
          const y = baseY + wave1 + wave2;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      });

      // --- 8. FLOATING GOLDEN PARTICLES (Spirit Embers & Celestial Dust) ---
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!reducedMotion) {
          p.x += p.speedX + Math.sin(time + p.pulsePhase) * 0.25;
          p.y += p.speedY;
          p.pulsePhase += p.pulseSpeed;

          // Boundary wrap
          if (p.y < -15 || p.x < -20 || p.x > width + 20) {
            particles[i] = createParticle(false);
            continue;
          }
        }

        const pulse = Math.sin(p.pulsePhase) * 0.35 + 0.65;
        const finalAlpha = p.baseAlpha * pulse;

        ctx.save();
        ctx.globalAlpha = finalAlpha;

        // Outer soft golden aura
        const pGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.glowSize);
        pGlow.addColorStop(0, p.color);
        pGlow.addColorStop(0.3, 'rgba(245, 158, 11, 0.25)');
        pGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = pGlow;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.glowSize, 0, Math.PI * 2);
        ctx.fill();

        // Sharp sparkling particle core
        ctx.fillStyle = '#fffdf0';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.75, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion]);

  return (
    <div
      className="fixed inset-0 w-full h-full pointer-events-none z-0 overflow-hidden transition-opacity duration-1000"
      aria-hidden="true"
    >
      {/* 1. Procedural 60fps Canvas for Mountains, Palaces, Lanterns, Mist & Golden Motes */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />

      {/* 2. Traditional Subtle Silk Texture Overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.4) 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* 3. Readability & Contrast Shield: Gentle Vignette & Deep Central Well */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#090507]/75 via-transparent to-[#090507]/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(9,5,7,0.78)_100%)] pointer-events-none" />
    </div>
  );
}
