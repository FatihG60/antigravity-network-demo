import React, { useEffect, useRef, useState } from 'react';

// Real-time Settings Configuration
interface Config {
  repelForce: number;
  connectionRadius: number;
  particleDensity: number;
  isAttracting: boolean; // Black hole mode
  theme: 'cyberpunk' | 'matrix' | 'fire' | 'nova' | 'abyss' | 'toxic' | 'synthwave';
  showDataFlows: boolean;
}

// Sparkle/Dust Particles left behind by cursor
class DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;

  constructor(x: number, y: number, theme: string) {
    this.x = x + (Math.random() - 0.5) * 20;
    this.y = y + (Math.random() - 0.5) * 20;
    this.vx = (Math.random() - 0.5) * 2;
    this.vy = (Math.random() - 0.5) * 2 + 1; // Slight gravity fall
    this.life = 0;
    this.maxLife = 30 + Math.random() * 40;
    this.size = Math.random() * 2 + 0.5;

    if (theme === 'fire') this.color = `hsla(${Math.random() * 40}, 100%, 65%, `;
    else if (theme === 'matrix') this.color = `hsla(${100 + Math.random() * 40}, 100%, 65%, `;
    else if (theme === 'nova') this.color = `hsla(${300 + Math.random() * 60}, 100%, 75%, `;
    else if (theme === 'abyss') this.color = `hsla(${200 + Math.random() * 40}, 100%, 60%, `;
    else if (theme === 'toxic') this.color = `hsla(${80 + Math.random() * 40}, 100%, 60%, `;
    else if (theme === 'synthwave') this.color = `hsla(${330 + Math.random() * 60}, 100%, 65%, `;
    else this.color = `hsla(${180 + Math.random() * 60}, 100%, 75%, `;
  }

  updateAndDraw(ctx: CanvasRenderingContext2D) {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    const opacity = 1 - (this.life / this.maxLife);
    if (opacity <= 0) return false; // dead

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color + `${opacity})`;
    ctx.shadowBlur = 8;
    ctx.shadowColor = this.color + '1)';
    ctx.fill();
    ctx.shadowBlur = 0;
    return true; // alive
  }
}

// Data flowing across the network lines
class DataPacket {
  progress: number;
  speed: number;
  startNode: Particle;
  endNode: Particle;
  color: string;

  constructor(start: Particle, end: Particle, theme: string) {
    this.startNode = start;
    this.endNode = end;
    this.progress = 0;
    this.speed = 0.02 + Math.random() * 0.04; // Travel speed
    
    // Brilliant glowing white/theme color
    if (theme === 'fire') this.color = '#ffcc00';
    else if (theme === 'matrix') this.color = '#ffffff';
    else if (theme === 'nova') this.color = '#ffaaee';
    else if (theme === 'abyss') this.color = '#00ffff';
    else if (theme === 'toxic') this.color = '#ccff00';
    else if (theme === 'synthwave') this.color = '#ff00aa';
    else this.color = '#00ffff'; 
  }

  updateAndDraw(ctx: CanvasRenderingContext2D) {
    this.progress += this.speed;
    if (this.progress >= 1) return false; // Arrived

    // Interpolate position
    const x = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress;
    const y = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress;

    // Pulse effect
    const size = 2 + Math.sin(this.progress * Math.PI) * 2;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.fill();
    
    // Trail effect for data
    ctx.beginPath();
    const trailX = this.startNode.x + (this.endNode.x - this.startNode.x) * Math.max(0, this.progress - 0.15);
    const trailY = this.startNode.y + (this.endNode.y - this.startNode.y) * Math.max(0, this.progress - 0.15);
    ctx.moveTo(x, y);
    ctx.lineTo(trailX, trailY);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = size * 0.8;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    ctx.shadowBlur = 0;
    return true;
  }
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
  pulseTime: number;

  constructor(width: number, height: number, isSpecial = false, label = '') {
    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.baseVx = (Math.random() - 0.5) * 1.5;
    this.baseVy = (Math.random() - 0.5) * 1.5;
    this.vx = this.baseVx;
    this.vy = this.baseVy;
    this.isSpecialNode = isSpecial;
    this.label = label;
    this.pulseTime = Math.random() * Math.PI * 2;
    
    if (isSpecial) {
       this.radius = 8 + Math.random() * 4;
       this.baseVx *= 0.2;
       this.baseVy *= 0.2;
    } else {
       // Randomly sizing some normal nodes to be tiny vs medium
       this.radius = Math.random() > 0.8 ? (Math.random() * 3 + 2) : (Math.random() * 1.5 + 0.5);
    }
    this.hueOffset = Math.random();
  }

