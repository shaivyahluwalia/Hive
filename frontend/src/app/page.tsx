"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

function HiveVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animId: number;
    let tick = 0;

    // ── Mutable state ────────────────────────────────────────
    const packets: { node: number; t: number; speed: number }[] = [];
    const pulseRings: { r: number; alpha: number }[] = [
      { r: 0, alpha: 0.55 },
      { r: 45, alpha: 0.38 },
      { r: 90, alpha: 0.18 },
    ];

    const toastDefs = [
      { text: '✓ Hired: David V.',           color: '#c8392d', rx: 0.62, ry: 0.12 },
      { text: '⚡ AI Deployed: Analytics',   color: '#059669', rx: 0.58, ry: 0.80 },
      { text: '✓ Task done: Marketing AI',   color: '#1a7fd4', rx: 0.02, ry: 0.58 },
      { text: '✓ Hired: Elena R.',           color: '#c8392d', rx: 0.03, ry: 0.15 },
    ];
    const toasts: { defIdx: number; life: number; delay: number }[] = toastDefs.map((_, i) => ({
      defIdx: i, life: 0, delay: 60 + i * 100,
    }));

    const NODES = [
      { label: 'Marketing AI', type: 'ai',    angle: 0.00, orbitFrac: 0.38, size: 20, color: '#1a7fd4' },
      { label: 'Sarah J.',     type: 'human', angle: 0.78, orbitFrac: 0.30, size: 17, color: '#c8392d' },
      { label: 'HR AI',        type: 'ai',    angle: 1.57, orbitFrac: 0.42, size: 19, color: '#7c3aed' },
      { label: 'David V.',     type: 'human', angle: 2.35, orbitFrac: 0.32, size: 17, color: '#c8392d' },
      { label: 'Analytics AI', type: 'ai',    angle: 3.14, orbitFrac: 0.40, size: 20, color: '#059669' },
      { label: 'Elena R.',     type: 'human', angle: 3.92, orbitFrac: 0.28, size: 16, color: '#c8392d' },
      { label: 'Docs AI',      type: 'ai',    angle: 4.71, orbitFrac: 0.38, size: 19, color: '#d97706' },
      { label: 'Marcus A.',    type: 'human', angle: 5.50, orbitFrac: 0.31, size: 17, color: '#c8392d' },
    ];

    // Initialise packets
    NODES.forEach((_, i) => {
      packets.push({ node: i, t: Math.random(), speed: 0.004 + Math.random() * 0.004 });
    });

    // ── Canvas sizing (no cumulative scale) ──────────────────
    function fit() {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width  = w + 'px';
      canvas.style.height = h + 'px';
    }
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(canvas.parentElement!);

    // ── Helpers ──────────────────────────────────────────────
    function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y,     x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x,     y + h, r);
      ctx.arcTo(x,     y + h, x,     y,     r);
      ctx.arcTo(x,     y,     x + w, y,     r);
      ctx.closePath();
    }

    // ── Main draw loop ───────────────────────────────────────
    function draw() {
      const dpr = window.devicePixelRatio || 1;
      const lw  = canvas.width  / dpr;   // logical width
      const lh  = canvas.height / dpr;   // logical height

      const ctx = canvas.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);   // always reset

      ctx.clearRect(0, 0, lw, lh);

      const cx = lw / 2;
      const cy = lh / 2;
      const baseR = Math.min(lw, lh) * 0.36;

      // Background
      ctx.fillStyle = '#0b0e14';
      ctx.fillRect(0, 0, lw, lh);

      // Grid
      ctx.strokeStyle = 'rgba(26,127,212,0.045)';
      ctx.lineWidth = 1;
      for (let x = 0; x < lw; x += 34) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, lh); ctx.stroke(); }
      for (let y = 0; y < lh; y += 34) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(lw, y); ctx.stroke(); }

      // Ambient glow
      const aGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 1.1);
      aGlow.addColorStop(0, 'rgba(26,127,212,0.09)');
      aGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = aGlow;
      ctx.fillRect(0, 0, lw, lh);

      // Compute node positions
      const speed = (type: string) => type === 'ai' ? 0.18 : 0.11;
      const npos = NODES.map(n => {
        const a = n.angle + tick * speed(n.type);
        const r = baseR * n.orbitFrac;
        return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * 0.58 };
      });

      // Orbit ellipses
      const orbitFracs = [...new Set(NODES.map(n => n.orbitFrac))];
      ctx.strokeStyle = 'rgba(26,127,212,0.07)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 10]);
      orbitFracs.forEach(frac => {
        const r = baseR * frac;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.58, 0, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Beams
      npos.forEach(({ x, y }, i) => {
        const col = NODES[i].color;
        const g = ctx.createLinearGradient(x, y, cx, cy);
        g.addColorStop(0, col + '00');
        g.addColorStop(0.4, col + '44');
        g.addColorStop(1, col + '88');
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Packets
      packets.forEach(pk => {
        const { x: nx, y: ny } = npos[pk.node];
        const px = nx + (cx - nx) * pk.t;
        const py = ny + (cy - ny) * pk.t;
        const col = NODES[pk.node].color;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fillStyle = col + 'aa';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py, 7, 0, Math.PI * 2);
        ctx.fillStyle = col + '22';
        ctx.fill();
        pk.t += pk.speed;
        if (pk.t > 1) pk.t = 0;
      });

      // Pulse rings
      pulseRings.forEach(p => {
        ctx.beginPath();
        ctx.arc(cx, cy, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(26,127,212,${p.alpha.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        p.r    += 0.9;
        p.alpha -= 0.003;
        if (p.alpha <= 0 || p.r > baseR * 1.5) {
          p.r    = 0;
          p.alpha = 0.5;
        }
      });

      // Hub glow
      const hg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
      hg.addColorStop(0, 'rgba(26,127,212,0.22)');
      hg.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 60, 0, Math.PI * 2);
      ctx.fillStyle = hg;
      ctx.fill();

      // Hub circle
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fillStyle = '#0d1117';
      ctx.fill();
      ctx.strokeStyle = 'rgba(26,127,212,0.65)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rotating hexagon inside hub
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tick * 0.3);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const hx = Math.cos(a) * 13;
        const hy = Math.sin(a) * 13;
        i === 0 ? ctx.moveTo(hx, hy) : ctx.lineTo(hx, hy);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(26,127,212,0.85)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Hub label
      ctx.save();
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = 'rgba(26,127,212,0.9)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('HIVE', cx, cy);
      ctx.restore();

      // Nodes
      npos.forEach(({ x, y }, i) => {
        const n = NODES[i];
        // Outer glow
        const ng = ctx.createRadialGradient(x, y, 0, x, y, n.size * 2.2);
        ng.addColorStop(0, n.color + '28');
        ng.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(x, y, n.size * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = ng;
        ctx.fill();

        // Node ring
        ctx.beginPath();
        ctx.arc(x, y, n.size, 0, Math.PI * 2);
        ctx.strokeStyle = n.color + '99';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Node fill
        const nf = ctx.createRadialGradient(x - 3, y - 3, 0, x, y, n.size);
        nf.addColorStop(0, '#1c2230');
        nf.addColorStop(1, '#0d1117');
        ctx.beginPath();
        ctx.arc(x, y, n.size, 0, Math.PI * 2);
        ctx.fillStyle = nf;
        ctx.fill();

        // Icon
        ctx.save();
        if (n.type === 'human') {
          ctx.fillStyle = n.color + 'cc';
          ctx.beginPath();
          ctx.arc(x, y - 4, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = n.color + '66';
          ctx.beginPath();
          ctx.arc(x, y + 10, 8, Math.PI, 0);
          ctx.fill();
        } else {
          ctx.fillStyle = n.color + 'cc';
          ctx.fillRect(x - 6, y - 7, 12, 10);
          ctx.fillStyle = '#0d1117';
          ctx.fillRect(x - 4, y - 5, 3, 3);
          ctx.fillRect(x + 1, y - 5, 3, 3);
          ctx.fillStyle = n.color + 'aa';
          ctx.fillRect(x - 3, y + 1, 6, 1.5);
        }
        ctx.restore();

        // Label tag
        ctx.save();
        ctx.font = '600 7px sans-serif';
        const tw = ctx.measureText(n.label).width;
        const tw2 = tw + 14;
        const tx = x - tw2 / 2;
        const ty = y + n.size + 5;
        rrect(ctx, tx, ty, tw2, 14, 4);
        ctx.fillStyle = 'rgba(13,17,23,0.88)';
        ctx.fill();
        ctx.strokeStyle = n.color + '44';
        ctx.lineWidth = 1;
        rrect(ctx, tx, ty, tw2, 14, 4);
        ctx.stroke();
        ctx.fillStyle = n.type === 'ai' ? n.color : '#e5c5bb';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(n.label, x, ty + 7);
        ctx.restore();
      });

      // Toast notifications
      tick++;
      toasts.forEach(toast => {
        if (tick < toast.delay) return;
        toast.life++;
        const MAX = 150;
        const fade = toast.life < 20 ? toast.life / 20
          : toast.life > MAX - 20 ? (MAX - toast.life) / 20
          : 1;
        if (toast.life > MAX) {
          toast.life = 0;
          toast.delay = tick + 60 + Math.floor(Math.random() * 120);
          return;
        }
        const def = toastDefs[toast.defIdx];
        const tx = def.rx * lw;
        const ty = def.ry * lh;
        const TW = 190, TH = 28;

        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, fade));
        rrect(ctx, tx, ty, TW, TH, 6);
        ctx.fillStyle = 'rgba(13,17,23,0.92)';
        ctx.fill();
        ctx.strokeStyle = def.color + '50';
        ctx.lineWidth = 1;
        rrect(ctx, tx, ty, TW, TH, 6);
        ctx.stroke();
        // accent bar
        ctx.fillStyle = def.color;
        rrect(ctx, tx, ty + 5, 3, TH - 10, 2);
        ctx.fill();
        ctx.font = '600 9px monospace';
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(def.text, tx + 11, ty + TH / 2);
        ctx.restore();
      });

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  );
}

export default function LandingPage() {
  return (
    <div className="hero-section" style={{ flexDirection: 'column', minHeight: 'calc(100vh - 72px)' }}>
      <div className="hero-section" style={{ flex: 1 }}>

        {/* ── LEFT: Brand Messaging ── */}
        <div className="hero-left">
          <span className="hero-eyebrow">// Unified Workforce Hub</span>

          <h1 className="hero-headline">
            <span className="line-black">HIVE:</span>
            <span className="line-red">YOUR MOST</span>
            <span className="line-red">TRUSTED</span>
            <span className="line-red">HIRING PARTNER</span>
          </h1>

          <p className="hero-body">
            Work when you want, hire when you need. Access vetted human contractors and deploy AI-powered digital employees instantly — from one unified dashboard.
          </p>

          <div className="hero-ctas">
            <Link href="/signup?role=Business" className="btn-primary">
              Hire Workforce
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/signup?role=Worker" className="btn-secondary">
              Apply as Talent
            </Link>
          </div>

          <div className="stat-row">
            <div className="stat-item">
              <div className="stat-num">15k+</div>
              <div className="stat-label">Workers</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">4</div>
              <div className="stat-label">AI Employees</div>
            </div>
            <div className="stat-item">
              <div className="stat-num">98%</div>
              <div className="stat-label">Success Rate</div>
            </div>
          </div>

          <div className="hero-seam" />
        </div>

        {/* ── RIGHT: Live Canvas ── */}
        <div className="hero-right" style={{ background: '#0b0e14', overflow: 'hidden', position: 'relative' }}>
          <div className="ai-grid-overlay" />

          {/* Ambient glows */}
          <div style={{
            position: 'absolute', top: '20%', left: '25%',
            width: '260px', height: '260px',
            background: 'radial-gradient(circle, rgba(26,127,212,0.08) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 1,
          }} />
          <div style={{
            position: 'absolute', bottom: '20%', right: '10%',
            width: '200px', height: '200px',
            background: 'radial-gradient(circle, rgba(200,57,45,0.06) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 1,
          }} />

          {/* Canvas */}
          <HiveVisualization />

          {/* Status badge */}
          <div style={{
            position: 'absolute', bottom: '1rem', left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, display: 'flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.3rem 0.9rem', borderRadius: '999px',
            background: 'rgba(26,127,212,0.08)', border: '1px solid rgba(26,127,212,0.2)',
          }}>
            <span style={{
              display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%',
              background: '#1a7fd4', boxShadow: '0 0 6px #1a7fd4',
              animation: 'hvPulse 2s ease-in-out infinite',
            }} />
            <span style={{
              fontSize: '0.6rem', fontWeight: 700, color: 'rgba(26,127,212,0.85)',
              letterSpacing: '0.12em', fontFamily: 'monospace',
            }}>
              LIVE · WORKFORCE NETWORK
            </span>
          </div>
        </div>

      </div>
      <style>{`@keyframes hvPulse{0%,100%{opacity:1;box-shadow:0 0 6px #1a7fd4}50%{opacity:.3;box-shadow:0 0 2px #1a7fd4}}`}</style>
    </div>
  );
}
