import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminCourseAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiPlay, FiFileText, FiHelpCircle, FiArrowLeft, FiSave, FiChevronUp, FiChevronDown, FiUsers } from 'react-icons/fi'

const typeOptions = [
  { value: 'video', label: 'Vidéo YouTube', icon: FiPlay, color: 'text-blue-500' },
  { value: 'document', label: 'Document PDF', icon: FiFileText, color: 'text-emerald-500' },
  { value: 'quiz', label: 'Quiz', icon: FiHelpCircle, color: 'text-purple-500' }
]

export default function AdminLessons() {
  const { id } = useParams()
  const [lessons, setLessons] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingLesson, setEditingLesson] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', type: 'video', youtube_id: '', file_url: '', content: '', duration: '', is_free: true })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [lessonsRes, coursesRes] = await Promise.all([
        adminCourseAPI.getLessons(id),
        adminCourseAPI.getAll({ limit: 50 })
      ])
      setLessons(lessonsRes.data)
      setCourse(coursesRes.data.courses.find(c => c.id === id))
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  const resetForm = () => {
    setForm({ title: '', description: '', type: 'video', youtube_id: '', file_url: '', content: '', duration: '', is_free: true })
    setEditingLesson(null)
    setShowForm(false)
  }

  const editLesson = (lesson) => {
    setForm({
      title: lesson.title, description: lesson.description || '', type: lesson.type,
      youtube_id: lesson.youtube_id || '', file_url: lesson.file_url || '',
      content: lesson.content || '', duration: lesson.duration || '', is_free: lesson.is_free
    })
    setEditingLesson(lesson)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title) return toast.error('Titre requis')
    try {
      if (editingLesson) {
        await adminCourseAPI.updateLesson(editingLesson.id, form)
        toast.success('Leçon mise à jour')
      } else {
        await adminCourseAPI.createLesson(id, form)
        toast.success('Leçon créée')
      }
      resetForm()
      loadData()
    } catch { toast.error('Erreur sauvegarde') }
  }

  const handleDelete = async (lessonId) => {
    if (!confirm('Supprimer cette leçon ?')) return
    try {
      await adminCourseAPI.deleteLesson(lessonId)
      toast.success('Leçon supprimée')
      loadData()
    } catch { toast.error('Erreur suppression') }
  }

  const moveLesson = async (lessonId, direction) => {
    const idx = lessons.findIndex(l => l.id === lessonId)
    const target = idx + direction
    if (target < 0 || target >= lessons.length) return
    const current = lessons[idx]
    const swap = lessons[target]
    try {
      await Promise.all([
        adminCourseAPI.updateLesson(current.id, { order_index: swap.order_index }),
        adminCourseAPI.updateLesson(swap.id, { order_index: current.order_index })
      ])
      loadData()
    } catch { toast.error('Erreur réorganisation') }
  }

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link to="/admin/courses" className="btn btn-ghost btn-sm btn-square">
            <FiArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{course?.title || 'Leçons'}</h1>
            <p className="text-sm text-base-content/60">{lessons.length} leçon(s)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/courses/${id}/enrollments`} className="btn btn-outline gap-2">
            <FiUsers size={16} /> Inscriptions
          </Link>
          <button onClick={() => { resetForm(); setShowForm(true) }} className="btn btn-primary gap-2">
            <FiPlus size={16} /> Ajouter une leçon
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-base-100 border border-base-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold mb-4">{editingLesson ? 'Modifier' : 'Nouvelle'} leçon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <input type="text" placeholder="Titre de la leçon" className="input input-bordered w-full" value={form.title}
                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <select className="select select-bordered w-full" value={form.type}
                onChange={(e) => setForm(p => ({ ...p, type: e.target.value }))}>
                {typeOptions.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" className="toggle toggle-sm toggle-primary" checked={form.is_free}
                onChange={(e) => setForm(p => ({ ...p, is_free: e.target.checked }))} />
              <span className="text-sm">{form.is_free ? 'Gratuit' : 'Premium'}</span>
            </div>
            {form.type === 'video' && (
              <div>
                <input type="text" placeholder="YouTube ID (ex: dQw4w9WgXcQ)" className="input input-bordered w-full" value={form.youtube_id}
                  onChange={(e) => setForm(p => ({ ...p, youtube_id: e.target.value }))} />
              </div>
            )}
            {(form.type === 'document' || form.type === 'pdf') && (
              <div>
                <input type="text" placeholder="URL du fichier" className="input input-bordered w-full" value={form.file_url}
                  onChange={(e) => setForm(p => ({ ...p, file_url: e.target.value }))} />
              </div>
            )}
            <div>
              <input type="text" placeholder="Durée (ex: 15min)" className="input input-bordered w-full" value={form.duration}
                onChange={(e) => setForm(p => ({ ...p, duration: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <textarea placeholder="Description (optionnelle)" className="textarea textarea-bordered w-full h-20 resize-none" value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="md:col-span-2">
              <textarea placeholder="Contenu texte / HTML (optionnel)" className="textarea textarea-bordered w-full h-24 resize-none font-mono text-xs" value={form.content}
                onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))} />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary btn-sm gap-2"><FiSave size={14} /> Sauvegarder</button>
            <button type="button" onClick={resetForm} className="btn btn-ghost btn-sm">Annuler</button>
          </div>
        </form>
      )}

      {lessons.length === 0 ? (
        <div className="text-center py-20 text-base-content/40 bg-base-100 border border-base-200 rounded-xl">
          <FiPlay size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucune leçon. Créez-en une.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, i) => {
            const typeInfo = typeOptions.find(t => t.value === lesson.type) || typeOptions[0]
            const TypeIcon = typeInfo.icon
            return (
              <div key={lesson.id} className="bg-base-100 border border-base-200 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-xs text-base-content/30 font-mono w-6">{i + 1}</span>
                <span className={`p-2 rounded-lg bg-base-200 ${typeInfo.color}`}>
                  <TypeIcon size={16} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate">{lesson.title}</p>
                    {!lesson.is_free && <span className="badge badge-warning badge-xs">Premium</span>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-base-content/40 mt-0.5">
                    <span>{typeInfo.label}</span>
                    {lesson.duration && <><span>•</span><span>{lesson.duration}</span></>}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveLesson(lesson.id, -1)} disabled={i === 0}
                    className="btn btn-ghost btn-xs btn-square" title="Monter">
                    <FiChevronUp size={14} />
                  </button>
                  <button onClick={() => moveLesson(lesson.id, 1)} disabled={i === lessons.length - 1}
                    className="btn btn-ghost btn-xs btn-square" title="Descendre">
                    <FiChevronDown size={14} />
                  </button>
                  {lesson.type === 'quiz' && (
                    <Link to={`/admin/lessons/${lesson.id}/quiz`} className="btn btn-ghost btn-xs btn-square text-purple-500" title="Quiz">
                      <FiHelpCircle size={14} />
                    </Link>
                  )}
                  <button onClick={() => editLesson(lesson)} className="btn btn-ghost btn-xs btn-square" title="Modifier">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(lesson.id)} className="btn btn-ghost btn-xs btn-square text-error" title="Supprimer">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
