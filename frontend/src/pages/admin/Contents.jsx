import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { adminAPI, contentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiFilm, FiPlus, FiEdit2, FiTrash2, FiPlay, FiFileText, FiMusic, FiSearch } from 'react-icons/fi';

export default function AdminContents() {
  const [contents, setContents] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchContents = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (typeFilter) params.type = typeFilter;

    adminAPI.getContents(params)
      .then((res) => { setContents(res.data.contents); setTotalPages(res.data.totalPages); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchContents(); }, [page, typeFilter]);

  const handleDelete = async (id, title) => {
    if (!confirm(`Voulez-vous vraiment supprimer "${title}" ?`)) return;
    try {
      await contentAPI.delete(id);
      toast.success('Contenu supprimé');
      fetchContents();
    } catch (err) { toast.error('Erreur lors de la suppression'); }
  };

  const typeIcons = { video: FiPlay, document: FiFileText, audio: FiMusic };
  const typeColors = { video: 'badge-info', document: 'badge-success', audio: 'badge-secondary' };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><FiFilm /> Gestion des contenus</h1>
        <Link to="/admin/contents/add" className="btn btn-primary gap-2"><FiPlus /> Ajouter un contenu</Link>
      </div>

      <div className="mb-6">
        <select className="select select-bordered" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
          <option value="">Tous les types</option>
          <option value="video">Vidéos</option>
          <option value="document">Documents</option>
          <option value="audio">Audios</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : contents.length === 0 ? (
        <div className="text-center py-16">
          <p className="opacity-60 mb-4">Aucun contenu trouvé.</p>
          <Link to="/admin/contents/add" className="btn btn-primary">Ajouter le premier contenu</Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Prix</th>
                <th>Vues</th>
                <th>Catégorie</th>
                <th>Ajouté le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contents.map((c) => {
                const Icon = typeIcons[c.type] || FiPlay;
                return (
                  <tr key={c.id}>
                    <td className="font-medium max-w-xs truncate">{c.title}</td>
                    <td><span className={`badge badge-sm gap-1 ${typeColors[c.type] || 'badge-ghost'}`}><Icon /> {c.type}</span></td>
                    <td><span className={`badge badge-sm ${c.status === 'free' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span></td>
                    <td>{c.status === 'paid' ? `${c.price}€` : '-'}</td>
                    <td>{c.views_count || 0}</td>
                    <td className="text-sm opacity-70">{c.category_name || '-'}</td>
                    <td className="text-sm">{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => navigate(`/admin/contents/edit/${c.id}`)} className="btn btn-xs btn-ghost text-info"><FiEdit2 /></button>
                        <button onClick={() => handleDelete(c.id, c.title)} className="btn btn-xs btn-ghost text-error"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 join">
          <button className="join-item btn btn-sm" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>«</button>
          <button className="join-item btn btn-sm">Page {page} / {totalPages}</button>
          <button className="join-item btn btn-sm" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>»</button>
        </div>
      )}
    </div>
  );
}
