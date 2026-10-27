// Small coloured pill that shows a status (works for both projects and shots).
const CLASS_BY_STATUS = {
  Planning: 'badge-gray',
  'In Production': 'badge-blue',
  Completed: 'badge-green',
  Planned: 'badge-gray',
  Ready: 'badge-blue',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge ${CLASS_BY_STATUS[status] || 'badge-gray'}`}>
      <span className="badge-dot" />
      {status}
    </span>
  );
}
