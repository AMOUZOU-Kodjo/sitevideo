import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminCourseAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiArrowLeft, FiHelpCircle } from 'react-icons/fi'

export default function AdminQuizManager() {
  const { lessonId } = useParams()
  const [quizzes, setQuizzes] = useState([])
  const [lesson, setLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ question: '', options: ['', '', '', ''], correct_answer: '', explanation: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [quizRes, coursesRes] = await Promise.all([
        adminCourseAPI.getQuiz(lessonId),
        adminCourseAPI.getAll({ limit: 50 })
      ])
      setQuizzes(quizRes.data)
      for (const c of coursesRes.data.courses) {
        const lessons = await adminCourseAPI.getLessons(c.id)
        const l = lessons.data.find(l => l.id === lessonId)
        if (l) { setLesson(l); break }
      }
    } catch {}
    finally { setLoading(false) }
  }

  const addOption = () => {
    setForm(p => ({ ...p, options: [...p.options, ''] }))
  }

  const removeOption = (i) => {
    if (form.options.length <= 2) return toast.error('Minimum 2 options')
    setForm(p => ({ ...p, options: p.options.filter((_, idx) => idx !== i), correct_answer: p.correct_answer === p.options[i] ? '' : p.correct_answer }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.question || form.options.some(o => !o.trim()) || !form.correct_answer) {
      return toast.error('Tous les champs requis')
    }
    try {
      if (editing) {
        await adminCourseAPI.updateQuiz(editing.id, form)
        toast.success('Question mise à jour')
      } else {
        await adminCourseAPI.addQuiz(lessonId, form)
        toast.success('Question ajoutée')
      }
      setShowForm(false)
      setEditing(null)
      setForm({ question: '', options: ['', '', '', ''], correct_answer: '', explanation: '' })
      loadData()
    } catch { toast.error('Erreur sauvegarde') }
  }

  const editQuiz = (q) => {
    setForm({ question: q.question, options: [...q.options], correct_answer: q.correct_answer, explanation: q.explanation || '' })
    setEditing(q)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette question ?')) return
    try {
      await adminCourseAPI.deleteQuiz(id)
      toast.success('Question supprimée')
      loadData()
    } catch { toast.error('Erreur suppression') }
  }

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/courses" className="btn btn-ghost btn-sm btn-square">
          <FiArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Gestion du Quiz</h1>
          <p className="text-sm text-base-content/60">{lesson?.title || 'Leçon'}</p>
        </div>
      </div>

      <button onClick={() => { setShowForm(true); setEditing(null); setForm({ question: '', options: ['', '', '', ''], correct_answer: '', explanation: '' }) }}
        className="btn btn-primary btn-sm gap-2 mb-6">
        <FiPlus size={14} /> Ajouter une question
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-base-100 border border-base-200 rounded-xl p-5 mb-6 shadow-sm">
          <h3 className="font-semibold mb-4">{editing ? 'Modifier' : 'Nouvelle'} question</h3>
          <div className="space-y-3">
            <input type="text" placeholder="Question" className="input input-bordered w-full" value={form.question}
              onChange={(e) => setForm(p => ({ ...p, question: e.target.value }))} />
            {form.options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input type="text" placeholder={`Option ${i + 1}`} className="input input-bordered flex-1" value={opt}
                  onChange={(e) => {
                    const newOpts = [...form.options]
                    newOpts[i] = e.target.value
                    setForm(p => ({ ...p, options: newOpts }))
                  }} />
                <button type="button" onClick={() => removeOption(i)} className="btn btn-ghost btn-xs btn-square text-error" title="Supprimer">
                  <FiTrash2 size={12} />
                </button>
              </div>
            ))}
            <button type="button" onClick={addOption} className="btn btn-ghost btn-xs gap-1"><FiPlus size={12} /> Ajouter une option</button>
            <select className="select select-bordered w-full" value={form.correct_answer}
              onChange={(e) => setForm(p => ({ ...p, correct_answer: e.target.value }))}>
              <option value="">-- Choisir la bonne réponse --</option>
              {form.options.filter(o => o.trim()).map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
            <textarea placeholder="Explication (optionnelle)" className="textarea textarea-bordered w-full h-20 resize-none" value={form.explanation}
              onChange={(e) => setForm(p => ({ ...p, explanation: e.target.value }))} />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn btn-primary btn-sm gap-2"><FiSave size={14} /> Sauvegarder</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn btn-ghost btn-sm">Annuler</button>
          </div>
        </form>
      )}

      {quizzes.length === 0 ? (
        <div className="text-center py-20 text-base-content/40 bg-base-100 border border-base-200 rounded-xl">
          <FiHelpCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucune question pour ce quiz.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quizzes.map((q, i) => (
            <div key={q.id} className="bg-base-100 border border-base-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-sm">{i + 1}. {q.question}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {q.options.map((opt, oi) => (
                      <span key={oi} className={`px-2.5 py-1 rounded-lg text-xs border ${opt === q.correct_answer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium' : 'border-base-200 text-base-content/60'}`}>
                        {opt}
                      </span>
                    ))}
                  </div>
                  {q.explanation && <p className="text-xs text-base-content/40 mt-2">{q.explanation}</p>}
                </div>
                <div className="flex gap-1 ml-3">
                  <button onClick={() => editQuiz(q)} className="btn btn-ghost btn-xs btn-square"><FiEdit2 size={12} /></button>
                  <button onClick={() => handleDelete(q.id)} className="btn btn-ghost btn-xs btn-square text-error"><FiTrash2 size={12} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
