"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { User, FileText, CheckCircle, Clock, Briefcase, Search, MapPin, ArrowRight, Upload, X, FileBadge2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

const MOCK_JOBS = [
  { id: 1, title: 'Waiter / Server', company: 'The Grand Bistro', location: 'Mumbai', type: 'Part-time', pay: '₹1,200/hr', tags: ['Hospitality', 'Customer Service'] },
  { id: 2, title: 'Cashier', company: 'FreshMart Grocery', location: 'Delhi', type: 'Full-time', pay: '₹1,100/hr', tags: ['Retail', 'POS Systems'] },
  { id: 3, title: 'Receptionist', company: 'Apex Coworking', location: 'Bangalore', type: 'Full-time', pay: '₹1,550/hr', tags: ['Front Desk', 'Communication'] },
  { id: 4, title: 'Delivery Executive', company: 'SwiftShip Logistics', location: 'Pune', type: 'Freelance', pay: '₹1,350/hr', tags: ['Driving', 'Navigation'] },
  { id: 5, title: 'Salesperson', company: 'BrightSell Agency', location: 'Hyderabad', type: 'Full-time', pay: '₹1,700/hr', tags: ['Sales', 'B2C', 'CRM'] },
  { id: 6, title: 'Office Assistant', company: 'CleanEdge Facilities', location: 'Chennai', type: 'Part-time', pay: '₹1,250/hr', tags: ['Admin', 'Organization'] },
];

const MOCK_APPLICATIONS = [
  { title: 'Waiter / Server', company: 'The Grand Bistro', status: 'Pending', date: '2 days ago' },
  { title: 'Receptionist', company: 'Apex Coworking', status: 'Hired', date: '1 week ago' },
  { title: 'Delivery Executive', company: 'SwiftShip Logistics', status: 'Rejected', date: '2 weeks ago' },
];

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Hired:    { bg: 'rgba(34,197,94,0.1)',  color: '#16a34a' },
  Pending:  { bg: 'rgba(234,179,8,0.1)', color: '#a16207' },
  Rejected: { bg: 'rgba(239,68,68,0.08)', color: '#dc2626' },
};

