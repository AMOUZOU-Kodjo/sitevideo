import { Link } from 'react-router-dom'
import { useState } from 'react'
import { FiPlay, FiFileText, FiMusic, FiGithub, FiTwitter, FiLinkedin, FiMail, FiArrowUp, FiHeart, FiStar, FiShield, FiZap, FiSend, FiCheck, FiTrendingUp } from 'react-icons/fi'
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
    <footer className="relative bg-base-200 pt-20 pb-0">
      {/* Wave ornament */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      {/* Scroll to top */}
      <button
        onClick={scrollTop}
        className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary text-white shadow-xl hover:shadow-primary/30 hover:scale-110 transition-all duration-300 flex items-center justify-center group"
        aria-label="Retour en haut"
      >
        <FiArrowUp size={18} className="group-hover:-translate-y-0.5 transition-transform" />
      </button>

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-base-300">
          {/* Brand — 3 cols */}
          <div className="lg:col-span-3">
            <Link to="/" className="inline-flex items-center gap-2 text-2xl font-extrabold">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-sm shadow-lg">SV</span>
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">SV</span>
            </Link>
            <p className="text-sm text-base-content/60 mt-4 leading-relaxed max-w-xs">
              Plateforme multimédia nouvelle génération. Vidéos, documents PDF et contenus audio en streaming ou téléchargement.
            </p>
            {/* Social */}
            <div className="flex gap-2 mt-5">
              {[
                { icon: FiGithub, label: 'GitHub', color: 'hover:bg-base-300 hover:text-base-content' },
                { icon: FiTwitter, label: 'Twitter', color: 'hover:bg-sky-100 hover:text-sky-600 dark:hover:bg-sky-900/30 dark:hover:text-sky-400' },
                { icon: FiLinkedin, label: 'LinkedIn', color: 'hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-900/30 dark:hover:text-blue-400' },
                { icon: FiMail, label: 'Email', color: 'hover:bg-amber-100 hover:text-amber-600 dark:hover:bg-amber-900/30 dark:hover:text-amber-400' }
              ].map((s, i) => (
                <span key={i} className={`w-9 h-9 rounded-lg bg-base-300/50 flex items-center justify-center text-base-content/50 cursor-pointer transition-all duration-200 hover:scale-110 ${s.color}`} title={s.label}>
                  <s.icon size={15} />
                </span>
              ))}
            </div>
            {/* Trust badges */}
            <div className="flex items-center gap-3 mt-5 text-xs text-base-content/40">
              <span className="flex items-center gap-1"><FiShield size={11} /> SSL</span>
              <span className="w-1 h-1 rounded-full bg-base-300" />
              <span className="flex items-center gap-1"><FiZap size={11} /> 99.9% uptime</span>
              <span className="w-1 h-1 rounded-full bg-base-300" />
              <span className="flex items-center gap-1"><FiStar size={11} /> 4.8/5</span>
            </div>
          </div>

          {/* Navigation — 2 cols */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-base-content/50 mb-5">Navigation</h4>
            <ul className="space-y-3.5">
              {[
                { to: '/', label: 'Accueil', icon: null },
                { to: '/catalog', label: 'Catalogue', icon: null },
                { to: '/login', label: 'Connexion', icon: null },
                { to: '/register', label: 'Inscription', icon: null }
              ].map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="group flex items-center gap-2 text-sm text-base-content/70 hover:text-primary transition-all duration-200">
                    <span className="w-0 group-hover:w-3 h-0.5 bg-primary rounded-full transition-all duration-200" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Content types — 2 cols */}
          <div className="lg:col-span-2">
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-base-content/50 mb-5">Contenus</h4>
            <ul className="space-y-3.5">
              {[
                { to: '/catalog?type=video', label: 'Vidéos', icon: FiPlay, color: 'text-blue-500' },
                { to: '/catalog?type=document', label: 'Documents', icon: FiFileText, color: 'text-emerald-500' },
                { to: '/catalog?type=audio', label: 'Audio', icon: FiMusic, color: 'text-purple-500' },
                { to: '/catalog?status=paid', label: 'Premium', icon: FiStar, color: 'text-amber-500' }
              ].map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="group flex items-center gap-3 text-sm text-base-content/70 hover:text-primary transition-all duration-200">
                    <span className={`w-7 h-7 rounded-lg bg-base-300/50 flex items-center justify-center ${l.color} group-hover:scale-110 transition-transform`}>
                      <l.icon size={12} />
                    </span>
                    {l.label}
                    {l.label === 'Premium' && <FiTrendingUp size={11} className="text-amber-500" />}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support + Newsletter — 3 cols */}
          <div className="lg:col-span-3">
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-base-content/50 mb-5">Support</h4>
            <ul className="space-y-3.5 mb-6">
              {[
                { to: '/aide', label: 'Centre d\'aide' },
                { to: '/contact', label: 'Nous contacter' },
                { to: '/faq', label: 'FAQ' },
                { to: '/signalement', label: 'Signalement' },
                { to: '/temoignages', label: 'Témoignages' }
              ].map((l, i) => (
                <li key={i}>
                  <Link to={l.to} className="text-sm text-base-content/50 hover:text-primary transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>

            {/* Newsletter */}
            <h4 className="font-semibold text-xs uppercase tracking-[0.15em] text-base-content/50 mb-3">Newsletter</h4>
            <form onSubmit={handleNewsletter} className="relative">
              <div className="join w-full">
                <div className="relative flex-1">
                  <FiMail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    className="input input-bordered input-sm w-full pl-9 pr-16"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={subscribed}
                  />
                </div>
                <button
                  type="submit"
                  className={`btn btn-sm join-item ${subscribed ? 'btn-success' : 'btn-primary'} gap-1`}
                  disabled={subscribed}
                >
                  {subscribed ? <FiCheck size={14} /> : <FiSend size={14} />}
                </button>
              </div>
              <p className="text-[10px] text-base-content/30 mt-1.5">1 email par mois. Désinscription immédiate.</p>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-base-content/40">
          <p>&copy; {currentYear} SV. Tous droits réservés.</p>
          <div className="flex items-center gap-4">
            <span className="hover:text-base-content/70 transition-colors cursor-default">CGU</span>
            <span className="hover:text-base-content/70 transition-colors cursor-default">Confidentialité</span>
            <span className="hover:text-base-content/70 transition-colors cursor-default">Cookies</span>
            <span className="flex items-center gap-1 ml-2">
              Fait avec <FiHeart size={11} className="text-red-500" /> par SV
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
