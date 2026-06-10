import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentAPI, purchaseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPlay, FiFileText, FiMusic, FiLock, FiUnlock, FiDownload, FiArrowLeft, FiEye, FiAlertTriangle, FiYoutube, FiBookOpen, FiClock, FiShare2, FiChevronRight, FiUsers, FiStar } from 'react-icons/fi';
import ContentCard from '../components/ContentCard';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const toAbsUrl = (url) => url?.startsWith('http') ? url : url;
const viewUrl = (url, name) => {
  if (!url) return null;
  if (url.startsWith('http')) {
    let proxyUrl = `${API_URL}/contents/proxy/file?url=${encodeURIComponent(url)}`;
    if (name) proxyUrl += `&name=${encodeURIComponent(name)}`;
    return proxyUrl;
  }
  return url;
};
const downloadUrl = (url) => toAbsUrl(url);

const typeConfig = {
  video: { icon: FiPlay, label: 'Vidéo', color: 'badge-info', emoji: '🎬', gradient: 'from-blue-600 to-blue-800' },
  document: { icon: FiFileText, label: 'Document', color: 'badge-success', emoji: '📄', gradient: 'from-emerald-600 to-teal-700' },
  audio: { icon: FiMusic, label: 'Audio', color: 'badge-secondary', emoji: '🎵', gradient: 'from-purple-600 to-indigo-700' }
};

