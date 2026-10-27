// Loading indicator. Use <Spinner /> inline or <Spinner fullPage /> to centre it.
export default function Spinner({ fullPage = false, label = 'Loading...' }) {
  return (
    <div className={fullPage ? 'spinner-wrap spinner-full' : 'spinner-wrap'} role="status">
      <span className="spinner" />
      <span className="spinner-label">{label}</span>
    </div>
  );
}
