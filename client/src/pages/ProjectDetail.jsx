import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, UserPlus, ArrowLeft, Edit3, Users } from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('tasks'); // 'tasks' | 'members'
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
  const [memberEmail, setMemberEmail] = useState('');
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${id}`);
      setProject(data);
      const member = data.members?.find(m => (m.user?._id || m.user) === user?._id);
      setIsAdmin(member?.role === 'admin');
      setEditForm({ name: data.name, description: data.description || '' });
    } catch { toast.error('Project not found'); navigate('/projects'); }
  };

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/projects/${id}/tasks`);
      setTasks(data);
    } catch { /* silent */ }
  };

  useEffect(() => {
    Promise.all([fetchProject(), fetchTasks()]).then(() => setLoading(false));
  }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/tasks`, {
        ...taskForm,
        assignedTo: taskForm.assignedTo || undefined,
        dueDate: taskForm.dueDate || undefined,
      });
      toast.success('Task created!');
      setShowTaskModal(false);
      setTaskForm({ title: '', description: '', assignedTo: '', priority: 'medium', dueDate: '' });
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      await api.put(`/projects/${id}/tasks/${taskId}`, { status });
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Cannot update'); }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    try {
      await api.delete(`/projects/${id}/tasks/${taskId}`);
      toast.success('Task deleted');
      fetchTasks();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: 'member' });
      toast.success('Member added!');
      setMemberEmail('');
      setShowMemberModal(false);
      fetchProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member?')) return;
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      toast.success('Member removed');
      fetchProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEditProject = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/projects/${id}`, editForm);
      toast.success('Project updated');
      setShowEditModal(false);
      fetchProject();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleDeleteProject = async () => {
    if (!confirm('Delete this project and all tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Project deleted');
      navigate('/projects');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  if (loading) return <div className="app-layout"><Sidebar/><div className="main-content"><div className="loading"><div className="spinner"></div></div></div></div>;

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  const renderTask = (task) => {
    const overdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done';
    return (
      <div key={task._id} className="task-card">
        <div className="task-card-header">
          <div className="task-card-title">{task.title}</div>
        </div>
        {task.description && <p style={{fontSize:13,color:'var(--text-secondary)',marginBottom:8}}>{task.description.substring(0,80)}</p>}
        <div className="task-card-meta">
          <span className={`badge badge-${task.priority}`}>{task.priority}</span>
          {overdue && <span className="badge badge-overdue">Overdue</span>}
          {task.dueDate && <span style={{fontSize:12,color:'var(--text-muted)'}}>{new Date(task.dueDate).toLocaleDateString()}</span>}
          {task.assignedTo && (
            <span style={{fontSize:12,color:'var(--text-muted)'}}>→ {task.assignedTo.name}</span>
          )}
        </div>
        <div className="task-card-actions">
          <select className="form-select" style={{padding:'4px 8px',fontSize:12,width:'auto'}} value={task.status} onChange={e => handleStatusChange(task._id, e.target.value)}>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          {isAdmin && (
            <button className="btn-icon" style={{padding:4}} onClick={() => handleDeleteTask(task._id)} title="Delete">
              <Trash2 size={14}/>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:8}}>
          <button className="btn-icon" onClick={() => navigate('/projects')}><ArrowLeft size={18}/></button>
          <div style={{flex:1}}>
            <h1 className="page-title">{project?.name}</h1>
            {project?.description && <p className="page-subtitle">{project.description}</p>}
          </div>
          {isAdmin && (
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-secondary btn-sm" onClick={() => setShowEditModal(true)}><Edit3 size={14}/> Edit</button>
              <button className="btn btn-danger btn-sm" onClick={handleDeleteProject}><Trash2 size={14}/> Delete</button>
            </div>
          )}
        </div>

        <div style={{display:'flex',gap:8,marginBottom:24,borderBottom:'1px solid var(--border)',paddingBottom:12}}>
          <button className={`btn btn-sm ${tab==='tasks' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('tasks')}>
            Tasks ({tasks.length})
          </button>
          <button className={`btn btn-sm ${tab==='members' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab('members')}>
            <Users size={14}/> Members ({project?.members?.length || 0})
          </button>
          {isAdmin && tab === 'tasks' && (
            <button className="btn btn-primary btn-sm" style={{marginLeft:'auto'}} onClick={() => setShowTaskModal(true)}>
              <Plus size={14}/> Add Task
            </button>
          )}
          {isAdmin && tab === 'members' && (
            <button className="btn btn-primary btn-sm" style={{marginLeft:'auto'}} onClick={() => setShowMemberModal(true)}>
              <UserPlus size={14}/> Add Member
            </button>
          )}
        </div>

        {tab === 'tasks' && (
          tasks.length === 0 ? (
            <div className="empty-state"><div className="empty-state-title">No tasks yet</div><p>Create a task to get started</p></div>
          ) : (
            <div className="kanban-board">
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title" style={{color:'var(--info)'}}>To Do</span>
                  <span className="kanban-column-count">{todoTasks.length}</span>
                </div>
                <div className="kanban-tasks">{todoTasks.map(renderTask)}</div>
              </div>
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title" style={{color:'var(--warning)'}}>In Progress</span>
                  <span className="kanban-column-count">{inProgressTasks.length}</span>
                </div>
                <div className="kanban-tasks">{inProgressTasks.map(renderTask)}</div>
              </div>
              <div className="kanban-column">
                <div className="kanban-column-header">
                  <span className="kanban-column-title" style={{color:'var(--success)'}}>Done</span>
                  <span className="kanban-column-count">{doneTasks.length}</span>
                </div>
                <div className="kanban-tasks">{doneTasks.map(renderTask)}</div>
              </div>
            </div>
          )
        )}

        {tab === 'members' && (
          <div className="members-list">
            {project?.members?.map(m => (
              <div key={m.user?._id || m._id} className="member-row">
                <div className="sidebar-avatar" style={{width:36,height:36,fontSize:14}}>{m.user?.name?.charAt(0)?.toUpperCase()}</div>
                <div className="member-info">
                  <div className="member-name">{m.user?.name}</div>
                  <div className="member-email">{m.user?.email}</div>
                </div>
                <span className={`badge badge-${m.role}`}>{m.role}</span>
                {isAdmin && m.user?._id !== project.owner?._id && (
                  <button className="btn-icon" onClick={() => handleRemoveMember(m.user?._id)} title="Remove"><Trash2 size={14}/></button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Task Modal */}
        {showTaskModal && (
          <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Create Task</h2>
              <form onSubmit={handleCreateTask}>
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input className="form-input" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} required autoFocus />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} />
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  <div className="form-group">
                    <label className="form-label">Assign To</label>
                    <select className="form-select" value={taskForm.assignedTo} onChange={e => setTaskForm({...taskForm, assignedTo: e.target.value})}>
                      <option value="">Unassigned</option>
                      {project?.members?.map(m => (
                        <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Priority</label>
                    <select className="form-select" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Due Date</label>
                  <input className="form-input" type="date" value={taskForm.dueDate} onChange={e => setTaskForm({...taskForm, dueDate: e.target.value})} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Task</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Member Modal */}
        {showMemberModal && (
          <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Add Member</h2>
              <form onSubmit={handleAddMember}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input className="form-input" type="email" value={memberEmail} onChange={e => setMemberEmail(e.target.value)} placeholder="member@example.com" required autoFocus />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Add Member</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Project Modal */}
        {showEditModal && (
          <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <h2 className="modal-title">Edit Project</h2>
              <form onSubmit={handleEditProject}>
                <div className="form-group">
                  <label className="form-label">Project Name</label>
                  <input className="form-input" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={editForm.description} onChange={e => setEditForm({...editForm, description: e.target.value})} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
