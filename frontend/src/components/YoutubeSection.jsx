import { useState, useEffect, useRef } from 'react'
import { FiYoutube, FiEye, FiClock, FiCalendar, FiArrowRight, FiRadio, FiExternalLink, FiUser } from 'react-icons/fi'
import { youtubeAPI } from '../services/api'

export default function YoutubeSection() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [showPlayer, setShowPlayer] = useState(false)
  const playerRef = useRef(null)

  useEffect(() => {
    youtubeAPI.getLatest(4)
      .then(res => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (showPlayer) {
      setTimeout(() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100)
    }
  }, [showPlayer])

  if (loading) {
    return (
      <div className="relative group animate-pulse">
        <div className="bg-base-800/80 backdrop-blur-xl rounded-2xl border border-base-200/20 shadow-2xl p-4 w-[520px]">
          <div className="flex items-center gap-2 mb-4 px-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            <span className="text-base-content/30 text-xs ml-2 font-mono">YouTube — Loading...</span>
          </div>
          <div className="rounded-xl overflow-hidden bg-base-900 skeleton h-64" />
          <div className="mt-3 flex items-center gap-3">
            <div className="skeleton h-8 w-8 rounded-full" />
            <div className="skeleton h-4 w-40" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !data?.videos?.length) {
    return (
      <div className="relative group">
        <div className="bg-base-800/80 backdrop-blur-xl rounded-2xl border border-base-200/20 shadow-2xl p-8 w-[520px] text-center">
          <FiYoutube size={48} className="text-red-500/40 mx-auto mb-3" />
          <p className="text-base-content/50 text-sm">YouTube non disponible</p>
        </div>
      </div>
    )
  }

  const { videos, channel, isLive } = data
  const latest = videos[0]
  const embedUrl = `https://www.youtube.com/embed/${latest.id}?autoplay=1&rel=0`

  const formatDate = (d) => {
    const date = new Date(d)
    const now = new Date()
    const diff = now - date
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    if (days === 0) return "Aujourd'hui"
    if (days === 1) return 'Hier'
    if (days < 7) return `Il y a ${days} jours`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  const formatViews = (n) => {
    if (!n) return '0'
    if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
    if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
    return n.toString()
  }

  return (
    <div className="relative group">
      {/* Glow effect */}
      <div className={`absolute inset-0 rounded-2xl blur-3xl transition-all duration-700 ${isLive ? 'bg-red-500/20' : 'bg-primary/20'}`} />

      <div className="relative bg-base-800/80 backdrop-blur-xl rounded-2xl border border-base-200/20 shadow-2xl p-4 hover:border-base-200/40 transition-all duration-500">
        {/* Traffic lights */}
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="text-base-content/30 text-xs ml-2 font-mono">Code avec Kodjo — YouTube</span>

          {/* Live badge */}
          {isLive && (
            <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              EN DIRECT
            </span>
          )}
        </div>

        {/* Video player / Thumbnail */}
        {showPlayer ? (
          <div ref={playerRef} className="rounded-xl overflow-hidden bg-black aspect-video">
            <iframe
              src={embedUrl}
              title={latest.title}
              className="w-full h-full"
              allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden bg-base-900 relative group/card cursor-pointer" onClick={() => setShowPlayer(true)}>
            <img
              src={latest.thumbnail}
              alt={latest.title}
              className="w-full h-64 object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl group-hover/card:scale-110 transition-all duration-300 group-hover/card:shadow-red-600/50">
                <FiYoutube size={28} className="text-white ml-0.5" />
              </div>
            </div>
            {/* Duration overlay */}
            <div className="absolute bottom-3 right-3 bg-black/70 text-white text-xs px-2 py-0.5 rounded font-medium">
              Regarder
            </div>
          </div>
        )}

        {/* Video info */}
        <div className="flex items-start gap-3 mt-4">
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            {channel.avatar ? (
              <img
                src={channel.avatar}
                alt={channel.name}
                className="w-10 h-10 rounded-full object-cover hover:scale-110 transition-transform"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm">
                {channel.name?.charAt(0) || 'C'}
              </div>
            )}
          </a>
          <div className="flex-1 min-w-0">
            <a
              href={latest.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold line-clamp-1 hover:text-red-500 transition-colors block"
            >
              {latest.title}
            </a>
            <div className="flex items-center gap-3 text-xs mt-1 text-base-content/40">
              <span className="flex items-center gap-1"><FiUser size={10} /> {channel.name}</span>
              <span className="flex items-center gap-1"><FiEye size={10} /> {formatViews(latest.views)}</span>
              <span className="flex items-center gap-1"><FiCalendar size={10} /> {formatDate(latest.published)}</span>
            </div>
          </div>
          <a
            href={channel.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-ghost gap-1 text-red-500 hover:bg-red-500/10 flex-shrink-0"
            title="Voir la chaîne"
          >
            <FiExternalLink size={14} /> Chaîne
          </a>
        </div>

        {/* More videos */}
        {videos.length > 1 && (
          <div className="mt-4 pt-3 border-t border-base-700/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-base-content/40 uppercase tracking-wider">Dernières vidéos</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {videos.slice(1).map((v) => (
                <a
                  key={v.id}
                  href={v.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/vid block"
                >
                  <div className="rounded-lg overflow-hidden bg-base-900 aspect-video mb-1.5">
                    <img src={v.thumbnail} alt={v.title} className="w-full h-full object-cover group-hover/vid:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                  <p className="text-[11px] line-clamp-2 text-base-content/60 group-hover/vid:text-base-content transition-colors">{v.title}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
