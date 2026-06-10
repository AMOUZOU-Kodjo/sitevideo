import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiBarChart2, FiUsers, FiFilm, FiPlus, FiLogOut, FiHome, FiShoppingCart, FiChevronRight, FiChevronDown, FiSettings, FiBox, FiFolder, FiMessageSquare, FiSliders, FiCode, FiHelpCircle, FiAward } from 'react-icons/fi';

const links = [
  { to: '/admin/dashboard', icon: FiBarChart2, label: 'Tableau de bord' },
  { to: '/admin/contents', icon: FiFilm, label: 'Tous les contenus' },
  { to: '/admin/contents/add', icon: FiPlus, label: 'Ajouter un contenu' },
  { to: '/admin/categories', icon: FiFolder, label: 'Catégories' },
  { to: '/admin/testimonials', icon: FiMessageSquare, label: 'Témoignages' },
  { to: '/admin/users', icon: FiUsers, label: 'Utilisateurs' },
  { to: '/admin/purchases', icon: FiShoppingCart, label: 'Ventes' },
  { to: '/admin/settings', icon: FiSliders, label: 'Paramètres' }
];

const courseLinks = [
  { to: '/admin/courses', icon: FiCode, label: 'Cours' },
  { to: '/admin/certificates', icon: FiAward, label: 'Certificats' },
  { to: '/admin/forum', icon: FiHelpCircle, label: 'Forum' }
];

export default function AdminLayout() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || !isAdmin) {
    navigate('/login');
    return null;
  }

  const [courseOpen, setCourseOpen] = useState(() => {
    const coursePaths = ['/admin/courses', '/admin/certificates', '/admin/forum'];
    return coursePaths.some(p => location.pathname.startsWith(p));
  });

  const currentLink = [...links, ...courseLinks].find(l => {
    if (l.to === '/admin/dashboard') return location.pathname === '/admin/dashboard';
    return location.pathname.startsWith(l.to);
  });

  return (
    <div className="drawer lg:drawer-open min-h-screen bg-base-200/30">
      <input id="admin-drawer" type="checkbox" className="drawer-toggle" />

      {/* Main content */}
      <div className="drawer-content flex flex-col">
        {/* Top navbar (mobile) */}
        <div className="navbar bg-base-100 border-b border-base-200 lg:hidden sticky top-0 z-30">
          <label htmlFor="admin-drawer" className="btn btn-square btn-ghost">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </label>
          <div className="flex-1 flex items-center gap-2">
            <span className="font-bold text-sm">Administration</span>
            {currentLink && (
              <>
                <FiChevronRight size={14} className="text-base-content/30" />
                <span className="text-sm text-base-content/60">{currentLink.label}</span>
              </>
            )}
          </div>
          <div className="avatar placeholder">
            <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <footer className="mt-auto px-8 py-4 border-t border-base-200 text-xs text-base-content/30 flex justify-between">
          <span>© {new Date().getFullYear()} SavoirBox — Administration</span>
          <span>v1.0.0</span>
        </footer>
      </div>

      {/* Sidebar */}
      <div className="drawer-side">
        <label htmlFor="admin-drawer" className="drawer-overlay"></label>
        <aside className="bg-base-100 min-h-full w-72 flex flex-col border-r border-base-200">
          {/* Logo area */}
          <div className="p-5 border-b border-base-200">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md">
                <FiBox size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-base">SavoirBox</p>
                <p className="text-[10px] text-base-content/40 uppercase tracking-wider">Administration</p>
              </div>
            </Link>
          </div>

          {/* User card */}
          <div className="mx-4 mt-4 p-3 bg-base-200/50 rounded-xl border border-base-200">
            <div className="flex items-center gap-3">
              <div className="avatar placeholder">
                <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm shadow-sm">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-base-content/40 truncate">{user.email}</p>
              </div>
              <span className="badge badge-warning badge-xs">Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <ul className="menu p-2 flex-1 mt-2">
            {links.map((link) => {
              const isActive = link.to === '/admin/dashboard'
                ? location.pathname === '/admin/dashboard'
                : location.pathname.startsWith(link.to);
              return (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary/10 text-primary shadow-sm'
                        : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                    }`}
                  >
                    <link.icon size={18} />
                    {link.label}
                    {isActive && <FiChevronRight size={14} className="ml-auto text-primary/40" />}
                  </Link>
                </li>
              );
            })}

            {/* Divider */}
            <li className="menu-title text-[10px] uppercase tracking-wider text-base-content/30 px-3 pt-6 pb-2">Cours Python</li>

            {/* Collapsible section */}
            <li>
              <button
                onClick={() => setCourseOpen(!courseOpen)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  courseOpen
                    ? 'bg-primary/10 text-primary'
                    : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
                }`}
              >
                <FiCode size={18} />
                Cours Python
                {courseOpen ? <FiChevronDown size={14} className="ml-auto" /> : <FiChevronRight size={14} className="ml-auto" />}
              </button>
              {courseOpen && (
                <ul className="ml-3 mt-1 space-y-0.5">
                  {courseLinks.map((link) => {
                    const isActive = link.to === '/admin/dashboard'
                      ? location.pathname === '/admin/dashboard'
                      : location.pathname.startsWith(link.to);
                    return (
                      <li key={link.to}>
                        <Link
                          to={link.to}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-primary/10 text-primary shadow-sm'
                              : 'text-base-content/50 hover:bg-base-200 hover:text-base-content'
                          }`}
                        >
                          <link.icon size={16} />
                          {link.label}
                          {isActive && <FiChevronRight size={12} className="ml-auto text-primary/40" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          </ul>

          {/* Bottom links */}
          <div className="border-t border-base-200 p-4 space-y-1.5">
            <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-base-content/50 hover:bg-base-200 hover:text-base-content transition-all">
              <FiHome size={16} /> Retour au site
            </Link>
            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-error/70 hover:bg-error/5 hover:text-error transition-all w-full">
              <FiLogOut size={16} /> Déconnexion
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
