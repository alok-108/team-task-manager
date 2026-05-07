import { useState, useEffect } from 'react';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { CheckCircle, Clock, AlertTriangle, FolderKanban, ListTodo, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-layout"><Sidebar/><div className="main-content"><div className="loading"><div className="spinner"></div></div></div></div>;

  const o = data?.overview || {};
  const my = data?.myStats || {};

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Overview of all your projects and tasks</p>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-icon purple"><FolderKanban size={24}/></div>
            <div><div className="stat-value">{o.totalProjects || 0}</div><div className="stat-label">Projects</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><ListTodo size={24}/></div>
            <div><div className="stat-value">{o.totalTasks || 0}</div><div className="stat-label">Total Tasks</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon green"><CheckCircle size={24}/></div>
            <div><div className="stat-value">{o.done || 0}</div><div className="stat-label">Completed</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon orange"><Clock size={24}/></div>
            <div><div className="stat-value">{o.inProgress || 0}</div><div className="stat-label">In Progress</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon red"><AlertTriangle size={24}/></div>
            <div><div className="stat-value">{o.overdue || 0}</div><div className="stat-label">Overdue</div></div>
          </div>
          <div className="stat-card">
            <div className="stat-icon purple"><TrendingUp size={24}/></div>
            <div><div className="stat-value">{o.completionRate || 0}%</div><div className="stat-label">Completion Rate</div></div>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:24}}>
          <div className="card">
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>My Tasks</h3>
            <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
              <div><span style={{fontSize:24,fontWeight:800,color:'var(--info)'}}>{my.todo||0}</span><div style={{fontSize:12,color:'var(--text-muted)'}}>To Do</div></div>
              <div><span style={{fontSize:24,fontWeight:800,color:'var(--warning)'}}>{my.inProgress||0}</span><div style={{fontSize:12,color:'var(--text-muted)'}}>In Progress</div></div>
              <div><span style={{fontSize:24,fontWeight:800,color:'var(--success)'}}>{my.done||0}</span><div style={{fontSize:12,color:'var(--text-muted)'}}>Done</div></div>
              <div><span style={{fontSize:24,fontWeight:800,color:'var(--danger)'}}>{my.overdue||0}</span><div style={{fontSize:12,color:'var(--text-muted)'}}>Overdue</div></div>
            </div>
          </div>

          <div className="card">
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Project Breakdown</h3>
            {data?.projectStats?.length > 0 ? data.projectStats.map(p => (
              <div key={p._id} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontWeight:600,fontSize:14}}>{p.name}</span>
                  <span style={{fontSize:13,color:'var(--text-muted)'}}>{p.done}/{p.totalTasks}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: p.totalTasks > 0 ? `${(p.done/p.totalTasks)*100}%` : '0%'}}></div>
                </div>
              </div>
            )) : <p style={{color:'var(--text-muted)',fontSize:14}}>No projects yet</p>}
          </div>
        </div>

        {data?.upcomingTasks?.length > 0 && (
          <div className="card" style={{marginTop:24}}>
            <h3 style={{fontSize:16,fontWeight:700,marginBottom:16}}>Upcoming Deadlines (Next 7 Days)</h3>
            {data.upcomingTasks.map(t => (
              <div key={t._id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <div>
                  <span style={{fontWeight:600,fontSize:14}}>{t.title}</span>
                  <span style={{marginLeft:8,fontSize:12,color:'var(--text-muted)'}}>{t.project?.name}</span>
                </div>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span className={`badge badge-${t.status}`}>{t.status}</span>
                  <span style={{fontSize:13,color:'var(--warning)'}}>{new Date(t.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
