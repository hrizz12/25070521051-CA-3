import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ProjectForm from '../components/ProjectForm.jsx';
import ShotForm from '../components/ShotForm.jsx';
import Spinner from '../components/Spinner.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import {
  IconArrowLeft,
  IconCalendar,
  IconCheck,
  IconClock,
  IconEdit,
  IconFilm,
  IconPin,
  IconPlus,
  IconTrash,
} from '../components/Icons.jsx';
import { formatDate, formatDuration, pad } from '../components/format.js';
import NotFound from './NotFound.jsx';

const SHOT_FILTERS = ['', 'Planned', 'Ready', 'Completed'];

export default function ProjectDetail() {
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [projectLoading, setProjectLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  const [shots, setShots] = useState([]);
  const [shotsLoading, setShotsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('scene');
  const [order, setOrder] = useState('asc');

  // Modals: editProject (true/false), shotForm (null | 'new' | a shot object)
  const [editProject, setEditProject] = useState(false);
  const [shotForm, setShotForm] = useState(null);
  const [confirmProject, setConfirmProject] = useState(false);
  const [shotToDelete, setShotToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadProject = useCallback(async () => {
    try {
      const data = await api.getProject(id);
      setProject(data.project);
      setNotFound(false);
    } catch (err) {
      if (err.status === 404 || err.status === 400) setNotFound(true);
      else setError(err.message);
    } finally {
      setProjectLoading(false);
    }
  }, [id]);

  const loadShots = useCallback(async () => {
    try {
      const data = await api.getShots(id, { status: statusFilter, sort, order });
      setShots(data.shots);
    } catch (err) {
      if (err.status !== 404 && err.status !== 400) toast.error(err.message);
    } finally {
      setShotsLoading(false);
    }
  }, [id, statusFilter, sort, order, toast]);

  useEffect(() => {
    setProjectLoading(true);
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    loadShots();
  }, [loadShots]);

  // After any change: refresh the shot list AND the project (its shot counts changed)
  async function refreshAll() {
    await Promise.all([loadProject(), loadShots()]);
  }

  async function handleSaveProject(form) {
    const data = await api.updateProject(id, form);
    toast.success('Project updated');
    setProject((current) => ({ ...current, ...data.project }));
    setEditProject(false);
  }

  async function handleDeleteProject() {
    setDeleting(true);
    try {
      await api.deleteProject(id);
      toast.success('Project deleted');
      navigate('/projects', { replace: true });
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
    }
  }

  async function handleSaveShot(form) {
    if (shotForm && shotForm !== 'new') {
      await api.updateShot(shotForm._id, form);
      toast.success('Shot updated');
    } else {
      await api.createShot(id, form);
      toast.success('Shot added');
    }
    setShotForm(null);
    await refreshAll();
  }

  async function handleToggleComplete(shot) {
    const next = shot.status === 'Completed' ? 'Planned' : 'Completed';
    try {
      await api.updateShotStatus(shot._id, next);
      toast.success(next === 'Completed' ? 'Shot marked completed' : 'Shot reopened');
      await refreshAll();
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleDeleteShot() {
    setDeleting(true);
    try {
      await api.deleteShot(shotToDelete._id);
      toast.success('Shot deleted');
      setShotToDelete(null);
      await refreshAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  }

  // Pre-fill numbers for a new shot: same scene as the last shot, next shot number
  function suggestNumbers() {
    if (shots.length === 0) return { scene: 1, shot: 1 };
    const lastScene = Math.max(...shots.map((s) => s.sceneNumber));
    const inScene = shots.filter((s) => s.sceneNumber === lastScene).map((s) => s.shotNumber);
    return { scene: lastScene, shot: Math.max(...inScene) + 1 };
  }

  if (projectLoading && !project) return <Spinner label="Loading project..." />;
  if (notFound) return <NotFound message="This project does not exist, or it does not belong to your account." />;
  if (error) {
    return (
      <div className="page">
        <div className="form-alert">{error}</div>
        <Link to="/projects" className="btn btn-ghost">
          Back to projects
        </Link>
      </div>
    );
  }
  if (!project) return null;

  const percent = project.shotCount > 0 ? Math.round((project.completedCount / project.shotCount) * 100) : 0;
  const totalSeconds = shots.reduce((sum, s) => sum + (s.estimatedDuration || 0), 0);
  const suggested = suggestNumbers();

  return (
    <div className="page">
      <Link to="/projects" className="back-link">
        <IconArrowLeft size={16} /> All projects
      </Link>

      <header className="page-header">
        <div>
          <div className="title-row">
            <h1>{project.title}</h1>
            <StatusBadge status={project.status} />
          </div>
          {project.description && <p className="page-subtitle">{project.description}</p>}
          <div className="meta-list meta-list-large">
            <span>
              <IconCalendar size={15} /> {formatDate(project.shootDate)}
            </span>
            {project.location && (
              <span>
                <IconPin size={15} /> {project.location}
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button className="btn btn-ghost" onClick={() => setEditProject(true)}>
            <IconEdit size={16} /> Edit
          </button>
          <button className="btn btn-ghost btn-danger-text" onClick={() => setConfirmProject(true)}>
            <IconTrash size={16} /> Delete
          </button>
        </div>
      </header>

      <section className="progress-panel">
        <div>
          <strong>
            {project.completedCount} of {project.shotCount}
          </strong>{' '}
          <span className="muted">shots completed</span>
        </div>
        <div className="progress progress-large">
          <div className="progress-bar" style={{ width: `${percent}%` }} />
        </div>
        <span className="muted">{percent}%</span>
      </section>

      <section>
        <div className="section-head">
          <h2>Shot list</h2>
          <button className="btn btn-primary" onClick={() => setShotForm('new')}>
            <IconPlus size={16} /> Add shot
          </button>
        </div>

        <div className="toolbar">
          <div className="chips" role="group" aria-label="Filter shots by status">
            {SHOT_FILTERS.map((f) => (
              <button
                key={f || 'all'}
                className={statusFilter === f ? 'chip chip-active' : 'chip'}
                onClick={() => setStatusFilter(f)}
              >
                {f || 'All'}
              </button>
            ))}
          </div>

          <div className="sort-controls">
            <label htmlFor="sort" className="muted">
              Sort by
            </label>
            <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="scene">Scene number</option>
              <option value="shot">Shot number</option>
            </select>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
              aria-label="Toggle sort order"
            >
              {order === 'asc' ? 'Ascending' : 'Descending'}
            </button>
          </div>
        </div>

        {shotsLoading ? (
          <Spinner label="Loading shots..." />
        ) : shots.length === 0 ? (
          statusFilter ? (
            <EmptyState
              icon={<IconFilm size={28} />}
              title={`No ${statusFilter.toLowerCase()} shots`}
              text="Nothing matches this filter right now."
            >
              <button className="btn btn-ghost" onClick={() => setStatusFilter('')}>
                Show all shots
              </button>
            </EmptyState>
          ) : (
            <EmptyState
              icon={<IconFilm size={30} />}
              title="No shots planned yet"
              text="Break this project into scenes and shots. Add camera angles, movement and gear so nothing is forgotten on set."
            >
              <button className="btn btn-primary" onClick={() => setShotForm('new')}>
                <IconPlus size={16} /> Add the first shot
              </button>
            </EmptyState>
          )
        ) : (
          <>
            <div className="shot-table">
              {shots.map((shot) => (
                <article key={shot._id} className={shot.status === 'Completed' ? 'shot shot-done' : 'shot'}>
                  <div className="shot-number" title="Scene / Shot">
                    <span>SC {pad(shot.sceneNumber)}</span>
                    <strong>{pad(shot.shotNumber)}</strong>
                  </div>

                  <div className="shot-main">
                    <div className="shot-title-row">
                      <h3>{shot.title}</h3>
                      <span className="tag">{shot.shotType}</span>
                    </div>
                    {shot.actionDescription && <p className="shot-action">{shot.actionDescription}</p>}
                    <div className="shot-details">
                      {shot.cameraAngle && <span>Angle: {shot.cameraAngle}</span>}
                      {shot.cameraMovement && <span>Move: {shot.cameraMovement}</span>}
                      {shot.location && (
                        <span>
                          <IconPin size={13} /> {shot.location}
                        </span>
                      )}
                      <span>
                        <IconClock size={13} /> {formatDuration(shot.estimatedDuration)}
                      </span>
                    </div>
                    {shot.equipmentNotes && <p className="shot-gear">Gear: {shot.equipmentNotes}</p>}
                  </div>

                  <div className="shot-side">
                    <StatusBadge status={shot.status} />
                    <div className="shot-actions">
                      <button
                        className={shot.status === 'Completed' ? 'icon-btn icon-btn-active' : 'icon-btn'}
                        onClick={() => handleToggleComplete(shot)}
                        title={shot.status === 'Completed' ? 'Reopen shot' : 'Mark as completed'}
                        aria-label={shot.status === 'Completed' ? 'Reopen shot' : 'Mark as completed'}
                      >
                        <IconCheck size={16} />
                      </button>
                      <button className="icon-btn" onClick={() => setShotForm(shot)} title="Edit shot" aria-label="Edit shot">
                        <IconEdit size={16} />
                      </button>
                      <button
                        className="icon-btn icon-btn-danger"
                        onClick={() => setShotToDelete(shot)}
                        title="Delete shot"
                        aria-label="Delete shot"
                      >
                        <IconTrash size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="muted shot-total">
              {shots.length} shot{shots.length === 1 ? '' : 's'} shown - estimated runtime {formatDuration(totalSeconds)}
            </p>
          </>
        )}
      </section>

      {editProject && <ProjectForm project={project} onSubmit={handleSaveProject} onCancel={() => setEditProject(false)} />}

      {shotForm && (
        <ShotForm
          shot={shotForm === 'new' ? null : shotForm}
          suggestedScene={suggested.scene}
          suggestedShot={suggested.shot}
          defaultLocation={project.location}
          onSubmit={handleSaveShot}
          onCancel={() => setShotForm(null)}
        />
      )}

      {confirmProject && (
        <ConfirmModal
          title="Delete this project?"
          message={`"${project.title}" and all ${project.shotCount} of its shots will be permanently deleted. This cannot be undone.`}
          busy={deleting}
          onConfirm={handleDeleteProject}
          onCancel={() => setConfirmProject(false)}
        />
      )}

      {shotToDelete && (
        <ConfirmModal
          title="Delete this shot?"
          message={`Shot "${shotToDelete.title}" will be permanently deleted.`}
          busy={deleting}
          onConfirm={handleDeleteShot}
          onCancel={() => setShotToDelete(null)}
        />
      )}
    </div>
  );
}
