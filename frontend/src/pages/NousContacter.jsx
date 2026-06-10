import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import { FiMail, FiMapPin, FiPhone, FiClock, FiSend, FiMessageSquare, FiUser, FiChevronRight, FiCheck, FiCopy, FiArrowRight, FiExternalLink } from 'react-icons/fi'
import { contactAPI } from '../services/api'
import { Link } from 'react-router-dom'

const contactMethods = [
  {
    icon: FiMail, label: 'Email', value: 'phipsipy@gmail.com', desc: 'Réponse sous 24h',
    href: 'mailto:phipsipy@gmail.com',
    color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/20',
    gradient: 'from-primary/10 to-transparent'
  },
  {
    icon: FiPhone, label: 'Téléphone', value: '+228 91 03 87 27', desc: 'Lun-Ven 9h-18h',
    href: 'tel:+22891038727',
    color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/20', border: 'border-emerald-500/20',
    gradient: 'from-emerald-500/10 to-transparent'
  },
  {
    icon: FiMapPin, label: 'Adresse', value: 'Lomé, Togo', desc: '12 rue de la Réussite',
    href: 'https://www.google.com/maps/search/Lom%C3%A9+Togo',
    color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/20', border: 'border-amber-500/20',
    gradient: 'from-amber-500/10 to-transparent'
  },
  {
    icon: FiClock, label: 'Horaires', value: 'Lun-Ven 9h-18h', desc: 'Fermé samedi et dimanche',
    href: null,
    color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20', border: 'border-purple-500/20',
    gradient: 'from-purple-500/10 to-transparent'
  }
]

const subjects = [
  'Question générale', 'Problème technique', 'Facturation', 'Réclamation', 'Partenariat', 'Autre'
]

function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.unobserve(el) } },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return [ref, visible]
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal()
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
}