export default function WorkerDashboard() {
  const { user, csrfToken, refreshUser } = useAuth();
  const [searchJob, setSearchJob] = useState('');
  const [appliedIds, setAppliedIds] = useState<number[]>([]);

  // Resume state
  const [resumeFile, setResumeFile]       = useState<File | null>(null);
  const [resumeSkills, setResumeSkills]   = useState('');
  const [resumeExp, setResumeExp]         = useState('');
  const [resumeBio, setResumeBio]         = useState('');
  const [resumeSaving, setResumeSaving]   = useState(false);
  const [resumeSaved, setResumeSaved]     = useState(false);
  const [resumeError, setResumeError]     = useState('');
  const [existingResume, setExistingResume] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Load existing resume info on mount
  useEffect(() => {
    const loadResume = async () => {
      try {
        const res = await fetch('/api/resume/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.resumePath)   setExistingResume(data.resumePath);
          if (data.resumeSkills) setResumeSkills(data.resumeSkills);
          if (data.resumeExp)    setResumeExp(data.resumeExp);
          if (data.resumeBio)    setResumeBio(data.resumeBio);
          if (data.resumePath)   setResumeSaved(true);
        }
      } catch { /* not logged in or no resume yet */ }
    };
    if (user?.role === 'Worker') loadResume();
  }, [user]);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) { setResumeFile(file); setResumeSaved(false); setResumeError(''); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setResumeFile(file); setResumeSaved(false); setResumeError(''); }
  };

  const handleResumeSave = async () => {
    setResumeSaving(true);
    setResumeError('');
    try {
      const formData = new FormData();
      if (resumeFile) formData.append('file', resumeFile);
      formData.append('skills',     resumeSkills);
      formData.append('experience', resumeExp);
      formData.append('bio',        resumeBio);

      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        headers: { 'X-CSRF-Token': csrfToken },
        body: formData,
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok) {
        setResumeSaved(true);
        if (data.filename) setExistingResume(data.filename);
        await refreshUser();
      } else {
        setResumeError(data.error || 'Upload failed. Please try again.');
      }
    } catch {
      setResumeError('Network error. Please check your connection.');
    } finally {
      setResumeSaving(false);
    }
  };

  const filtered = MOCK_JOBS.filter(j =>
    j.title.toLowerCase().includes(searchJob.toLowerCase()) ||
    j.tags.some(t => t.toLowerCase().includes(searchJob.toLowerCase()))
  );

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* ── Profile Header ── */}
        <div className="hive-card" style={{ padding: '1.75rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'var(--tint-human)', border: '2px solid var(--border-human)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <User className="h-8 w-8" style={{ color: 'var(--accent-red)' }} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
              {user?.username || 'Job Seeker'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', marginTop: '0.25rem' }}>
              Status: <span style={{ color: '#16a34a', fontWeight: 700 }}>Available for Work</span>
              {resumeSaved && <span style={{ marginLeft: '0.75rem', color: 'var(--accent-blue)', fontWeight: 700 }}>· Resume Uploaded ✓</span>}
            </p>
          </div>
          <button className="btn-secondary" style={{ fontSize: '0.8125rem', flexShrink: 0 }}>
            Edit Profile
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem' }}>
          {[
            { label: 'Applications Sent', value: '3', icon: FileText,    color: '#3b82f6' },
            { label: 'Pending Review',    value: '1', icon: Clock,        color: '#f59e0b' },
            { label: 'Hired',             value: '1', icon: CheckCircle,  color: '#22c55e' },
          ].map(s => (
            <div key={s.label} className="hive-card" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <s.icon className="h-5 w-5" style={{ color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--fg-primary)', lineHeight: 1, fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>{s.value}</div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--fg-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '0.2rem' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Resume Builder Section ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'rgba(26,127,212,0.08)', border: '1px solid rgba(26,127,212,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <FileBadge2 className="h-4.5 w-4.5" style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
                My Resume
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginTop: '0.1rem' }}>
                Upload your CV and add your key skills so businesses can find you faster.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>

            {/* Upload box */}
            <div
              className="hive-card"
              onDragOver={e => e.preventDefault()}
              onDrop={handleFileDrop}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', cursor: 'pointer' }}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleFileChange} />

              {/* Drop zone */}
              <div style={{
                border: '2px dashed rgba(26,127,212,0.2)', borderRadius: '0.75rem',
                padding: '2rem', textAlign: 'center',
                background: resumeFile ? 'rgba(26,127,212,0.03)' : 'rgba(24,24,26,0.02)',
                transition: 'background 0.15s'
              }}>
                {resumeFile ? (
                  <>
                    <FileBadge2 className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--accent-blue)' }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg-primary)' }}>{resumeFile.name}</p>
                    <p style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', marginTop: '0.25rem' }}>
                      {(resumeFile.size / 1024).toFixed(0)} KB · {resumeFile.type.includes('pdf') ? 'PDF' : 'Word'}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--fg-muted)', opacity: 0.5 }} />
                    <p style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg-primary)' }}>
                      Drop your resume here
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--fg-muted)', marginTop: '0.25rem' }}>
                      PDF, DOC or DOCX · Max 5 MB
                    </p>
                    <span className="btn-secondary" style={{ display: 'inline-flex', marginTop: '0.875rem', fontSize: '0.75rem', padding: '0.4rem 1rem' }}>
                      Browse File
                    </span>
                  </>
                )}
              </div>

              {/* Show previously uploaded resume */}
              {existingResume && !resumeFile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)' }}>
                  <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#16a34a' }} />
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#16a34a' }}>Resume on file: {existingResume}</span>
                </div>
              )}

              {resumeFile && (
                <button
                  onClick={e => { e.stopPropagation(); setResumeFile(null); setResumeSaved(false); setResumeError(''); }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem', color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  <X className="h-3.5 w-3.5" /> Remove file
                </button>
              )}
            </div>

            {/* Skills & experience fields */}
            <div className="hive-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>
                  Key Skills
                </label>
                <input
                  type="text"
                  value={resumeSkills}
                  onChange={e => setResumeSkills(e.target.value)}
                  placeholder="e.g. Customer Service, POS, Inventory..."
                  className="hive-input"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>
                  Years of Experience
                </label>
                <select
                  value={resumeExp}
                  onChange={e => setResumeExp(e.target.value)}
                  className="hive-input"
                  style={{ fontSize: '0.875rem' }}
                >
                  <option value="">Select range</option>
                  <option>Less than 1 year</option>
                  <option>1–2 years</option>
                  <option>3–5 years</option>
                  <option>5+ years</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', marginBottom: '0.4rem' }}>
                  Short Bio (optional)
                </label>
                <textarea
                  placeholder="A 1–2 sentence intro about yourself..."
                  rows={3}
                  value={resumeBio}
                  onChange={e => setResumeBio(e.target.value)}
                  className="hive-input"
                  style={{ fontSize: '0.875rem', resize: 'none', lineHeight: 1.55 }}
                />
              </div>

              {resumeError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.75rem', borderRadius: '8px', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.8125rem', color: '#dc2626' }}>
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {resumeError}
                </div>
              )}

              <button
                onClick={handleResumeSave}
                disabled={resumeSaving || (!resumeFile && !resumeSkills && !existingResume)}
                className={resumeSaved ? 'btn-secondary' : 'btn-primary'}
                style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.875rem', opacity: (resumeSaving || (!resumeFile && !resumeSkills && !existingResume)) ? 0.55 : 1 }}
              >
                {resumeSaving ? (
                  <><div style={{ width: '14px', height: '14px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Saving...</>
                ) : resumeSaved ? (
                  <><CheckCircle className="h-4 w-4" /> Profile Updated</>
                ) : (
                  <><Upload className="h-4 w-4" /> Save Resume & Skills</>
                )}
              </button>
            </div>

          </div>
        </section>

        {/* ── Browse Jobs ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>Browse Jobs</h2>
            <div style={{ position: 'relative', minWidth: '240px' }}>
              <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', width: '15px', height: '15px', color: 'var(--fg-muted)' }} />
              <input
                type="text"
                value={searchJob}
                onChange={e => setSearchJob(e.target.value)}
                placeholder="Search by role or skill..."
                className="hive-input"
                style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1rem' }}>
            {filtered.map(job => (
              <div key={job.id} className="hive-card" style={{ padding: '1.25rem 1.375rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--fg-primary)' }}>{job.title}</h3>
                    <span style={{
                      fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                      padding: '0.2rem 0.6rem', borderRadius: '999px',
                      background: job.type === 'Full-time' ? 'rgba(34,197,94,0.1)' : 'rgba(59,130,246,0.1)',
                      color: job.type === 'Full-time' ? '#16a34a' : '#2563eb'
                    }}>
                      {job.type}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-muted)' }}>{job.company}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--fg-muted)' }}>
                      <MapPin className="h-3 w-3" />{job.location}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem' }}>
                  {job.tags.map(t => <span key={t} className="skill-tag">{t}</span>)}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--accent-red)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>{job.pay}</span>
                  <button
                    onClick={() => setAppliedIds(prev => prev.includes(job.id) ? prev : [...prev, job.id])}
                    disabled={appliedIds.includes(job.id)}
                    className={appliedIds.includes(job.id) ? 'btn-secondary' : 'btn-primary'}
                    style={{ fontSize: '0.75rem', padding: '0.45rem 1rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                  >
                    {appliedIds.includes(job.id) ? (
                      <><CheckCircle className="h-3.5 w-3.5" /> Applied</>
                    ) : (
                      <>Apply <ArrowRight className="h-3.5 w-3.5" /></>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Application Tracker ── */}
        <section>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", marginBottom: '1rem' }}>My Applications</h2>
          <div className="hive-card" style={{ overflow: 'hidden' }}>
            <div style={{ borderBottom: '1px solid rgba(24,24,26,0.06)', background: 'rgba(24,24,26,0.02)', padding: '0.875rem 1.25rem', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem' }}>
              {['Job Title', 'Company', 'Date', 'Status'].map(h => (
                <span key={h} style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>{h}</span>
              ))}
            </div>
            {MOCK_APPLICATIONS.map((app, i) => {
              const s = STATUS_STYLE[app.status];
              return (
                <div key={i} style={{
                  padding: '1rem 1.25rem',
                  display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '1rem', alignItems: 'center',
                  borderBottom: i < MOCK_APPLICATIONS.length - 1 ? '1px solid rgba(24,24,26,0.05)' : 'none'
                }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--fg-primary)' }}>{app.title}</span>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--fg-muted)' }}>{app.company}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--fg-muted)' }}>{app.date}</span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0.25rem 0.75rem', borderRadius: '999px',
                    fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                    background: s.bg, color: s.color, width: 'fit-content'
                  }}>
                    {app.status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
