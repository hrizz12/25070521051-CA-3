import { useEffect } from 'react';

// "Are you sure?" dialog used before deleting things.
export default function ConfirmModal({ title, message, confirmText = 'Delete', busy = false, onConfirm, onCancel }) {
  // Close with the Escape key
  useEffect(() => {
    function onKey(event) {
      if (event.key === 'Escape' && !busy) onCancel();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  return (
    <div className="modal-backdrop" onClick={busy ? undefined : onCancel}>
      <div
        className="modal modal-small"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title">{title}</h2>
        <p className="modal-text">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
