import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminCourseAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiAward, FiDownload, FiArrowLeft } from 'react-icons/fi'

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { loadData() }, [page])

  const loadData = async () => {
    try {
      const res = await adminCourseAPI.getCertificates({ page, limit: 20 })
      setCertificates(res.data.certificates)
      setTotalPages(res.data.totalPages)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/dashboard" className="btn btn-ghost btn-sm btn-square"><FiArrowLeft size={18} /></Link>
        <div>
          <h1 className="text-2xl font-bold">Certificats</h1>
          <p className="text-sm text-base-content/60">{certificates.length} délivré(s)</p>
        </div>
      </div>

      {loading ? <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      : certificates.length === 0 ? (
        <div className="text-center py-20 text-base-content/40 bg-base-100 border border-base-200 rounded-xl">
          <FiAward size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucun certificat</p>
        </div>
      ) : (
        <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden">
          <table className="table">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-base-content/50">
                <th>Certificat ID</th>
                <th>Utilisateur</th>
                <th>Cours</th>
                <th>Délivré le</th>
              </tr>
            </thead>
            <tbody>
              {certificates.map(c => (
                <tr key={c.id}>
                  <td className="font-mono text-xs">{c.certificate_id}</td>
                  <td>
                    <div>
                      <p className="font-medium text-sm">{c.user_name}</p>
                      <p className="text-xs text-base-content/40">{c.user_email}</p>
                    </div>
                  </td>
                  <td className="text-sm">{c.course_title}</td>
                  <td className="text-sm text-base-content/60">{new Date(c.issued_at).toLocaleDateString()}</td>
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
