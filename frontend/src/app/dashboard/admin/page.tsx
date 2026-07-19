"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Users, Briefcase, Cpu, IndianRupee, Trash2, 
  ShieldAlert, RefreshCw, Layers, Loader2 
} from 'lucide-react';

interface UserRecord {
  _id: string;
  username: string;
  email: string;
  role: 'Business' | 'Worker' | 'Admin';
  createdAt: string;
  availability?: string;
  rating?: number;
}

interface JobRecord {
  _id: string;
  title: string;
  category: string;
  budget: number;
  workerType: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  businessId: string;
  workerId: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, loading, csrfToken } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<UserRecord[]>([]);
  const [jobsList, setJobsList] = useState<JobRecord[]>([]);
  const [fetching, setFetching] = useState(true);

  // Redirect if unauthorized
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'Admin') {
        if (user.role === 'Business') router.push('/dashboard/business');
        else router.push('/dashboard/worker');
      }
    }
  }, [user, loading, router]);

  const fetchAdminData = async () => {
    setFetching(true);
    try {
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }

      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData.users);
      }

      const jobsRes = await fetch('/api/admin/jobs');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobsList(jobsData.jobs);
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'Admin') {
      fetchAdminData();
    }
  }, [user]);

  const handleDeleteUser = async (id: string) => {
    if (id === user?._id) {
      alert("Self-termination is forbidden.");
      return;
    }
    if (!confirm('Are you sure you want to permanently delete this user account?')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'X-CSRF-Token': csrfToken
        }
      });

      if (res.ok) {
        alert('User account deleted successfully.');
        fetchAdminData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading || !user) {
    return (
      <div style={{ display: 'flex', minHeight: '80vh', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)' }}>
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--accent-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--fg-muted)' }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', background: 'var(--bg-canvas)', padding: '2.5rem 2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', borderBottom: '1px solid rgba(24,24,26,0.06)', paddingBottom: '1.5rem' }}>
          <div>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-muted)', marginBottom: '0.35rem' }}>
              System Command Console
            </p>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldAlert className="h-6 w-6" style={{ color: 'var(--accent-red)' }} />
              Platform Administration
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--fg-muted)', marginTop: '0.35rem' }}>
              Audit user accounts, track contracts, and review deployed AI employee configurations.
            </p>
          </div>
          
          <button
            onClick={fetchAdminData}
            disabled={fetching}
            className="btn-primary"
            style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${fetching ? 'animate-spin' : ''}`} />
            Refresh Log
          </button>
        </div>

        {fetching && !stats ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '12rem' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid var(--accent-red)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* ── Stats Row ── */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
                {[
                  { label: 'Platform Users', val: stats.totalUsers, sub: `${stats.businessCount} Clients · ${stats.workerCount} Workers`, icon: Users, color: 'rgba(24,24,26,0.04)' },
                  { label: 'Active Contracts', val: `${stats.inProgressJobs + stats.completedJobs} Jobs`, sub: `${stats.pendingJobs} Pending bids`, icon: Briefcase, color: 'rgba(200,57,45,0.08)' },
                  { label: 'AI Runtimes', val: stats.activeAiTasks + stats.completedAiTasks, sub: `${stats.activeAiTasks} Active tasks`, icon: Cpu, color: 'rgba(26,127,212,0.08)' },
                  { label: 'Spend Volume', val: `₹${stats.totalSpend.toLocaleString('en-IN')}`, sub: `Saved: ₹${stats.estimatedSavings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'rgba(24,24,26,0.04)' }
                ].map((c, i) => (
                  <div key={i} className="hive-card" style={{ padding: '1.25rem 1.5rem', background: '#fff' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px',
                      background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: '0.875rem'
                    }}>
                      <c.icon className="h-4.5 w-4.5" style={{ color: 'var(--fg-primary)' }} />
                    </div>
                    <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', display: 'block' }}>
                      {c.label}
                    </span>
                    <span style={{ fontSize: '1.375rem', fontWeight: 900, color: 'var(--fg-primary)', fontFamily: "var(--font-outfit,'Outfit',sans-serif)", display: 'block', marginTop: '0.25rem', lineHeight: 1.1 }}>
                      {c.val}
                    </span>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--fg-muted)', display: 'block', marginTop: '0.25rem' }}>
                      {c.sub}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* ── Tables Grid ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
              
              {/* User Moderation */}
              <div className="hive-card" style={{ padding: '1.5rem', background: '#fff' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--fg-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
                  <Users className="h-4.5 w-4.5" style={{ color: 'var(--accent-red)' }} />
                  User Directory Accounts
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(24,24,26,0.06)' }}>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>Username</th>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>Role</th>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersList.map((u) => (
                        <tr key={u._id} style={{ borderBottom: '1px solid rgba(24,24,26,0.04)' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-primary)', display: 'block' }}>{u.username}</span>
                            <span style={{ fontSize: '0.6875rem', color: 'var(--fg-muted)', display: 'block' }}>{u.email}</span>
                          </td>
                          <td style={{ padding: '0.75rem' }}>
                            <span className={u.role === 'Business' ? 'badge-red' : u.role === 'Worker' ? 'badge-blue' : 'skill-tag'}>
                              {u.role}
                            </span>
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              style={{
                                background: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.15)',
                                color: '#dc2626', padding: '0.35rem', borderRadius: '6px', cursor: 'pointer',
                                display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Jobs Audit Log */}
              <div className="hive-card" style={{ padding: '1.5rem', background: '#fff' }}>
                <h3 style={{ fontSize: '0.9375rem', fontWeight: 800, color: 'var(--fg-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "var(--font-outfit,'Outfit',sans-serif)" }}>
                  <Layers className="h-4.5 w-4.5" style={{ color: 'var(--accent-blue)' }} />
                  Global Contracts Log
                </h3>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(24,24,26,0.06)' }}>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>Project</th>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)' }}>Budget</th>
                        <th style={{ padding: '0.5rem 0.75rem', fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--fg-muted)', textAlign: 'right' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobsList.map((job) => (
                        <tr key={job._id} style={{ borderBottom: '1px solid rgba(24,24,26,0.04)' }}>
                          <td style={{ padding: '0.75rem' }}>
                            <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-primary)', display: 'block', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</span>
                            <span style={{ fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--fg-muted)', display: 'block', marginTop: '0.15rem' }}>{job.workerType}</span>
                          </td>
                          <td style={{ padding: '0.75rem', fontSize: '0.8125rem', fontWeight: 700, color: 'var(--fg-primary)' }}>
                            ₹{job.budget.toLocaleString('en-IN')}
                          </td>
                          <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                            <span style={{
                              fontSize: '0.625rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em',
                              padding: '0.2rem 0.5rem', borderRadius: '999px',
                              background: job.status === 'Completed' ? 'rgba(34,197,94,0.1)' : job.status === 'In Progress' ? 'rgba(59,130,246,0.1)' : 'rgba(234,179,8,0.1)',
                              color: job.status === 'Completed' ? '#16a34a' : job.status === 'In Progress' ? '#2563eb' : '#d97706'
                            }}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
