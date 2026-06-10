import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiMessageSquare, FiCheck, FiX, FiStar, FiClock, FiUser, FiTrash2 } from 'react-icons/fi';

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetch = () => {
    setLoading(true);
    const params = { limit: 50 };
    if (filter === 'pending') params.approved = 'false';
    if (filter === 'approved') params.approved = 'true';
    adminAPI.getTestimonials(params).then((res) => {
      setTestimonials(res.data.testimonials);
      setTotal(res.data.total);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [filter]);

  const handleApprove = async (id) => {
    try {
      await adminAPI.approveTestimonial(id);
      toast.success('Témoignage approuvé.');
      fetch();
    } catch { toast.error('Erreur.'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce témoignage ?')) return;
    try {
      await adminAPI.deleteTestimonial(id);
      toast.success('Témoignage supprimé.');
      fetch();
    } catch { toast.error('Erreur.'); }
  };

  const tabs = [
    { value: 'all', label: 'Tous' },
    { value: 'pending', label: 'En attente' },
    { value: 'approved', label: 'Approuvés' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><FiMessageSquare className="text-primary" /> Témoignages</h1>
          <p className="text-sm text-base-content/50 mt-1">{total} témoignages</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-base-200/50 p-1 rounded-xl w-fit mb-6">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setFilter(t.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === t.value ? 'bg-base-100 shadow-sm text-base-content' : 'text-base-content/50 hover:text-base-content'}`}
          >{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-20 text-base-content/30">
          <FiMessageSquare size={48} className="mx-auto mb-3 opacity-30" />
          <p>Aucun témoignage</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {testimonials.map((t) => (
            <div key={t.id} className={`bg-base-100 rounded-xl border p-4 hover:shadow-sm transition-shadow ${t.is_approved ? 'border-base-200' : 'border-warning/30 bg-warning/5'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm">
                    {t.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{t.name}</span>
                      {t.role && <span className="text-xs text-base-content/40">{t.role}</span>}
                      {!t.is_approved && <span className="badge badge-warning badge-xs">En attente</span>}
                    </div>
                    <div className="flex gap-0.5 my-1">
                      {Array.from({ length: t.rating }, (_, i) => <FiStar key={i} size={12} className="fill-amber-400 text-amber-400" />)}
                    </div>
                    <p className="text-sm text-base-content/70 line-clamp-3">"{t.content}"</p>
                    <p className="text-[10px] text-base-content/30 mt-1 flex items-center gap-1">
                      <FiClock size={10} /> {new Date(t.created_at).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!t.is_approved && (
                    <button onClick={() => handleApprove(t.id)} className="btn btn-success btn-xs btn-square" title="Approuver">
                      <FiCheck size={14} />
                    </button>
                  )}
                  <button onClick={() => handleDelete(t.id)} className="btn btn-error btn-xs btn-square" title="Supprimer">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
