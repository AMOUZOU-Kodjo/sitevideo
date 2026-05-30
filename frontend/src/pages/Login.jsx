import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiLogIn } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Tous les champs sont requis.'); return; }
    setLoading(true);
    try {
      const data = await login(email, password);
      toast.success(`Bienvenue ${data.user.name} !`);
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur de connexion');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="card w-full max-w-md bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold text-center justify-center mb-4">Connexion</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-control mb-4">
              <label className="label"><span className="label-text">Email</span></label>
              <label className="input-group">
                <span className="bg-base-300"><FiMail /></span>
                <input type="email" placeholder="email@exemple.com" className="input input-bordered w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
              </label>
            </div>
            <div className="form-control mb-6">
              <label className="label"><span className="label-text">Mot de passe</span></label>
              <label className="input-group">
                <span className="bg-base-300"><FiLock /></span>
                <input type="password" placeholder="••••••••" className="input input-bordered w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
            </div>
            <button type="submit" className="btn btn-primary w-full gap-2" disabled={loading}>
              {loading ? <span className="loading loading-spinner"></span> : <FiLogIn />}
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
          <p className="text-center mt-4 text-sm">
            Pas encore de compte ? <Link to="/register" className="link link-primary">S'inscrire</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
