import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiPlus, FiEdit2, FiTrash2, FiFolder, FiHash, FiCalendar } from 'react-icons/fi';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [name, setName] = useState('');

  const fetch = () => {
    setLoading(true);
    adminAPI.getCategories().then((res) => setCategories(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleSave = async () => {
    if (!name.trim()) return toast.error('Le nom est requis.');
    try {
      if (editItem) {
        await adminAPI.updateCategory(editItem.id, { name: name.trim() });
        toast.success('Catégorie mise à jour.');
      } else {
        await adminAPI.createCategory({ name: name.trim() });
        toast.success('Catégorie créée.');
      }
      setShowModal(false);
      setEditItem(null);
      setName('');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await adminAPI.deleteCategory(id);
      toast.success('Catégorie supprimée.');
      fetch();
    } catch (err) {
      toast.error('Erreur lors de la suppression.');
    }
  };

  const openEdit = (cat) => {
    setEditItem(cat);
    setName(cat.name);
    setShowModal(true);
  };

  const openCreate = () => {
    setEditItem(null);
    setName('');
    setShowModal(true);
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><FiFolder className="text-primary" /> Catégories</h1>
          <p className="text-sm text-base-content/50 mt-1">{categories.length} catégories</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary gap-2"><FiPlus size={16} /> Nouvelle catégorie</button>
      </div>

      <div className="grid gap-3">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-base-100 rounded-xl border border-base-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <FiFolder size={18} />
              </div>
              <div>
                <p className="font-semibold">{cat.name}</p>
                <p className="text-xs text-base-content/40 flex items-center gap-3 mt-0.5">
                  <span className="flex items-center gap-1"><FiHash size={10} /> {cat.slug}</span>
                  <span>{cat.content_count || 0} contenus</span>
                  <span className="flex items-center gap-1"><FiCalendar size={10} /> {new Date(cat.created_at).toLocaleDateString('fr-FR')}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => openEdit(cat)} className="btn btn-ghost btn-sm btn-square"><FiEdit2 size={14} /></button>
              <button onClick={() => handleDelete(cat.id)} className="btn btn-ghost btn-sm btn-square text-error"><FiTrash2 size={14} /></button>
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="text-center py-16 text-base-content/30">
            <FiFolder size={48} className="mx-auto mb-3 opacity-30" />
            <p>Aucune catégorie</p>
            <button onClick={openCreate} className="btn btn-primary btn-sm mt-3">Créer une catégorie</button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-200 p-6 w-full max-w-md">
              <h3 className="text-lg font-bold mb-4">{editItem ? 'Modifier' : 'Nouvelle'} catégorie</h3>
              <input
                type="text" placeholder="Nom de la catégorie"
                className="input input-bordered w-full mb-4"
                value={name} onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowModal(false)} className="btn btn-ghost">Annuler</button>
                <button onClick={handleSave} className="btn btn-primary">
                  {editItem ? 'Enregistrer' : 'Créer'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
