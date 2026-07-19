"use client";

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

function HiveVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    let animId: number;

    // Track mouse coordinates for interactive particle attraction
    const mouse = { x: -9999, y: -9999, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = cvs.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    cvs.addEventListener('mousemove', handleMouseMove);
    cvs.addEventListener('mouseleave', handleMouseLeave);

    // ── Interactive Ambient Particles ────────────────────────
    const dustParticles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = [];
    for (let i = 0; i < 60; i++) {
      dustParticles.push({
        x: Math.random() * 400,
        y: Math.random() * 400,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1 + Math.random() * 2,
        alpha: 0.2 + Math.random() * 0.5,
      });
    }

    function fit() {
      if (!cvs) return;
      const parent = cvs.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio || 1;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      cvs.width  = w * dpr;
      cvs.height = h * dpr;
      cvs.style.width  = w + 'px';
      cvs.style.height = h + 'px';
    }
    fit();
    const ro = new ResizeObserver(fit);
    if (cvs.parentElement) {
      ro.observe(cvs.parentElement);
    }

    function draw() {
      if (!cvs) return;
      const dpr = window.devicePixelRatio || 1;
      const lw  = cvs.width  / dpr;
      const lh  = cvs.height / dpr;

      const ctx = cvs.getContext('2d')!;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Clear transparently
      ctx.clearRect(0, 0, lw, lh);

      // Update and Draw dust particles (affected by mouse distance)
      dustParticles.forEach(p => {
        if (p.x > lw) p.x = 0;
        if (p.y > lh) p.y = 0;
        if (p.x < 0) p.x = lw;
        if (p.y < 0) p.y = lh;

        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            p.vx += (dx / dist) * 0.08;
            p.vy += (dy / dist) * 0.08;
          }
        }

        // Limit velocity
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 1.5) {
          p.vx = (p.vx / speed) * 1.5;
          p.vy = (p.vy / speed) * 1.5;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Apply friction
        p.vx *= 0.96;
        p.vy *= 0.96;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 211, 238, ${p.alpha})`; // Cyan neon matching MacBook display glow
        ctx.fill();
      });

      animId = requestAnimationFrame(draw);
    }

    animId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      cvs.removeEventListener('mousemove', handleMouseMove);
      cvs.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  );
}

export default function LandingPage() {
  const [scene, setScene] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Loop playhead progress bar: 100 steps in 4.5s
    const progInterval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) return 0;
        return p + 1;
      });
    }, 45);

    // Switch scenes every 4.5s
    const sceneInterval = setInterval(() => {
      setScene((s) => {
        if (s === 5) return 1;
        return (s + 1) as 1 | 2 | 3 | 4 | 5;
      });
      setProgress(0);
    }, 4500);

    return () => {
      clearInterval(progInterval);
      clearInterval(sceneInterval);
    };
  }, []);

  const sceneTitles: Record<number, string> = {
    1: "SYSTEM INIT & MONGODB CONNECTOR",
    2: "TALENT DISCOVERY & CONTRACTING",
    3: "AI WORKER DEPLOYMENT PIPELINE",
    4: "REAL-TIME WORKFORCE METRICS BOARD",
    5: "SECURE INR PAYMENTS & RATINGS FLOW",
  };

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

        {/* ── RIGHT: Live-Action Feature Film Simulator ── */}
        <div className="hero-right" style={{ background: '#080a0f', overflow: 'hidden', position: 'relative' }}>
          
          {/* Film screening progress line at the very top */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'rgba(255,255,255,0.06)', zIndex: 30 }}>
            <div style={{ width: `${progress}%`, height: '100%', background: '#1a7fd4', transition: 'width 0.05s linear' }} />
          </div>

          {/* High-Fidelity Desktop Mockup Console */}
          <div style={{
            position: 'absolute',
            inset: '1.5rem',
            background: '#0b0f19',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            zIndex: 5
          }}>
            
            {/* Console Header Bar */}
            <div style={{
              background: 'rgba(255,255,255,0.03)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              padding: '0.6rem 1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }} />
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
              </div>
              <span style={{ fontSize: '0.55rem', color: '#94a3b8', fontWeight: 700, fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                HIVE MOVIE STREAM // CHAPTER 0{scene}/05
              </span>
              <span style={{ fontSize: '0.55rem', color: '#1a7fd4', fontWeight: 800, fontFamily: 'monospace' }}>
                {sceneTitles[scene]}
              </span>
            </div>

            {/* Simulated Live Viewport Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

              {/* CHAPTER 1: Database & Security Overview */}
              <div style={{
                position: 'absolute', inset: 0,
                opacity: scene === 1 ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out',
                zIndex: scene === 1 ? 10 : 1,
                pointerEvents: scene === 1 ? 'auto' : 'none'
              }}>
                <div style={{ padding: '1.2rem', height: '100%', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Database & Security</span>
                    <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 700 }}>SECURE ENGINE</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, justifyContent: 'center' }}>
                    {/* MongoDB Connection Card */}
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px', padding: '0.75rem',
                      display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(16,185,129,0.1)', color: '#10b981',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', animation: 'hvPulse 2s infinite'
                      }}>
                        🛢️
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>MongoDB Database Layer</div>
                        <div style={{ fontSize: '0.58rem', color: '#10b981', marginTop: '0.15rem' }}>
  ● Connected: Hive Cloud Database Cluster
</div>
                      </div>
                    </div>

                    {/* Admin Session Security Card */}
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px', padding: '0.75rem',
                      display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'rgba(26,127,212,0.1)', color: '#1a7fd4',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem'
                      }}>
                        🔑
                      </div>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>JWT Authentication System</div>
                        <div style={{ fontSize: '0.58rem', color: '#1a7fd4', marginTop: '0.15rem' }}>✓ Secure CSRF Token Verification Active</div>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: '0.4rem' }}>
                    RUNNING LOCALHOST DEPLOYMENT ON M1 SILICON PLATFORM
                  </div>
                </div>
              </div>

              {/* CHAPTER 2: Contractor Marketplace */}
              <div style={{
                position: 'absolute', inset: 0,
                opacity: scene === 2 ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out',
                zIndex: scene === 2 ? 10 : 1,
                pointerEvents: scene === 2 ? 'auto' : 'none'
              }}>
                <div style={{ padding: '1.2rem', height: '100%', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Talent Marketplace</span>
                    <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(26,127,212,0.15)', color: '#1a7fd4', fontWeight: 700 }}>VETTED TALENTS FOUND</span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1 }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px', padding: '0.6rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>David V. <span style={{ color: '#94a3b8', fontSize: '0.58rem', fontWeight: 400 }}>· Backend Architect</span></div>
                        <div style={{ fontSize: '0.6rem', color: '#c8392d', marginTop: '0.2rem', fontWeight: 700 }}>₹950 / hr</div>
                      </div>
                      <div style={{ fontSize: '0.58rem', padding: '0.25rem 0.5rem', borderRadius: '4px', background: 'rgba(200,57,45,0.1)', border: '1px solid rgba(200,57,45,0.3)', color: '#c8392d', fontWeight: 800 }}>
                        HIRED
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px', padding: '0.6rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Sarah J. <span style={{ color: '#94a3b8', fontSize: '0.58rem', fontWeight: 400 }}>· UI Developer</span></div>
                        <div style={{ fontSize: '0.6rem', color: '#c8392d', marginTop: '0.2rem', fontWeight: 700 }}>₹800 / hr</div>
                      </div>
                      <div style={{
                        fontSize: '0.58rem', padding: '0.25rem 0.5rem', borderRadius: '4px',
                        background: '#1a7fd4', color: '#fff', fontWeight: 800,
                        boxShadow: '0 0 10px rgba(26,127,212,0.3)',
                        animation: 'simulate-click-btn 2.5s infinite alternate'
                      }}>
                        HIRE CONTRACTOR
                      </div>
                    </div>
                  </div>

                  <div style={{
                    position: 'absolute',
                    top: '65%', left: '72%',
                    width: '12px', height: '12px',
                    borderLeft: '4px solid #fff',
                    borderTop: '4px solid #fff',
                    transform: 'rotate(-25deg)',
                    animation: 'move-cursor 3.5s infinite ease-in-out',
                    zIndex: 20
                  }} />
                </div>
              </div>

              {/* CHAPTER 3: AI Employee Deployment Grid */}
              <div style={{
                position: 'absolute', inset: 0,
                opacity: scene === 3 ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out',
                zIndex: scene === 3 ? 10 : 1,
                pointerEvents: scene === 3 ? 'auto' : 'none'
              }}>
                <div style={{ padding: '1.2rem', height: '100%', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Deploy AI Employees</span>
                    <span style={{ fontSize: '0.6rem', padding: '0.15rem 0.4rem', borderRadius: '4px', background: 'rgba(26,127,212,0.15)', color: '#1a7fd4', fontWeight: 700 }}>2 AGENTS ACTIVE</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', flex: 1, justifyContent: 'center' }}>
                    {/* Lumina AI Agent Card */}
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px', padding: '0.65rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(124,58,237,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>🤖</div>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Lumina AI <span style={{ color: '#8b5cf6', fontSize: '0.58rem' }}>· Codegen</span></div>
                          <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '0.15rem' }}>Auto-writes & checks React files</div>
                        </div>
                      </div>
                      <div style={{
                        fontSize: '0.55rem', padding: '0.2rem 0.4rem', borderRadius: '4px',
                        background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                        color: '#10b981', fontWeight: 800
                      }}>
                        ACTIVE
                      </div>
                    </div>

                    {/* Orion AI Agent Card */}
                    <div style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '8px', padding: '0.65rem',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>⚡</div>
                        <div>
                          <div style={{ fontSize: '0.72rem', fontWeight: 700 }}>Orion AI <span style={{ color: '#f59e0b', fontSize: '0.58rem' }}>· Marketer</span></div>
                          <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginTop: '0.15rem' }}>Compiles campaigns & SEO plans</div>
                        </div>
                      </div>
                      <div style={{
                        fontSize: '0.55rem', padding: '0.2rem 0.4rem', borderRadius: '4px',
                        background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                        color: '#f59e0b', fontWeight: 800,
                        animation: 'hvPulse 2s infinite'
                      }}>
                        DEPLOYING...
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.4rem' }}>
                    <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', background: '#1a7fd4', borderRadius: '2px', width: '100%', animation: 'fill-progress 3.5s ease-out infinite' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* CHAPTER 4: Workforce Board & Metrics */}
              <div style={{
                position: 'absolute', inset: 0,
                opacity: scene === 4 ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out',
                zIndex: scene === 4 ? 10 : 1,
                pointerEvents: scene === 4 ? 'auto' : 'none'
              }}>
                <div style={{ padding: '1.2rem', height: '100%', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>WORKFORCE METRICS OVERVIEW</span>
                    <span style={{ color: '#10b981', fontSize: '0.6rem', fontWeight: 700 }}>4 ACTIVE</span>
                  </div>

                  <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '0.8rem' }}>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.55rem', color: '#94a3b8', textTransform: 'uppercase' }}>Rupees Saved</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#10b981', marginTop: '0.15rem' }}>₹14,250</div>
                    </div>
                    <div style={{ flex: 1, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.5rem', textAlign: 'center' }}>
                      <div style={{ fontSize: '0.55rem', color: '#94a3b8', textTransform: 'uppercase' }}>AI Employees</div>
                      <div style={{ fontSize: '1rem', fontWeight: 900, color: '#1a7fd4', marginTop: '0.15rem' }}>4 Deployed</div>
                    </div>
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', minHeight: '60px' }}>
                    <div style={{ fontSize: '0.55rem', color: '#94a3b8', marginBottom: '0.3rem' }}>DAILY INTEGRATED EFFICIENCY INDEX</div>
                    <div style={{ height: '40px', position: 'relative', borderLeft: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <svg viewBox="0 0 100 40" style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
                        <path d="M 0 35 Q 25 15 50 25 T 100 5" fill="none" stroke="#1a7fd4" strokeWidth="2" strokeDasharray="150" strokeDashoffset="150" style={{ animation: 'draw-chart 3.5s ease-out infinite' }} />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* CHAPTER 5: Payments & Star Reviews */}
              <div style={{
                position: 'absolute', inset: 0,
                opacity: scene === 5 ? 1 : 0,
                transition: 'opacity 0.4s ease-in-out',
                zIndex: scene === 5 ? 10 : 1,
                pointerEvents: scene === 5 ? 'auto' : 'none'
              }}>
                <div style={{ padding: '1.2rem', height: '100%', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.4rem', marginBottom: '0.8rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>TRANSACTION STATUS</span>
                    <span style={{ color: '#10b981', fontSize: '0.6rem', fontWeight: 700 }}>PAID (INR)</span>
                  </div>

                  <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '8px', padding: '0.6rem', marginBottom: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>✓</div>
                    <div>
                      <div style={{ fontSize: '0.7rem', fontWeight: 700 }}>Payment Complete: ₹14,250</div>
                      <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>TXN ID: TXN_DEMO_982 (Verified successfully)</div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '0.6rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '0.3rem' }}>
                    <div style={{ fontSize: '0.62rem', color: '#e2e8f0' }}>David V. - Express API Optimization Review</div>
                    <div style={{ display: 'flex', gap: '0.2rem', margin: '0.2rem 0' }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span key={star} style={{
                          color: '#f59e0b', fontSize: '1rem',
                          animation: `fill-star-${star} 2.5s infinite forwards`
                        }}>★</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '0.55rem', color: '#10b981', fontWeight: 700 }}>FEEDBACK RECORDED IN MONGO DATABASE</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Interactive Ambient Particles (draws on top of simulator canvas) */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none' }}>
            <HiveVisualization />
          </div>

        </div>

      </div>
      <style>{`
        @keyframes hvPulse{0%,100%{opacity:1;box-shadow:0 0 6px #1a7fd4}50%{opacity:.3;box-shadow:0 0 2px #1a7fd4}}
        @keyframes spin-dashed {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-solid {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes simulate-click-btn {
          0%, 80% { transform: scale(1); filter: brightness(1); }
          90% { transform: scale(0.93); filter: brightness(0.85); }
          100% { transform: scale(1); filter: brightness(1.1); }
        }
        @keyframes move-cursor {
          0% { transform: translate(0, 0) rotate(-25deg); }
          40% { transform: translate(-30px, -45px) rotate(-25deg); }
          50% { transform: translate(-30px, -45px) scale(0.8) rotate(-25deg); }
          60% { transform: translate(-30px, -45px) scale(1) rotate(-25deg); }
          100% { transform: translate(0, 0) rotate(-25deg); }
        }
        @keyframes fill-progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes draw-chart {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fill-star-1 { 0%, 10% { opacity: 0.15; } 15%, 100% { opacity: 1; } }
        @keyframes fill-star-2 { 0%, 25% { opacity: 0.15; } 30%, 100% { opacity: 1; } }
        @keyframes fill-star-3 { 0%, 40% { opacity: 0.15; } 45%, 100% { opacity: 1; } }
        @keyframes fill-star-4 { 0%, 55% { opacity: 0.15; } 60%, 100% { opacity: 1; } }
        @keyframes fill-star-5 { 0%, 70% { opacity: 0.15; } 75%, 100% { opacity: 1; } }
      `}</style>
    </div>
  );
}
