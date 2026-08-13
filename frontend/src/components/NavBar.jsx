import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth.jsx';

export default function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="nav">
      <Link to="/" className="nav-brand">EventPass</Link>
      <nav className="nav-links">
        {user ? (
          <>
            <Link to="/">Events</Link>
            <Link to="/checkin">Check-in</Link>
            <span className="nav-user">{user.name}</span>
            <button
              className="btn-link"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Log in</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}
