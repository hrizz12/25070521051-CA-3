// Friendly message shown when a list has nothing in it yet.
export default function EmptyState({ icon, title, text, children }) {
  return (
    <div className="empty-state">
      <div className="empty-frame">
        <span className="corner corner-tl" />
        <span className="corner corner-tr" />
        <span className="corner corner-bl" />
        <span className="corner corner-br" />
        <div className="empty-icon">{icon}</div>
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      {children}
    </div>
  );
}
