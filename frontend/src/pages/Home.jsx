import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { contentAPI } from '../services/api'
import {
  FiPlay, FiFileText, FiMusic, FiArrowRight, FiStar, FiUsers, FiBookOpen,
  FiShield, FiZap, FiTrendingUp, FiChevronRight, FiBox, FiPlayCircle,
  FiDownloadCloud, FiEye, FiClock, FiAward, FiYoutube
} from 'react-icons/fi'
import ContentCard from '../components/ContentCard'
import YoutubeSection from '../components/YoutubeSection'

// ── Intersection Observer hook ──
function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.unobserve(el) } },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return [ref, visible]
}

// ── Animated counter ──
function AnimatedCounter({ end, suffix = '', duration = 2000 }) {
  const [ref, visible] = useReveal(0.5)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!visible) return
    let start = 0
    const step = Math.ceil(end / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [visible, end, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// ── Scroll reveal wrapper ──
function Reveal({ children, className = '', delay = 0, threshold = 0.15 }) {
  const [ref, visible] = useReveal(threshold)
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

// ── Data ──
const features = [
  {
    icon: FiPlayCircle, title: 'Vidéos YouTube', desc: 'Streaming HD intégré sans quitter la plateforme. Ajout par simple lien URL.',
    color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30',
    iconBg: 'bg-blue-100 dark:bg-blue-900/50', iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    icon: FiFileText, title: 'Documents PDF', desc: 'Lecteur intégré avec aperçu. Téléchargement direct pour les contenus gratuits.',
    color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50', iconColor: 'text-emerald-600 dark:text-emerald-400'
  },
  {
    icon: FiMusic, title: 'Contenu Audio', desc: 'Lecteur audio intégré. Streaming MP3, WAV, OGG et plus sans téléchargement.',
    color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30',
    iconBg: 'bg-purple-100 dark:bg-purple-900/50', iconColor: 'text-purple-600 dark:text-purple-400'
  },
  {
    icon: FiAward, title: 'Contenu Premium', desc: 'Monétisez vos créations. Accès sécurisé par paiement, aperçu gratuit de chaque document.',
    color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50', iconColor: 'text-amber-600 dark:text-amber-400'
  }
]

const steps = [
  { num: '01', title: 'Parcourez', desc: 'Explorez notre catalogue de vidéos, documents et fichiers audio triés par catégories.', icon: FiBox },
  { num: '02', title: 'Accédez', desc: 'Contenu gratuit immédiat. Pour le premium, achetez en un clic et débloquez l\'accès complet.', icon: FiShield },
  { num: '03', title: 'Profitez', desc: 'Streaming intégré, lecteur PDF, téléchargement — tout est conçu pour une expérience fluide.', icon: FiPlay }
]

const testimonials = [
  { name: 'Sophie Martin', role: 'Enseignante', avatar: 'SM', text: 'Plateforme formidable pour partager mes cours avec mes élèves. L\'aperçu PDF est très pratique.', rating: 5 },
  { name: 'Thomas Dubois', role: 'Créateur de contenu', avatar: 'TD', text: 'La monétisation intégrée m\'a permis de vendre mes formations vidéo facilement.', rating: 5 },
  { name: 'Marie Leroy', role: 'Étudiante', avatar: 'ML', text: 'Je trouve toujours ce qu\'il me faut. L\'interface est claire et les téléchargements rapides.', rating: 5 }
]

const statItems = [
  { icon: FiBookOpen, value: 528, suffix: '+', label: 'Contenus disponibles' },
  { icon: FiUsers, value: 12400, suffix: '+', label: 'Utilisateurs actifs' },
  { icon: FiStar, value: 48, suffix: '/5', label: 'Note moyenne', format: (v) => (v / 10).toFixed(1) },
  { icon: FiZap, value: 999, suffix: '%', label: 'Temps de disponibilité', format: (v) => (v / 10).toFixed(1) }
]

export default function Home() {
  const [contents, setContents] = useState([])
  const [featured, setFeatured] = useState([])
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    contentAPI.getAll({ limit: 4 }).then((res) => {
      setContents(res.data.contents)
      setFeatured(res.data.contents.filter(c => c.status === 'paid' || c.views_count > 10).slice(0, 3))
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (testimonials.length === 0) return
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % testimonials.length), 5000)
    return () => clearInterval(timer)
  }, [])

  const renderStars = (n) => Array.from({ length: n }, (_, i) => (
    <FiStar key={i} size={18} className="fill-amber-400 text-amber-400" />
  ))

  return (
    <div className="overflow-hidden">

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex items-center bg-base-900 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-focus to-secondary opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.12)_0%,_transparent_60%)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        {/* Floating decorative circles */}
        <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-accent/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="text-center lg:text-left">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-sm mb-8 border border-white/10 hover:bg-white/15 transition-colors">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                  Plateforme multimédia nouvelle génération
                </div>
              </Reveal>

              <Reveal delay={100}>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6">
                  Vidéos, Documents
                  <br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-accent via-amber-300 to-amber-200">
                    & Audio.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={200}>
                <p className="text-lg md:text-xl text-white/70 max-w-xl mb-10 leading-relaxed">
                  La plateforme tout-en-un pour découvrir, apprendre et partager.
                  Contenu gratuit ou premium, streaming intégré, sans publicité.
                </p>
              </Reveal>

              <Reveal delay={300}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link to="/catalog" className="btn btn-accent btn-lg gap-2 shadow-2xl hover:shadow-accent/30 hover:scale-[1.02] transition-all duration-300 group">
                    Explorer le catalogue <FiArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link to="/register" className="btn btn-ghost btn-lg text-white border border-white/20 hover:bg-white/10 hover:border-white/30 gap-2 transition-all duration-300">
                    Créer un compte gratuit
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={400}>
                <div className="flex items-center gap-6 mt-12 justify-center lg:justify-start">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-9 h-9 rounded-full border-2 border-white/80 shadow-md bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm hover:scale-110 transition-transform">
                        {['JD', 'AL', 'MB', 'CB'][i - 1]}
                      </div>
                    ))}
                    <div className="w-9 h-9 rounded-full border-2 border-white/80 bg-white/10 flex items-center justify-center text-white text-xs font-bold backdrop-blur-sm">+</div>
                  </div>
                  <p className="text-white/60 text-sm">Rejoignez <strong className="text-white">12 000+</strong> utilisateurs</p>
                </div>
              </Reveal>
            </div>

            {/* Right — YouTube dynamic section */}
            <Reveal delay={200} className="hidden lg:flex justify-center">
              <YoutubeSection />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ CHANNEL BANNER ═══════════════ */}
      <Reveal>
        <section className="relative max-w-6xl mx-auto px-4 mt-8">
          <a href="https://www.youtube.com/@CodeAvecKodjo" target="_blank" rel="noopener noreferrer" className="block group">
            <div className="relative rounded-2xl overflow-hidden bg-base-800 shadow-xl border border-base-200 hover:border-primary/30 transition-all duration-500">
              <img
                src="https://yt3.ggpht.com/5qbzYycq3VIVxm0zU83Tu9nxR5iDLYJwaqznRfMG99O7WbuOQTLVrY_IZrPgOzkVq5p84trKsA=s600-c-k-c0x00ffffff-no-rj-rp-mo"
                alt="Code avec Kodjo"
                className="w-full h-40 md:h-56 object-cover opacity-50 group-hover:opacity-70 scale-100 group-hover:scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-secondary/40 to-transparent" />
              <div className="absolute inset-0 flex items-center px-8 md:px-12">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-white/60 text-xs md:text-sm font-medium tracking-wider uppercase">Chaîne partenaire</p>
                    <h3 className="text-white text-xl md:text-3xl font-bold">Code avec Kodjo</h3>
                    <p className="text-white/70 text-sm md:text-base mt-1 flex items-center gap-2">
                      <FiYoutube size={16} className="text-red-400" />
                      YouTube · Tutoriels & Live coding
                    </p>
                  </div>
                  <span className="ml-auto hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-semibold border border-white/20 hover:bg-white/20 transition-all group-hover:scale-105">
                    Voir la chaîne <FiArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </a>
        </section>
      </Reveal>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="relative -mt-16 z-20 max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((s, i) => (
            <Reveal key={i} delay={i * 80} threshold={0.3}>
              <div className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="card-body items-center text-center py-6">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <s.icon size={22} className="text-primary" />
                  </div>
                  <p className="text-3xl font-extrabold">
                    {s.format ? <AnimatedCounter end={parseInt(s.value)} /> : <AnimatedCounter end={s.value} />}
                    {s.suffix}
                  </p>
                  <p className="text-xs text-base-content/50">{s.label}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section className="py-28 px-4 md:px-8 max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <span className="badge badge-primary badge-outline mb-4 px-4 py-2">Fonctionnalités</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-base-content/60 max-w-2xl mx-auto text-lg">
              Une plateforme unifiée pour tous vos contenus multimédias. Streaming, téléchargement et monétisation intégrés.
            </p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Reveal key={i} delay={i * 100}>
              <div className={`${f.bg} rounded-2xl p-6 border border-base-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group cursor-default`}>
                <div className={`${f.iconBg} ${f.iconColor} w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <f.icon size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-base-content/70 leading-relaxed">{f.desc}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  En savoir plus <FiArrowRight size={12} />
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════ LATEST ═══════════════ */}
      <section className="py-20 px-4 md:px-8 bg-base-200/40">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <span className="badge badge-accent badge-outline mb-4 px-4 py-2">Derniers ajouts</span>
                <h2 className="text-3xl md:text-4xl font-bold">Nouveautés</h2>
              </div>
              <Link to="/catalog" className="btn btn-outline btn-primary gap-2 group hover:scale-105 transition-all">
                Voir tout <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </Reveal>

          {contents.length === 0 ? (
            <div className="text-center py-20 bg-base-200/60 rounded-3xl border border-base-200">
              <FiBookOpen className="text-6xl mx-auto mb-4 opacity-20" />
              <p className="text-xl opacity-60">Aucun contenu pour le moment.</p>
              <p className="text-sm opacity-40 mt-1">Soyez le premier à ajouter du contenu !</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {contents.map((item, i) => (
                <Reveal key={item.id} delay={i * 100}>
                  <ContentCard item={item} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="py-28 px-4 md:px-8 max-w-7xl mx-auto">
        <Reveal>
          <div className="text-center mb-16">
            <span className="badge badge-secondary badge-outline mb-4 px-4 py-2">Fonctionnement</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Comment ça marche ?</h2>
            <p className="text-base-content/60 text-lg">Trois étapes simples pour accéder à tout le contenu.</p>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-8 relative">
          <div className="hidden md:block absolute top-20 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-primary via-accent to-secondary" />
          {steps.map((s, i) => (
            <Reveal key={i} delay={i * 150}>
              <div className="text-center relative group">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10 group-hover:scale-110 group-hover:shadow-2xl transition-all duration-300">
                  <s.icon size={28} />
                </div>
                <div className="absolute -top-2 -right-2 md:-right-6 w-8 h-8 rounded-full bg-base-200 border-2 border-primary/20 text-primary text-sm font-bold flex items-center justify-center z-20 group-hover:scale-110 transition-transform">
                  {s.num}
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{s.title}</h3>
                <p className="text-base-content/60 max-w-xs mx-auto leading-relaxed">{s.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ═══════════════ PREMIUM ═══════════════ */}
      {featured.length > 0 && (
        <section className="py-20 px-4 md:px-8 bg-base-200/40">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="card bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-amber-600/5 border border-amber-500/20 rounded-3xl overflow-hidden hover:shadow-2xl transition-shadow duration-500">
                <div className="card-body p-8 md:p-12">
                  <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                      <span className="badge badge-warning gap-1 mb-4 px-3 py-2">
                        <FiTrendingUp /> Premium
                      </span>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">Contenu exclusif</h2>
                      <p className="text-base-content/70 mb-8 leading-relaxed text-lg">
                        Accédez à du contenu premium de qualité. Achat unique, accès à vie. Pas d'abonnement.
                      </p>
                      <Link to="/catalog?status=paid" className="btn btn-warning btn-lg gap-2 shadow-xl hover:shadow-warning/30 hover:scale-[1.02] transition-all duration-300 group">
                        <FiTrendingUp /> Découvrir le premium <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                    <div className="grid gap-4">
                      {featured.map((item) => (
                        <Link key={item.id} to={`/content/${item.id}`} className="flex items-center gap-4 p-4 bg-base-100/80 backdrop-blur rounded-xl border border-base-200 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800 transition-all duration-300 group">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-base-200 flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                            {item.type === 'video' && item.youtube_id ? (
                              <img src={`https://img.youtube.com/vi/${item.youtube_id}/default.jpg`} alt="" className="w-full h-full object-cover" loading="lazy" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl opacity-40">
                                {item.type === 'document' ? <FiFileText /> : <FiMusic />}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-medium opacity-50">{item.type}</span>
                              <span className="badge badge-xs badge-warning">{item.price}€</span>
                            </div>
                            <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{item.title}</h4>
                          </div>
                          <FiChevronRight className="text-base-content/30 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-28 px-4 md:px-8 max-w-4xl mx-auto">
        <Reveal>
          <div className="text-center mb-14">
            <span className="badge badge-accent badge-outline mb-4 px-4 py-2">Témoignages</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Ils nous font confiance</h2>
          </div>
        </Reveal>

        <div className="relative min-h-[260px]">
          {testimonials.map((t, i) => (
            <div key={i} className={`transition-all duration-700 ease-in-out absolute inset-0 ${i === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
              <Reveal threshold={0.1}>
                <div className="max-w-2xl mx-auto text-center">
                  <div className="flex justify-center gap-1 mb-5">
                    {renderStars(t.rating)}
                  </div>
                  <div className="relative">
                    <span className="absolute -top-6 -left-2 text-6xl text-primary/10 font-serif leading-none">"</span>
                    <p className="text-xl md:text-2xl leading-relaxed italic text-base-content/80 mb-8 px-4">"{t.text}"</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary text-white font-bold flex items-center justify-center mx-auto mb-3 text-sm shadow-lg ring-4 ring-base-100">
                    {t.avatar}
                  </div>
                  <p className="font-bold text-lg">{t.name}</p>
                  <p className="text-sm text-base-content/50">{t.role}</p>
                </div>
              </Reveal>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {testimonials.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`transition-all duration-300 ${i === currentSlide ? 'w-8 h-2.5 bg-primary rounded-full' : 'w-2.5 h-2.5 rounded-full bg-base-300 hover:bg-base-400'}`} aria-label={`Témoignage ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="py-28 px-4 md:px-8 bg-gradient-to-b from-transparent to-base-200/30">
        <Reveal>
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-8 shadow-xl">
              <FiZap size={30} className="text-white" />
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
              Prêt à <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">découvrir</span> ?
            </h2>
            <p className="text-base-content/60 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
              Rejoignez notre communauté et accédez à des centaines de contenus gratuitement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg gap-2 shadow-xl hover:shadow-primary/30 hover:scale-[1.02] transition-all duration-300 group">
                Créer un compte gratuit <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/catalog" className="btn btn-outline btn-lg hover:scale-[1.02] transition-all duration-300">
                Parcourir le catalogue
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  )
}
