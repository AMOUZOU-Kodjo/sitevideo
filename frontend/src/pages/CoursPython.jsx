import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { courseAPI } from '../services/api'
import toast from 'react-hot-toast'
import { jsPDF } from 'jspdf'
import {
  FiBookOpen, FiPlay, FiFileText, FiHelpCircle, FiMessageSquare,
  FiChevronDown, FiChevronUp, FiCheck, FiX, FiSearch, FiClock,
  FiBarChart2, FiSend, FiThumbsUp, FiLock, FiUnlock, FiUsers,
  FiCode, FiTrendingUp, FiAward, FiStar, FiArrowLeft, FiDownload,
  FiCheckCircle, FiCircle, FiPercent, FiExternalLink
} from 'react-icons/fi'

const difficultyConfig = {
  beginner: { label: 'Débutant', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: FiStar },
  intermediate: { label: 'Intermédiaire', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: FiBarChart2 },
  advanced: { label: 'Avancé', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: FiTrendingUp }
}

const typeIcons = { video: FiPlay, document: FiFileText, pdf: FiFileText, quiz: FiHelpCircle }

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
const toAbsUrl = (url) => url?.startsWith('http') ? url : `${API_BASE}${url}`
const viewUrl = toAbsUrl
const downloadUrl = toAbsUrl

