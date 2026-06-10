import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlay, FiFileText, FiMusic, FiDownload, FiEye, FiClock, FiLock, FiStar, FiTrendingUp, FiImage } from 'react-icons/fi'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
const toAbsUrl = (url) => url?.startsWith('http') ? url : `${BASE_URL}${url}`

const THUMB_FALLBACK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" fill="%23e5e7eb"><rect width="320" height="180"/><text x="160" y="100" text-anchor="middle" fill="%239ca3af" font-size="40">▶</text></svg>')

const typeConfig = {
  video: { icon: FiPlay, color: 'badge-info', label: 'Vidéo', bg: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20', iconColor: 'text-blue-400' },
  document: { icon: FiFileText, color: 'badge-success', label: 'Document', bg: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20', iconColor: 'text-green-400' },
  audio: { icon: FiMusic, color: 'badge-secondary', label: 'Audio', bg: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20', iconColor: 'text-purple-400' }
}

export function ContentCardSkeleton({ variant = 'default' }) {
  return (
    <div className={`card bg-base-100 shadow-md border border-base-200 overflow-hidden animate-pulse ${variant === 'horizontal' ? 'flex gap-3 p-3' : ''}`}>
      {variant === 'horizontal' ? (
        <>
          <div className="w-16 h-16 flex-shrink-0 rounded-lg skeleton" />
          <div className="flex-1 space-y-2">
            <div className="skeleton h-4 w-3/4" />
            <div className="skeleton h-3 w-1/2" />
            <div className="flex gap-2">
              <div className="skeleton h-4 w-16 rounded-full" />
              <div className="skeleton h-4 w-16 rounded-full" />
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="skeleton h-28 w-full" />
          <div className="p-4 space-y-3 pt-0">
            <div className="skeleton h-4 w-3/4 mx-auto" />
            <div className="skeleton h-3 w-1/2 mx-auto" />
            <div className="flex justify-center gap-2">
              <div className="skeleton h-5 w-16 rounded-full" />
              <div className="skeleton h-5 w-16 rounded-full" />
            </div>
            <div className="flex justify-between">
              <div className="skeleton h-4 w-12" />
              <div className="skeleton h-6 w-20 rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ContentCardHorizontal({ item }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [imageError, setImageError] = useState(false)

  const typeInfo = typeConfig[item.type] || typeConfig.video
  const hasThumb = !!item.thumbnail && !imageError

  return (
    <div className="flex gap-3 bg-base-100 rounded-lg shadow-sm hover:shadow-md transition-all p-3 border border-base-200">
      <Link to={`/content/${item.id}`} className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-base-200 block">
        {item.type === 'video' && item.youtube_id && !imageError ? (
          <img src={`https://img.youtube.com/vi/${item.youtube_id}/default.jpg`} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={() => setImageError(true)} />
        ) : hasThumb ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={() => setImageError(true)} />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <typeInfo.icon size={20} className={typeInfo.iconColor} />
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/content/${item.id}`} className="font-medium text-sm line-clamp-1 hover:text-primary transition-colors">
          {item.title}
        </Link>
        <div className="flex flex-wrap gap-1 mt-1">
          <span className={`badge badge-xs ${typeInfo.color}`}>{typeInfo.label}</span>
          <span className={`badge badge-xs ${item.status === 'free' ? 'badge-success' : 'badge-warning'}`}>
            {item.status === 'free' ? 'Gratuit' : `${item.price}€`}
          </span>
          {item.category_name && <span className="badge badge-ghost badge-xs">{item.category_name}</span>}
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs opacity-50">
          <span className="flex items-center gap-0.5"><FiDownload size={10} /> {item.downloads_count || 0}</span>
          <span className="flex items-center gap-0.5"><FiEye size={10} /> {item.views_count || 0}</span>
          <span className="flex items-center gap-0.5"><FiClock size={10} /> {new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
        </div>
      </div>

      <div className="flex gap-1 flex-shrink-0 items-center">
        <Link to={`/content/${item.id}`} className="btn btn-xs btn-primary btn-square" title="Voir">
          <FiEye size={12} />
        </Link>
        {item.status === 'free' && item.file_url && (
          <a href={toAbsUrl(item.file_url)} download className="btn btn-xs btn-success btn-square" title="Télécharger">
            <FiDownload size={12} />
          </a>
        )}
      </div>
    </div>
  )
}

export default function ContentCard({ item, variant = 'default' }) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [imageError, setImageError] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  if (variant === 'horizontal') return <ContentCardHorizontal item={item} />
  if (variant === 'mobile') return <ContentCardMobile item={item} />

  const typeInfo = typeConfig[item.type] || typeConfig.video
  const hasThumb = !!item.thumbnail && !imageError
  const isPopular = item.downloads_count > 50 || item.views_count > 200
  const isNew = new Date(item.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const fileUrl = item.file_url ? toAbsUrl(item.file_url) : null

  const handleView = (e) => {
    e.preventDefault()
    navigate(`/content/${item.id}`)
  }

  const handleDownload = (e) => {
    if (!user && item.status === 'paid') {
      e.preventDefault()
      toast.error('Connectez-vous pour télécharger')
      navigate('/login')
      return
    }
    if (item.status === 'paid' && !item.hasAccess) {
      e.preventDefault()
      navigate(`/content/${item.id}`)
      return
    }
  }

  return (
    <div
      onClick={handleView}
      className="card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 border border-base-200 hover:-translate-y-1 overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleView(e) }}
    >
      {/* Thumbnail */}
      <figure className="h-36 bg-base-200 overflow-hidden relative">
        {item.type === 'video' && item.youtube_id ? (
          <>
            <img
              src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none' }}
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                <FiPlay size={20} className="text-primary ml-0.5" />
              </div>
            </div>
          </>
        ) : hasThumb ? (
          <>
            <img
              src={item.thumbnail}
              alt={item.title}
              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => { e.target.onerror = null; setImageError(true) }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </>
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${typeInfo.bg}`}>
            <typeInfo.icon size={36} className={`${typeInfo.iconColor} opacity-60`} />
          </div>
        )}

        {/* Top-left badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`badge badge-xs ${typeInfo.color} shadow-md`}>{typeInfo.label}</span>
          {item.status === 'paid' && (
            <span className="badge badge-xs badge-warning gap-0.5 shadow-md"><FiLock size={8} /> {item.price}€</span>
          )}
          {item.status === 'free' && item.file_url && (
            <span className="badge badge-xs badge-success gap-0.5 shadow-md"><FiDownload size={8} /> Gratuit</span>
          )}
        </div>

        {/* Top-right badges */}
        <div className="absolute top-2 right-2 flex gap-1">
          {isPopular && (
            <span className="badge badge-xs badge-error gap-0.5 shadow-md"><FiTrendingUp size={8} /> Populaire</span>
          )}
        </div>

        {/* Bottom-right */}
        {isNew && (
          <div className="absolute bottom-2 right-2">
            <span className="badge badge-xs badge-info shadow-md">Nouveau</span>
          </div>
        )}
      </figure>

      {/* Body */}
      <div className="p-3 space-y-2">
        {item.category_name && (
          <span className="text-[10px] uppercase tracking-wider text-primary font-semibold">{item.category_name}</span>
        )}
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {item.title}
        </h3>

        {item.description && (
          <p className="text-xs text-base-content/60 line-clamp-2">{item.description}</p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-3 text-[11px] text-base-content/50 pt-1">
          <span className="flex items-center gap-1"><FiEye size={11} /> {item.views_count || 0}</span>
          <span className="flex items-center gap-1"><FiDownload size={11} /> {item.downloads_count || 0}</span>
          <span className="flex items-center gap-1"><FiClock size={11} /> {new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
        </div>

        {/* Quick actions */}
        <div className="flex gap-1.5 pt-2 border-t border-base-200">
          <button onClick={handleView} className="btn btn-primary btn-xs flex-1 gap-1"><FiEye size={11} /> Voir</button>
          {fileUrl && item.status === 'free' ? (
            <a href={fileUrl} download onClick={handleDownload} className="btn btn-success btn-xs flex-1 gap-1"><FiDownload size={11} /> Télécharger</a>
          ) : fileUrl && item.status === 'paid' ? (
            <Link to={`/content/${item.id}`} className="btn btn-warning btn-xs flex-1 gap-1"><FiLock size={11} /> Acheter</Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// Version mobile compacte
function ContentCardMobile({ item }) {
  const typeInfo = typeConfig[item.type] || typeConfig.video
  const [imageError, setImageError] = useState(false)
  const hasThumb = !!item.thumbnail && !imageError

  return (
    <Link to={`/content/${item.id}`} className="flex items-center gap-2 p-2 bg-base-100 rounded-lg hover:bg-base-200 transition-colors">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${typeInfo.bg}`}>
        <typeInfo.icon size={14} className={typeInfo.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-medium truncate">{item.title}</h4>
        <div className="flex gap-1 mt-0.5">
          <span className={`badge badge-xs ${typeInfo.color}`}>{typeInfo.label}</span>
          <span className={`badge badge-xs ${item.status === 'free' ? 'badge-success' : 'badge-warning'}`}>
            {item.status === 'free' ? 'Gratuit' : `${item.price}€`}
          </span>
        </div>
      </div>
      <FiEye size={14} className="text-base-content/40" />
    </Link>
  )
}
