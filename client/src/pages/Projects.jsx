import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Plus, FolderKanban } from 'lucide-react';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const navigate = useNavigate();

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch { toast.error('Failed to load projects'); }
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    setCreating(true);
    try {
      await api.post('/projects', form);
      toast.success('Project created!');
      setShowModal(false);
      setForm({ name: '', description: '' });
      fetchProjects();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setCreating(false);
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
          </div>
          <button id="create-project-btn" className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18}/> New Project
          </button>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner"></div></div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <FolderKanban size={64}/>
            <div className="empty-state-title">No projects yet</div>
            <p>Create your first project to get started</p>
          </div>
        ) : (
          <div className="card-grid">
            {projects.map(p => (
              <div key={p._id} className="card project-card" onClick={() => navigate(`/projects/${p._id}`)}>
                <div className="project-card-header">
                  <div className="project-card-name">{p.name}</div>
                </div>
                {p.description && <div className="project-card-desc">{p.description.substring(0,100)}{p.description.length > 100 ? '...' : ''}</div>}
                <div className="project-card-stats">
                  <div className="project-card-stat">
                    <div className="project-card-stat-value" style={{color:'var(--info)'}}>{p.taskCounts?.todo || 0}</div>
                    <div className="project-card-stat-label">To Do</div>
                  </div>
                  <div className="project-card-stat">
                    <div className="project-card-stat-value" style={{color:'var(--warning)'}}>{p.taskCounts?.['in-progress'] || 0}</div>
                    <div className="project-card-stat-label">In Progress</div>
                  </div>
                  <div className="project-card-stat">
                    <div className="project-card-stat-value" style={{color:'var(--success)'}}>{p.taskCounts?.done || 0}</div>
                    <div className="project-card-stat-label">Done</div>
                  </div>
                </div>
                <div className="project-members-row">
                  {p.members?.slice(0, 5).map(m => (
                    <div key={m.user?._id || m._id} className="member-avatar" title={m.user?.name}>
                      {m.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                  ))}
                  {p.members?.length > 5 && <span style={{fontSize:12,color:'var(--text-muted)'}}>+{p.members.length - 5}</span>}
                </div>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Create Project</h2>
              <form onSubmit={handleCreate}>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input id="project-name-input" className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="My Awesome Project" required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea id="project-desc-input" className="form-textarea" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="What is this project about?" />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={creating}>{creating ? 'Creating...' : 'Create Project'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