export default function ContentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [related, setRelated] = useState([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const [showReader, setShowReader] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const playerRef = useRef(null);
  const shareRef = useRef(null);

  useEffect(() => {
    Promise.all([
      contentAPI.getById(id),
      user ? purchaseAPI.checkAccess(id).catch(() => ({ data: { hasAccess: false } })) : Promise.resolve({ data: { hasAccess: false } })
    ]).then(([contentRes, accessRes]) => {
      setContent(contentRes.data);
      setHasAccess(accessRes.data.hasAccess);
      if (contentRes.data?.category_id) {
        contentAPI.getAll({ category: contentRes.data.category_id, limit: 5 }).then((res) => {
          setRelated((res.data.contents || []).filter(c => c.id !== contentRes.data.id).slice(0, 4));
        }).catch(() => {});
      }
    }).catch(() => toast.error('Contenu introuvable.'))
    .finally(() => setLoading(false));
  }, [id, user]);

  const handlePurchase = async () => {
    if (!user) { toast.error('Connectez-vous pour acheter.'); return; }
    try {
      await purchaseAPI.purchase(content.id);
      toast.success('Achat réussi !');
      setHasAccess(true);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'achat');
    }
  };

  const scrollToPlayer = () => {
    setTimeout(() => playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleRead = (e) => {
    if (!canAccess) { handlePurchase(); return; }
    setShowReader(true);
    scrollToPlayer();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Lien copié !');
    setShowShare(false);
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!content) return <div className="text-center py-20">Contenu introuvable.</div>;

  const Icon = typeConfig[content.type]?.icon || FiPlay;
  const canAccess = hasAccess || content.status === 'free';
  const fileUrl = content.file_url ? viewUrl(content.file_url, content.title) : null;
  const typeConf = typeConfig[content.type] || typeConfig.video;
  const hasThumb = !!content.thumbnail;

  const shareUrl = encodeURIComponent(window.location.href);
  const shareTitle = encodeURIComponent(content.title);

  return (
    <div>

      {/* ═══ BREADCRUMB ═══ */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-xs md:text-sm text-base-content/50 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
          <FiChevronRight size={12} />
          <Link to="/catalog" className="hover:text-primary transition-colors">Catalogue</Link>
          <FiChevronRight size={12} />
          <span className="text-base-content/70 truncate max-w-[200px]">{content.title}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

          {/* ═══ MAIN CONTENT ═══ */}
          <div className="lg:col-span-2 space-y-6" ref={playerRef}>

            {/* Document header — cover + metadata side by side */}
            {(content.type === 'document' || hasThumb) && (
              <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-[220px] lg:w-[260px] flex-shrink-0 bg-base-200">
                    {hasThumb ? (
                      <img src={content.thumbnail} alt={content.title} className="w-full h-48 md:h-72 object-cover" />
                    ) : (
                      <div className={`w-full h-48 md:h-72 flex items-center justify-center bg-gradient-to-br ${typeConf.gradient}`}>
                        <Icon size={56} className="text-white/40" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 p-5 md:p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`badge badge-sm ${typeConf.color}`}>{typeConf.label}</span>
                        <span className={`badge badge-sm ${content.status === 'free' ? 'badge-success' : 'badge-warning'}`}>
                          {content.status === 'free' ? 'Gratuit' : `${content.price}€`}
                        </span>
                        {content.category_name && <span className="badge badge-sm badge-ghost">{content.category_name}</span>}
                      </div>
                      <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2 leading-tight">{content.title}</h1>
                      {content.description && <p className="text-sm md:text-base text-base-content/70 leading-relaxed line-clamp-3">{content.description}</p>}
                    </div>
                    <div className="flex items-center gap-4 mt-4 text-xs text-base-content/40">
                      <span className="flex items-center gap-1"><FiEye size={13} /> {content.views_count || 0} vues</span>
                      <span className="flex items-center gap-1"><FiDownload size={13} /> {content.downloads_count || 0} téléchargements</span>
                      <span className="flex items-center gap-1"><FiClock size={13} /> {new Date(content.created_at).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
                {/* Actions bar */}
                <div className="flex gap-2 px-5 pb-5 md:px-6 md:pb-6">
                  {content.type === 'document' && fileUrl && (
                    canAccess ? (
                      <>
                        <button onClick={handleRead} className="btn btn-primary gap-2 flex-1"><FiBookOpen size={16} /> Consulter</button>
                        <a href={downloadUrl(content.file_url)} target="_blank" rel="noopener noreferrer" className="btn btn-success gap-2 flex-1"><FiDownload size={16} /> Télécharger</a>
                      </>
                    ) : (
                      <>
                        <button onClick={handlePurchase} className="btn btn-warning gap-2 flex-1"><FiLock size={16} /> Acheter {content.price}€</button>
                        <button onClick={scrollToPlayer} className="btn btn-ghost gap-2"><FiBookOpen size={16} /> Aperçu</button>
                      </>
                    )
                  )}
                  <div className="relative">
                    <button onClick={() => setShowShare(!showShare)} className="btn btn-ghost btn-square">
                      <FiShare2 size={16} />
                    </button>
                    {showShare && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowShare(false)} />
                        <div ref={shareRef} className="absolute right-0 bottom-full mb-2 z-40 bg-base-100 rounded-xl shadow-2xl border border-base-200 p-3 w-56">
                          <p className="text-[10px] font-semibold text-base-content/40 uppercase tracking-wider mb-2">Partager</p>
                          <div className="grid grid-cols-4 gap-2">
                            <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener" className="btn btn-xs btn-ghost btn-square text-blue-600 hover:bg-blue-50">f</a>
                            <a href={`https://wa.me/?text=${shareTitle}%20-%20${shareUrl}`} target="_blank" rel="noopener" className="btn btn-xs btn-ghost btn-square text-green-600 hover:bg-green-50">W</a>
                            <a href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`} target="_blank" rel="noopener" className="btn btn-xs btn-ghost btn-square text-sky-600 hover:bg-sky-50">T</a>
                            <button onClick={copyLink} className="btn btn-xs btn-ghost btn-square text-base-content/60 hover:bg-base-200">
                              <FiShare2 size={12} />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Video player */}
            {content.type === 'video' && content.youtube_id && (
              canAccess ? (
                <div>
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-lg bg-black">
                    <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${content.youtube_id}?rel=0&modestbranding=1&playsinline=1`} title={content.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen onError={() => setEmbedError(true)}></iframe>
                  </div>
                  {embedError && (
                    <div className="alert alert-warning mt-4">
                      <FiAlertTriangle />
                      <span>Impossible de lire cette vidéo. <a href={`https://www.youtube.com/watch?v=${content.youtube_id}`} target="_blank" rel="noopener noreferrer" className="link link-primary">Voir sur YouTube</a></span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-video rounded-2xl overflow-hidden shadow-lg bg-base-300 relative flex items-center justify-center">
                  <div className="absolute inset-0 backdrop-blur-sm bg-base-300/70 flex flex-col items-center justify-center gap-4 p-8 text-center z-10">
                    <FiLock className="text-5xl text-warning" />
                    <h3 className="text-xl font-bold">Contenu Premium</h3>
                    <p className="opacity-70">Achetez pour accéder à cette vidéo</p>
                    <button onClick={handlePurchase} className="btn btn-warning gap-2"><FiLock /> Acheter {content.price}€</button>
                  </div>
                  <img src={`https://img.youtube.com/vi/${content.youtube_id}/maxresdefault.jpg`} alt="" className="w-full h-full object-cover opacity-30" onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
              )
            )}

            {/* Document PDF reader */}
            {content.type === 'document' && fileUrl && (
              <>
                {showReader ? (
                  <div className="rounded-2xl overflow-hidden shadow-lg bg-base-200" style={{ height: '85vh' }}>
                    <div className="flex items-center justify-between px-4 py-2.5 bg-base-300">
                      <span className="font-medium text-sm truncate flex items-center gap-2">
                        <FiFileText size={14} className="text-primary" /> {content.title}
                      </span>
                      <button onClick={() => setShowReader(false)} className="btn btn-ghost btn-xs">Fermer</button>
                    </div>
                    <embed src={fileUrl} type="application/pdf" className="w-full h-[calc(85vh-44px)]" />
                  </div>
                ) : !(content.type === 'document' && (hasThumb || content.type === 'document')) ? (
                  <div className="rounded-2xl overflow-hidden shadow-lg relative" style={{ height: '70vh' }}>
                    <embed src={fileUrl} type="application/pdf" className="w-full h-full pointer-events-none" style={{ opacity: 0.4 }} />
                    <div className="absolute inset-0 flex items-center justify-center z-10">
                      <div className="text-center max-w-sm">
                        {canAccess ? (
                          <button onClick={handleRead} className="btn btn-primary btn-lg gap-3 shadow-xl">
                            <FiBookOpen className="text-xl" /> Lire le document
                          </button>
                        ) : (
                          <div className="flex flex-col items-center gap-4">
                            <div className="bg-base-100/90 backdrop-blur rounded-2xl p-8 shadow-xl">
                              <FiLock className="text-5xl text-warning mx-auto mb-3" />
                              <h3 className="text-xl font-bold mb-1">Document Premium</h3>
                              <p className="opacity-70 mb-4">Achetez pour lire et télécharger</p>
                              <button onClick={handlePurchase} className="btn btn-warning gap-2"><FiLock /> Acheter {content.price}€</button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {/* Audio player */}
            {content.type === 'audio' && (
              canAccess ? (
                <div className="rounded-2xl bg-gradient-to-br from-base-200 to-base-300 p-8 shadow-lg border border-base-200">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
                      <FiMusic size={24} className="text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">{content.title}</p>
                      <p className="text-xs text-base-content/50">Streaming audio</p>
                    </div>
                  </div>
                  <audio controls className="w-full" src={fileUrl || undefined}>
                    Votre navigateur ne supporte pas le lecteur audio.
                  </audio>
                </div>
              ) : (
                <div className="h-64 rounded-2xl bg-base-300 relative flex items-center justify-center shadow-lg">
                  <div className="absolute inset-0 backdrop-blur-sm bg-base-300/70 flex flex-col items-center justify-center gap-4 p-8 text-center z-10">
                    <FiLock className="text-5xl text-warning" />
                    <h3 className="text-xl font-bold">Contenu Premium</h3>
                    <p className="opacity-70">Achetez pour écouter</p>
                    <button onClick={handlePurchase} className="btn btn-warning gap-2"><FiLock /> Acheter {content.price}€</button>
                  </div>
                  <FiMusic className="text-8xl opacity-20" />
                </div>
              )
            )}

            {/* Title + meta when NOT in document header */}
            {content.type !== 'document' && !hasThumb && (
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">{content.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className={`badge ${typeConf.color}`}>{typeConf.label}</span>
                  <span className={`badge ${content.status === 'free' ? 'badge-success' : 'badge-warning'}`}>
                    {content.status === 'free' ? 'Gratuit' : `${content.price}€`}
                  </span>
                  {content.category_name && <span className="badge badge-ghost">{content.category_name}</span>}
                </div>
                {content.description && <p className="text-base text-base-content/70 leading-relaxed mb-4">{content.description}</p>}
                <div className="flex items-center gap-4 text-sm text-base-content/40 mb-2">
                  <span className="flex items-center gap-1"><FiEye size={14} /> {content.views_count || 0} vues</span>
                  <span className="flex items-center gap-1"><FiDownload size={14} /> {content.downloads_count || 0} téléchargements</span>
                  <span className="flex items-center gap-1"><FiClock size={14} /> {new Date(content.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            )}

            {/* Stats row for documents */}
            {content.type === 'document' && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: FiEye, label: 'Vues', value: content.views_count || 0 },
                  { icon: FiDownload, label: 'Téléchargements', value: content.downloads_count || 0 },
                  { icon: FiClock, label: 'Publié le', value: new Date(content.created_at).toLocaleDateString('fr-FR') }
                ].map((s, i) => (
                  <div key={i} className="bg-base-100 rounded-xl p-4 border border-base-200 text-center shadow-sm">
                    <s.icon size={18} className="mx-auto mb-1 text-primary/60" />
                    <div className="font-bold text-lg">{s.value}</div>
                    <div className="text-[10px] text-base-content/40 uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Description (for documents that had the cover header) */}
            {content.type === 'document' && content.description && (
              <div className="bg-base-100 rounded-2xl p-6 border border-base-200 shadow-sm">
                <h3 className="font-bold text-lg mb-3">Description</h3>
                <p className="text-base text-base-content/70 leading-relaxed">{content.description}</p>
              </div>
            )}

            {/* Related */}
            {related.length > 0 && (
              <div className="pt-4">
                <div className="flex items-center gap-2 mb-5">
                  <FiBookOpen size={18} className="text-primary" />
                  <h2 className="text-xl font-bold">Contenus similaires</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {related.map((item) => <ContentCard key={item.id} item={item} />)}
                </div>
              </div>
            )}
          </div>

          {/* ═══ SIDEBAR ═══ */}
          <div className="lg:col-span-1 space-y-4">
            {/* Price/actions card */}
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-200 sticky top-24 overflow-hidden">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-primary" />
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeConf.gradient} flex items-center justify-center shadow-md`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold">{typeConf.label}</p>
                    <p className="text-xs text-base-content/50">
                      {content.type === 'video' ? 'Streaming YouTube' : content.type === 'document' ? 'PDF intégré' : 'Streaming audio'}
                    </p>
                  </div>
                </div>

                <div className={`text-2xl font-bold ${content.status === 'free' ? 'text-success' : 'text-warning'}`}>
                  {content.status === 'free' ? (
                    <span className="flex items-center gap-2"><FiUnlock size={20} /> Gratuit</span>
                  ) : (
                    <span className="flex items-center gap-2"><FiLock size={20} /> {content.price}€</span>
                  )}
                </div>

                {canAccess ? (
                  <div className="space-y-2">
                    {content.type === 'video' && content.youtube_id && (
                      <>
                        <button onClick={scrollToPlayer} className="btn btn-primary w-full gap-2"><FiPlay size={16} /> Lire la vidéo</button>
                        <a href={`https://www.youtube.com/watch?v=${content.youtube_id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full gap-2"><FiYoutube size={16} /> Voir sur YouTube</a>
                      </>
                    )}
                    {content.type === 'document' && fileUrl && (
                      <>
                        <button onClick={handleRead} className="btn btn-primary w-full gap-2"><FiBookOpen size={16} /> Lire le document</button>
                        <a href={downloadUrl(content.file_url)} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full gap-2"><FiDownload size={16} /> Télécharger</a>
                      </>
                    )}
                    {content.type === 'audio' && (
                      <button onClick={scrollToPlayer} className="btn btn-primary w-full gap-2"><FiPlay size={16} /> Écouter</button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-base-content/60">Ce contenu est payant.</p>
                    <button onClick={handlePurchase} className="btn btn-warning w-full gap-2"><FiLock size={16} /> Acheter {content.price}€</button>
                    {content.type === 'document' && (
                      <button onClick={scrollToPlayer} className="btn btn-ghost btn-sm w-full gap-2"><FiBookOpen size={14} /> Voir l'aperçu</button>
                    )}
                    {content.type === 'video' && content.youtube_id && (
                      <a href={`https://www.youtube.com/watch?v=${content.youtube_id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm w-full gap-2"><FiYoutube size={14} /> Aperçu sur YouTube</a>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Info card */}
            <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-5 space-y-3">
              <h4 className="font-semibold text-sm">Informations</h4>
              <div className="space-y-2 text-sm">
                {content.category_name && (
                  <div className="flex justify-between">
                    <span className="text-base-content/50">Catégorie</span>
                    <span className="font-medium">{content.category_name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-base-content/50">Type</span>
                  <span className="font-medium">{typeConf.label}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/50">Statut</span>
                  <span className={`font-medium ${content.status === 'free' ? 'text-success' : 'text-warning'}`}>
                    {content.status === 'free' ? 'Gratuit' : 'Payant'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/50">Vues</span>
                  <span className="font-medium">{content.views_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/50">Téléchargements</span>
                  <span className="font-medium">{content.downloads_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/50">Ajouté le</span>
                  <span className="font-medium">{new Date(content.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
