import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { apiFetch } from '../../services/api';
import './AuthPage.css';

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'register' ? false : true;
  const [isLogin, setIsLogin] = useState(initialMode);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      if (location.state?.returnTo) {
        navigate(location.state.returnTo);
      } else if (user?.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate, location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = isLogin 
        ? { phoneNumber, password }
        : { phoneNumber, password, email, firstName, lastName };

      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      });

      if (isLogin) {
        login(data.user, data.token);
        // Redirect based on role
        if (location.state?.returnTo) {
          navigate(location.state.returnTo);
        } else if (data.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // Successful registration, switch to login
        setIsLogin(true);
        setError('Inscription réussie. Veuillez vous connecter.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur de connexion est survenue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{isLogin ? 'Connexion' : 'Créer un compte'}</h2>
          <p>Bienvenue sur Baol Trans Services</p>
        </div>

        {error && (
          <div className={`auth-alert ${error.includes('réussie') ? 'success' : 'error'}`}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            id="phoneNumber"
            label="Numéro de téléphone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />

          {!isLogin && (
            <div className="name-fields">
              <div className="name-field-item">
                <Input
                  id="firstName"
                  label="Prénom"
                  type="text"
                  placeholder="Ex: Modou"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="name-field-item">
                <Input
                  id="lastName"
                  label="Nom"
                  type="text"
                  placeholder="Ex: Ndiaye"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {!isLogin && (
            <Input
              id="email"
              label="Email (Optionnel)"
              type="email"
              placeholder="Ex: etudiant@ugb.edu.sn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}

          <Input
            id="password"
            label="Mot de passe"
            type="password"
            placeholder="Votre mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button 
            variant="primary" 
            fullWidth 
            type="submit" 
            disabled={isLoading}
          >
            {isLoading ? 'Chargement...' : (isLogin ? 'Se connecter' : 'S\'inscrire')}
          </Button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? 'Pas encore de compte ?' : 'Vous avez déjà un compte ?'}
            <button 
              type="button" 
              className="toggle-auth-btn" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