export default function NousContacter() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.subject || !form.message) {
      toast.error('Veuillez remplir tous les champs.')
      return
    }
    setSending(true)
    try {
      await contactAPI.send({ name: form.name, email: form.email, subject: form.subject, message: form.message })
      toast.success('Message envoyé avec succès ! Nous vous répondrons rapidement.')
      setForm({ name: '', email: '', subject: '', message: '' })
    } catch {
      toast.error("Erreur lors de l'envoi du message. Veuillez réessayer.")
    } finally {
      setSending(false)
    }
  }

  const copyEmail = () => {
    navigator.clipboard.writeText('phipsipy@gmail.com')
    setCopied(true)
    toast.success('Email copié !')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative pt-20 pb-28 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-3xl -translate-y-1/2" />
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center relative">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6 border border-primary/20">
              <FiMessageSquare size={14} /> Nous contacter
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-base-content to-base-content/60 bg-clip-text text-transparent">
              Restons en contact
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-base-content/60 max-w-xl mx-auto text-lg">
              Une question, une suggestion ou un problème ? Notre équipe est à votre écoute.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Contact Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-16 pb-24 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-6">
            <Reveal delay={100}>
              <div>
                <h2 className="text-2xl font-bold mb-1">Nos coordonnées</h2>
                <p className="text-base-content/60">Choisissez le moyen qui vous convient le mieux.</p>
              </div>
            </Reveal>

            <div className="space-y-4">
              {contactMethods.map((m, i) => {
                const Wrapper = m.href ? 'a' : 'div'
                const wrapperProps = m.href ? { href: m.href, target: '_blank', rel: 'noopener noreferrer' } : {}
                return (
                  <Reveal key={i} delay={150 + i * 80}>
                    <Wrapper
                      {...wrapperProps}
                      className={`group flex items-start gap-4 p-5 rounded-2xl bg-base-100 border ${m.border} hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden ${m.href ? 'cursor-pointer' : ''}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-r ${m.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                      <div className={`w-12 h-12 rounded-xl ${m.bg} flex items-center justify-center shrink-0 ${m.color} group-hover:scale-110 transition-transform duration-300 relative`}>
                        <m.icon size={22} />
                      </div>
                      <div className="relative flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm">{m.label}</p>
                          {m.href && (
                            <FiExternalLink size={12} className="text-base-content/30 group-hover:text-primary transition-colors shrink-0" />
                          )}
                        </div>
                        <p className="text-sm font-medium mt-0.5">{m.value}</p>
                        <p className="text-xs text-base-content/40 mt-0.5">{m.desc}</p>
                      </div>
                      {m.label === 'Email' && (
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyEmail() }}
                          className="relative shrink-0 w-9 h-9 rounded-lg bg-base-200/50 hover:bg-base-200 flex items-center justify-center text-base-content/40 hover:text-primary transition-all"
                          title="Copier l'email"
                        >
                          {copied ? <FiCheck size={14} className="text-success" /> : <FiCopy size={14} />}
                        </button>
                      )}
                    </Wrapper>
                  </Reveal>
                )
              })}
            </div>

            <Reveal delay={500}>
              <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FiArrowRight size={14} className="text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm">Vous pouvez aussi</h3>
                </div>
                <div className="space-y-2.5">
                  <Link to="/aide" className="flex items-center gap-2.5 text-sm text-primary hover:text-primary/80 transition-colors group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    Consulter le centre d'aide
                  </Link>
                  <Link to="/faq" className="flex items-center gap-2.5 text-sm text-primary hover:text-primary/80 transition-colors group">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    Lire la FAQ
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <Reveal delay={200}>
              <div className="card bg-base-100 border border-base-200 shadow-xl hover:shadow-2xl transition-shadow duration-500 rounded-2xl overflow-hidden">
                <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />
                <div className="card-body p-6 md:p-8">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FiSend size={18} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Envoyez-nous un message</h2>
                      <p className="text-sm text-base-content/60">Remplissez le formulaire ci-dessous.</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5 mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Nom complet</span></label>
                        <div className="relative group">
                          <FiUser size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors" />
                          <input
                            type="text" name="name" placeholder="Jean Dupont"
                            className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            value={form.name} onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="form-control">
                        <label className="label"><span className="label-text font-medium">Email</span></label>
                        <div className="relative group">
                          <FiMail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base-content/40 group-focus-within:text-primary transition-colors" />
                          <input
                            type="email" name="email" placeholder="jean@exemple.com"
                            className="input input-bordered w-full pl-10 focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                            value={form.email} onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-control">
                      <label className="label"><span className="label-text font-medium">Sujet</span></label>
                      <select
                        name="subject"
                        className="select select-bordered w-full focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        value={form.subject} onChange={handleChange}
                      >
                        <option value="">Sélectionnez un sujet</option>
                        {subjects.map((s, i) => (<option key={i} value={s}>{s}</option>))}
                      </select>
                    </div>

                    <div className="form-control">
                      <label className="label"><span className="label-text font-medium">Message</span></label>
                      <textarea
                        name="message" rows={5}
                        placeholder="Décrivez votre demande en quelques lignes..."
                        className="textarea textarea-bordered resize-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        value={form.message} onChange={handleChange}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                      <button type="submit" className="btn btn-primary gap-2 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all flex-1 sm:flex-none" disabled={sending}>
                        {sending ? <span className="loading loading-spinner loading-sm"></span> : <FiSend size={16} />}
                        {sending ? 'Envoi en cours...' : 'Envoyer le message'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-base-200/50 py-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <Reveal>
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold mb-2">Nous trouver</h2>
              <p className="text-base-content/60">Situé au cœur de Lomé, au Togo.</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-base-200 h-64 md:h-80 bg-base-300 flex items-center justify-center relative group">
              <iframe
                title="Localisation Lomé"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.521260062523!2d1.218908!3d6.172497!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTAnMjEuMCJOIDHCsDEzJzA4LjEiRQ!5e0!3m2!1sfr!2stg!4v1"
                className="w-full h-full border-0"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8">
          <Reveal>
            <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content p-10 md:p-14 rounded-3xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
              <div className="relative text-center">
                <FiMessageSquare size={36} className="mx-auto mb-4 opacity-90" />
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Prêt à collaborer ?</h2>
                <p className="opacity-80 max-w-md mx-auto mb-6">
                  Que vous ayez un projet, une question ou simplement envie d'échanger, nous sommes là pour vous.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <a href="mailto:phipsipy@gmail.com" className="btn btn-accent gap-2 shadow-lg">
                    <FiMail size={16} /> phipsipy@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
