import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contentAPI, purchaseAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPlay, FiFileText, FiMusic, FiLock, FiUnlock, FiDownload, FiArrowLeft, FiEye, FiAlertTriangle, FiYoutube } from 'react-icons/fi';

export default function ContentDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [content, setContent] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);
  const playerRef = useRef(null);

  useEffect(() => {
    Promise.all([
      contentAPI.getById(id),
      user ? purchaseAPI.checkAccess(id).catch(() => ({ data: { hasAccess: false } })) : Promise.resolve({ data: { hasAccess: false } })
    ]).then(([contentRes, accessRes]) => {
      setContent(contentRes.data);
      setHasAccess(accessRes.data.hasAccess);
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
    playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!content) return <div className="text-center py-20">Contenu introuvable.</div>;

  const typeIcons = { video: FiPlay, document: FiFileText, audio: FiMusic };
  const Icon = typeIcons[content.type] || FiPlay;
  const canAccess = hasAccess || content.status === 'free';

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
      <Link to="/catalog" className="btn btn-ghost btn-sm mb-4 gap-2"><FiArrowLeft /> Retour au catalogue</Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2" ref={playerRef}>
          {content.type === 'video' && content.youtube_id ? (
            canAccess ? (
              <>
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-black">
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${content.youtube_id}?rel=0&modestbranding=1&playsinline=1`} title={content.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen onError={() => setEmbedError(true)}></iframe>
                </div>
                {embedError && (
                  <div className="alert alert-warning mt-4">
                    <FiAlertTriangle />
                    <span>Impossible de lire cette vidéo. Elle est peut-être privée ou le partage est désactivé. <a href={`https://www.youtube.com/watch?v=${content.youtube_id}`} target="_blank" rel="noopener noreferrer" className="link link-primary">Voir sur YouTube</a></span>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-base-300 relative flex items-center justify-center">
                <div className="absolute inset-0 backdrop-blur-sm bg-base-300/70 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <FiLock className="text-5xl text-warning" />
                  <h3 className="text-xl font-bold">Contenu Premium</h3>
                  <p className="opacity-70">Achetez ce contenu pour y accéder</p>
                  <button onClick={handlePurchase} className="btn btn-warning gap-2">
                    <FiLock /> Acheter pour {content.price}€
                  </button>
                </div>
                <img src={`https://img.youtube.com/vi/${content.youtube_id}/maxresdefault.jpg`} alt="" className="w-full h-full object-cover opacity-30" onError={(e) => { e.target.style.display = 'none'; }} />
              </div>
            )
          ) : content.type === 'audio' ? (
            canAccess ? (
              <div className="rounded-xl bg-base-200 p-8">
                <audio controls className="w-full" src={content.file_url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${content.file_url}` : undefined}>
                  Votre navigateur ne supporte pas le lecteur audio.
                </audio>
              </div>
            ) : (
              <div className="h-64 rounded-xl bg-base-300 relative flex items-center justify-center">
                <div className="absolute inset-0 backdrop-blur-sm bg-base-300/70 flex flex-col items-center justify-center gap-4 p-8 text-center">
                  <FiLock className="text-5xl text-warning" />
                  <h3 className="text-xl font-bold">Contenu Premium</h3>
                  <p className="opacity-70">Achetez ce contenu pour écouter</p>
                  <button onClick={handlePurchase} className="btn btn-warning gap-2">
                    <FiLock /> Acheter pour {content.price}€
                  </button>
                </div>
                <FiMusic className="text-8xl opacity-20" />
              </div>
            )
          ) : (
            <div className="h-64 md:h-80 rounded-xl bg-base-200 flex items-center justify-center">
              <Icon className="text-8xl opacity-30" />
            </div>
          )}

          <h1 className="text-2xl md:text-3xl font-bold mt-6 mb-2">{content.title}</h1>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`badge ${content.type === 'video' ? 'badge-info' : content.type === 'document' ? 'badge-success' : 'badge-secondary'}`}>
              {content.type}
            </span>
            <span className={`badge ${content.status === 'free' ? 'badge-success' : 'badge-warning'}`}>
              {content.status === 'free' ? 'Gratuit' : `${content.price}€`}
            </span>
            {content.category_name && <span className="badge badge-ghost">{content.category_name}</span>}
            <span className="text-sm opacity-60 flex items-center gap-1"><FiEye /> {content.views_count || 0} vues</span>
          </div>

          {content.description && <p className="text-base opacity-80 leading-relaxed">{content.description}</p>}
        </div>

        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-lg sticky top-24">
            <div className="card-body">
              <div className="flex items-center gap-3 mb-4">
                <Icon className="text-3xl text-primary" />
                <div>
                  <p className="font-bold text-lg">{content.type === 'video' ? 'Vidéo' : content.type === 'document' ? 'Document' : 'Audio'}</p>
                  <p className="text-sm opacity-60">{content.type === 'video' ? 'Streaming YouTube' : content.type === 'document' ? 'Téléchargement PDF' : 'Streaming Audio'}</p>
                </div>
              </div>

              <div className="text-3xl font-bold mb-6">
                {content.status === 'free' ? (
                  <span className="text-success flex items-center gap-2"><FiUnlock /> Gratuit</span>
                ) : (
                  <span className="text-warning flex items-center gap-2"><FiLock /> {content.price}€</span>
                )}
              </div>

              {canAccess ? (
                <div className="space-y-3">
                  {content.type === 'video' && content.youtube_id && (
                    <>
                      <button onClick={scrollToPlayer} className="btn btn-primary w-full gap-2">
                        <FiPlay /> Lire la vidéo
                      </button>
                      <a href={`https://www.youtube.com/watch?v=${content.youtube_id}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline w-full gap-2">
                        <FiYoutube /> Voir sur YouTube
                      </a>
                    </>
                  )}
                  {content.type === 'audio' && (
                    <button onClick={scrollToPlayer} className="btn btn-primary w-full gap-2">
                      <FiPlay /> Écouter
                    </button>
                  )}
                  {content.type !== 'video' && content.file_url && (
                    <a href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${content.file_url}`} target="_blank" className="btn btn-primary w-full gap-2" download>
                      <FiDownload /> Télécharger
                    </a>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm opacity-70 mb-2">Ce contenu est payant. Achetez-le pour y accéder.</p>
                  <button onClick={handlePurchase} className="btn btn-warning w-full gap-2">
                    <FiLock /> Acheter pour {content.price}€
                  </button>
                  {content.type === 'video' && content.youtube_id && (
                    <a href={`https://www.youtube.com/watch?v=${content.youtube_id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm w-full gap-2">
                      <FiYoutube /> Aperçu sur YouTube
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
