import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiHelpCircle, FiChevronDown, FiSearch, FiMessageSquare, FiChevronRight } from 'react-icons/fi'

const faqData = [
  {
    category: 'Compte et inscription',
    items: [
      { q: 'Comment créer un compte ?', r: 'Rendez-vous sur la page d\'inscription, remplissez vos informations (nom, email, mot de passe) et validez. Vous recevrez un email de confirmation pour activer votre compte.' },
      { q: 'Puis-je supprimer mon compte ?', r: 'Oui, depuis les paramètres de votre profil. La suppression est définitive et entraîne la perte de tous vos contenus et abonnements.' },
      { q: 'Comment réinitialiser mon mot de passe ?', r: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Un email vous sera envoyé pour créer un nouveau mot de passe.' }
    ]
  },
  {
    category: 'Abonnement et paiement',
    items: [
      { q: 'Quels sont les moyens de paiement acceptés ?', r: 'Nous acceptons les cartes bancaires (Visa, Mastercard), PayPal et les virements bancaires pour les abonnements annuels.' },
      { q: 'Puis-me faire rembourser ?', r: 'Vous disposez d\'un délai de rétractation de 14 jours. Contactez notre service client pour effectuer une demande de remboursement.' },
      { q: 'Comment résilier mon abonnement ?', r: 'Rendez-vous dans les paramètres de votre compte, rubrique "Abonnement", et cliquez sur "Résilier". L\'accès reste valable jusqu\'à la fin de la période en cours.' }
    ]
  },
  {
    category: 'Contenus et téléchargements',
    items: [
      { q: 'Comment télécharger une vidéo ?', r: 'Ouvrez la page du contenu souhaité et cliquez sur le bouton "Télécharger". Les formats disponibles varient selon le type de contenu.' },
      { q: 'Dans quel format sont les documents ?', r: 'Les documents sont disponibles au format PDF. Certains documents premium sont également disponibles en format EPUB.' },
      { q: 'Y a-t-il une limite de téléchargement ?', r: 'Non, vous pouvez télécharger autant de contenus que vous le souhaitez, tant que votre abonnement est actif.' }
    ]
  },
  {
    category: 'Problèmes techniques',
    items: [
      { q: 'La lecture vidéo ne fonctionne pas', r: 'Essayez de rafraîchir la page, de vider le cache de votre navigateur ou de désactiver vos extensions. Si le problème persiste, contactez notre support.' },
      { q: 'L\'application est lente', r: 'Vérifiez votre connexion internet et essayez de réduire la qualité vidéo dans les paramètres de lecture. Fermez les autres applications gourmandes en bande passante.' },
      { q: 'Je ne reçois pas les emails', r: 'Vérifiez vos spams et assurez-vous que votre adresse email est correcte. Ajoutez contact@savoirbox.com à vos contacts.' }
    ]
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)
  const [search, setSearch] = useState('')

  const toggleQuestion = (idx) => setOpenIndex(openIndex === idx ? null : idx)

  const filtered = faqData.map(cat => ({
    ...cat,
    items: cat.items.filter(
      item => item.q.toLowerCase().includes(search.toLowerCase()) ||
             item.r.toLowerCase().includes(search.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-base-200 via-base-100 to-base-200 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <FiHelpCircle size={14} /> FAQ
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Foire aux questions</h1>
          <p className="text-base-content/60 max-w-xl mx-auto mb-8">
            Retrouvez les réponses aux questions les plus fréquentes sur SavoirBox.
          </p>
          <div className="max-w-lg mx-auto relative">
            <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher dans la FAQ..."
              className="input input-bordered w-full pl-11 pr-4 h-12 bg-base-100 shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* FAQ accordion */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <FiHelpCircle size={48} className="mx-auto text-base-content/20 mb-4" />
            <p className="text-base-content/60">Aucun résultat trouvé pour "{search}"</p>
          </div>
        ) : (
          <div className="space-y-10">
            {filtered.map((cat, ci) => (
              <div key={ci}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-primary rounded-full" />
                  {cat.category}
                </h2>
                <div className="space-y-2">
                  {cat.items.map((item, ii) => {
                    const idx = `${ci}-${ii}`
                    return (
                      <div
                        key={ii}
                        className="bg-base-100 border border-base-200 rounded-xl overflow-hidden hover:shadow-sm transition-all"
                      >
                        <button
                          onClick={() => toggleQuestion(idx)}
                          className="w-full flex items-center justify-between p-4 md:p-5 text-left"
                        >
                          <span className="font-medium text-sm md:text-base pr-4">{item.q}</span>
                          <FiChevronDown
                            size={18}
                            className={`shrink-0 text-base-content/40 transition-transform duration-200 ${openIndex === idx ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${openIndex === idx ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                          <p className="px-4 md:px-5 pb-4 md:pb-5 text-sm text-base-content/70 leading-relaxed border-t border-base-200 pt-4">
                            {item.r}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="bg-base-200/50 py-16">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <div className="card bg-base-100 border border-base-200 p-8 md:p-12">
            <FiMessageSquare size={36} className="mx-auto text-primary mb-4" />
            <h2 className="text-2xl font-bold mb-2">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="text-base-content/60 mb-6 max-w-md mx-auto">Notre équipe est à votre disposition pour répondre à toutes vos questions.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/contact" className="btn btn-primary gap-2">
                <FiMessageSquare size={16} /> Nous contacter
              </Link>
              <Link to="/aide" className="btn btn-ghost gap-2">
                Centre d'aide <FiChevronRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
