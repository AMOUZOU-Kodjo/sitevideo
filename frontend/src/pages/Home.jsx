import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../services/api';
import { FiPlay, FiFileText, FiMusic, FiArrowRight } from 'react-icons/fi';

export default function Home() {
  const [contents, setContents] = useState([]);
  const [stats, setStats] = useState({ videos: 0, documents: 0, audios: 0 });

  useEffect(() => {
    contentAPI.getAll({ limit: 6 }).then((res) => {
      setContents(res.data.contents);
      const counts = { videos: 0, documents: 0, audios: 0 };
      res.data.contents.forEach((c) => { if (c.type === 'video') counts.videos++; else if (c.type === 'document') counts.documents++; else if (c.type === 'audio') counts.audios++; });
      setStats(counts);
    }).catch(() => {});
  }, []);

  const typeIcons = { video: FiPlay, document: FiFileText, audio: FiMusic };
  const typeColors = { video: 'text-blue-500 bg-blue-100', document: 'text-green-500 bg-green-100', audio: 'text-purple-500 bg-purple-100' };

  return (
    <div>
      <section className="hero min-h-[70vh] bg-gradient-to-br from-primary via-primary-focus to-secondary">
        <div className="hero-content text-center text-neutral-content">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">SiteVideo</h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">Vidéos, Documents, Audios. Gratuit ou Premium.</p>
            <Link to="/catalog" className="btn btn-lg btn-accent gap-2">
              Explorer le catalogue <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Derniers contenus</h2>
        {contents.length === 0 ? (
          <div className="text-center py-12">
            <p className="opacity-60">Aucun contenu pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contents.map((item) => {
              const Icon = typeIcons[item.type] || FiPlay;
              const colorClass = typeColors[item.type] || 'text-gray-500 bg-gray-100';
              return (
                <Link key={item.id} to={`/content/${item.id}`} className="card bg-base-100 shadow-md card-hover">
                  {item.type === 'video' && item.youtube_id ? (
                    <figure className="relative aspect-video">
                      <img src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <FiPlay className="text-white text-4xl" />
                      </div>
                    </figure>
                  ) : (
                    <figure className="h-40 flex items-center justify-center bg-base-200">
                      <Icon className={`text-6xl ${colorClass.split(' ')[0]}`} />
                    </figure>
                  )}
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`p-2 rounded-lg ${colorClass}`}><Icon className="text-sm" /></span>
                      <span className={`badge badge-sm ${item.status === 'free' ? 'badge-success' : 'badge-warning'}`}>
                        {item.status === 'free' ? 'Gratuit' : `${item.price}€`}
                      </span>
                    </div>
                    <h3 className="card-title text-base">{item.title}</h3>
                    {item.description && <p className="text-sm opacity-70 line-clamp-2">{item.description}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {contents.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/catalog" className="btn btn-outline btn-primary">Voir tout le catalogue</Link>
          </div>
        )}
      </section>
    </div>
  );
}
