import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiBarChart2, FiUsers, FiFilm, FiPlus, FiLogOut, FiHome, FiShoppingCart } from 'react-icons/fi';

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || !isAdmin) {
    navigate('/login');
    return null;
  }

  const links = [
    { to: '/admin/dashboard', icon: FiBarChart2, label: 'Tableau de bord' },
    { to: '/admin/contents', icon: FiFilm, label: 'Contenus' },
    { to: '/admin/contents/add', icon: FiPlus, label: 'Ajouter' },
    { to: '/admin/users', icon: FiUsers, label: 'Utilisateurs' },
    { to: '/admin/purchases', icon: FiShoppingCart, label: 'Ventes' }
  ];

  return (
    <div className="drawer lg:drawer-open min-h-screen">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex flex-col">
        <div className="navbar bg-base-100 shadow-sm lg:hidden">
          <label htmlFor="admin-drawer" className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </label>
          <span className="font-bold">Admin</span>
        </div>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </div>

      <div className="drawer-side">
        <label htmlFor="admin-drawer" className="drawer-overlay"></label>
        <aside className="bg-base-200 min-h-full w-72 p-4 flex flex-col">
          <div className="mb-8">
            <Link to="/" className="text-xl font-bold text-primary">SiteVideo</Link>
            <p className="text-sm opacity-60 mt-1">Espace Administration</p>
          </div>

          <div className="flex items-center gap-3 mb-6 p-3 bg-base-300 rounded-lg">
            <div className="avatar placeholder">
              <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm">{user.name}</p>
              <p className="text-xs opacity-60">{user.email}</p>
              <span className="badge badge-warning badge-xs mt-1">Admin</span>
            </div>
          </div>

          <ul className="menu p-0 flex-1">
            {links.map((link) => (
              <li key={link.to} className={location.pathname === link.to ? 'bordered' : ''}>
                <Link to={link.to} className={location.pathname === link.to ? 'active' : ''}>
                  <link.icon className="mr-2" /> {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="border-t border-base-300 pt-4 mt-4 space-y-2">
            <Link to="/" className="btn btn-ghost btn-sm w-full justify-start"><FiHome className="mr-2" /> Retour au site</Link>
            <button onClick={() => { logout(); navigate('/'); }} className="btn btn-ghost btn-sm w-full justify-start text-error">
              <FiLogOut className="mr-2" /> Déconnexion
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
