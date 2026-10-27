import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge.jsx';
import { IconCalendar, IconPin, IconTrash } from './Icons.jsx';
import { formatDate, formatDateTime } from './format.js';

// One project shown as a card (used on Projects page and Dashboard).
// onDelete is optional: the dashboard version hides the delete button.
export default function ProjectCard({ project, onDelete }) {
  const percent = project.shotCount > 0 ? Math.round((project.completedCount / project.shotCount) * 100) : 0;

  return (
    <article className="card project-card">
      <Link to={`/projects/${project._id}`} className="project-card-link">
        <div className="project-card-top">
          <h3>{project.title}</h3>
          <StatusBadge status={project.status} />
        </div>

        <p className="project-card-desc">{project.description || 'No description yet.'}</p>

        <div className="meta-list">
          <span>
            <IconCalendar size={15} /> {formatDate(project.shootDate)}
          </span>
          {project.location && (
            <span>
              <IconPin size={15} /> {project.location}
            </span>
          )}
        </div>

        <div className="progress-row">
          <div className="progress">
            <div className="progress-bar" style={{ width: `${percent}%` }} />
          </div>
          <span className="progress-text">
            {project.completedCount}/{project.shotCount} shots
          </span>
        </div>

        <small className="muted">Updated {formatDateTime(project.updatedAt)}</small>
      </Link>

      {onDelete && (
        <button
          className="icon-btn icon-btn-danger project-card-delete"
          onClick={() => onDelete(project)}
          aria-label={`Delete ${project.title}`}
          title="Delete project"
        >
          <IconTrash size={16} />
        </button>
      )}
    </article>
  );
}
