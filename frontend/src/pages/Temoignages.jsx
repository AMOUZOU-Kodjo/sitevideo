import { useState, useEffect } from 'react'
import { FiStar, FiHeart, FiMessageCircle, FiUser, FiMessageSquare, FiSend, FiEdit3, FiChevronDown } from 'react-icons/fi'
import { testimonialAPI } from '../services/api'
import toast from 'react-hot-toast'

const stats = [
  { value: '15 000+', label: 'Utilisateurs actifs', icon: FiUser },
  { value: '4.8/5', label: 'Note moyenne', icon: FiStar },
  { value: '98%', label: 'Satisfaction client', icon: FiHeart },
  { value: '10 000+', label: 'Avis vérifiés', icon: FiMessageCircle }
]

const avatarColors = [
  'from-blue-500 to-blue-600', 'from-emerald-500 to-emerald-600',
  'from-purple-500 to-purple-600', 'from-amber-500 to-amber-600',
  'from-rose-500 to-rose-600', 'from-cyan-500 to-cyan-600',
  'from-indigo-500 to-indigo-600', 'from-teal-500 to-teal-600'
]

function getInitials(name) {
  return name.split(' ').map(s => s[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function Temoignages() {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5 })
  const [sending, setSending] = useState(false)

  const perPage = 6
  const displayed = testimonials.slice(0, page * perPage)

  const fetchTestimonials = async () => {
    try {
      const { data } = await testimonialAPI.getAll()
      setTestimonials(data)
    } catch {
      toast.error('Erreur lors du chargement des témoignages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTestimonials() }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.content) {
      toast.error('Veuillez remplir votre nom et votre témoignage.')
      return
    }
    setSending(true)
    try {
      const { data } = await testimonialAPI.create(form)
      setTestimonials([data, ...testimonials])
      toast.success('Témoignage publié ! Merci pour votre retour.')
      setForm({ name: '', role: '', content: '', rating: 5 })
      setShowForm(false)
    } catch {
      toast.error('Erreur lors de l\'envoi du témoignage')
    } finally {
      setSending(false)
    }
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-base-200 via-base-100 to-base-200 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <FiHeart size={14} /> Témoignages
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Ce que disent nos utilisateurs</h1>
          <p className="text-base-content/60 max-w-xl mx-auto mb-8">
            Découvrez les retours d'expérience de notre communauté et rejoignez des milliers d'utilisateurs satisfaits.
          </p>
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary gap-2 shadow-lg">
            <FiEdit3 size={16} /> {showForm ? 'Fermer le formulaire' : 'Publier mon témoignage'}
          </button>
        </div>
      </section>

      {/* Submit form */}
      {showForm && (
        <section className="max-w-3xl mx-auto px-4 md:px-8 -mt-8 mb-16">
          <div className="card bg-base-100 border border-2 border-primary/20 shadow-xl">
            <div className="card-body p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1">Partagez votre expérience</h2>
              <p className="text-sm text-base-content/60 mb-6">Votre avis aide d'autres utilisateurs à nous découvrir.</p>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Votre nom *</span></label>
                    <input type="text" name="name" placeholder="Jean Dupont" className="input input-bordered w-full" value={form.name} onChange={handleChange} />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-medium">Votre rôle (optionnel)</span></label>
                    <input type="text" name="role" placeholder="Étudiant, développeur..." className="input input-bordered w-full" value={form.role} onChange={handleChange} />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Votre note</span></label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })} className="p-1 transition-transform hover:scale-110">
                        <FiStar size={24} className={s <= form.rating ? 'text-amber-500 fill-amber-500' : 'text-base-content/20'} />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-base-content/50">{form.rating}/5</span>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label"><span className="label-text font-medium">Votre témoignage *</span></label>
                  <textarea name="content" rows={4} placeholder="Dites-nous ce que vous pensez de SiteVideo..." className="textarea textarea-bordered resize-none" value={form.content} onChange={handleChange} />
                </div>
                <button type="submit" className="btn btn-primary gap-2" disabled={sending}>
                  {sending ? <span className="loading loading-spinner loading-sm"></span> : <FiSend size={16} />}
                  {sending ? 'Publication...' : 'Publier mon témoignage'}
                </button>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-10 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="card bg-base-100 border border-base-200">
              <div className="card-body items-center text-center p-5">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                  <s.icon size={18} />
                </div>
                <p className="text-2xl font-extrabold">{s.value}</p>
                <p className="text-xs text-base-content/50">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials grid */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        {loading ? (
          <div className="flex justify-center py-16"><span className="loading loading-spinner loading-lg text-primary"></span></div>
        ) : testimonials.length === 0 ? (
          <div className="text-center py-16">
            <FiMessageSquare size={48} className="mx-auto text-base-content/20 mb-4" />
            <p className="text-base-content/60">Aucun témoignage pour le moment. Soyez le premier à partager votre expérience !</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {displayed.map((t, i) => (
                <div key={t.id} className="card bg-base-100 border border-base-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                  <div className="card-body p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white text-sm font-bold`}>
                          {getInitials(t.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t.name}</p>
                          {t.role && <p className="text-xs text-base-content/50">{t.role}</p>}
                        </div>
                      </div>
                      <FiMessageSquare size={24} className="text-primary/20" />
                    </div>
                    <p className="text-sm text-base-content/70 leading-relaxed mb-4">"{t.content}"</p>
                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-base-200">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <FiStar key={si} size={14} className={si < t.rating ? 'text-amber-500 fill-amber-500' : 'text-base-content/20'} />
                        ))}
                      </div>
                      <span className="text-xs text-base-content/40">{formatDate(t.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {displayed.length < testimonials.length && (
              <div className="text-center mt-10">
                <button onClick={() => setPage(p => p + 1)} className="btn btn-outline btn-primary gap-2">
                  Voir plus de témoignages
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* CTA */}
      <section className="bg-base-200/50 py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content p-10 md:p-14">
            <FiHeart size={36} className="mx-auto mb-4" />
            <h2 className="text-2xl md:text-3xl font-bold mb-3">Rejoignez notre communauté</h2>
            <p className="opacity-80 max-w-md mx-auto mb-6">
              Des milliers d'utilisateurs nous font confiance. Créez votre compte gratuitement et découvrez SiteVideo.
            </p>
            <a href="/register" className="btn btn-accent gap-2">Créer un compte gratuit</a>
          </div>
        </div>
      </section>
    </div>
  )
}
