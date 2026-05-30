import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiShoppingCart } from 'react-icons/fi';

export default function AdminPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminAPI.getPurchases({ page, limit: 20 })
      .then((res) => { setPurchases(res.data.purchases); setTotalPages(res.data.totalPages); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiShoppingCart /> Historique des ventes</h1>

      {loading ? (
        <div className="flex justify-center py-10"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16"><p className="opacity-60">Aucune vente pour le moment.</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Contenu</th>
                <th>Type</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td className="font-medium">{p.user_name}</td>
                  <td>{p.user_email}</td>
                  <td>{p.content_title}</td>
                  <td><span className="badge badge-sm badge-ghost">{p.content_type}</span></td>
                  <td className="font-semibold">{parseFloat(p.amount).toFixed(2)}€</td>
                  <td><span className={`badge badge-sm ${p.status === 'completed' ? 'badge-success' : p.status === 'refunded' ? 'badge-error' : 'badge-warning'}`}>{p.status}</span></td>
                  <td className="text-sm">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
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