  getColor(theme: string) {
    if (this.isSpecialNode) return 'hsl(0, 0%, 100%)';
    switch (theme) {
      case 'matrix': return `hsl(${120 + this.hueOffset * 30}, 90%, 65%)`;
      case 'fire': return `hsl(${10 + this.hueOffset * 40}, 100%, 60%)`;
      case 'nova': return `hsl(${280 + this.hueOffset * 60}, 100%, 75%)`;
      case 'abyss': return `hsl(${200 + this.hueOffset * 40}, 100%, 60%)`; // Deep ocean
      case 'toxic': return `hsl(${90 + this.hueOffset * 20}, 100%, 60%)`; // Acid green
      case 'synthwave': return `hsl(${330 + this.hueOffset * 40}, 100%, 65%)`; // Magenta/Pink
      case 'cyberpunk':
      default: return `hsl(${190 + (this.hueOffset > 0.5 ? 20 : 70)}, 100%, 70%)`;
    }
  }

  update(width: number, height: number, mouseX: number, mouseY: number, config: Config, shockwaves: any[]) {
    this.x += this.vx;
    this.y += this.vy;
    this.pulseTime += 0.05;

    // Screen wrap or bounce
    if (this.x < 0 || this.x > width) { this.vx *= -1; this.baseVx *= -1; this.x = Math.max(0, Math.min(width, this.x)); }
    if (this.y < 0 || this.y > height) { this.vy *= -1; this.baseVy *= -1; this.y = Math.max(0, Math.min(height, this.y)); }

    const dx = this.x - mouseX;
    const dy = this.y - mouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const effectRadius = config.isAttracting ? 500 : 200;

    // Mouse Physics
    if (dist > 0 && dist < effectRadius) {
      const force = (effectRadius - dist) / effectRadius;
      const direction = config.isAttracting ? -1.5 : 1; 
      const weight = this.isSpecialNode ? 0.25 : 1.2;
      this.vx += (dx / dist) * force * config.repelForce * direction * weight;
      this.vy += (dy / dist) * force * config.repelForce * direction * weight;
    } else {
      // Natural fluid drift
      this.vx += (this.baseVx - this.vx) * 0.02;
      this.vy += (this.baseVy - this.vy) * 0.02;
    }

    // Shockwave Physics
    for (const sw of shockwaves) {
      const sdx = this.x - sw.x;
      const sdy = this.y - sw.y;
      const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
      if (Math.abs(sdist - sw.radius) < 30) {
         this.vx += (sdx / sdist) * sw.force * (this.isSpecialNode ? 0.3 : 1.5);
         this.vy += (sdy / sdist) * sw.force * (this.isSpecialNode ? 0.3 : 1.5);
      }
    }

    // Velocity limits
    const maxSpeed = config.isAttracting ? 20 : (this.isSpecialNode ? 1.5 : 5);
    const currentSpeed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (currentSpeed > maxSpeed) {
      this.vx = (this.vx / currentSpeed) * maxSpeed;
      this.vy = (this.vy / currentSpeed) * maxSpeed;
    }
  }

