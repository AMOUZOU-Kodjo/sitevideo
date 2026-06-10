import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import toast from 'react-hot-toast'
import {
  FiHome, FiGrid, FiBook, FiShield, FiSun, FiMoon, FiUser, FiLogOut,
  FiMenu, FiX, FiChevronDown, FiChevronRight, FiPlay, FiFileText,
  FiMusic, FiStar, FiArrowRight, FiMonitor, FiMail, FiMessageSquare
} from 'react-icons/fi'

const contentTypes = [
  { label: 'Vidéos', icon: FiPlay, to: '/catalog?type=video', color: 'text-blue-500' },
  { label: 'Documents', icon: FiFileText, to: '/catalog?type=document', color: 'text-emerald-500' },
  { label: 'Audio', icon: FiMusic, to: '/catalog?type=audio', color: 'text-purple-500' },
  { label: 'Premium', icon: FiStar, to: '/catalog?status=paid', color: 'text-amber-500' }
]

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [typesOpen, setTypesOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const typesRef = useRef(null)
  const userRef = useRef(null)
  const drawerRef = useRef(null)

  const handleLogout = () => {
    logout()
    toast.success('Déconnecté')
    navigate('/')
  }

  const initials = user?.name
    ? user.name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  // Fermeture au clic externe
  useEffect(() => {
    const handler = (e) => {
      if (typesRef.current && !typesRef.current.contains(e.target)) setTypesOpen(false)
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false)
      if (drawerRef.current && !drawerRef.current.contains(e.target) && !e.target.closest('.mobile-trigger')) setMobileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Fermeture au changement de route
  useEffect(() => {
    setMobileOpen(false); setTypesOpen(false); setUserMenuOpen(false)
  }, [location.pathname])

  const isActive = (path) => {
    if (path.includes('?')) return location.pathname + location.search === path
    return location.pathname === path
  }
  const isStartsWith = (path) => location.pathname.startsWith(path)

  const navLink = (to, label, icon, opts = {}) => {
    const active = opts.exact ? isActive(to) : (opts.startsWith ? isStartsWith(to) : isActive(to))
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          active
            ? 'bg-primary/10 text-primary shadow-sm'
            : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
        } ${opts.className || ''}`}
      >
        {icon && icon}
        {label}
      </Link>
    )
  }

  return (
    <header className="bg-base-100/90 backdrop-blur-md sticky top-0 z-50 border-b border-base-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* ─── Left: Logo + mobile trigger ─── */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-base-200 transition-colors mobile-trigger"
              aria-label="Menu"
            >
              {mobileOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all">
                <FiMonitor size={18} />
              </div>
              <span className="font-bold text-xl hidden sm:block">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SV</span>
              </span>
            </Link>
          </div>

          {/* ─── Center: Desktop nav ─── */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLink('/', 'Accueil', <FiHome size={16} />, { exact: true })}
            {navLink('/catalog', 'Catalogue', <FiGrid size={16} />)}

            {/* Types dropdown */}
            <div className="relative" ref={typesRef}>
              <button
                onClick={() => setTypesOpen(!typesOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  typesOpen ? 'bg-primary/10 text-primary' : 'text-base-content/70 hover:bg-base-200 hover:text-base-content'
                }`}
              >
                <FiPlay size={16} />
                Types
                <FiChevronDown size={14} className={`transition-transform duration-200 ${typesOpen ? 'rotate-180' : ''}`} />
              </button>

              {typesOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-base-100 rounded-xl shadow-2xl border border-base-200 overflow-hidden z-50">
                  <div className="p-2 border-b border-base-200 bg-base-50">
                    <p className="text-xs font-semibold text-base-content/50 uppercase tracking-wider px-2 py-1">
                      Filtrer par type
                    </p>
                  </div>
                  <div className="p-1.5">
                    {contentTypes.map((t) => (
                      <Link
                        key={t.to}
                        to={t.to}
                        onClick={() => setTypesOpen(false)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm ${
                          isActive(t.to) ? 'bg-primary/10 text-primary' : 'hover:bg-base-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <t.icon size={16} className={t.color} />
                          <span>{t.label}</span>
                        </div>
                        <FiChevronRight size={14} className="text-base-content/20" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {user && navLink('/library', 'Bibliothèque', <FiBook size={16} />)}
            {navLink('/temoignages', 'Témoignages', <FiStar size={16} />)}
            {navLink('/contact', 'Contact', <FiMail size={16} />)}
            {isAdmin && navLink('/admin/dashboard', 'Admin', <FiShield size={16} />, { startsWith: true, className: 'text-warning' })}
          </nav>

          {/* ─── Right: Theme + User ─── */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-base-200 transition-colors text-base-content/60 hover:text-base-content"
              title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            >
              {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
            </button>

            {user ? (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-base-200 transition-all focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {initials}
                  </div>
                  <FiChevronDown
                    size={14}
                    className={`text-base-content/40 transition-transform duration-200 hidden sm:block ${userMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-72 bg-base-100 rounded-2xl shadow-2xl border border-base-200 overflow-hidden z-50">
                    {/* Header */}
                    <div className="bg-gradient-to-br from-primary to-secondary p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-lg">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-semibold text-sm truncate">{user.name}</p>
                          <p className="text-white/60 text-xs truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                            {isAdmin ? '⚡ Administrateur' : '👤 Utilisateur'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Menu */}
                    <div className="p-2">
                      <Link
                        to="/library"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm hover:bg-base-200 transition-all"
                      >
                        <FiBook size={16} className="text-primary" />
                        Ma Bibliothèque
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm hover:bg-base-200 transition-all"
                        >
                          <FiShield size={16} className="text-warning" />
                          Administration
                        </Link>
                      )}

                      <div className="h-px bg-base-200 my-1.5" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-error hover:bg-error/10 transition-all w-full"
                      >
                        <FiLogOut size={16} />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link to="/login" className="btn btn-ghost btn-sm">Connexion</Link>
                <Link to="/register" className="btn btn-primary btn-sm shadow-md hover:shadow-lg transition-all">Inscription</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══ Mobile Drawer ═══ */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-base-100 shadow-2xl border-r border-base-200 transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-base-200">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white shadow-md">
                <FiMonitor size={18} />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SiteVideo</span>
            </Link>
            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-base-200 transition-colors">
              <FiX size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto h-full pb-24">
          <div className="space-y-6">
            {/* Navigation */}
            <div>
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest mb-2 px-2">Navigation</p>
              <div className="space-y-0.5">
                {[
                  { to: '/', label: 'Accueil', icon: FiHome },
                  { to: '/catalog', label: 'Catalogue', icon: FiGrid },
                  { to: '/temoignages', label: 'Témoignages', icon: FiStar },
                  { to: '/contact', label: 'Contact', icon: FiMail },
                ].map(l => (
                  <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive(l.to) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'
                    }`}
                  ><l.icon size={16} />{l.label}</Link>
                ))}
              </div>
            </div>

            {/* Types */}
            <div>
              <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest mb-2 px-2">Types</p>
              <div className="space-y-0.5">
                {contentTypes.map(t => (
                  <Link key={t.to} to={t.to} onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                      isActive(t.to) ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-base-200'
                    }`}
                  ><t.icon size={16} className={t.color} />{t.label}</Link>
                ))}
              </div>
            </div>

            {user && (
              <div>
                <p className="text-xs font-semibold text-base-content/40 uppercase tracking-widest mb-2 px-2">Mon compte</p>
                <div className="space-y-0.5">
                  <Link to="/library" onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-base-200 transition-all"
                  ><FiBook size={16} /> Bibliothèque</Link>
                  {isAdmin && (
                    <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-base-200 transition-all"
                    ><FiShield size={16} className="text-warning" /> Admin</Link>
                  )}
                  <button onClick={handleLogout}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-error hover:bg-error/10 transition-all w-full"
                  ><FiLogOut size={16} /> Déconnexion</button>
                </div>
              </div>
            )}

            {!user && (
              <div className="pt-2 space-y-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-outline btn-sm w-full">Connexion</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary btn-sm w-full shadow-md">Inscription</Link>
              </div>
            )}

            {/* Theme dans mobile */}
            <div className="pt-2 border-t border-base-200">
              <button onClick={toggleTheme}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-base-200 transition-all w-full"
              >
                {theme === 'dark' ? <FiSun size={16} /> : <FiMoon size={16} />}
                {theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}
    </header>
  )
}
