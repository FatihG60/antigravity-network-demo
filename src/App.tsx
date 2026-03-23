import React, { useEffect, useRef, useState } from 'react';

// Configuration interface for real-time updates
interface Config {
  repelForce: number;
  connectionRadius: number;
  particleDensity: number;
  isAttracting: boolean; // Black hole mode
  theme: 'cyberpunk' | 'matrix' | 'fire';
}

class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseVx: number;
  baseVy: number;
  radius: number;
  hueOffset: number;
  isSpecialNode: boolean;
  label?: string;

  constructor(width: number, height: number, isSpecial = false, label = '') {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.baseVx = (Math.random() - 0.5) * 1.5;
    this.baseVy = (Math.random() - 0.5) * 1.5;
    this.vx = this.baseVx;
    this.vy = this.baseVy;
    this.isSpecialNode = isSpecial;
    this.label = label;
    
    if (isSpecial) {
       this.radius = 6 + Math.random() * 4;
       this.baseVx *= 0.3;
       this.baseVy *= 0.3;
    } else {
       this.radius = Math.random() * 2 + 1;
    }
    this.hueOffset = Math.random();
  }

  getColor(theme: string) {
    if (this.isSpecialNode) return 'hsl(0, 0%, 100%)';
    switch (theme) {
      case 'matrix':
        return `hsl(${120 + this.hueOffset * 30}, 90%, 65%)`;
      case 'fire':
        return `hsl(${10 + this.hueOffset * 30}, 100%, 60%)`;
      case 'cyberpunk':
      default:
        return `hsl(${200 + (this.hueOffset > 0.5 ? 20 : 60)}, 90%, 70%)`;
    }
  }

  update(width: number, height: number, mouseX: number, mouseY: number, config: Config, shockwaves: any[]) {
    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) {
      this.vx *= -1;
      this.baseVx *= -1;
      this.x = Math.max(0, Math.min(width, this.x));
    }
    if (this.y < 0 || this.y > height) {
      this.vy *= -1;
      this.baseVy *= -1;
      this.y = Math.max(0, Math.min(height, this.y));
    }

    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectRadius = config.isAttracting ? 400 : 180;

    // Mouse attract or repel
    if (dist > 0 && dist < effectRadius) {
      const force = (effectRadius - dist) / effectRadius;
      const direction = config.isAttracting ? -1 : 1; // Pull in or push out
      // Special node is heavier
      const weight = this.isSpecialNode ? 0.2 : 1;
      this.vx += (dx / dist) * force * config.repelForce * direction * weight;
      this.vy += (dy / dist) * force * config.repelForce * direction * weight;
    } else {
      this.vx += (this.baseVx - this.vx) * 0.05;
      this.vy += (this.baseVy - this.vy) * 0.05;
    }

    // Shockwave Interaction
    for (const sw of shockwaves) {
      const sdx = this.x - sw.x;
      const sdy = this.y - sw.y;
      const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
      // Ring collision
      if (Math.abs(sdist - sw.radius) < 20) {
         this.vx += (sdx / sdist) * sw.force * (this.isSpecialNode ? 0.3 : 1);
         this.vy += (sdy / sdist) * sw.force * (this.isSpecialNode ? 0.3 : 1);
      }
    }

    const maxSpeed = config.isAttracting ? 12 : (this.isSpecialNode ? 2 : 4);
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > maxSpeed) {
      this.vx = (this.vx / currentSpeed) * maxSpeed;
      this.vy = (this.vy / currentSpeed) * maxSpeed;
    }
  }

  draw(ctx: CanvasRenderingContext2D, theme: string) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.getColor(theme);
    
    if (this.isSpecialNode) {
       ctx.shadowBlur = 20;
       ctx.shadowColor = ctx.fillStyle;
    } else {
       ctx.shadowBlur = 8;
       ctx.shadowColor = ctx.fillStyle;
    }
    
    ctx.fill();
    ctx.shadowBlur = 0;

    if (this.isSpecialNode && this.label) {
       ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
       ctx.font = '12px Inter, sans-serif';
       ctx.textAlign = 'center';
       ctx.fillText(this.label, this.x, this.y - 15);
    }
  }
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Settings State Panel Controls
  const [density, setDensity] = useState<number>(3); // 1 to 5 index
  const [force, setForce] = useState<number>(0.5);
  const [connRadius, setConnRadius] = useState<number>(140);
  const [theme, setTheme] = useState<'cyberpunk'|'matrix'|'fire'>('cyberpunk');

  // Mutable state config injected into requestAnimationFrame without re-renders
  const configRef = useRef<Config>({
    repelForce: 0.5,
    connectionRadius: 140,
    particleDensity: 3,
    isAttracting: false,
    theme: 'cyberpunk'
  });

  // Keep ref up to date with slider states
  useEffect(() => {
    configRef.current = {
      ...configRef.current,
      repelForce: force,
      connectionRadius: connRadius,
      particleDensity: density,
      theme,
    };
  }, [force, connRadius, density, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetX = -1000;
    let targetY = -1000;
    
    let shockwaves: any[] = [];
    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const densityMultiplier = [0.5, 0.8, 1, 1.5, 2][configRef.current.particleDensity - 1];
      const particleCount = Math.floor(((width * height) / 10000) * densityMultiplier);
      
      // Standard nodes
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(width, height));
      }
      // Special Data Nodes
      particles.push(new Particle(width, height, true, "Auth API"));
      particles.push(new Particle(width, height, true, "User DB"));
      particles.push(new Particle(width, height, true, "Core AI"));
    };

    initParticles();

    // Mouse Tracking
    const handleMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
    };
    const handleMouseLeave = () => {
       targetX = -1000;
       targetY = -1000;
       configRef.current.isAttracting = false;
    };
    const handleMouseDown = () => { configRef.current.isAttracting = true; };
    const handleMouseUp = () => { configRef.current.isAttracting = false; };
    
    // Shockwave click
    const handleClick = (e: MouseEvent) => {
       shockwaves.push({
          x: e.clientX,
          y: e.clientY,
          radius: 10,
          opacity: 1,
          force: 15
       });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles(); // Reset bounds
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;

    const draw = () => {
      const gConfig = configRef.current;
      mouseX += (targetX - mouseX) * 0.15;
      mouseY += (targetY - mouseY) * 0.15;

      ctx.fillStyle = 'rgba(10, 10, 15, 0.7)'; // Motion blur trail length
      ctx.fillRect(0, 0, width, height);

      // Handle shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
         let wave = shockwaves[i];
         ctx.beginPath();
         ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
         ctx.strokeStyle = `rgba(255, 255, 255, ${wave.opacity})`;
         ctx.lineWidth = 2;
         ctx.stroke();
         
         wave.radius += 10;
         wave.opacity -= 0.02;
         wave.force *= 0.9;
         
         if (wave.opacity <= 0) {
            shockwaves.splice(i, 1);
         }
      }

      const { connectionRadius, theme } = gConfig;
      
      // Node drawing and connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionRadius) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            const opacity = 1 - (dist / connectionRadius);
            
            // Different line tint based on theme
            let r=130, g=200, b=255;
            if (theme === 'matrix') { r=50; g=220; b=100; }
            if (theme === 'fire') { r=255; g=100; b=50; }
            
            // Highlight special node edges
            if (p1.isSpecialNode || p2.isSpecialNode) {
               ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
               ctx.lineWidth = 1.5;
            } else {
               ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.35})`;
               ctx.lineWidth = 0.8;
            }
            ctx.stroke();
          }
        }
        
        // Mouse connection spring
        const dCursorX = p1.x - mouseX;
        const dCursorY = p1.y - mouseY;
        const distCursor = Math.sqrt(dCursorX * dCursorX + dCursorY * dCursorY);
        
        if (distCursor < connectionRadius + 40) {
           ctx.beginPath();
           ctx.moveTo(p1.x, p1.y);
           ctx.lineTo(mouseX, mouseY);
           const op = 1 - (distCursor / (connectionRadius + 40));
           ctx.strokeStyle = gConfig.isAttracting 
                ? `rgba(255, 50, 100, ${op * 0.8})` // Rage/Attract color
                : `rgba(180, 150, 255, ${op * 0.5})`;
           ctx.lineWidth = gConfig.isAttracting ? 2 : 1;
           ctx.stroke();
        }

        p1.update(width, height, mouseX, mouseY, gConfig, shockwaves);
        p1.draw(ctx, gConfig.theme);
      }

      // Cursor Ambient Glow 
      if (mouseX > 0 && mouseY > 0 && Math.abs(mouseX - targetX) < width) {
        let glowR=100, glowG=150, glowB=255;
        if(gConfig.isAttracting) { glowR=255; glowG=0; glowB=50; }
        else if(theme === 'matrix') { glowR=0; glowG=255; glowB=50; }
        else if(theme === 'fire') { glowR=255; glowG=150; glowB=0; }

        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, gConfig.isAttracting ? 400 : 250);
        gradient.addColorStop(0, `rgba(${glowR}, ${glowG}, ${glowB}, ${gConfig.isAttracting ? 0.3 : 0.1})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        ctx.globalCompositeOperation = 'source-over';
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseout', handleMouseLeave);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#0a0a0f] overflow-hidden font-sans">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
      
      {/* Title Centered Behind Panel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-blue-300 via-purple-400 to-cyan-500 drop-shadow-2xl">
           NEXUS
        </h1>
        <p className="text-gray-400/80 text-xl font-light tracking-[0.2em] uppercase">
          Interactive Node System
        </p>
      </div>

      {/* Glassmorphism Configuration Panel */}
      <div className="absolute top-8 left-8 z-10 w-80 p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] text-white">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
           <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
           </svg>
           Particle Matrix
        </h2>

        <div className="space-y-5">
           {/* Repel Force */}
           <div>
             <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Repel Force</span>
                <span>{force.toFixed(1)}</span>
             </div>
             <input type="range" min="0" max="2" step="0.1" value={force} onChange={e => setForce(Number(e.target.value))} className="w-full accent-purple-500 h-1 bg-gray-700 rounded-lg appearance-none" />
           </div>

           {/* Radius */}
           <div>
             <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Network Radius</span>
                <span>{connRadius}px</span>
             </div>
             <input type="range" min="50" max="300" step="10" value={connRadius} onChange={e => setConnRadius(Number(e.target.value))} className="w-full accent-blue-500 h-1 bg-gray-700 rounded-lg appearance-none" />
           </div>

           {/* Density */}
           <div>
             <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Node Density</span>
                <span>Tier {density}</span>
             </div>
             <input type="range" min="1" max="5" step="1" value={density} onChange={e => setDensity(Number(e.target.value))} className="w-full accent-cyan-500 h-1 bg-gray-700 rounded-lg appearance-none" />
           </div>

           {/* Theme Selection */}
           <div className="pt-2 border-t border-white/10">
              <p className="text-xs text-gray-400 mb-2">Color Theme</p>
              <div className="flex gap-2">
                 <button onClick={() => setTheme('cyberpunk')} className={`flex-1 py-1.5 rounded text-xs transition-colors ${theme === 'cyberpunk' ? 'bg-purple-600/60 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Cyber</button>
                 <button onClick={() => setTheme('matrix')} className={`flex-1 py-1.5 rounded text-xs transition-colors ${theme === 'matrix' ? 'bg-green-600/60 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Matrix</button>
                 <button onClick={() => setTheme('fire')} className={`flex-1 py-1.5 rounded text-xs transition-colors ${theme === 'fire' ? 'bg-orange-600/60 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Fire</button>
              </div>
           </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-xs text-gray-400 leading-relaxed font-mono">
           [CLICK] Force burst<br/>
           [HOLD] Supergravity Pull<br/>
           * Data Nodes highlighted in white.
        </div>
      </div>
    </div>
  );
};

export default App;
