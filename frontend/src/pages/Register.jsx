import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiUserPlus } from 'react-icons/fi';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirm) { toast.error('Tous les champs sont requis.'); return; }
    if (password !== confirm) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 6) { toast.error('Minimum 6 caractères.'); return; }
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Inscription réussie !');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors de l\'inscription');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center justify-center mb-4">Inscription</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-3">
              <label className="label"><span className="label-text">Nom complet</span></label>
              <label className="input-group">
                <span className="bg-base-300"><FiUser /></span>
                <input type="text" placeholder="Votre nom" className="input input-bordered w-full" value={name} onChange={(e) => setName(e.target.value)} />
              </label>
            </div>
            <div className="form-control mb-3">
              <label className="label"><span className="label-text">Email</span></label>
              <label className="input-group">
                <span className="bg-base-300"><FiMail /></span>
                <input type="email" placeholder="email@exemple.com" className="input input-bordered w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
            </div>
            <div className="form-control mb-3">
              <label className="label"><span className="label-text">Mot de passe</span></label>
              <label className="input-group">
                <span className="bg-base-300"><FiLock /></span>
                <input type="password" placeholder="Minimum 6 caractères" className="input input-bordered w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
            </div>
            <div className="form-control mb-6">
              <label className="label"><span className="label-text">Confirmer le mot de passe</span></label>
              <label className="input-group">
                <span className="bg-base-300"><FiLock /></span>
                <input type="password" placeholder="Identique au mot de passe" className="input input-bordered w-full" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-full gap-2" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : <FiUserPlus />}
              {loading ? 'Inscription...' : 'Créer mon compte'}
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            Déjà inscrit ? <Link to="/login" className="link link-primary">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
