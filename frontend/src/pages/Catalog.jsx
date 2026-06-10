import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { contentAPI } from '../services/api';
import { FiSearch, FiGrid, FiList, FiPlay, FiFileText, FiMusic, FiStar, FiBookOpen, FiEye, FiDownload } from 'react-icons/fi';
import ContentCard, { ContentCardSkeleton, ContentCardHorizontal } from '../components/ContentCard';

const categories = [
  { value: '', label: 'Toutes', icon: FiGrid },
  { value: 'video', label: 'Vidéos', icon: FiPlay },
  { value: 'document', label: 'Documents', icon: FiFileText },
  { value: 'audio', label: 'Audio', icon: FiMusic }
];

export default function Catalog() {
  const [contents, setContents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  const fetchContents = () => {
    setLoading(true);
    const params = { page, limit: 15 };
    if (type) params.type = type;
    if (status) params.status = status;
    if (search) params.search = search;

    contentAPI.getAll(params).then((res) => {
      setContents(res.data.contents || []);
      setTotalPages(res.data.totalPages || 1);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchContents(); }, [page, type, status]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchContents();
  };

  const featured = useMemo(() =>
    contents.filter(c => c.views_count > 20 || c.downloads_count > 10).slice(0, 3),
    [contents]
  );

  const totalDownloads = useMemo(() =>
    contents.reduce((s, c) => s + (c.downloads_count || 0), 0),
    [contents]
  );

  const totalViews = useMemo(() =>
    contents.reduce((s, c) => s + (c.views_count || 0), 0),
    [contents]
  );

  const activeCat = categories.find(c => c.value === type) || categories[0];

  return (
    <div>
      {/* ═══ HERO ═══ */}
      <section className="relative bg-gradient-to-br from-primary via-primary-focus to-secondary py-14 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(255,255,255,0.1)_0%,_transparent_60%)]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 text-center md:text-left">
          <div className="max-w-3xl mx-auto md:mx-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-white/80 text-xs mb-6 border border-white/10">
              <FiBookOpen size={13} /> Catalogue
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Explorez notre{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
                catalogue
              </span>
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto md:mx-0">
              Vidéos, documents et contenus audio en streaming ou téléchargement.
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative max-w-xl mx-auto md:mx-0 mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <FiSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="text" placeholder="Rechercher un titre..."
                  className="input input-bordered w-full pl-11 pr-4 h-12 bg-white/95 shadow-lg focus:border-amber-400 transition-all text-base-content"
                  value={search} onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-warning h-12 px-6 shadow-lg gap-2 border-0 font-semibold">
                <FiSearch size={16} /> Rechercher
              </button>
            </div>
          </form>

          {/* Stats */}
          <div className="flex flex-wrap justify-center md:justify-start gap-6 md:gap-10 text-white">
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-bold">{contents.length || '—'}</div>
              <div className="text-white/70 text-sm">Contenus</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-bold">{totalViews}</div>
              <div className="text-white/70 text-sm">Vues</div>
            </div>
            <div className="text-center md:text-left">
              <div className="text-2xl md:text-3xl font-bold">{totalDownloads}</div>
              <div className="text-white/70 text-sm">Téléchargements</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FILTERS ═══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-5 mb-8 relative z-20">
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200">
          <div className="p-4 md:p-5">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {categories.map((cat) => {
                const active = type === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => { setType(cat.value); setPage(1); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      active
                        ? 'bg-primary text-primary-content shadow-md'
                        : 'bg-base-200/70 text-base-content/60 hover:bg-base-200 hover:text-base-content border border-base-200'
                    }`}
                  >
                    <cat.icon size={15} className="inline mr-1.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Bottom row */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-base-200">
              <div className="flex items-center gap-1 flex-wrap">
                <span className="text-xs text-base-content/40 mr-1">Statut :</span>
                {['', 'free', 'paid'].map((s) => {
                  const active = status === s;
                  const label = s === '' ? 'Tous' : s === 'free' ? 'Gratuit' : 'Premium';
                  return (
                    <button key={s} onClick={() => { setStatus(s); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        active ? 'bg-primary/10 text-primary' : 'text-base-content/50 hover:bg-base-200'
                      }`}
                    >{label}</button>
                  );
                })}
              </div>
              <div className="join">
                <button className={`join-item btn btn-xs ${viewMode === 'grid' ? 'btn-primary' : ''}`} onClick={() => setViewMode('grid')}><FiGrid size={14} /></button>
                <button className={`join-item btn btn-xs ${viewMode === 'list' ? 'btn-primary' : ''}`} onClick={() => setViewMode('list')}><FiList size={14} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pb-16">

        {/* Loading */}
        {loading && (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => <ContentCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => <ContentCardSkeleton key={i} variant="horizontal" />)}
            </div>
          )
        )}

        {/* Empty */}
        {!loading && contents.length === 0 && (
          <div className="text-center py-20 bg-base-200/40 rounded-2xl border border-base-200">
            <activeCat.icon size={48} className="mx-auto mb-4 text-base-content/20" />
            <p className="text-lg font-medium text-base-content/60">Aucun contenu trouvé</p>
            <p className="text-sm text-base-content/40 mt-1">Essayez de modifier vos filtres ou votre recherche.</p>
            <button onClick={() => { setType(''); setStatus(''); setSearch(''); setPage(1); }} className="btn btn-primary btn-sm mt-4 gap-2">
              Réinitialiser les filtres
            </button>
          </div>
        )}

        {/* Featured (grid view only, not when filtering) */}
        {!loading && featured.length > 0 && !type && !status && page === 1 && viewMode === 'grid' && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <FiStar className="text-amber-500 fill-amber-500" size={18} />
              <h2 className="text-xl font-bold">À la une</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featured.map((item) => (
                <Link
                  key={item.id}
                  to={`/content/${item.id}`}
                  className="group flex gap-3 md:flex-col bg-base-100 rounded-xl shadow-md hover:shadow-xl transition-all border border-base-200 hover:border-primary/40 overflow-hidden"
                >
                  <div className="relative w-24 h-24 md:w-full md:h-44 flex-shrink-0 overflow-hidden bg-base-200">
                    {item.type === 'video' && item.youtube_id ? (
                      <img src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : item.thumbnail ? (
                      <img src={item.thumbnail} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl opacity-30">
                        {item.type === 'document' ? <FiFileText /> : item.type === 'audio' ? <FiMusic /> : <FiPlay />}
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 bg-amber-400 text-amber-900 rounded-full text-[10px] font-bold flex items-center gap-1 shadow">
                        <FiStar size={10} className="fill-amber-900" /> À la une
                      </span>
                    </div>
                    <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-sm ${
                      item.type === 'video' ? 'bg-blue-500 text-white' : item.type === 'document' ? 'bg-emerald-500 text-white' : 'bg-purple-500 text-white'
                    }`}>
                      {item.type === 'video' ? 'Vidéo' : item.type === 'document' ? 'Document' : 'Audio'}
                    </span>
                  </div>
                  <div className="flex-1 py-2 pr-3 md:p-4 min-w-0">
                    <h3 className="text-sm md:text-base font-bold text-base-content group-hover:text-primary transition-colors line-clamp-2 mb-1">{item.title}</h3>
                    <p className="text-xs text-base-content/50 line-clamp-1 mb-1">{item.description || item.category_name || ''}</p>
                    <div className="flex items-center gap-3 text-[11px] text-base-content/40">
                      <span className="flex items-center gap-1"><FiEye size={10} /> {item.views_count || 0}</span>
                      <span className="flex items-center gap-1"><FiDownload size={10} /> {item.downloads_count || 0}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        {!loading && contents.length > 0 && viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contents.map((item) => <ContentCard key={item.id} item={item} />)}
          </div>
        )}

        {/* List */}
        {!loading && contents.length > 0 && viewMode === 'list' && (
          <div className="space-y-3">
            {contents.map((item) => <ContentCardHorizontal key={item.id} item={item} />)}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-12">
            <div className="join shadow-md">
              <button className="join-item btn btn-sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>«</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i + 1} className={`join-item btn btn-sm ${page === i + 1 ? 'btn-primary' : ''}`} onClick={() => setPage(i + 1)}>{i + 1}</button>
              ))}
              <button className="join-item btn btn-sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>»</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
