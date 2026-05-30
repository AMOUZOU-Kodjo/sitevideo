import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiUsers, FiSearch, FiShield, FiUserX, FiUserCheck } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (search) params.search = search;

    adminAPI.getUsers(params)
      .then((res) => { setUsers(res.data.users); setTotalPages(res.data.totalPages); })
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); fetchUsers(); };

  const handleToggleBan = async (userId, currentBan) => {
    try {
      await adminAPI.updateUser(userId, { is_banned: !currentBan });
      toast.success(currentBan ? 'Utilisateur réactivé' : 'Utilisateur banni');
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
  };

  const handleToggleAdmin = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      toast.success(`Rôle changé en ${newRole}`);
      fetchUsers();
    } catch (err) { toast.error(err.response?.data?.error || 'Erreur'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiUsers /> Gestion des utilisateurs</h1>

      <form onSubmit={handleSearch} className="mb-6 join">
        <input type="text" placeholder="Rechercher par nom ou email..." className="input input-bordered join-item w-full max-w-md" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button type="submit" className="btn btn-primary join-item"><FiSearch /></button>
      </form>

      {loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Inscription</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.is_banned ? 'opacity-60' : ''}>
                  <td className="font-medium">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge badge-sm ${u.role === 'admin' ? 'badge-warning' : 'badge-ghost'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    {u.is_banned ? <span className="badge badge-error badge-sm">Banni</span> : <span className="badge badge-success badge-sm">Actif</span>}
                  </td>
                  <td className="text-sm">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <div className="flex gap-2">
                      <button onClick={() => handleToggleAdmin(u.id, u.role)} className="btn btn-xs btn-ghost" title="Changer rôle">
                        <FiShield />
                      </button>
                      <button onClick={() => handleToggleBan(u.id, u.is_banned)} className={`btn btn-xs btn-ghost ${u.is_banned ? 'text-success' : 'text-error'}`} title={u.is_banned ? 'Réactiver' : 'Bannir'}>
                        {u.is_banned ? <FiUserCheck /> : <FiUserX />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
