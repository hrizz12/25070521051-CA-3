import { Link } from 'react-router-dom';

// Shown for any URL that does not match a route (and for projects that do not exist).
export default function NotFound({ message = 'The page you are looking for does not exist.' }) {
  return (
    <div className="notfound">
      <div className="notfound-code">404</div>
      <h1>Cut! Scene not found.</h1>
      <p>{message}</p>
      <Link to="/" className="btn btn-primary">
        Back to dashboard
      </Link>
    </div>
  );
}
