import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { contentAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiArrowLeft } from 'react-icons/fi';

export default function AddContent() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'video',
    status: 'free',
    price: '',
    youtube_id: '',
    category_id: ''
  });
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  useEffect(() => {
    contentAPI.getCategories().then((res) => setCategories(res.data)).catch(() => {});
    if (isEdit) {
      contentAPI.getById(id).then((res) => {
        const c = res.data;
        setForm({ title: c.title, description: c.description || '', type: c.type, status: c.status, price: c.price?.toString() || '', youtube_id: c.youtube_id || '', category_id: c.category_id || '' });
      }).catch(() => { toast.error('Contenu introuvable'); navigate('/admin/contents'); }).finally(() => setFetching(false));
    }
  }, [id, isEdit, navigate]);

  const extractYoutubeId = (url) => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m) return m[1];
    }
    return url;
  };

  const handleChange = (e) => {
    const val = e.target.name === 'youtube_id' ? extractYoutubeId(e.target.value) : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { toast.error('Le titre est requis.'); return; }
    if (form.status === 'paid' && (!form.price || parseFloat(form.price) <= 0)) { toast.error('Le prix doit être supérieur à 0 pour un contenu payant.'); return; }
    if (form.type === 'video' && !form.youtube_id) { toast.error('L\'ID YouTube est requis pour une vidéo.'); return; }
    if ((form.type === 'document' || form.type === 'audio') && !file && !isEdit) { toast.error('Le fichier est requis.'); return; }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('type', form.type);
      formData.append('status', form.status);
      formData.append('price', form.status === 'paid' ? form.price : '0');
      formData.append('youtube_id', form.youtube_id);
      if (form.category_id) formData.append('category_id', form.category_id);
      if (file) formData.append('file', file);

      if (isEdit) {
        await contentAPI.update(id, formData);
        toast.success('Contenu modifié !');
      } else {
        await contentAPI.create(formData);
        toast.success('Contenu ajouté !');
      }
      navigate('/admin/contents');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally { setLoading(false); }
  };

  if (fetching) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary"></span></div>;

  return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => navigate('/admin/contents')} className="btn btn-ghost btn-sm mb-4 gap-2"><FiArrowLeft /> Retour</button>
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Modifier le contenu' : 'Ajouter un contenu'}</h1>

      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-lg">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Titre *</span></label>
            <input type="text" name="title" className="input input-bordered" value={form.title} onChange={handleChange} placeholder="Titre du contenu" required />
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Description</span></label>
            <textarea name="description" className="textarea textarea-bordered h-24" value={form.description} onChange={handleChange} placeholder="Description..."></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Type *</span></label>
              <select name="type" className="select select-bordered" value={form.type} onChange={handleChange}>
                <option value="video">Vidéo (YouTube)</option>
                <option value="document">Document (PDF)</option>
                <option value="audio">Audio (MP3)</option>
              </select>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Catégorie</span></label>
              <select name="category_id" className="select select-bordered" value={form.category_id} onChange={handleChange}>
                <option value="">Sans catégorie</option>
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-control">
            <label className="label"><span className="label-text font-medium">Statut *</span></label>
            <div className="join">
              <button type="button" className={`join-item btn flex-1 ${form.status === 'free' ? 'btn-success' : ''}`} onClick={() => setForm({ ...form, status: 'free', price: '' })}>Gratuit</button>
              <button type="button" className={`join-item btn flex-1 ${form.status === 'paid' ? 'btn-warning' : ''}`} onClick={() => setForm({ ...form, status: 'paid' })}>Payant</button>
            </div>
          </div>

          {form.status === 'paid' && (
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Prix (€) *</span></label>
              <input type="number" name="price" className="input input-bordered w-40" value={form.price} onChange={handleChange} min="0.01" step="0.01" />
            </div>
          )}

          {form.type === 'video' && (
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">ID YouTube *</span></label>
              <input type="text" name="youtube_id" className="input input-bordered" value={form.youtube_id} onChange={handleChange} placeholder="Ex: dQw4w9WgXcQ" />
              <label className="label"><span className="label-text-alt opacity-60">Copiez l'ID depuis l'URL YouTube (ex: watch?v=XXXXXXXXX)</span></label>
            </div>
          )}

          {(form.type === 'document' || form.type === 'audio') && (
            <div className="form-control">
              <label className="label"><span className="label-text font-medium">Fichier {isEdit ? '(laisser vide pour conserver)' : '*'}</span></label>
              <input type="file" className="file-input file-input-bordered w-full" accept={form.type === 'document' ? '.pdf,.doc,.docx,.epub' : '.mp3,.wav,.ogg,.m4a'} onChange={(e) => setFile(e.target.files[0])} />
            </div>
          )}

          <div className="pt-4">
            <button type="submit" className="btn btn-primary w-full gap-2" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : <FiSave />}
              {isEdit ? 'Enregistrer les modifications' : 'Ajouter le contenu'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
