import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../Styles/Login.css';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left Section - Branding */}
      <div className="login-branding">
        <div className="branding-content">
          <div className="branding-header">
            <div className="branding-logo">
              <div className="branding-logo-icon">T</div>
              <span className="branding-logo-text">Taskme</span>
            </div>
          </div>

          <div className="branding-main">
            <h1 className="branding-title">Gestion intelligente des tâches et missions</h1>
            <p className="branding-description">
              Répartition équitable, transparente et traçable des missions pédagogiques au sein de votre communauté d'auditeurs.
            </p>

            <div className="branding-stats">
              <div className="stat-item">
                <div className="stat-number">500+</div>
                <div className="stat-label">Tâches gérées</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">50+</div>
                <div className="stat-label">Auditeurs actifs</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">98%</div>
                <div className="stat-label">Satisfaction</div>
              </div>
            </div>
          </div>

          <div className="branding-footer">
            <p className="copyright">© 2024 Taskme. Tous droits réservés.</p>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="login-form-section">
        <div className="login-container">
          <div className="login-header">
            <h1 className="login-title">Connexion</h1>
            <p className="login-subtitle">Entrez vos identifiants pour accéder à votre espace</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div style={{
                padding: '12px',
                backgroundColor: '#fee',
                border: '1px solid #fcc',
                borderRadius: '6px',
                color: '#c33',
                marginBottom: '16px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email" className="field-label">Adresse email</label>
              <input
                id="email"
                type="email"
                className="field-input"
                placeholder="votre@email.ma"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <div className="field-label-row">
                <label htmlFor="password" className="field-label">Mot de passe</label>
                <a href="#" className="forgot-password-link">Mot de passe oublié?</a>
              </div>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="field-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>

          <p className="signup-text">
            Pas encore de compte? <a href="#" className="contact-admin-link">Contactez votre administrateur</a>
          </p>

          <div className="demo-accounts">
            <p className="demo-title">Comptes de test:</p>
            <div className="demo-list">
              <p className="demo-item">
                <span className="demo-role">Admin:</span> admin@taskme.ma
              </p>
              <p className="demo-item">
                <span className="demo-role">Coordinateur:</span> imane.el@taskme.ma
              </p>
              <p className="demo-item">
                <span className="demo-role">Auditeur 1:</span> ahmed.benali@taskme.ma
              </p>
              <p className="demo-item">
                <span className="demo-role">Auditeur 2:</span> fatima.zahra@taskme.ma
              </p>
              <p className="demo-password">Mot de passe pour tous: 123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
