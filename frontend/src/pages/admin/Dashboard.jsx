import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import {
  FiUsers, FiFilm, FiShoppingCart, FiDollarSign, FiTrendingUp,
  FiArrowUp, FiArrowDown, FiEye, FiDownload, FiPlay, FiFileText, FiMusic
} from 'react-icons/fi';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];
const STATUS_COLORS = ['#10b981', '#f59e0b'];

function StatCard({ label, value, icon: Icon, trend, trendLabel, color }) {
  return (
    <div className="stat bg-base-100 rounded-2xl shadow-sm border border-base-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={20} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-success' : 'text-error'}`}>
            {trend >= 0 ? <FiArrowUp size={12} /> : <FiArrowDown size={12} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold mb-0.5">{value}</p>
      <p className="text-sm text-base-content/50">{label}</p>
      {trendLabel && <p className="text-[10px] text-base-content/30 mt-1">{trendLabel}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload) return null;
  return (
    <div className="bg-base-100 border border-base-200 rounded-xl shadow-xl p-3 text-sm">
      <p className="font-semibold text-base-content/60 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then((res) => setStats(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-56 skeleton rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 skeleton rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 skeleton rounded-2xl" />
        <div className="h-80 skeleton rounded-2xl" />
      </div>
    </div>
  );
  if (!stats) return <div className="text-center py-20">Erreur de chargement des statistiques.</div>;

  const contentTotal = stats.contents?.total || 0;
  const freePct = contentTotal ? Math.round((stats.contents.free / contentTotal) * 100) : 0;
  const paidPct = contentTotal ? Math.round((stats.contents.paid / contentTotal) * 100) : 0;

  const typeData = [
    { name: 'Vidéos', value: stats.contents.videos || 0, icon: '🎬' },
    { name: 'Documents', value: stats.contents.documents || 0, icon: '📄' },
    { name: 'Audios', value: stats.contents.audios || 0, icon: '🎵' }
  ].filter(d => d.value > 0);

  const statusData = [
    { name: 'Gratuit', value: stats.contents.free || 0 },
    { name: 'Payant', value: stats.contents.paid || 0 }
  ].filter(d => d.value > 0);

  const lineData = (stats.monthlyUsers || []).map(m => ({
    month: m.month?.slice(5) || m.month,
    Inscriptions: parseInt(m.count)
  }));

  const revenueData = (stats.monthlyRevenue || []).map(m => ({
    month: m.month?.slice(5) || m.month,
    Revenus: parseFloat(m.revenue) || 0,
    Ventes: parseInt(m.purchases) || 0
  }));

  const contentTrend = stats.monthlyContents?.length >= 2
    ? Math.round(((parseInt(stats.monthlyContents[stats.monthlyContents.length - 1].total) -
        parseInt(stats.monthlyContents[stats.monthlyContents.length - 2].total)) /
        Math.max(parseInt(stats.monthlyContents[stats.monthlyContents.length - 2].total), 1)) * 100)
    : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3">
            <FiTrendingUp className="text-primary" />
            Tableau de bord
          </h1>
          <p className="text-sm text-base-content/50 mt-1">Aperçu général de la plateforme</p>
        </div>
        <div className="text-xs text-base-content/30 hidden sm:block">
          Mis à jour en temps réel
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Utilisateurs"
          value={stats.totalUsers}
          icon={FiUsers}
          trend={15}
          trendLabel="vs mois dernier"
          color="bg-primary/10 text-primary"
        />
        <StatCard
          label="Contenus"
          value={contentTotal}
          icon={FiFilm}
          trend={contentTrend}
          trendLabel="vs mois dernier"
          color="bg-secondary/10 text-secondary"
        />
        <StatCard
          label="Ventes"
          value={stats.totalPurchases}
          icon={FiShoppingCart}
          trend={8}
          trendLabel="vs mois dernier"
          color="bg-accent/10 text-accent"
        />
        <StatCard
          label="Revenus"
          value={`${stats.totalRevenue?.toFixed(2) || 0}€`}
          icon={FiDollarSign}
          trend={12}
          trendLabel="vs mois dernier"
          color="bg-success/10 text-success"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Line chart — Users */}
        <div className="card bg-base-100 rounded-2xl shadow-sm border border-base-200">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FiUsers size={16} className="text-primary" />
                Évolution des inscriptions
              </h3>
              <span className="badge badge-sm badge-ghost">12 mois</span>
            </div>
            <p className="text-xs text-base-content/40 mb-4">Nouveaux utilisateurs par mois</p>
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--fallback-bc, oklch(0% 0 0))" strokeOpacity={0.08} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--fallback-bc, oklch(0% 0 0))" strokeOpacity={0.3} />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--fallback-bc, oklch(0% 0 0))" strokeOpacity={0.3} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="Inscriptions" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-base-content/30 text-sm">Aucune donnée</div>
            )}
          </div>
        </div>

        {/* Area chart — Revenue */}
        <div className="card bg-base-100 rounded-2xl shadow-sm border border-base-200">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FiDollarSign size={16} className="text-success" />
                Revenus mensuels
              </h3>
              <span className="badge badge-sm badge-ghost">12 mois</span>
            </div>
            <p className="text-xs text-base-content/40 mb-4">Montant des ventes par mois</p>
            {revenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--fallback-bc, oklch(0% 0 0))" strokeOpacity={0.08} />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="var(--fallback-bc, oklch(0% 0 0))" strokeOpacity={0.3} />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--fallback-bc, oklch(0% 0 0))" strokeOpacity={0.3} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Revenus" stroke="#10b981" strokeWidth={2.5} fill="url(#revenueGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-base-content/30 text-sm">Aucune donnée</div>
            )}
          </div>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Bar chart — Content types */}
        <div className="card bg-base-100 rounded-2xl shadow-sm border border-base-200 lg:col-span-2">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FiFilm size={16} className="text-secondary" />
                Répartition des contenus
              </h3>
              <span className="badge badge-sm badge-ghost">{contentTotal} total</span>
            </div>
            <p className="text-xs text-base-content/40 mb-4">Par type de contenu</p>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--fallback-bc, oklch(0% 0 0))" strokeOpacity={0.08} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="var(--fallback-bc, oklch(0% 0 0))" strokeOpacity={0.3} />
                  <YAxis tick={{ fontSize: 12 }} stroke="var(--fallback-bc, oklch(0% 0 0))" strokeOpacity={0.3} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={60}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-base-content/30 text-sm">Aucun contenu</div>
            )}
          </div>
        </div>

        {/* Donut chart — Free vs Paid */}
        <div className="card bg-base-100 rounded-2xl shadow-sm border border-base-200">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FiShoppingCart size={16} className="text-warning" />
                Statut des contenus
              </h3>
            </div>
            <p className="text-xs text-base-content/40 mb-4">Gratuit vs Payant</p>
            {statusData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                      {statusData.map((_, i) => <Cell key={i} fill={STATUS_COLORS[i]} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex gap-6 text-sm mt-2">
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#10b981]" /> Gratuit <strong>{freePct}%</strong></span>
                  <span className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-[#f59e0b]" /> Payant <strong>{paidPct}%</strong></span>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-base-content/30 text-sm">Aucun contenu</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom row — Top content + Recent users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top contents */}
        <div className="card bg-base-100 rounded-2xl shadow-sm border border-base-200">
          <div className="card-body p-5">
            <h3 className="font-bold text-base flex items-center gap-2 mb-4">
              <FiEye size={16} className="text-primary" />
              Contenus les plus vus
            </h3>
            {stats.topContents?.length > 0 ? (
              <div className="space-y-2">
                {stats.topContents.map((item, i) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-base-200/50 transition-colors">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-base-300 text-base-content/50'}`}>
                      {i + 1}
                    </span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.type === 'video' ? 'bg-blue-100 text-blue-600' : item.type === 'document' ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'}`}>
                      {item.type === 'video' ? <FiPlay size={14} /> : item.type === 'document' ? <FiFileText size={14} /> : <FiMusic size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-base-content/40">{item.type}</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-base-content/50">
                      <span className="flex items-center gap-1"><FiEye size={11} /> {item.views_count || 0}</span>
                      <span className="flex items-center gap-1"><FiDownload size={11} /> {item.downloads_count || 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/30 text-sm">Aucun contenu</div>
            )}
            <Link to="/admin/contents" className="btn btn-ghost btn-sm w-full mt-2 gap-1">Voir tous les contenus →</Link>
          </div>
        </div>

        {/* Recent users */}
        <div className="card bg-base-100 rounded-2xl shadow-sm border border-base-200">
          <div className="card-body p-5">
            <h3 className="font-bold text-base flex items-center gap-2 mb-4">
              <FiUsers size={16} className="text-primary" />
              Derniers inscrits
            </h3>
            {stats.recentUsers?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table table-xs">
                  <thead>
                    <tr className="text-base-content/40 text-[10px] uppercase tracking-wider">
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="font-medium text-sm">{u.name}</td>
                        <td className="text-xs text-base-content/50">{u.email}</td>
                        <td>
                          <span className={`badge badge-xs ${u.role === 'admin' ? 'badge-warning' : 'badge-ghost'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="text-xs text-base-content/40">{new Date(u.created_at).toLocaleDateString('fr-FR')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-base-content/30 text-sm">Aucun utilisateur</div>
            )}
            <Link to="/admin/users" className="btn btn-ghost btn-sm w-full mt-2 gap-1">Voir tous les utilisateurs →</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
