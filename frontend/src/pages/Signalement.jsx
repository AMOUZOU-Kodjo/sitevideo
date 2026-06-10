import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiAlertTriangle, FiFlag, FiSend, FiShield, FiCheckCircle, FiEye, FiLock, FiUsers } from 'react-icons/fi'

const reportTypes = [
  { value: 'contenu-inapproprie', label: 'Contenu inapproprié', desc: 'Violence, haine, nudité ou tout contenu choquant' },
  { value: 'plagiat', label: 'Plagiat / Droits d\'auteur', desc: 'Utilisation non autorisée de votre travail' },
  { value: 'harcelement', label: 'Harcèlement', desc: 'Comportement abusif ou intimidant' },
  { value: 'spam', label: 'Spam ou arnaque', desc: 'Contenu trompeur ou frauduleux' },
  { value: 'technique', label: 'Problème technique', desc: 'Lien brisé, erreur de lecture ou bug' },
  { value: 'autre', label: 'Autre', desc: 'Tout autre motif de signalement' }
]

const guidelines = [
  { icon: FiCheckCircle, text: 'Soyez précis et factuel dans votre signalement' },
  { icon: FiEye, text: 'Ajoutez des preuves si possible (captures d\'écran, liens)' },
  { icon: FiLock, text: 'Votre identité restera confidentielle' },
  { icon: FiUsers, text: 'Notre équipe examine chaque signalement sous 48h' }
]

export default function Signalement() {
  const [form, setForm] = useState({ type: '', url: '', description: '', email: '' })
  const [sending, setSending] = useState(false)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.type || !form.description || !form.email) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setSending(true)
    await new Promise(r => setTimeout(r, 1000))
    toast.success('Signalement envoyé avec succès. Notre équipe l\'examinera dans les plus brefs délais.')
    setForm({ type: '', url: '', description: '', email: '' })
    setSending(false)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-base-200 via-base-100 to-base-200 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-error/10 text-error text-xs font-medium mb-6">
            <FiFlag size={14} /> Signalement
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Signaler un problème</h1>
          <p className="text-base-content/60 max-w-xl mx-auto">
            Aidez-nous à maintenir une plateforme sûre et respectueuse en signalant tout contenu ou comportement inapproprié.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Guidelines */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <FiShield size={20} className="text-error" />
              <h2 className="text-xl font-bold">Bon à savoir</h2>
            </div>
            <div className="space-y-4">
              {guidelines.map((g, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-base-100 border border-base-200">
                  <span className="text-primary mt-0.5 shrink-0"><g.icon size={18} /></span>
                  <p className="text-sm text-base-content/70">{g.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-5 rounded-xl bg-warning/10 border border-warning/20">
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <FiAlertTriangle size={16} className="text-warning" />
                Signalement abusif
              </h3>
              <p className="text-xs text-base-content/60">
                Tout signalement frauduleux ou abusif peut entraîner la suspension de votre compte.
                Utilisez cet outil de manière responsable.
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="card bg-base-100 border border-base-200">
              <div className="card-body p-6 md:p-8">
                <h2 className="text-xl font-bold mb-1">Formulaire de signalement</h2>
                <p className="text-sm text-base-content/60 mb-6">Tous les champs marqués d'un * sont obligatoires.</p>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Type de signalement *</span>
                    </label>
                    <select
                      name="type"
                      className="select select-bordered w-full"
                      value={form.type}
                      onChange={handleChange}
                    >
                      <option value="">Sélectionnez un type</option>
                      {reportTypes.map((t, i) => (
                        <option key={i} value={t.value}>{t.label} — {t.desc}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">URL du contenu (optionnel)</span>
                    </label>
                    <input
                      type="url"
                      name="url"
                      placeholder="https://savoirbox.com/content/..."
                      className="input input-bordered w-full"
                      value={form.url}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Description *</span>
                    </label>
                    <textarea
                      name="description"
                      rows={5}
                      placeholder="Décrivez le problème en détail. Incluez toute information pertinente..."
                      className="textarea textarea-bordered resize-none"
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Votre email *</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="vous@exemple.com"
                      className="input input-bordered w-full"
                      value={form.email}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="btn btn-error gap-2 w-full md:w-auto" disabled={sending}>
                    {sending ? <span className="loading loading-spinner loading-sm"></span> : <FiSend size={16} />}
                    {sending ? 'Envoi en cours...' : 'Envoyer le signalement'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
