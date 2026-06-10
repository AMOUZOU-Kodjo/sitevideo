import { Link } from 'react-router-dom'
import { FiHelpCircle, FiBookOpen, FiShield, FiDownload, FiCreditCard, FiUser, FiSearch, FiChevronRight } from 'react-icons/fi'

const categories = [
  { icon: FiBookOpen, title: 'Débuter', desc: 'Créez votre compte, explorez le catalogue et découvrez comment profiter de nos contenus.', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  { icon: FiDownload, title: 'Téléchargements', desc: 'Téléchargez vos vidéos, documents et audio pour une consultation hors-ligne.', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  { icon: FiCreditCard, title: 'Paiements', desc: 'Informations sur les abonnements, factures et modes de paiement acceptés.', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20' },
  { icon: FiUser, title: 'Mon compte', desc: 'Gérez votre profil, mot de passe et préférences de notification.', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  { icon: FiShield, title: 'Sécurité', desc: 'Protection de vos données personnelles et bonnes pratiques de sécurité.', color: 'from-red-500 to-red-600', bg: 'bg-red-100 dark:bg-red-900/20' },
  { icon: FiHelpCircle, title: 'Dépannage', desc: 'Solutions aux problèmes techniques courants sur la plateforme.', color: 'from-cyan-500 to-cyan-600', bg: 'bg-cyan-100 dark:bg-cyan-900/20' }
]

const articles = [
  { cat: 'Débuter', q: 'Comment créer un compte ?', time: '3 min' },
  { cat: 'Téléchargements', q: 'Comment télécharger une vidéo ?', time: '2 min' },
  { cat: 'Paiements', q: 'Quels sont les moyens de paiement ?', time: '4 min' },
  { cat: 'Mon compte', q: 'Comment réinitialiser mon mot de passe ?', time: '2 min' },
  { cat: 'Dépannage', q: 'La lecture ne fonctionne pas', time: '5 min' }
]

export default function CentreAide() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-base-200 via-base-100 to-base-200 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium mb-6">
            <FiHelpCircle size={14} /> Centre d'aide
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Comment pouvons-nous vous aider ?</h1>
          <p className="text-base-content/60 max-w-xl mx-auto mb-8">
            Trouvez des réponses à vos questions et profitez pleinement de SiteVideo.
          </p>
          <div className="max-w-lg mx-auto relative">
            <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />
            <input
              type="text"
              placeholder="Rechercher un article, une question..."
              className="input input-bordered w-full pl-11 pr-4 h-12 bg-base-100 shadow-sm"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <h2 className="text-2xl font-bold mb-2">Parcourir par thème</h2>
        <p className="text-base-content/60 mb-8">Sélectionnez une catégorie pour trouver l'aide dont vous avez besoin.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat, i) => (
            <div key={i} className="card bg-base-100 border border-base-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
              <div className="card-body">
                <div className={`w-12 h-12 rounded-xl ${cat.bg} flex items-center justify-center mb-3`}>
                  <cat.icon size={22} className={`text-${cat.color.split(' ')[0].replace('from-', '')}`} />
                </div>
                <h3 className="font-bold text-lg">{cat.title}</h3>
                <p className="text-sm text-base-content/60">{cat.desc}</p>
                <div className="flex items-center gap-1 text-primary text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Voir les articles <FiChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Popular articles */}
      <section className="bg-base-200/50 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold mb-1">Articles populaires</h2>
              <p className="text-base-content/60 text-sm">Les questions les plus fréquentes</p>
            </div>
            <Link to="/faq" className="btn btn-ghost btn-sm gap-1">
              Voir la FAQ <FiChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-base-100 rounded-xl border border-base-200 hover:shadow-sm transition-all cursor-pointer">
                <div>
                  <span className="badge badge-ghost badge-xs mb-1.5">{a.cat}</span>
                  <p className="font-medium text-sm">{a.q}</p>
                </div>
                <span className="text-xs text-base-content/40 whitespace-nowrap ml-4">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16 text-center">
        <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content p-10 md:p-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-3">Vous n'avez pas trouvé votre réponse ?</h2>
          <p className="opacity-80 max-w-md mx-auto mb-6">Notre équipe est là pour vous aider. Contactez-nous et nous vous répondrons dans les plus brefs délais.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/contact" className="btn btn-accent gap-2">Nous contacter</Link>
            <Link to="/faq" className="btn btn-outline btn-accent gap-2">Consulter la FAQ</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