  draw(ctx: CanvasRenderingContext2D, theme: string) {
    const baseColor = this.getColor(theme);
    
    // Heartbeat Pulse for Special Nodes
    if (this.isSpecialNode) {
       const pulseRadius = this.radius + 15 + Math.sin(this.pulseTime) * 10;
       ctx.beginPath();
       ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
       let pr=255, pg=255, pb=255;
       if (theme === 'fire') { pr=255; pg=100; pb=0; }
       else if (theme === 'matrix') { pr=0; pg=255; pb=50; }
       else if (theme === 'nova') { pr=255; pg=100; pb=255; }
       else if (theme === 'abyss') { pr=0; pg=150; pb=255; }
       else if (theme === 'toxic') { pr=150; pg=255; pb=0; }
       else if (theme === 'synthwave') { pr=255; pg=0; pb=150; }
       else { pr=0; pg=200; pb=255; }
       
       ctx.fillStyle = `rgba(${pr}, ${pg}, ${pb}, 0.15)`;
       ctx.fill();
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = baseColor;
    ctx.shadowBlur = this.isSpecialNode ? 25 : 12;
    ctx.shadowColor = baseColor;
    ctx.fill();
    ctx.shadowBlur = 0;

    if (this.isSpecialNode && this.label) {
       ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
       ctx.font = '700 13px Inter, sans-serif';
       ctx.textAlign = 'center';
       ctx.fillText(this.label, this.x, this.y - 25);
       
       // High-tech underline
       const metrics = ctx.measureText(this.label);
       ctx.fillRect(this.x - metrics.width/2, this.y - 20, metrics.width, 2);
    }
  }
}

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // UI State
  const [density, setDensity] = useState<number>(3);
  const [force, setForce] = useState<number>(0.8);
  const [connRadius, setConnRadius] = useState<number>(150);
  const [theme, setTheme] = useState<Config['theme']>('nova');
  const [showDataFlows, setShowDataFlows] = useState<boolean>(true);

  // Config reference for canvas loop
  const configRef = useRef<Config>({
    repelForce: 0.8,
    connectionRadius: 150,
    particleDensity: 3,
    isAttracting: false,
    theme: 'nova',
    showDataFlows: true
  });

  useEffect(() => {
    configRef.current = {
      ...configRef.current,
      repelForce: force,
      connectionRadius: connRadius,
      particleDensity: density,
      theme,
      showDataFlows,
    };
  }, [force, connRadius, density, theme, showDataFlows]);

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
    let dustParticles: DustParticle[] = [];
    let dataPackets: DataPacket[] = [];
    let timeAxis = 0; 

