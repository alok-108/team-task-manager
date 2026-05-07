import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FolderKanban, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      <button className="mobile-menu-btn btn-icon" onClick={() => setOpen(!open)}>
        {open ? <X size={20}/> : <Menu size={20}/>}
      </button>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">T</div>
          <span className="sidebar-title">TaskFlow</span>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/dashboard" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
            <LayoutDashboard size={20}/> Dashboard
          </NavLink>
          <NavLink to="/projects" className={({isActive}) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={() => setOpen(false)}>
            <FolderKanban size={20}/> Projects
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initial}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-email">{user?.email}</div>
            </div>
          </div>
          <button className="sidebar-link" onClick={handleLogout} style={{marginTop: 8, color: 'var(--danger)'}}>
            <LogOut size={20}/> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
