import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminCourseAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiArrowLeft, FiHelpCircle, FiPlay, FiZap, FiX, FiCheck, FiUsers } from 'react-icons/fi'

const typeColors = {
  video: 'text-blue-500',
  document: 'text-emerald-500',
  pdf: 'text-emerald-500',
  quiz: 'text-purple-500'
}

const emptyForm = { question: '', options: ['', '', '', ''], correct_answer: '', explanation: '' }

export default function AdminCourseQuizManager() {
  const { id: courseId } = useParams()
  const [lessons, setLessons] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [formLessonId, setFormLessonId] = useState(null)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [generating, setGenerating] = useState(null)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [coursesRes, lessonsRes, quizzesRes] = await Promise.all([
        adminCourseAPI.getAll({ limit: 50 }),
        adminCourseAPI.getLessons(courseId),
        adminCourseAPI.getCourseQuizzes(courseId)
      ])
      setCourse(coursesRes.data.courses.find(c => c.id === courseId))
      setLessons(lessonsRes.data)
      setQuizzes(quizzesRes.data)
    } catch { toast.error('Erreur chargement') }
    finally { setLoading(false) }
  }

  const getQuizCount = (lessonId) => quizzes.filter(q => q.lesson_id === lessonId).length
  const getLessonQuizzes = (lessonId) => quizzes.filter(q => q.lesson_id === lessonId)

  const resetForm = () => {
    setForm(emptyForm)
    setEditing(null)
    setFormLessonId(null)
  }

  const openAddForm = (lessonId) => {
    setForm(emptyForm)
    setFormLessonId(lessonId)
    setEditing(null)
  }

  const editQuiz = (q) => {
    setForm({ question: q.question, options: [...q.options], correct_answer: q.correct_answer, explanation: q.explanation || '' })
    setEditing(q)
    setFormLessonId(q.lesson_id)
  }

  const addOption = () => setForm(p => ({ ...p, options: [...p.options, ''] }))

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
        await adminCourseAPI.addQuiz(formLessonId, form)
        toast.success('Question ajoutée')
      }
      resetForm()
      loadData()
    } catch { toast.error('Erreur sauvegarde') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette question ?')) return
    try {
      await adminCourseAPI.deleteQuiz(id)
      toast.success('Question supprimée')
      loadData()
    } catch { toast.error('Erreur suppression') }
  }

  const handleGenerate = async (lessonId) => {
    setGenerating(lessonId)
    try {
      const res = await adminCourseAPI.generateQuiz(lessonId, { count: 3 })
      toast.success(res.data.message)
      loadData()
    } catch { toast.error('Erreur génération') }
    finally { setGenerating(null) }
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
            <h1 className="text-2xl font-bold">Gestion des Quiz</h1>
            <p className="text-sm text-base-content/60">{course?.title || 'Cours'} — {quizzes.length} question(s)</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to={`/admin/courses/${courseId}/lessons`} className="btn btn-outline btn-sm gap-1">
            <FiPlay size={14} /> Leçons
          </Link>
          <Link to={`/admin/courses/${courseId}/enrollments`} className="btn btn-outline btn-sm gap-1">
            <FiUsers size={14} /> Inscriptions
          </Link>
        </div>
      </div>

      {lessons.length === 0 ? (
        <div className="text-center py-20 text-base-content/40 bg-base-100 border border-base-200 rounded-xl">
          <FiHelpCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>Aucune leçon dans ce cours. Créez d'abord des leçons.</p>
          <Link to={`/admin/courses/${courseId}/lessons`} className="btn btn-primary btn-sm mt-4 gap-1">
            <FiPlus size={14} /> Ajouter des leçons
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {lessons.map((lesson) => {
            const lessonQuizzes = getLessonQuizzes(lesson.id)
            const isFormOpen = formLessonId === lesson.id
            return (
              <div key={lesson.id} className="bg-base-100 border border-base-200 rounded-xl shadow-sm flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-base-200">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`p-1.5 rounded-lg bg-base-200 shrink-0 ${typeColors[lesson.type] || 'text-base-content/60'}`}>
                        <FiHelpCircle size={14} />
                      </span>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{lesson.title}</p>
                        <p className="text-xs text-base-content/40">{getQuizCount(lesson.id)} question(s)</p>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => handleGenerate(lesson.id)} disabled={generating === lesson.id}
                        className="btn btn-ghost btn-xs gap-1 text-warning" title="Générer 3 questions">
                        <FiZap size={12} /> {generating === lesson.id ? '...' : 'Générer'}
                      </button>
                      <button onClick={() => openAddForm(lesson.id)} className="btn btn-ghost btn-xs btn-square text-primary" title="Ajouter une question">
                        <FiPlus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 p-3 space-y-2">
                  {isFormOpen && (
                    <form onSubmit={handleSubmit} className="bg-base-200/50 rounded-lg p-3 border border-base-200 mb-2">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-xs">{editing ? 'Modifier' : 'Nouvelle'} question</h4>
                        <button type="button" onClick={resetForm} className="btn btn-ghost btn-xs btn-square"><FiX size={12} /></button>
                      </div>
                      <div className="space-y-1.5">
                        <input type="text" placeholder="Question" className="input input-bordered input-xs w-full" value={form.question}
                          onChange={(e) => setForm(p => ({ ...p, question: e.target.value }))} />
                        {form.options.map((opt, i) => (
                          <div key={i} className="flex gap-1 items-center">
                            <input type="text" placeholder={`Option ${i + 1}`} className="input input-bordered input-xs flex-1" value={opt}
                              onChange={(e) => {
                                const newOpts = [...form.options]
                                newOpts[i] = e.target.value
                                setForm(p => ({ ...p, options: newOpts }))
                              }} />
                            <button type="button" onClick={() => removeOption(i)} className="btn btn-ghost btn-xs btn-square text-error"><FiTrash2 size={10} /></button>
                          </div>
                        ))}
                        <button type="button" onClick={addOption} className="btn btn-ghost btn-xs gap-1 text-[11px]"><FiPlus size={10} /> Option</button>
                        <select className="select select-bordered select-xs w-full" value={form.correct_answer}
                          onChange={(e) => setForm(p => ({ ...p, correct_answer: e.target.value }))}>
                          <option value="">-- Bonne réponse --</option>
                          {form.options.filter(o => o.trim()).map((opt, i) => (
                            <option key={i} value={opt}>{opt}</option>
                          ))}
                        </select>
                        <textarea placeholder="Explication (optionnelle)" className="textarea textarea-bordered textarea-xs w-full h-14 resize-none" value={form.explanation}
                          onChange={(e) => setForm(p => ({ ...p, explanation: e.target.value }))} />
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        <button type="submit" className="btn btn-primary btn-xs gap-1"><FiSave size={11} /> Sauvegarder</button>
                        <button type="button" onClick={resetForm} className="btn btn-ghost btn-xs">Annuler</button>
                      </div>
                    </form>
                  )}

                  {lessonQuizzes.length === 0 && !isFormOpen ? (
                    <div className="text-center py-6 text-xs text-base-content/30">
                      Aucune question. Cliquez sur <strong>+</strong> ou <strong>Générer</strong>
                    </div>
                  ) : (
                    lessonQuizzes.map((q, i) => (
                      <div key={q.id} className="bg-base-200/30 rounded-lg p-2.5 border border-base-200/50">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] text-base-content/30 font-mono mt-0.5 shrink-0">{i + 1}.</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium leading-snug">{q.question}</p>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {q.options.map((opt, oi) => (
                                <span key={oi} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] border ${opt === q.correct_answer ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 font-medium' : 'border-base-200 text-base-content/50'}`}>
                                  {opt === q.correct_answer && <FiCheck size={9} />}
                                  {opt}
                                </span>
                              ))}
                            </div>
                            {q.explanation && <p className="text-[10px] text-base-content/40 mt-1 italic leading-tight">{q.explanation}</p>}
                          </div>
                          <div className="flex gap-0.5 shrink-0">
                            <button onClick={() => editQuiz(q)} className="btn btn-ghost btn-xs btn-square"><FiEdit2 size={10} /></button>
                            <button onClick={() => handleDelete(q.id)} className="btn btn-ghost btn-xs btn-square text-error"><FiTrash2 size={10} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
