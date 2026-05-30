import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { FiUsers, FiFilm, FiShoppingCart, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then((res) => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;
  if (!stats) return <div className="text-center py-20">Erreur de chargement des statistiques.</div>;

  const statCards = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: FiUsers, color: 'bg-primary text-white' },
    { label: 'Contenus', value: stats.contents?.total || 0, icon: FiFilm, color: 'bg-secondary text-white' },
    { label: 'Ventes', value: stats.totalPurchases, icon: FiShoppingCart, color: 'bg-accent text-white' },
    { label: 'Revenus', value: `${stats.totalRevenue?.toFixed(2) || 0}€`, icon: FiDollarSign, color: 'bg-success text-white' }
  ];

  const chartData = [
    { name: 'Vidéos', count: parseInt(stats.contents?.videos) || 0 },
    { name: 'Documents', count: parseInt(stats.contents?.documents) || 0 },
    { name: 'Audios', count: parseInt(stats.contents?.audios) || 0 }
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2"><FiTrendingUp /> Tableau de bord</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="stat bg-base-100 shadow-lg rounded-xl">
            <div className="stat-figure text-4xl opacity-20"><card.icon /></div>
            <div className="stat-title">{card.label}</div>
            <div className="stat-value text-3xl">{card.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title mb-4">Répartition des contenus</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h3 className="card-title mb-4">Statut des contenus</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-success/10 rounded-lg">
                <span className="font-semibold text-success">Contenus gratuits</span>
                <span className="text-2xl font-bold">{stats.contents?.free || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-warning/10 rounded-lg">
                <span className="font-semibold text-warning">Contenus payants</span>
                <span className="text-2xl font-bold">{stats.contents?.paid || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h3 className="card-title mb-4">Derniers inscrits</h3>
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers?.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium">{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className={`badge badge-sm ${u.role === 'admin' ? 'badge-warning' : 'badge-ghost'}`}>{u.role}</span></td>
                    <td>{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
