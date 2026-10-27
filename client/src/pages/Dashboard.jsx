import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import Spinner from '../components/Spinner.jsx';
import { IconFilm, IconPlus } from '../components/Icons.jsx';

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api.getDashboard());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(form) {
    const result = await api.createProject(form);
    toast.success('Project created');
    setShowForm(false);
    navigate(`/projects/${result.project._id}`);
  }

  if (loading) return <Spinner label="Loading your workspace..." />;

  if (error) {
    return (
      <div className="page">
        <div className="form-alert">{error}</div>
        <button className="btn btn-ghost" onClick={load}>
          Try again
        </button>
      </div>
    );
  }

  const { stats, recentProjects } = data;
  const remaining = stats.totalShots - stats.completedShots;

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Production workspace</p>
          <h1>Welcome back, {user.username}</h1>
          <p className="page-subtitle">Here is what is happening across your shoots.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <IconPlus size={16} /> New project
        </button>
      </header>

      <section className="stats-grid">
        <div className="stat">
          <span className="stat-label">Projects</span>
          <strong className="stat-value">{stats.totalProjects}</strong>
        </div>
        <div className="stat">
          <span className="stat-label">Planned shots</span>
          <strong className="stat-value">{stats.totalShots}</strong>
        </div>
        <div className="stat stat-accent">
          <span className="stat-label">Completed shots</span>
          <strong className="stat-value">{stats.completedShots}</strong>
          <small className="muted">{remaining} still to shoot</small>
        </div>
      </section>

      {stats.totalProjects === 0 ? (
        <EmptyState
          icon={<IconFilm size={30} />}
          title="Your first production starts here"
          text="Create a project, then break it down into scenes and shots. Everything you plan will show up on this dashboard."
        >
          <button className="btn btn-primary btn-lg" onClick={() => setShowForm(true)}>
            <IconPlus size={16} /> Create your first project
          </button>
        </EmptyState>
      ) : (
        <section>
          <div className="section-head">
            <h2>Recently updated</h2>
            <Link to="/projects" className="link">
              View all projects
            </Link>
          </div>
          <div className="project-grid">
            {recentProjects.map((project) => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        </section>
      )}

      {showForm && <ProjectForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}
    </div>
  );
}
