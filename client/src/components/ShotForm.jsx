import { useEffect, useState } from 'react';

const SHOT_TYPES = ['Wide', 'Medium', 'Close-up', 'POV'];
const SHOT_STATUSES = ['Planned', 'Ready', 'Completed'];

// Modal form used for BOTH adding and editing a shot.
// suggestedScene / suggestedShot only pre-fill numbers for a NEW shot.
export default function ShotForm({ shot, suggestedScene = 1, suggestedShot = 1, defaultLocation = '', onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: shot?.title || '',
    sceneNumber: shot?.sceneNumber ?? suggestedScene,
    shotNumber: shot?.shotNumber ?? suggestedShot,
    shotType: shot?.shotType || 'Wide',
    cameraAngle: shot?.cameraAngle || '',
    cameraMovement: shot?.cameraMovement || '',
    location: shot ? shot.location : defaultLocation,
    equipmentNotes: shot?.equipmentNotes || '',
    actionDescription: shot?.actionDescription || '',
    estimatedDuration: shot?.estimatedDuration ?? 0,
    status: shot?.status || 'Planned',
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

  function validate() {
    const found = {};
    const scene = Number(form.sceneNumber);
    const shotNo = Number(form.shotNumber);
    const duration = Number(form.estimatedDuration);

    if (!form.title.trim()) found.title = 'Shot title is required';
    if (!Number.isInteger(scene) || scene < 1) found.sceneNumber = 'Enter a whole number, 1 or more';
    if (!Number.isInteger(shotNo) || shotNo < 1) found.shotNumber = 'Enter a whole number, 1 or more';
    if (!Number.isFinite(duration) || duration < 0) found.estimatedDuration = 'Duration cannot be negative';
    if (form.actionDescription.length > 500) found.actionDescription = 'At most 500 characters';
    if (form.equipmentNotes.length > 500) found.equipmentNotes = 'At most 500 characters';
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
      await onSubmit({
        ...form,
        sceneNumber: Number(form.sceneNumber),
        shotNumber: Number(form.shotNumber),
        estimatedDuration: Number(form.estimatedDuration),
      });
    } catch (err) {
      setServerError(err.message);
      setSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={saving ? undefined : onCancel}>
      <div className="modal modal-wide" role="dialog" aria-modal="true" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{shot ? 'Edit shot' : 'Add shot'}</h2>
          <p>{shot ? 'Change the details of this shot.' : 'Describe the shot you want to capture.'}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {serverError && <div className="form-alert">{serverError}</div>}

          <div className="field">
            <label htmlFor="shot-title">Shot title</label>
            <input
              id="shot-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Hero enters the platform"
              maxLength={100}
              autoFocus
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </div>

          <div className="field-row field-row-3">
            <div className="field">
              <label htmlFor="sceneNumber">Scene #</label>
              <input id="sceneNumber" name="sceneNumber" type="number" min="1" value={form.sceneNumber} onChange={handleChange} />
              {errors.sceneNumber && <span className="field-error">{errors.sceneNumber}</span>}
            </div>
            <div className="field">
              <label htmlFor="shotNumber">Shot #</label>
              <input id="shotNumber" name="shotNumber" type="number" min="1" value={form.shotNumber} onChange={handleChange} />
              {errors.shotNumber && <span className="field-error">{errors.shotNumber}</span>}
            </div>
            <div className="field">
              <label htmlFor="estimatedDuration">Duration (sec)</label>
              <input
                id="estimatedDuration"
                name="estimatedDuration"
                type="number"
                min="0"
                value={form.estimatedDuration}
                onChange={handleChange}
              />
              {errors.estimatedDuration && <span className="field-error">{errors.estimatedDuration}</span>}
            </div>
          </div>

          <div className="field-row field-row-3">
            <div className="field">
              <label htmlFor="shotType">Shot type</label>
              <select id="shotType" name="shotType" value={form.shotType} onChange={handleChange}>
                {SHOT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="cameraAngle">Camera angle</label>
              <input
                id="cameraAngle"
                name="cameraAngle"
                list="angle-options"
                value={form.cameraAngle}
                onChange={handleChange}
                placeholder="Eye level"
                maxLength={60}
              />
              <datalist id="angle-options">
                <option value="Eye level" />
                <option value="High angle" />
                <option value="Low angle" />
                <option value="Dutch angle" />
                <option value="Overhead" />
              </datalist>
            </div>
            <div className="field">
              <label htmlFor="cameraMovement">Camera movement</label>
              <input
                id="cameraMovement"
                name="cameraMovement"
                list="movement-options"
                value={form.cameraMovement}
                onChange={handleChange}
                placeholder="Static"
                maxLength={60}
              />
              <datalist id="movement-options">
                <option value="Static" />
                <option value="Pan" />
                <option value="Tilt" />
                <option value="Dolly" />
                <option value="Tracking" />
                <option value="Handheld" />
                <option value="Crane" />
              </datalist>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label htmlFor="shot-location">Location</label>
              <input
                id="shot-location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Where is it filmed?"
                maxLength={150}
              />
            </div>
            <div className="field">
              <label htmlFor="shot-status">Status</label>
              <select id="shot-status" name="status" value={form.status} onChange={handleChange}>
                {SHOT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="field">
            <label htmlFor="equipmentNotes">Equipment / camera notes</label>
            <textarea
              id="equipmentNotes"
              name="equipmentNotes"
              rows={2}
              value={form.equipmentNotes}
              onChange={handleChange}
              placeholder="e.g. 35mm lens, gimbal, ND filter"
              maxLength={500}
            />
            {errors.equipmentNotes && <span className="field-error">{errors.equipmentNotes}</span>}
          </div>

          <div className="field">
            <label htmlFor="actionDescription">Action</label>
            <textarea
              id="actionDescription"
              name="actionDescription"
              rows={3}
              value={form.actionDescription}
              onChange={handleChange}
              placeholder="What happens in this shot?"
              maxLength={500}
            />
            {errors.actionDescription && <span className="field-error">{errors.actionDescription}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : shot ? 'Save changes' : 'Add shot'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
