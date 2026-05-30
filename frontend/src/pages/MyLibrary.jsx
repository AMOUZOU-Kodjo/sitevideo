import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { purchaseAPI } from '../services/api';
import { FiPlay, FiFileText, FiMusic, FiBook } from 'react-icons/fi';

export default function MyLibrary() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    purchaseAPI.getMyPurchases()
      .then((res) => setPurchases(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const typeIcons = { video: FiPlay, document: FiFileText, audio: FiMusic };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3"><FiBook /> Ma Bibliothèque</h1>

      {loading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-20">
          <FiBook className="text-5xl mx-auto mb-4 opacity-30" />
          <p className="text-lg opacity-60 mb-4">Vous n'avez encore rien acheté.</p>
          <Link to="/catalog" className="btn btn-primary">Explorer le catalogue</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((item) => {
            const Icon = typeIcons[item.type] || FiPlay;
            return (
              <Link key={item.id} to={`/content/${item.content_id}`} className="card bg-base-100 shadow-md card-hover">
                <div className="card-body">
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className="text-2xl text-primary" />
                    <span className={`badge badge-sm ${item.type === 'video' ? 'badge-info' : item.type === 'document' ? 'badge-success' : 'badge-secondary'}`}>{item.type}</span>
                  </div>
                  <h3 className="card-title text-base">{item.title}</h3>
                  <p className="text-sm opacity-70">Acheté le {new Date(item.created_at).toLocaleDateString('fr-FR')}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
