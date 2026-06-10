import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminCourseAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiTrash2, FiMessageSquare, FiThumbsUp, FiArrowLeft, FiMapPin } from 'react-icons/fi'

export default function AdminForumManager() {
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { loadTopics() }, [page])

  const loadTopics = async () => {
    try {
      const res = await adminCourseAPI.getForum({ page, limit: 20 })
      setTopics(res.data.topics)
      setTotalPages(res.data.totalPages)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce sujet ?')) return
    try {
      await adminCourseAPI.deleteForumTopic(id)
      toast.success('Sujet supprimé')
      loadTopics()
    } catch { toast.error('Erreur suppression') }
  }

  const handlePin = async (id) => {
    try {
      await adminCourseAPI.pinTopic(id)
      toast.success('Épinglage mis à jour')
      loadTopics()
    } catch { toast.error('Erreur') }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="btn btn-ghost btn-sm btn-square">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Forum</h1>
          <p className="text-sm text-base-content/60">Modération des discussions</p>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      : topics.length === 0 ? (
        <div className="text-center py-20 text-base-content/40 bg-base-100 border border-base-200 rounded-xl">
          <FiMessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucun sujet</p>
        </div>
      ) : (
        <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-base-content/50">
                <th>Sujet</th>
                <th>Auteur</th>
                <th>Cours</th>
                <th>Réponses</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map(t => (
                <tr key={t.id}>
                  <td className="font-medium">
                    <div className="flex items-center gap-2">
                      {t.is_pinned && <FiMapPin size={14} className="text-primary" />}
                      <span className="truncate max-w-[200px]">{t.title}</span>
                    </div>
                  </td>
                  <td className="text-sm">{t.user_name}</td>
                  <td className="text-sm text-base-content/60">{t.course_title || '-'}</td>
                  <td><span className="badge badge-sm badge-ghost">{t.reply_count || 0}</span></td>
                  <td>
                    {t.is_pinned ? <span className="badge badge-sm badge-primary">Épinglé</span> : <span className="badge badge-sm badge-ghost">Normal</span>}
                  </td>
                  <td className="text-sm text-base-content/60">{new Date(t.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1">
                      <button onClick={() => handlePin(t.id)} className="btn btn-ghost btn-xs btn-square" title="Épingler/Détacher">
                        <FiThumbsUp size={12} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className="btn btn-ghost btn-xs btn-square text-error" title="Supprimer">
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button className="btn btn-sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Précédent</button>
          <span className="flex items-center text-sm text-base-content/60">Page {page} / {totalPages}</span>
          <button className="btn btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Suivant</button>
        </div>
      )}
    </div>
  )
}
