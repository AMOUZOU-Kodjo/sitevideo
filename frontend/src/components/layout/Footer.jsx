import { Link } from 'react-router-dom'
import { useState } from 'react'
import LogoSvg from '../ui/LogoSvg'
import { FiPlay, FiFileText, FiMusic, FiGithub, FiTwitter, FiLinkedin, FiMail, FiArrowUp, FiHeart, FiStar, FiShield, FiZap, FiSend, FiCheck, FiTrendingUp, FiCode, FiMessageSquare, FiHome, FiBook } from 'react-icons/fi'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const handleNewsletter = (e) => {
    e.preventDefault()
    if (!email) return
    setSubscribed(true)
    toast.success('Inscrit à la newsletter !')
    setEmail('')
    setTimeout(() => setSubscribed(false), 3000)
  }

  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative bg-base-200 pt-20 pb-0 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <button
        onClick={scrollTop}
        className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-white shadow-xl hover:shadow-primary/30 hover:scale-110 transition-all duration-300 flex items-center justify-center group z-10"
        aria-label="Retour en haut"
      >
        <FiArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
      </button>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-base-300">
          {/* Brand */}
          <div className="lg:col-span-3">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold group">
              <LogoSvg size={36} className="shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all" />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SavoirBox</span>
            </Link>
            <p className="text-sm text-base-content/60 mt-4 leading-relaxed max-w-xs">
              Plateforme multimédia nouvelle génération. Vidéos, documents PDF, cours Python et contenus audio en streaming ou téléchargement.
            </p>
            <div className="flex gap-2 mt-5">
              {[
                { icon: FiGithub, label: 'GitHub', color: 'hover:bg-base-300 hover:text-base-content hover:shadow-sm' },
                { icon: FiTwitter, label: 'Twitter', color: 'hover:bg-sky-100 hover:text-sky-600 dark:hover:bg-sky-900/30 dark:hover:text-sky-400 hover:shadow-sm' },
                { icon: FiLinkedin, label: 'LinkedIn', color: 'hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400 hover:shadow-sm' },
                { icon: FiMail, label: 'Email', color: 'hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 hover:shadow-sm' }
              ].map((s, i) => (
                <span key={i} className={`w-10 h-10 rounded-xl bg-base-300/50 flex items-center justify-center text-base-content/50 cursor-pointer transition-all duration-200 hover:scale-110 ${s.color}`} title={s.label}>
                  <s.icon size={16} />
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-5 text-xs text-base-content/40">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-base-300/30"><FiShield size={11} /> SSL</span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-base-300/30"><FiZap size={11} /> 99.9%</span>
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-base-300/30"><FiStar size={11} /> 4.8/5</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-base-content/50 mb-5">Navigation</h4>
            <ul className="space-y-3">
              {[
                { to: '/', label: 'Accueil', icon: FiHome },
                { to: '/catalog', label: 'Catalogue', icon: FiBook },
                { to: '/cours-python', label: 'Cours Python', icon: FiCode },
                { to: '/login', label: 'Connexion', icon: null },
                { to: '/register', label: 'Inscription', icon: null }
              ].map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="group flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-all duration-200 relative">
                    <span className="w-1.5 h-1.5 rounded-full bg-base-300 group-hover:bg-primary group-hover:scale-125 transition-all duration-200" />
                    <span className="relative">
                      {l.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contenus */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-base-content/50 mb-5">Contenus</h4>
            <ul className="space-y-3">
              {[
                { to: '/catalog?type=video', label: 'Vidéos', icon: FiPlay, color: 'text-blue-500' },
                { to: '/catalog?type=document', label: 'Documents', icon: FiFileText, color: 'text-emerald-500' },
                { to: '/catalog?type=audio', label: 'Audio', icon: FiMusic, color: 'text-purple-500' },
                { to: '/catalog?status=paid', label: 'Premium', icon: FiStar, color: 'text-amber-500' }
              ].map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="group flex items-center gap-3 text-sm text-base-content/60 hover:text-primary transition-all duration-200">
                    <span className={`w-8 h-8 rounded-xl bg-base-300/50 flex items-center justify-center ${l.color} group-hover:scale-110 group-hover:shadow-sm transition-all`}>
                      <l.icon size={13} />
                    </span>
                    <span className="relative">
                      {l.label}
                      {l.label === 'Premium' && <FiTrendingUp size={10} className="inline ml-1 text-amber-500" />}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-base-content/50 mb-5">Support</h4>
            <ul className="space-y-3">
              {[
                { to: '/aide', label: "Centre d'aide", icon: FiMessageSquare },
                { to: '/contact', label: 'Nous contacter', icon: FiMail },
                { to: '/faq', label: 'FAQ', icon: null },
                { to: '/signalement', label: 'Signalement', icon: null },
                { to: '/temoignages', label: 'Témoignages', icon: FiStar }
              ].map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="group flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-all duration-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-base-300 group-hover:bg-primary group-hover:scale-125 transition-all duration-200" />
                    <span className="relative">
                      {l.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-base-content/50 mb-5">Newsletter</h4>
            <p className="text-xs text-base-content/50 mb-4 leading-relaxed">
              Recevez les dernières actualités, nouveaux cours Python et contenus exclusifs.
            </p>
            <form onSubmit={handleNewsletter} className="relative">
              <div className="join w-full">
                <div className="relative flex-1">
                  <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input type="email" placeholder="votre@email.com"
                    className="input input-bordered input-sm w-full pl-9 pr-16 focus:border-primary transition-all"
                    value={email} onChange={(e) => setEmail(e.target.value)} disabled={subscribed} />
                </div>
                <button type="submit"
                  className={`btn btn-sm join-item ${subscribed ? 'btn-success' : 'btn-primary'} gap-1 transition-all`}
                  disabled={subscribed}>
                  {subscribed ? <FiCheck size={14} /> : <FiSend size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-base-content/30 mt-1.5">1 email par mois. Désinscription immédiate.</p>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-base-content/40">
          <p>&copy; {currentYear} SavoirBox. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-primary transition-colors cursor-pointer relative group py-1">
              CGU
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer relative group py-1">
              Confidentialité
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
            </span>
            <span className="hover:text-primary transition-colors cursor-pointer relative group py-1">
              Cookies
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary rounded-full group-hover:w-full transition-all duration-300" />
            </span>
            <span className="flex items-center gap-1 ml-2 px-3 py-1 rounded-full bg-base-300/50">
              Fait avec <FiHeart size={11} className="text-red-500 fill-red-500" /> par SavoirBox
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