async function generateCertificate(userName, courseTitle, certId) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const w = 297, h = 210

  let logoData = null
  try {
    const resp = await fetch('/logo.png')
    const blob = await resp.blob()
    logoData = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
  } catch {}

  const darkBlue = [15, 30, 65]
  const lightGray = [245, 247, 250]
  const textGray = [100, 110, 125]
  const dark = [17, 24, 39]

  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, w, h, 'F')

  doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.setLineWidth(6)
  doc.rect(6, 6, w - 12, h - 12)

  doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.setLineWidth(0.5)
  doc.rect(10, 10, w - 20, h - 20)

  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2])
  doc.rect(14, 14, w - 28, h - 28, 'F')

  if (logoData) {
    doc.addImage(logoData, 'PNG', 32, 20, 30, 30)
  } else {
    doc.setFillColor(darkBlue[0], darkBlue[1], darkBlue[2])
    doc.roundedRect(32, 20, 30, 30, 4, 4, 'F')
    doc.setFont('times', 'bold')
    doc.setFontSize(13)
    doc.setTextColor(255, 255, 255)
    doc.text('SB', 47, 40, { align: 'center' })
  }

  doc.setFont('times', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.text('Organisme de formation certifié', 47, 55, { align: 'center' })

  const logo2X = 32
  doc.setFillColor(220, 225, 240)
  doc.roundedRect(logo2X, 62, 24, 24, 3, 3, 'F')
  doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.setLineWidth(0.3)
  doc.roundedRect(logo2X, 62, 24, 24, 3, 3, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5)
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.text('QUALIOPI', logo2X + 12, 76, { align: 'center' })

  const logo3X = logo2X + 28
  doc.setFillColor(220, 225, 240)
  doc.roundedRect(logo3X, 62, 24, 24, 3, 3, 'F')
  doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.setLineWidth(0.3)
  doc.roundedRect(logo3X, 62, 24, 24, 3, 3, 'S')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(5)
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.text('DATADOCK', logo3X + 12, 76, { align: 'center' })

  doc.setFont('times', 'bold')
  doc.setFontSize(38)
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.text('CERTIFICAT DE FORMATION', w / 2, 68, { align: 'center' })

  doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.setLineWidth(1.5)
  doc.line(w / 2 - 80, 74, w / 2 + 80, 74)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(textGray[0], textGray[1], textGray[2])
  doc.text('Délivré à', w / 2, 90, { align: 'center' })

  doc.setFont('times', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text(userName, w / 2, 112, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(12)
  doc.setTextColor(textGray[0], textGray[1], textGray[2])
  doc.text('Pour avoir suivi et complété avec succès la formation', w / 2, 132, { align: 'center' })

  doc.setFont('times', 'bold')
  doc.setFontSize(24)
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.text(courseTitle, w / 2, 154, { align: 'center' })

  const dateStr = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(textGray[0], textGray[1], textGray[2])
  doc.text(`Date de délivrance : ${dateStr}`, w / 2, 172, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(textGray[0], textGray[1], textGray[2])
  doc.text(`Organisme : SavoirBox • SIRET : 123 456 789 00012 • N° d'activité : 11 75 12345 75`, w / 2, 182, { align: 'center' })

  const qrX = 28, qrY = 138, qrSize = 32
  doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.setLineWidth(0.5)
  doc.rect(qrX, qrY, qrSize, qrSize)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(5)
  doc.setTextColor(textGray[0], textGray[1], textGray[2])
  doc.text('QR CODE', qrX + qrSize / 2, qrY + qrSize / 2 + 2, { align: 'center' })
  doc.setFontSize(4)
  doc.text('Scannez pour vérifier', qrX + qrSize / 2, qrY + qrSize - 3, { align: 'center' })
  doc.setFontSize(3)
  doc.text(certId, qrX + qrSize / 2, qrY + qrSize / 2 - 4, { align: 'center' })

  const sigX = w - 105
  doc.setDrawColor(dark[0], dark[1], dark[2])
  doc.setLineWidth(0.5)
  doc.line(sigX, 176, sigX + 60, 176)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(dark[0], dark[1], dark[2])
  doc.text('Signature du responsable', sigX + 30, 183, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(textGray[0], textGray[1], textGray[2])
  doc.text('Prénom NOM', sigX + 30, 188, { align: 'center' })

  const stampX = w - 60, stampY = 156, stampR = 18
  doc.setDrawColor(darkBlue[0], darkBlue[1], darkBlue[2])
  doc.setLineWidth(1.5)
  doc.circle(stampX, stampY, stampR)
  doc.circle(stampX, stampY, stampR - 3)
  doc.setFont('times', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(darkBlue[0], darkBlue[1], darkBlue[2])
  const stampText = 'SAVOIRBOX CERTIFICATION'
  for (let i = 0; i < stampText.length; i++) {
    const angle = (i / stampText.length) * Math.PI * 2 - Math.PI / 2
    const tx = stampX + (stampR - 4.5) * Math.cos(angle)
    const ty = stampY + (stampR - 4.5) * Math.sin(angle)
    doc.text(stampText[i], tx, ty + 2.5, { align: 'center' })
  }
  doc.setFontSize(10)
  doc.text('✓', stampX, stampY + 3.5, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(textGray[0], textGray[1], textGray[2])
  doc.text(`ID : ${certId}`, w / 2, 198, { align: 'center' })

  doc.save(`certificat-${certId.toLowerCase()}.pdf`)
}

export default function CoursPython() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [quizData, setQuizData] = useState([])
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizResults, setQuizResults] = useState({})
  const [forumTopics, setForumTopics] = useState([])
  const [showForumForm, setShowForumForm] = useState(false)
  const [forumForm, setForumForm] = useState({ title: '', content: '' })
  const [replies, setReplies] = useState({})
  const [replyInputs, setReplyInputs] = useState({})
  const [search, setSearch] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')
  const [enrollment, setEnrollment] = useState(null)
  const [progress, setProgress] = useState([])
  const [totalLessons, setTotalLessons] = useState(0)
  const [completedLessons, setCompletedLessons] = useState(0)
  const [certificate, setCertificate] = useState(null)
  const [generatingCert, setGeneratingCert] = useState(false)

  useEffect(() => { loadCourses() }, [difficultyFilter])

  const loadCourses = async () => {
    try {
      const params = {}
      if (difficultyFilter) params.difficulty = difficultyFilter
      if (search) params.search = search
      const res = await courseAPI.getAll(params)
      setCourses(res.data)
    } catch { toast.error('Erreur chargement cours') }
    finally { setLoading(false) }
  }

  const loadCourseDetail = async (slug) => {
    try {
      const res = await courseAPI.getBySlug(slug)
      setSelectedCourse(res.data)
      setSelectedLesson(null)
      setQuizData([])
      setQuizResults({})
      loadForumTopics(slug)
      if (user) loadEnrollment(slug)
    } catch { toast.error('Erreur chargement du cours') }
  }

  const loadEnrollment = async (slug) => {
    try {
      const res = await courseAPI.getEnrollment(slug)
      setEnrollment(res.data.enrollment)
      setProgress(res.data.progress || [])
      setTotalLessons(res.data.totalLessons)
      setCompletedLessons(res.data.completedLessons)
    } catch { setEnrollment(null) }
  }

  const handleEnroll = async () => {
    if (!user) return toast.error('Connectez-vous pour vous inscrire')
    try {
      const res = await courseAPI.enroll(selectedCourse.slug)
      setEnrollment(res.data)
      toast.success('Inscrit au cours !')
      loadEnrollment(selectedCourse.slug)
    } catch { toast.error("Erreur d'inscription") }
  }

  const handleCompleteLesson = async (lessonId) => {
    try {
      const res = await courseAPI.completeLesson(selectedCourse.slug, lessonId)
      toast.success('Leçon terminée !')
      loadEnrollment(selectedCourse.slug)
      if (res.data.allDone) {
        toast.success('Félicitations ! Cours terminé !', { duration: 5000 })
        loadCertificate(selectedCourse.slug)
      }
    } catch { toast.error('Erreur') }
  }

  const loadCertificate = async (slug) => {
    try {
      const res = await courseAPI.getCertificate(slug)
      setCertificate(res.data)
    } catch {}
  }

  const handleDownloadCert = async () => {
    if (!certificate) return toast.error('Aucun certificat disponible')
    setGeneratingCert(true)
    try {
      await generateCertificate(certificate.user_name, certificate.course_title, certificate.certificate_id)
      toast.success('Certificat téléchargé !')
    } catch { toast.error('Erreur génération PDF') }
    finally { setGeneratingCert(false) }
  }

  const isLessonCompleted = (lessonId) => progress.some(p => p.lesson_id === lessonId && p.completed)

  const loadForumTopics = async (slug) => {
    try {
      const res = await courseAPI.getForumTopics(slug)
      setForumTopics(res.data.topics)
    } catch {}
  }

  const loadQuiz = async (lessonId) => {
    if (!selectedCourse) return
    try {
      const res = await courseAPI.getQuiz(selectedCourse.slug, lessonId)
      setQuizData(res.data)
      setQuizAnswers({})
      setQuizResults({})
    } catch { toast.error('Erreur chargement quiz') }
  }

  const submitQuizAnswer = async (quizId) => {
    const answer = quizAnswers[quizId]
    if (!answer) return toast.error('Sélectionne une réponse')
    try {
      const res = await courseAPI.submitQuiz(quizId, answer)
      setQuizResults(prev => ({ ...prev, [quizId]: res.data }))
      if (res.data.is_correct) toast.success('Bonne réponse !')
      else toast.error('Mauvaise réponse')
    } catch { toast.error('Erreur soumission') }
  }

  const allQuizPassed = () => {
    if (quizData.length === 0) return false
    return quizData.every(q => quizResults[q.id]?.is_correct)
  }

  const handleForumSubmit = async (e) => {
    e.preventDefault()
    if (!forumForm.title || !forumForm.content) return toast.error('Tous les champs requis')
    try {
      await courseAPI.createForumTopic(selectedCourse.slug, forumForm)
      toast.success('Sujet créé !')
      setForumForm({ title: '', content: '' })
      setShowForumForm(false)
      loadForumTopics(selectedCourse.slug)
    } catch { toast.error('Erreur création sujet') }
  }

  const toggleReplies = async (topicId) => {
    if (replies[topicId]) {
      setReplies(prev => { const n = { ...prev }; delete n[topicId]; return n })
      return
    }
    try {
      const res = await courseAPI.getTopicReplies(topicId)
      setReplies(prev => ({ ...prev, [topicId]: res.data }))
    } catch {}
  }

  const handleReply = async (topicId) => {
    const content = replyInputs[topicId]
    if (!content) return toast.error('Écris une réponse')
    try {
      await courseAPI.createReply(topicId, content)
      toast.success('Réponse publiée !')
      setReplyInputs(prev => ({ ...prev, [topicId]: '' }))
      const res = await courseAPI.getTopicReplies(topicId)
      setReplies(prev => ({ ...prev, [topicId]: res.data }))
    } catch { toast.error('Erreur réponse') }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadCourses()
  }

  const onSelectLesson = (lesson) => {
    setSelectedLesson(lesson)
    if (lesson.type === 'quiz') loadQuiz(lesson.id)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200/50 to-base-100">
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
              <FiCode size={16} /> Apprentissage interactif
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Maîtrisez Python
            </h1>
            <p className="text-lg text-base-content/70 mb-8 max-w-2xl mx-auto">
              Cours interactifs, vidéos YouTube, documents PDF, quiz et forum de discussion.
              Obtenez un certificat à la fin de chaque cours.
            </p>
            <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
              <div className="relative flex-1">
                <FiSearch size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input type="text" placeholder="Rechercher un cours..." value={search}
                  onChange={(e) => setSearch(e.target.value)} className="input input-bordered w-full pl-9" />
              </div>
              <button type="submit" className="btn btn-primary">Chercher</button>
            </form>
            <div className="flex justify-center gap-2 mt-4">
              {['', 'beginner', 'intermediate', 'advanced'].map(d => (
                <button key={d} onClick={() => setDifficultyFilter(d)}
                  className={`btn btn-xs ${difficultyFilter === d ? 'btn-primary' : 'btn-ghost'}`}
                >{d ? difficultyConfig[d].label : 'Tous'}</button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 -mt-6 mb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: FiBookOpen, label: 'Cours', value: courses.length },
            { icon: FiPlay, label: 'Leçons vidéo', value: courses.reduce((a, c) => a + (c.lesson_count || 0), 0) },
            { icon: FiUsers, label: 'Apprenants', value: 'Actif' },
            { icon: FiAward, label: 'Certificat', value: 'Inclus' }
          ].map((s, i) => (
            <div key={i} className="stat bg-base-100 border border-base-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="stat-figure text-primary"><s.icon size={24} /></div>
              <div className="stat-title text-xs">{s.label}</div>
              <div className="stat-value text-2xl text-primary">{s.value}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
        ) : selectedCourse ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <button onClick={() => { setSelectedCourse(null); setSelectedLesson(null); setCertificate(null) }}
                className="flex items-center gap-2 text-sm text-base-content/60 hover:text-primary transition-colors">
                <FiArrowLeft size={16} /> Retour aux cours
              </button>

              <div className="bg-base-100 border border-base-200 rounded-xl p-5 shadow-sm">
                <h2 className="font-bold text-lg mb-1">{selectedCourse.title}</h2>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${difficultyConfig[selectedCourse.difficulty]?.color || ''}`}>
                  {selectedCourse.difficulty && difficultyConfig[selectedCourse.difficulty]?.label}
                </span>
                <p className="text-sm text-base-content/60 mt-3">{selectedCourse.description}</p>
              </div>

              {/* Enrollment / Progress */}
              {user && (
                <div className="bg-base-100 border border-base-200 rounded-xl p-4 shadow-sm">
                  {enrollment ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{enrollment.status === 'completed' ? 'Terminé' : 'En cours'}</span>
                        <span className="text-xs font-bold text-primary">{completedLessons}/{totalLessons}</span>
                      </div>
                      <div className="w-full bg-base-200 rounded-full h-2.5 mb-2">
                        <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0}%` }} />
                      </div>
                      <p className="text-xs text-base-content/40">{Math.round((completedLessons / totalLessons) * 100) || 0}% complété</p>
                      {enrollment.status === 'completed' && (
                        <div className="mt-3">
                          {certificate ? (
                            <button onClick={handleDownloadCert} disabled={generatingCert}
                              className="btn btn-primary btn-sm w-full gap-2">
                              <FiDownload size={14} /> {generatingCert ? 'Génération...' : 'Télécharger le certificat'}
                            </button>
                          ) : (
                            <button onClick={() => loadCertificate(selectedCourse.slug)}
                              className="btn btn-outline btn-sm w-full gap-2">
                              <FiAward size={14} /> Voir mon certificat
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <button onClick={handleEnroll} className="btn btn-primary w-full gap-2">
                      <FiBookOpen size={16} /> S'inscrire au cours
                    </button>
                  )}
                </div>
              )}

              {/* Lessons */}
              <div className="bg-base-100 border border-base-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-3 border-b border-base-200 bg-base-200/50">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FiBookOpen size={16} className="text-primary" />
                    Leçons ({selectedCourse.lessons?.length || 0})
                  </h3>
                </div>
                <div className="divide-y divide-base-200 max-h-[500px] overflow-y-auto">
                  {selectedCourse.lessons?.map((lesson, i) => {
                    const Icon = typeIcons[lesson.type] || FiFileText
                    const typeColors = { video: 'text-blue-500', document: 'text-emerald-500', pdf: 'text-emerald-500', quiz: 'text-purple-500' }
                    const completed = isLessonCompleted(lesson.id)
                    return (
                      <button key={lesson.id} onClick={() => onSelectLesson(lesson)}
                        className={`w-full text-left p-3 transition-all hover:bg-base-200/50 ${selectedLesson?.id === lesson.id ? 'bg-primary/5 border-l-2 border-primary' : ''}`}>
                        <div className="flex items-center gap-3">
                          {completed ? (
                            <span className="text-emerald-500"><FiCheckCircle size={18} /></span>
                          ) : (
                            <span className={`p-2 rounded-lg bg-base-200 ${typeColors[lesson.type] || ''}`}>
                              <Icon size={14} />
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${completed ? 'text-base-content/50 line-through' : ''}`}>{lesson.title}</p>
                            <div className="flex items-center gap-2 text-xs text-base-content/40 mt-0.5">
                              <span>{lesson.type}</span>
                              {lesson.duration && <><span>•</span><span>{lesson.duration}</span></>}
                            </div>
                          </div>
                          <span className="text-xs text-base-content/30">{i + 1}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              {selectedLesson ? (
                <>
                  <div className="bg-base-100 border border-base-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-bold mb-1">{selectedLesson.title}</h2>
                      <p className="text-sm text-base-content/60">{selectedLesson.description}</p>
                    </div>
                    {enrollment && !isLessonCompleted(selectedLesson.id) && selectedLesson.type !== 'quiz' && (
                      <button onClick={() => handleCompleteLesson(selectedLesson.id)}
                        className="btn btn-success btn-sm gap-2">
                        <FiCheck size={14} /> Marquer terminée
                      </button>
                    )}
                    {enrollment && isLessonCompleted(selectedLesson.id) && (
                      <span className="flex items-center gap-1 text-emerald-500 text-sm font-medium">
                        <FiCheckCircle size={16} /> Terminée
                      </span>
                    )}
                  </div>

                  {selectedLesson.type === 'video' && selectedLesson.youtube_id && (
                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                      <iframe src={`https://www.youtube.com/embed/${selectedLesson.youtube_id}`}
                        className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen title={selectedLesson.title} />
                    </div>
                  )}

                  {(selectedLesson.type === 'document' || selectedLesson.type === 'pdf') && selectedLesson.file_url && (
                    <div className="bg-base-100 border border-base-200 rounded-xl p-6 shadow-sm">
                      <div className="flex items-center gap-4">
                        <span className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600"><FiFileText size={24} /></span>
                        <div><p className="font-medium">{selectedLesson.title}</p><p className="text-sm text-base-content/50">Document PDF</p></div>
                        <div className="flex gap-2 ml-auto">
                          <a href={viewUrl(selectedLesson.file_url)} target="_blank" rel="noopener noreferrer"
                            className="btn btn-primary btn-sm gap-2"><FiExternalLink size={14} /> Ouvrir</a>
                          <a href={downloadUrl(selectedLesson.file_url)} target="_blank" rel="noopener noreferrer"
                            className="btn btn-success btn-sm gap-2"><FiDownload size={14} /> Télécharger</a>
                        </div>
                      </div>
                      {selectedLesson.content && (
                        <div className="prose prose-sm max-w-none dark:prose-invert mt-4 pt-4 border-t border-base-200"
                          dangerouslySetInnerHTML={{ __html: selectedLesson.content.replace(/\n/g, '<br/>') }} />
                      )}
                    </div>
                  )}

                  {selectedLesson.content && selectedLesson.type !== 'document' && selectedLesson.type !== 'pdf' && (
                    <div className="bg-base-100 border border-base-200 rounded-xl p-6 shadow-sm prose prose-sm max-w-none dark:prose-invert"
                      dangerouslySetInnerHTML={{ __html: selectedLesson.content.replace(/\n/g, '<br/>') }} />
                  )}

                  {selectedLesson.type === 'quiz' && (
                    <div className="space-y-4">
                      <h3 className="font-bold text-lg flex items-center gap-2"><FiHelpCircle className="text-primary" /> Quiz</h3>
                      {quizData.length === 0 ? (
                        <div className="bg-base-100 border border-base-200 rounded-xl p-8 text-center shadow-sm">
                          <FiHelpCircle size={40} className="mx-auto text-base-content/20 mb-3" />
                          <p className="text-base-content/50">Aucune question pour ce quiz.</p>
                        </div>
                      ) : (
                        <>
                          {quizData.map((q, i) => (
                            <div key={q.id} className="bg-base-100 border border-base-200 rounded-xl p-5 shadow-sm">
                              <p className="font-medium mb-3">{i + 1}. {q.question}</p>
                              <div className="space-y-2">
                                {q.options.map((opt, oi) => {
                                  const selected = quizAnswers[q.id] === opt
                                  const result = quizResults[q.id]
                                  const isCorrect = result && opt === result.correct_answer
                                  return (
                                    <label key={oi} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all
                                      ${result ? (isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : (selected && !result.is_correct ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-base-200 opacity-60'))
                                      : selected ? 'border-primary bg-primary/5' : 'border-base-200 hover:border-primary/30'}`}>
                                      <input type="radio" name={`q-${q.id}`} value={opt}
                                        checked={selected} onChange={() => setQuizAnswers(prev => ({ ...prev, [q.id]: opt }))}
                                        disabled={!!result} className="radio radio-sm radio-primary" />
                                      <span className="text-sm">{opt}</span>
                                      {result && isCorrect && <FiCheck className="text-emerald-500 ml-auto" size={16} />}
                                      {result && selected && !result.is_correct && <FiX className="text-red-500 ml-auto" size={16} />}
                                    </label>
                                  )
                                })}
                              </div>
                              {quizResults[q.id] && (
                                <div className={`mt-3 p-3 rounded-lg text-sm ${quizResults[q.id].is_correct ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                                  {quizResults[q.id].is_correct ? 'Bonne réponse !' : `Mauvaise réponse. Réponse: ${quizResults[q.id].correct_answer}`}
                                  {quizResults[q.id].explanation && <p className="mt-1 text-xs opacity-75">{quizResults[q.id].explanation}</p>}
                                </div>
                              )}
                              {!quizResults[q.id] && (
                                <button onClick={() => submitQuizAnswer(q.id)} className="btn btn-primary btn-sm mt-3 gap-2" disabled={!quizAnswers[q.id]}>
                                  <FiCheck size={14} /> Valider
                                </button>
                              )}
                            </div>
                          ))}
                          {allQuizPassed() && enrollment && !isLessonCompleted(selectedLesson.id) && (
                            <button onClick={() => handleCompleteLesson(selectedLesson.id)}
                              className="btn btn-success gap-2 w-full">
                              <FiAward size={16} /> Quiz réussi ! Terminer la leçon
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Complete video lesson button at bottom */}
                  {enrollment && selectedLesson.type === 'video' && !isLessonCompleted(selectedLesson.id) && (
                    <div className="flex justify-center pt-2">
                      <button onClick={() => handleCompleteLesson(selectedLesson.id)}
                        className="btn btn-lg btn-success gap-3 px-8 shadow-lg">
                        <FiCheck size={20} /> Marquer comme terminée
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-base-100 border border-base-200 rounded-xl p-12 text-center shadow-sm">
                  <FiBookOpen size={48} className="mx-auto text-primary/30 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Sélectionnez une leçon</h3>
                  <p className="text-base-content/50">Choisissez une leçon dans la liste pour commencer.</p>
                </div>
              )}

              {/* Forum */}
              <div className="bg-base-100 border border-base-200 rounded-xl shadow-sm overflow-hidden mt-8">
                <div className="p-4 border-b border-base-200 bg-base-200/50 flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2"><FiMessageSquare size={16} className="text-primary" /> Forum</h3>
                  {user && <button onClick={() => setShowForumForm(!showForumForm)} className="btn btn-primary btn-sm gap-2"><FiSend size={14} /> Nouveau sujet</button>}
                </div>
                {showForumForm && (
                  <form onSubmit={handleForumSubmit} className="p-4 border-b border-base-200 bg-base-100">
                    <input type="text" placeholder="Titre du sujet" value={forumForm.title}
                      onChange={(e) => setForumForm(p => ({ ...p, title: e.target.value }))} className="input input-bordered w-full mb-2 text-sm" />
                    <textarea placeholder="Contenu..." value={forumForm.content} rows={3}
                      onChange={(e) => setForumForm(p => ({ ...p, content: e.target.value }))} className="textarea textarea-bordered w-full mb-2 text-sm resize-none" />
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm gap-2"><FiSend size={14} /> Publier</button>
                      <button type="button" onClick={() => setShowForumForm(false)} className="btn btn-ghost btn-sm">Annuler</button>
                    </div>
                  </form>
                )}
                <div className="divide-y divide-base-200 max-h-[500px] overflow-y-auto">
                  {forumTopics.length === 0 ? (
                    <div className="p-8 text-center text-base-content/40"><FiMessageSquare size={32} className="mx-auto mb-2" /><p className="text-sm">Aucune discussion.</p></div>
                  ) : forumTopics.map(topic => (
                    <div key={topic.id}>
                      <div className="p-4 hover:bg-base-200/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {topic.is_pinned && <FiThumbsUp size={14} className="text-primary" />}
                              <h4 className="font-medium text-sm">{topic.title}</h4>
                            </div>
                            <p className="text-xs text-base-content/50 mt-1 line-clamp-2">{topic.content}</p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-base-content/40">
                              <span>par {topic.user_name}</span>
                              <span>{new Date(topic.created_at).toLocaleDateString()}</span>
                              <span>{topic.reply_count || 0} réponses</span>
                            </div>
                          </div>
                          <button onClick={() => toggleReplies(topic.id)} className="btn btn-ghost btn-xs">
                            {replies[topic.id] ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                          </button>
                        </div>
                      </div>
                      {replies[topic.id] && (
                        <div className="bg-base-200/30 border-t border-base-200">
                          {replies[topic.id].map(reply => (
                            <div key={reply.id} className="p-3 pl-8 border-b border-base-200 last:border-0">
                              <div className="flex items-center gap-2 text-xs text-base-content/50 mb-1">
                                <span className="font-medium text-base-content/70">{reply.user_name}</span>
                                <span>{new Date(reply.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-sm">{reply.content}</p>
                            </div>
                          ))}
                          {user && (
                            <div className="p-3 pl-8 flex gap-2">
                              <input type="text" placeholder="Écrire une réponse..." value={replyInputs[topic.id] || ''}
                                onChange={(e) => setReplyInputs(p => ({ ...p, [topic.id]: e.target.value }))} className="input input-bordered input-sm flex-1 text-sm" />
                              <button onClick={() => handleReply(topic.id)} className="btn btn-primary btn-sm btn-square"><FiSend size={14} /></button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Course grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <FiBookOpen size={48} className="mx-auto text-base-content/20 mb-4" />
                <p className="text-base-content/50">Aucun cours trouvé.</p>
              </div>
            ) : courses.map(course => {
              const diff = difficultyConfig[course.difficulty] || difficultyConfig.beginner
              const DiffIcon = diff.icon
              return (
                <div key={course.id} onClick={() => loadCourseDetail(course.slug)}
                  className="group bg-base-100 border border-base-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                  <div className="aspect-video bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-base-100/80 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${diff.color}`}><DiffIcon size={12} /> {diff.label}</span>
                    </div>
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-2.5 py-1 rounded-full bg-primary text-white text-xs font-medium shadow-lg">Voir le cours</span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{course.title}</h3>
                    <p className="text-sm text-base-content/60 mt-1 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-3 mt-4 text-xs text-base-content/40">
                      <span className="flex items-center gap-1"><FiPlay size={12} /> {course.lesson_count || 0} leçons</span>
                      <span className="flex items-center gap-1"><FiAward size={12} /> Certificat</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}