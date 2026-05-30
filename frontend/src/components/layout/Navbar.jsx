import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiUser, FiBook, FiGrid, FiHome, FiShield } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="navbar bg-base-100 shadow-md sticky top-0 z-50">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            <li><Link to="/"><FiHome className="mr-2" />Accueil</Link></li>
            <li><Link to="/catalog"><FiGrid className="mr-2" />Catalogue</Link></li>
            {user && <li><Link to="/library"><FiBook className="mr-2" />Ma Bibliothèque</Link></li>}
            {isAdmin && <li><Link to="/admin/dashboard"><FiShield className="mr-2" />Admin</Link></li>}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost normal-case text-xl font-bold text-primary">SiteVideo</Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          <li><Link to="/" className="btn btn-ghost btn-sm"><FiHome /> Accueil</Link></li>
          <li><Link to="/catalog" className="btn btn-ghost btn-sm"><FiGrid /> Catalogue</Link></li>
          {user && <li><Link to="/library" className="btn btn-ghost btn-sm"><FiBook /> Bibliothèque</Link></li>}
          {isAdmin && <li><Link to="/admin/dashboard" className="btn btn-ghost btn-sm text-warning"><FiShield /> Admin</Link></li>}
        </ul>
      </div>

      <div className="navbar-end gap-2">
        {user ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-neutral text-neutral-content rounded-full w-10">
                <span>{user.name?.charAt(0).toUpperCase()}</span>
              </div>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
              <li className="menu-header px-4 py-2 text-sm opacity-60">{user.email}</li>
              <div className="divider my-1"></div>
              <li><Link to="/library"><FiBook className="mr-2" />Ma Bibliothèque</Link></li>
              {isAdmin && <li><Link to="/admin/dashboard"><FiShield className="mr-2" />Dashboard Admin</Link></li>}
              <li><a onClick={handleLogout} className="text-error"><FiLogOut className="mr-2" />Déconnexion</a></li>
            </ul>
          </div>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm">Connexion</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Inscription</Link>
          </>
        )}
      </div>
    </div>
  );
}