    const initParticles = () => {
      particles = [];
      const densityMultiplier = [0.4, 0.7, 1, 1.4, 2][configRef.current.particleDensity - 1];
      const particleCount = Math.floor(((width * height) / 9000) * densityMultiplier);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(width, height));
      }
      particles.push(new Particle(width, height, true, "AUTH PROTOCOL"));
      particles.push(new Particle(width, height, true, "QUANTUM DB"));
      particles.push(new Particle(width, height, true, "NEURAL NET"));
      particles.push(new Particle(width, height, true, "SATELLITE DOWNLINK"));
    };

    initParticles();

    let lastMouseX = -1000;
    let lastMouseY = -1000;

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      
      // Spawn dust slightly when moving cursor fast
      const dx = targetX - lastMouseX;
      const dy = targetY - lastMouseY;
      const speed = Math.sqrt(dx*dx + dy*dy);
      if (speed > 5 && Math.random() > 0.4) {
         for (let i=0; i < Math.min(speed/10, 5); i++) {
           dustParticles.push(new DustParticle(targetX, targetY, configRef.current.theme));
         }
      }
      lastMouseX = targetX;
      lastMouseY = targetY;
    };
    
    const handleMouseLeave = () => {
       targetX = -1000;
       targetY = -1000;
       configRef.current.isAttracting = false;
    };
    const handleMouseDown = () => { configRef.current.isAttracting = true; };
    const handleMouseUp = () => { configRef.current.isAttracting = false; };
    
    const handleClick = (e: globalThis.MouseEvent) => {
       // Super Nova Shockwave!
       shockwaves.push({
          x: e.clientX,
          y: e.clientY,
          radius: 5,
          opacity: 1,
          force: configRef.current.isAttracting ? -30 : 25 // Implode if holding
       });
       // Spawn burst of dust
       for(let i=0; i<30; i++) dustParticles.push(new DustParticle(e.clientX, e.clientY, configRef.current.theme));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseout', handleMouseLeave);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('click', handleClick);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles(); 
    };
    window.addEventListener('resize', handleResize);

    let animationFrameId: number;

    const draw = () => {
      const gConfig = configRef.current;
      timeAxis += 0.005;

      mouseX += (targetX - mouseX) * 0.2;
      mouseY += (targetY - mouseY) * 0.2;

      // Dark, slightly transparent background for Comet/Trail effects (Motion Blur)
      // Different darkness tint based on theme!
      let bgStyle = 'rgba(5, 5, 10, 0.45)';
      if (gConfig.theme === 'matrix') bgStyle = 'rgba(0, 10, 5, 0.5)';
      if (gConfig.theme === 'fire') bgStyle = 'rgba(15, 5, 0, 0.5)';
      if (gConfig.theme === 'nova') bgStyle = 'rgba(10, 0, 15, 0.4)';
      if (gConfig.theme === 'abyss') bgStyle = 'rgba(0, 5, 15, 0.5)';
      if (gConfig.theme === 'toxic') bgStyle = 'rgba(5, 10, 0, 0.5)';
      if (gConfig.theme === 'synthwave') bgStyle = 'rgba(10, 0, 5, 0.45)';
      
      ctx.fillStyle = bgStyle;
      ctx.fillRect(0, 0, width, height);

      // --- 1. NEBULA BACKGROUND EFFECT ---
      ctx.globalCompositeOperation = 'screen';
      const neb1X = width/2 + Math.sin(timeAxis) * width/3;
      const neb1Y = height/2 + Math.cos(timeAxis * 0.8) * height/3;
      const nebGrad1 = ctx.createRadialGradient(neb1X, neb1Y, 0, neb1X, neb1Y, 600);
      let n1R=0, n1G=150, n1B=255;
      if (gConfig.theme === 'fire') { n1R=255; n1G=50; n1B=0; }
      else if (gConfig.theme === 'matrix') { n1R=0; n1G=255; n1B=100; }
      else if (gConfig.theme === 'nova') { n1R=255; n1G=0; n1B=255; }
      else if (gConfig.theme === 'abyss') { n1R=0; n1G=100; n1B=255; }
      else if (gConfig.theme === 'toxic') { n1R=150; n1G=255; n1B=0; }
      else if (gConfig.theme === 'synthwave') { n1R=255; n1G=100; n1B=0; }
      nebGrad1.addColorStop(0, `rgba(${n1R},${n1G},${n1B},0.06)`);
      nebGrad1.addColorStop(1, 'rgba(0,0,0,0)');
      
      const neb2X = width/2 - Math.cos(timeAxis * 1.2) * width/3;
      const neb2Y = height/2 - Math.sin(timeAxis * 1.5) * height/3;
      const nebGrad2 = ctx.createRadialGradient(neb2X, neb2Y, 0, neb2X, neb2Y, 800);
      let n2R=150, n2G=0, n2B=255;
      if (gConfig.theme === 'fire') { n2R=255; n2G=150; n2B=0; }
      else if (gConfig.theme === 'matrix') { n2R=0; n2G=100; n2B=0; }
      else if (gConfig.theme === 'nova') { n2R=100; n2G=0; n2B=255; }
      else if (gConfig.theme === 'abyss') { n2R=0; n2G=50; n2B=150; }
      else if (gConfig.theme === 'toxic') { n2R=50; n2G=150; n2B=0; }
      else if (gConfig.theme === 'synthwave') { n2R=255; n2G=0; n2B=150; }
      nebGrad2.addColorStop(0, `rgba(${n2R},${n2G},${n2B},0.06)`);
      nebGrad2.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = nebGrad1; ctx.fillRect(0,0,width,height);
      ctx.fillStyle = nebGrad2; ctx.fillRect(0,0,width,height);
      ctx.globalCompositeOperation = 'source-over';


      // --- 2. SHOCKWAVES ---
      for (let i = shockwaves.length - 1; i >= 0; i--) {
         let wave = shockwaves[i];
         ctx.beginPath();
         ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
         ctx.strokeStyle = `rgba(255, 255, 255, ${wave.opacity})`;
         ctx.lineWidth = wave.opacity * 5; // Gets thinner as it fades
         ctx.stroke();
         
         // Animate inner ring
         ctx.beginPath();
         ctx.arc(wave.x, wave.y, wave.radius * 0.8, 0, Math.PI * 2);
         ctx.strokeStyle = `rgba(150, 200, 255, ${wave.opacity * 0.5})`;
         ctx.lineWidth = 2;
         ctx.stroke();
         
         wave.radius += gConfig.isAttracting ? -15 : 18; 
         wave.opacity -= 0.025;
         wave.force *= 0.92;
         
         if (wave.opacity <= 0 || wave.radius <= 0) shockwaves.splice(i, 1);
      }

      // --- 3. DUST PARTICLES (CURSOR TRAIL) ---
      for (let i = dustParticles.length - 1; i >= 0; i--) {
         if (!dustParticles[i].updateAndDraw(ctx)) {
            dustParticles.splice(i, 1);
         }
      }

      const { connectionRadius, theme } = gConfig;
      
      // --- 4. DATA NODES & LINK MESH ---
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
            
            // Dynamic theme line colors
            let r=100, g=200, b=255;
            if (theme === 'matrix') { r=50; g=220; b=100; }
            if (theme === 'fire') { r=255; g=120; b=50; }
            if (theme === 'nova') { r=220; g=100; b=255; }
            if (theme === 'abyss') { r=0; g=150; b=220; }
            if (theme === 'toxic') { r=150; g=255; b=50; }
            if (theme === 'synthwave') { r=255; g=100; b=200; }
            
            if (p1.isSpecialNode || p2.isSpecialNode) {
               ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.6})`;
               ctx.lineWidth = 1.2 + opacity;
               
               // Randomly spawn data packet traveling to/from Special Nodes!
               if (gConfig.showDataFlows && Math.random() < 0.005) { 
                  dataPackets.push(new DataPacket(Math.random() > 0.5 ? p1 : p2, Math.random() > 0.5 ? p2 : p1, theme));
               }
            } else {
               ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.35})`;
               ctx.lineWidth = Math.max(0.2, opacity * 1.5);
               
               // Rarely spawn data packet between normal nodes
               if (gConfig.showDataFlows && Math.random() < 0.0005) { 
                  dataPackets.push(new DataPacket(p1, p2, theme));
               }
            }
            // Add gradient to lines depending on distance for "Glowing Mesh" feel
            ctx.stroke();
          }
        }
        
        // --- MOUSE MAGNET TETHERS ---
        const dCursorX = p1.x - mouseX;
        const dCursorY = p1.y - mouseY;
        const distCursor = Math.sqrt(dCursorX * dCursorX + dCursorY * dCursorY);
        
        if (distCursor < connectionRadius + 80 && targetX > -100) {
           ctx.beginPath();
           ctx.moveTo(p1.x, p1.y);
           ctx.lineTo(mouseX, mouseY);
           const op = 1 - (distCursor / (connectionRadius + 80));
           
           ctx.strokeStyle = gConfig.isAttracting 
                ? `rgba(255, 50, 50, ${op * 0.9})` // Rage/Attract color (Red)
                : `rgba(255, 255, 255, ${op * 0.4})`; // White cursor attraction thread
           ctx.lineWidth = gConfig.isAttracting ? 2.5 : 1;
           ctx.shadowBlur = gConfig.isAttracting ? 15 : 0;
           ctx.shadowColor = ctx.strokeStyle;
           ctx.stroke();
           ctx.shadowBlur = 0;
        }

        p1.update(width, height, mouseX, mouseY, gConfig, shockwaves);
        p1.draw(ctx, gConfig.theme);
      }

      // --- 5. DATA PACKET FLOWS ---
      for (let i = dataPackets.length - 1; i >= 0; i--) {
         if (!dataPackets[i].updateAndDraw(ctx)) {
            dataPackets.splice(i, 1);
         }
      }

      // --- 6. MOUSE AMBIENT GLOW ---
      if (mouseX > 0 && mouseY > 0 && Math.abs(mouseX - targetX) < width) {
        let glowR=100, glowG=150, glowB=255;
        if(gConfig.isAttracting) { glowR=255; glowG=0; glowB=50; }
        else if(theme === 'matrix') { glowR=0; glowG=255; glowB=50; }
        else if(theme === 'fire') { glowR=255; glowG=150; glowB=0; }
        else if(theme === 'nova') { glowR=255; glowG=100; glowB=255; }
        else if(theme === 'abyss') { glowR=0; glowG=100; glowB=255; }
        else if(theme === 'toxic') { glowR=150; glowG=255; glowB=0; }
        else if(theme === 'synthwave') { glowR=255; glowG=0; glowB=150; }

        const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, gConfig.isAttracting ? 500 : 350);
        gradient.addColorStop(0, `rgba(${glowR}, ${glowG}, ${glowB}, ${gConfig.isAttracting ? 0.35 : 0.15})`);
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
    <div className="relative w-full h-screen bg-[#020205] overflow-hidden font-sans select-none">
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full cursor-crosshair" />
      
      {/* Title Centered Behind Panel */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
        <h1 className="text-6xl md:text-[8rem] font-black tracking-tighter mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white via-gray-300 to-gray-600 drop-shadow-2xl mix-blend-overlay opacity-80 decoration-slice">
           NEXUS
        </h1>
        <p className="text-white/40 text-sm md:text-xl font-medium tracking-[0.5em] uppercase blur-[0.5px]">
          Quantum Visualizer
        </p>
      </div>

      {/* Glassmorphism Configuration Panel */}
      <div className="absolute top-8 left-8 z-10 w-80 p-6 rounded-3xl bg-black/20 backdrop-blur-xl border border-white/5 shadow-[0_12px_45px_0_rgba(0,0,0,0.5)] text-white/90">
        <h2 className="text-lg font-bold mb-6 flex items-center gap-3 tracking-wide uppercase text-white/80">
           <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
           </svg>
           Hyper Control
        </h2>

        <div className="space-y-6">
           {/* Repel Force */}
           <div>
             <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                <span>Gravitational Field</span>
                <span className="text-white">{(force * 100).toFixed(0)}%</span>
             </div>
             <input type="range" min="0" max="2" step="0.1" value={force} onChange={e => setForce(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
           </div>

           {/* Radius */}
           <div>
             <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                <span>Mesh Bridging</span>
                <span className="text-white">{connRadius}px</span>
             </div>
             <input type="range" min="80" max="350" step="10" value={connRadius} onChange={e => setConnRadius(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
           </div>

           {/* Density */}
           <div>
             <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                <span>Entity Saturation</span>
                <span className="text-white">TL {density}</span>
             </div>
             <input type="range" min="1" max="5" step="1" value={density} onChange={e => setDensity(Number(e.target.value))} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
           </div>

           {/* Data Flows Toggle */}
           <div className="flex items-center justify-between pt-2">
             <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Data Transmissions</span>
             <label className="relative inline-flex items-center cursor-pointer">
               <input type="checkbox" className="sr-only peer" checked={showDataFlows} onChange={() => setShowDataFlows(!showDataFlows)} />
               <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan-500"></div>
             </label>
           </div>

           {/* Theme Selection */}
           <div className="pt-4 border-t border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3">Color Paradigm</p>
              <div className="grid grid-cols-2 gap-2">
                 <button onClick={() => setTheme('cyberpunk')} className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${theme === 'cyberpunk' ? 'bg-cyan-500/80 text-white shadow-[0_0_10px_rgba(0,255,255,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Cyber</button>
                 <button onClick={() => setTheme('matrix')} className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${theme === 'matrix' ? 'bg-green-500/80 text-white shadow-[0_0_10px_rgba(0,255,0,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Matrix</button>
                 <button onClick={() => setTheme('fire')} className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${theme === 'fire' ? 'bg-orange-500/80 text-white shadow-[0_0_10px_rgba(255,100,0,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Inferno</button>
                 <button onClick={() => setTheme('nova')} className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${theme === 'nova' ? 'bg-fuchsia-500/80 text-white shadow-[0_0_10px_rgba(255,0,255,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Nova</button>
                 <button onClick={() => setTheme('abyss')} className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${theme === 'abyss' ? 'bg-blue-600/80 text-white shadow-[0_0_10px_rgba(0,100,255,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Abyss</button>
                 <button onClick={() => setTheme('toxic')} className={`py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${theme === 'toxic' ? 'bg-lime-500/80 text-white shadow-[0_0_10px_rgba(150,255,0,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Toxic</button>
                 <button onClick={() => setTheme('synthwave')} className={`col-span-2 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${theme === 'synthwave' ? 'bg-pink-500/80 text-white shadow-[0_0_10px_rgba(255,0,150,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Synthwave</button>
              </div>
           </div>
        </div>

        {/* Instructions Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
           <ul className="text-[10px] text-gray-400/80 font-mono tracking-wide space-y-1.5 list-disc pl-3">
             <li><strong className="text-white">LCLICK:</strong> Kinetic Burst</li>
             <li><strong className="text-white">HOLD LCLICK:</strong> Gravity Implosion</li>
             <li><strong className="text-white">SWIPE:</strong> Cursor Stardust</li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default App;
