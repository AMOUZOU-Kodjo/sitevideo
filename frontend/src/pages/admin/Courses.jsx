import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminCourseAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiPlay, FiBarChart2, FiTrendingUp, FiStar, FiUsers, FiHelpCircle } from 'react-icons/fi'

const difficultyBadge = {
  beginner: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  intermediate: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
}

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => { loadCourses() }, [page, difficulty])

  const loadCourses = async () => {
    try {
      const params = { page, limit: 20 }
      if (difficulty) params.difficulty = difficulty
      const res = await adminCourseAPI.getAll(params)
      setCourses(res.data.courses)
      setTotalPages(res.data.totalPages)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce cours ?')) return
    try {
      await adminCourseAPI.delete(id)
      toast.success('Cours supprimé')
      loadCourses()
    } catch { toast.error('Erreur suppression') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Cours Python</h1>
          <p className="text-sm text-base-content/60">Gérez les cours de programmation Python</p>
        </div>
        <Link to="/admin/courses/add" className="btn btn-primary gap-2">
          <FiPlus size={16} /> Nouveau cours
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {['', 'beginner', 'intermediate', 'advanced'].map(d => (
          <button key={d} onClick={() => { setDifficulty(d); setPage(1) }}
            className={`btn btn-sm ${difficulty === d ? 'btn-primary' : 'btn-ghost'}`}>
            {d ? d : 'Tous'}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      : courses.length === 0 ? (
        <div className="text-center py-20 text-base-content/40">
          <FiBookOpen size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucun cours</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-base-100 rounded-xl border border-base-200">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-base-content/50">
                <th>Titre</th>
                <th>Difficulté</th>
                <th>Leçons</th>
                <th>Inscriptions</th>
                <th>Publié</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map(c => (
                <tr key={c.id}>
                  <td className="font-medium">{c.title}</td>
                  <td>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${difficultyBadge[c.difficulty] || ''}`}>
                      {c.difficulty}
                    </span>
                  </td>
                  <td><span className="flex items-center gap-1"><FiPlay size={12} /> {c.lesson_count || 0}</span></td>
                  <td><span className="flex items-center gap-1"><FiUsers size={12} className="text-secondary" /> {c.enrollment_count || 0}</span></td>
                  <td>
                    <span className={`badge badge-sm ${c.is_published ? 'badge-success' : 'badge-ghost'}`}>
                      {c.is_published ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td className="text-sm text-base-content/60">{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <div className="flex gap-1">
                      <Link to={`/admin/courses/edit/${c.id}`} className="btn btn-ghost btn-sm btn-square" title="Modifier">
                        <FiEdit2 size={14} />
                      </Link>
                      <Link to={`/admin/courses/${c.id}/lessons`} className="btn btn-ghost btn-sm btn-square" title="Leçons">
                        <FiBookOpen size={14} />
                      </Link>
                      <Link to={`/admin/courses/${c.id}/enrollments`} className="btn btn-ghost btn-sm btn-square text-secondary" title="Inscriptions">
                        <FiUsers size={14} />
                      </Link>
                      <Link to={`/admin/courses/${c.id}/quizzes`} className="btn btn-ghost btn-sm btn-square text-purple-500" title="Quiz">
                        <FiHelpCircle size={14} />
                      </Link>
                      <button onClick={() => handleDelete(c.id)} className="btn btn-ghost btn-sm btn-square text-error" title="Supprimer">
                        <FiTrash2 size={14} />
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
