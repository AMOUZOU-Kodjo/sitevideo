import { useState, useEffect } from 'react';
import { contentAPI } from '../services/api';
import { FiSearch, FiFilter, FiGrid, FiList } from 'react-icons/fi';
import ContentCard, { ContentCardSkeleton, ContentCardHorizontal } from '../components/ContentCard';

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
          <div className="join">
            <button className={`join-item btn btn-sm ${viewMode === 'grid' ? 'btn-active' : ''}`} onClick={() => setViewMode('grid')}><FiGrid /></button>
            <button className={`join-item btn btn-sm ${viewMode === 'list' ? 'btn-active' : ''}`} onClick={() => setViewMode('list')}><FiList /></button>
          </div>
        </div>
      </div>

      {loading ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => <ContentCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => <ContentCardSkeleton key={i} variant="horizontal" />)}
          </div>
        )
      ) : contents.length === 0 ? (
        <div className="text-center py-20">
          <FiFilter className="text-5xl mx-auto mb-4 opacity-30" />
          <p className="text-lg opacity-60">Aucun contenu trouvé.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {contents.map((item) => <ContentCard key={item.id} item={item} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {contents.map((item) => <ContentCardHorizontal key={item.id} item={item} />)}
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
