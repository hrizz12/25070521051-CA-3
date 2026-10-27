import { useEffect, useState } from 'react';
import { toDateInput } from './format.js';

const STATUSES = ['Planning', 'In Production', 'Completed'];

// Modal form used for BOTH creating and editing a project.
// If "project" is passed, the form starts filled in (edit mode).
export default function ProjectForm({ project, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: project?.title || '',
    description: project?.description || '',
    status: project?.status || 'Planning',
    shootDate: toDateInput(project?.shootDate),
    location: project?.location || '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape' && !saving) onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [saving, onCancel]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  // Frontend validation (the backend validates again - never trust the browser alone)
  function validate() {
    const found = {};
    if (!form.title.trim()) found.title = 'Project title is required';
    else if (form.title.trim().length > 100) found.title = 'Title must be at most 100 characters';
    if (form.description.length > 500) found.description = 'Description must be at most 500 characters';
    if (form.location.length > 150) found.location = 'Location must be at most 150 characters';
    return found;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length > 0) return;

    setSaving(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={saving ? undefined : onCancel}>
      <div className="modal" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{project ? 'Edit project' : 'New project'}</h2>
          <p>{project ? 'Update the details of this production.' : 'Start planning a new shoot.'}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {serverError && <div className="form-alert">{serverError}</div>}

          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Midnight Train - Short Film"
              maxLength={100}
              autoFocus
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="A short summary of the shoot"
              maxLength={500}
            />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="shootDate">Shoot date</label>
              <input id="shootDate" name="shootDate" type="date" value={form.shootDate} onChange={handleChange} />
            </div>
          </div>

          <div className="field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              name="location"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. Old Town Railway Station"
              maxLength={150}
            />
            {errors.location && <span className="field-error">{errors.location}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : project ? 'Save changes' : 'Create project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
