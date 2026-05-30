import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../services/api';
import { FiPlay, FiFileText, FiMusic, FiSearch, FiFilter, FiClock, FiEye } from 'react-icons/fi';

const THUMB_FALLBACK = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180" fill="%23e5e7eb"><rect width="320" height="180"/><text x="160" y="100" text-anchor="middle" fill="%239ca3af" font-size="40">▶</text></svg>');

export default function Catalog() {
  const [contents, setContents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchContents = () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (type) params.type = type;
    if (status) params.status = status;
    if (search) params.search = search;

    contentAPI.getAll(params).then((res) => {
      setContents(res.data.contents);
      setTotalPages(res.data.totalPages);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchContents(); }, [page, type, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchContents();
  };

  const typeIcons = { video: FiPlay, document: FiFileText, audio: FiMusic };
  const typeColors = { video: 'badge-info', document: 'badge-success', audio: 'badge-secondary' };
  const typeLabels = { video: 'Vidéo', document: 'Document', audio: 'Audio' };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Catalogue</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="join flex-1">
          <input type="text" placeholder="Rechercher..." className="input input-bordered join-item w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn btn-primary join-item"><FiSearch /></button>
        </form>

        <div className="flex gap-2">
          <select className="select select-bordered" value={type} onChange={(e) => { setType(e.target.value); setPage(1); }}>
            <option value="">Tous types</option>
            <option value="video">Vidéos</option>
            <option value="document">Documents</option>
            <option value="audio">Audios</option>
          </select>
          <select className="select select-bordered" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">Tous</option>
            <option value="free">Gratuits</option>
            <option value="paid">Payants</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : contents.length === 0 ? (
        <div className="text-center py-20">
          <FiFilter className="text-5xl mx-auto mb-4 opacity-30" />
          <p className="text-lg opacity-60">Aucun contenu trouvé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contents.map((item) => {
            const Icon = typeIcons[item.type] || FiPlay;
            return (
              <Link key={item.id} to={`/content/${item.id}`} className="flex items-start gap-4 p-4 bg-base-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex-shrink-0 w-48 h-28 rounded-lg overflow-hidden bg-base-200">
                  {item.type === 'video' && item.youtube_id ? (
                    <img src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`} alt={item.title} className="w-full h-full object-cover" loading="lazy" onError={(e) => { e.target.onerror = null; e.target.src = THUMB_FALLBACK; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="text-3xl opacity-30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge badge-sm ${typeColors[item.type] || 'badge-ghost'}`}>{typeLabels[item.type] || item.type}</span>
                    <span className={`badge badge-sm ${item.status === 'free' ? 'badge-success' : 'badge-warning'}`}>
                      {item.status === 'free' ? 'Gratuit' : `${item.price}€`}
                    </span>
                    {item.category_name && <span className="badge badge-ghost badge-sm hidden sm:inline-flex">{item.category_name}</span>}
                  </div>

                  <h3 className="text-base font-semibold truncate">{item.title}</h3>

                  {item.description && <p className="text-sm opacity-60 line-clamp-2 mt-1">{item.description}</p>}

                  <div className="flex items-center gap-4 mt-2 text-xs opacity-50">
                    <span className="flex items-center gap-1"><FiClock /> {new Date(item.created_at).toLocaleDateString('fr-FR')}</span>
                    <span className="flex items-center gap-1"><FiEye /> {item.views_count || 0} vues</span>
                  </div>
                </div>

                <div className="flex-shrink-0 hidden sm:flex items-center">
                  <span className="btn btn-ghost btn-sm btn-circle"><FiPlay className="text-lg text-primary" /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-10 join">
          <button className="join-item btn btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>«</button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button key={i + 1} className={`join-item btn btn-sm ${page === i + 1 ? 'btn-primary' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
          ))}
          <button className="join-item btn btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>»</button>
        </div>
      )}
    </div>
  );
}
