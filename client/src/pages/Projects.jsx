import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import Spinner from '../components/Spinner.jsx';
import { IconFilm, IconPlus, IconSearch } from '../components/Icons.jsx';

const FILTERS = ['', 'Planning', 'In Production', 'Completed'];

export default function Projects() {
  const toast = useToast();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState(''); // debounced version that is sent to the API
  const [status, setStatus] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Wait 300ms after the user stops typing before searching (fewer requests)
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchText.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await api.getProjects({ search, status });
      setProjects(data.projects);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(form) {
    const result = await api.createProject(form);
    toast.success('Project created');
    setShowForm(false);
    navigate(`/projects/${result.project._id}`);
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await api.deleteProject(toDelete._id);
      toast.success(`"${toDelete.title}" deleted`);
      setToDelete(null);
      await load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  const isFiltering = search !== '' || status !== '';

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Library</p>
          <h1>Projects</h1>
          <p className="page-subtitle">Every shoot you are planning, in one place.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <IconPlus size={16} /> New project
        </button>
      </header>

      <div className="toolbar">
        <div className="search-box">
          <IconSearch size={16} />
          <input
            type="search"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search projects by name"
            aria-label="Search projects by name"
          />
        </div>

        <div className="chips" role="group" aria-label="Filter by status">
          {FILTERS.map((f) => (
            <button
              key={f || 'all'}
              className={status === f ? 'chip chip-active' : 'chip'}
              onClick={() => setStatus(f)}
            >
              {f || 'All'}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner label="Loading projects..." />
      ) : error ? (
        <div>
          <div className="form-alert">{error}</div>
          <button className="btn btn-ghost" onClick={load}>
            Try again
          </button>
        </div>
      ) : projects.length === 0 ? (
        isFiltering ? (
          <EmptyState
            icon={<IconSearch size={28} />}
            title="No matching projects"
            text="Try a different name or clear the status filter."
          >
            <button
              className="btn btn-ghost"
              onClick={() => {
                setSearchText('');
                setStatus('');
              }}
            >
              Clear filters
            </button>
          </EmptyState>
        ) : (
          <EmptyState
            icon={<IconFilm size={30} />}
            title="No projects yet"
            text="Create your first project to start building a shot list."
          >
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <IconPlus size={16} /> New project
            </button>
          </EmptyState>
        )
      ) : (
        <div className="project-grid">
          {projects.map((project) => (
            <ProjectCard key={project._id} project={project} onDelete={setToDelete} />
          ))}
        </div>
      )}

      {showForm && <ProjectForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />}

      {toDelete && (
        <ConfirmModal
          title="Delete this project?"
          message={`"${toDelete.title}" and all ${toDelete.shotCount} of its shots will be permanently deleted. This cannot be undone.`}
          busy={deleting}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
    </div>
  );
}
