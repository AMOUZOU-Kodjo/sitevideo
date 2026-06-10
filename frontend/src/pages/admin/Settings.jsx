import { useState, useEffect } from 'react';
import { settingsAPI } from '../../services/api';
import toast from 'react-hot-toast';
import { FiSave, FiSettings, FiType, FiAlignLeft, FiLayers, FiBarChart2, FiArrowRight, FiPlus, FiTrash2, FiMenu } from 'react-icons/fi';

const defaultFeatures = [
  { icon: 'play-circle', title: '', desc: '' },
  { icon: 'file-text', title: '', desc: '' }
];

const defaultSteps = [
  { num: '01', title: '', desc: '', icon: 'box' },
  { num: '02', title: '', desc: '', icon: 'shield' },
  { num: '03', title: '', desc: '', icon: 'play' }
];

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    settingsAPI.getAll().then((res) => {
      const data = {};
      Object.entries(res.data).forEach(([k, v]) => {
        data[k] = typeof v === 'object' && v !== null ? (Array.isArray(v) ? v : v) : v;
      });
      setSettings(data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const update = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const payload = {};
      Object.entries(settings).forEach(([k, v]) => { payload[k] = v; });
      await settingsAPI.updateBulk(payload);
      toast.success('Paramètres enregistrés !');
    } catch {
      toast.error('Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const features = [...(settings.features || defaultFeatures), { icon: 'file-text', title: '', desc: '' }];
    update('features', features);
  };

  const removeFeature = (i) => {
    const features = (settings.features || []).filter((_, idx) => idx !== i);
    update('features', features);
  };

  if (loading) return <div className="flex justify-center py-20"><span className="loading loading-spinner loading-lg text-primary" /></div>;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-2"><FiSettings className="text-primary" /> Paramètres du site</h1>
          <p className="text-sm text-base-content/50 mt-1">Personnalisez le contenu de votre plateforme</p>
        </div>
        <button onClick={handleSaveAll} disabled={saving} className="btn btn-primary gap-2">
          <FiSave size={16} /> {saving ? 'Enregistrement...' : 'Tout enregistrer'}
        </button>
      </div>

      <div className="space-y-6">

        {/* Site info */}
        <section className="card bg-base-100 border border-base-200 rounded-2xl">
          <div className="card-body p-5">
            <h3 className="font-bold flex items-center gap-2 mb-4"><FiType size={16} className="text-primary" /> Informations générales</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Nom du site</label>
                <input type="text" className="input input-bordered w-full" value={settings.site_name || ''} onChange={(e) => update('site_name', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Description</label>
                <textarea className="textarea textarea-bordered w-full" rows={2} value={settings.site_description || ''} onChange={(e) => update('site_description', e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* Hero */}
        <section className="card bg-base-100 border border-base-200 rounded-2xl">
          <div className="card-body p-5">
            <h3 className="font-bold flex items-center gap-2 mb-4"><FiAlignLeft size={16} className="text-primary" /> Section Hero (Accueil)</h3>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Titre</label>
                <input type="text" className="input input-bordered w-full" value={settings.hero_title || ''} onChange={(e) => update('hero_title', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Sous-titre</label>
                <textarea className="textarea textarea-bordered w-full" rows={2} value={settings.hero_subtitle || ''} onChange={(e) => update('hero_subtitle', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Texte CTA</label>
                <textarea className="textarea textarea-bordered w-full" rows={2} value={settings.cta_text || ''} onChange={(e) => update('cta_text', e.target.value)} />
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="card bg-base-100 border border-base-200 rounded-2xl">
          <div className="card-body p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold flex items-center gap-2"><FiLayers size={16} className="text-primary" /> Fonctionnalités</h3>
              <button onClick={addFeature} className="btn btn-ghost btn-sm gap-1"><FiPlus size={14} /> Ajouter</button>
            </div>
            <div className="space-y-3">
              {(settings.features || []).map((f, i) => (
                <div key={i} className="flex gap-3 items-start p-3 bg-base-200/40 rounded-xl border border-base-200">
                  <FiMenu size={16} className="text-base-content/20 mt-3 flex-shrink-0" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                    <input type="text" placeholder="Icône (play-circle, file-text, music, award)" className="input input-bordered input-sm"
                      value={f.icon} onChange={(e) => { const fts = [...(settings.features || [])]; fts[i] = { ...fts[i], icon: e.target.value }; update('features', fts); }} />
                    <input type="text" placeholder="Titre" className="input input-bordered input-sm"
                      value={f.title} onChange={(e) => { const fts = [...(settings.features || [])]; fts[i] = { ...fts[i], title: e.target.value }; update('features', fts); }} />
                    <input type="text" placeholder="Description" className="input input-bordered input-sm"
                      value={f.desc} onChange={(e) => { const fts = [...(settings.features || [])]; fts[i] = { ...fts[i], desc: e.target.value }; update('features', fts); }} />
                  </div>
                  <button onClick={() => removeFeature(i)} className="btn btn-ghost btn-xs btn-square text-error flex-shrink-0 mt-1"><FiTrash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="card bg-base-100 border border-base-200 rounded-2xl">
          <div className="card-body p-5">
            <h3 className="font-bold flex items-center gap-2 mb-4"><FiBarChart2 size={16} className="text-primary" /> Statistiques affichées</h3>
            <p className="text-xs text-base-content/40 mb-4">Modifiez les valeurs affichées dans la section stats de l'accueil.</p>
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-wider text-base-content/40">
                    <th>Icône</th>
                    <th>Valeur</th>
                    <th>Suffixe</th>
                    <th>Label</th>
                  </tr>
                </thead>
                <tbody>
                  {(settings.stats || []).map((s, i) => (
                    <tr key={i}>
                      <td><input type="text" className="input input-xs input-bordered w-24" value={s.icon || ''}
                        onChange={(e) => { const sts = [...(settings.stats || [])]; sts[i] = { ...sts[i], icon: e.target.value }; update('stats', sts); }} /></td>
                      <td><input type="number" className="input input-xs input-bordered w-20" value={s.value || ''}
                        onChange={(e) => { const sts = [...(settings.stats || [])]; sts[i] = { ...sts[i], value: parseInt(e.target.value) || 0 }; update('stats', sts); }} /></td>
                      <td><input type="text" className="input input-xs input-bordered w-16" value={s.suffix || ''}
                        onChange={(e) => { const sts = [...(settings.stats || [])]; sts[i] = { ...sts[i], suffix: e.target.value }; update('stats', sts); }} /></td>
                      <td><input type="text" className="input input-xs input-bordered w-40" value={s.label || ''}
                        onChange={(e) => { const sts = [...(settings.stats || [])]; sts[i] = { ...sts[i], label: e.target.value }; update('stats', sts); }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
