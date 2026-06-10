import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminCourseAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiSave, FiArrowLeft, FiBookOpen } from 'react-icons/fi'

export default function AdminCourseForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    title: '', description: '', difficulty: 'beginner', thumbnail: '', is_published: true
  })

  useEffect(() => {
    if (isEdit) loadCourse()
  }, [id])

  const loadCourse = async () => {
    try {
      const res = await adminCourseAPI.getAll({ limit: 50 })
      const course = res.data.courses.find(c => c.id === id)
      if (course) setForm({ title: course.title, description: course.description || '', difficulty: course.difficulty || 'beginner', thumbnail: course.thumbnail || '', is_published: course.is_published })
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) return toast.error('Le titre est requis')
    setSaving(true)
    try {
      if (isEdit) {
        await adminCourseAPI.update(id, form)
        toast.success('Cours mis à jour')
      } else {
        await adminCourseAPI.create(form)
        toast.success('Cours créé')
      }
      navigate('/admin/courses')
    } catch { toast.error('Erreur sauvegarde') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/courses')} className="btn btn-ghost btn-sm btn-square">
          <FiArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{isEdit ? 'Modifier le cours' : 'Nouveau cours'}</h1>
          <p className="text-sm text-base-content/60">{isEdit ? 'Modifiez les informations du cours' : 'Créez un nouveau cours Python'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-base-100 border border-base-200 rounded-xl p-6 space-y-4 shadow-sm">
        <div>
          <label className="label"><span className="label-text">Titre du cours</span></label>
          <input type="text" className="input input-bordered w-full" value={form.title}
            onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Ex: Python pour les débutants" />
        </div>

        <div>
          <label className="label"><span className="label-text">Description</span></label>
          <textarea className="textarea textarea-bordered w-full h-24 resize-none" value={form.description}
            onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Description du cours..." />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label"><span className="label-text">Difficulté</span></label>
            <select className="select select-bordered w-full" value={form.difficulty}
              onChange={(e) => setForm(p => ({ ...p, difficulty: e.target.value }))}>
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </div>
          <div>
            <label className="label"><span className="label-text">Publié</span></label>
            <div className="flex items-center gap-3 h-12">
              <input type="checkbox" className="toggle toggle-primary" checked={form.is_published}
                onChange={(e) => setForm(p => ({ ...p, is_published: e.target.checked }))} />
              <span className="text-sm">{form.is_published ? 'Publié' : 'Brouillon'}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="label"><span className="label-text">URL de la miniature (optionnel)</span></label>
          <input type="text" className="input input-bordered w-full" value={form.thumbnail}
            onChange={(e) => setForm(p => ({ ...p, thumbnail: e.target.value }))} placeholder="https://..." />
        </div>

        <div className="pt-2">
          <button type="submit" className="btn btn-primary gap-2" disabled={saving}>
            <FiSave size={16} /> {saving ? 'Sauvegarde...' : (isEdit ? 'Mettre à jour' : 'Créer le cours')}
          </button>
        </div>
      </form>
    </div>
  )
}
