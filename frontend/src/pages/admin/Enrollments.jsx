import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminCourseAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiArrowLeft, FiUsers, FiCheck, FiClock } from 'react-icons/fi'

export default function AdminEnrollments() {
  const { id } = useParams()
  const [enrollments, setEnrollments] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { loadData() }, [page])

  const loadData = async () => {
    try {
      const [enrRes, coursesRes] = await Promise.all([
        adminCourseAPI.getEnrollments(id, { page, limit: 20 }),
        adminCourseAPI.getAll({ limit: 50 })
      ])
      setEnrollments(enrRes.data.enrollments)
      setTotalPages(enrRes.data.totalPages)
      setCourse(coursesRes.data.courses.find(c => c.id === id))
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/courses" className="btn btn-ghost btn-sm btn-square"><FiArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-2xl font-bold">Inscriptions</h1>
          <p className="text-sm text-base-content/60">{course?.title || 'Cours'}</p>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      : enrollments.length === 0 ? (
        <div className="text-center py-20 text-base-content/40 bg-base-100 border border-base-200 rounded-xl">
          <FiUsers size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucune inscription</p>
        </div>
      ) : (
        <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-base-content/50">
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Progression</th>
                <th>Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map(e => (
                <tr key={e.id}>
                  <td className="font-medium">{e.user_name}</td>
                  <td className="text-sm text-base-content/60">{e.user_email}</td>
                  <td>
                    {e.status === 'completed' ? (
                      <span className="badge badge-sm badge-success gap-1"><FiCheck size={10} /> Terminé</span>
                    ) : (
                      <span className="badge badge-sm badge-ghost gap-1"><FiClock size={10} /> Actif</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-base-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${e.progress || 0}%` }} />
                      </div>
                      <span className="text-xs">{e.progress || 0}%</span>
                    </div>
                  </td>
                  <td className="text-sm text-base-content/60">{new Date(e.started_at).toLocaleDateString()}</td>
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
