import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiLock, FiLogIn, FiEye, FiEyeOff, FiShield } from 'react-icons/fi';
import { apiBasePath } from '../../services/api/commonApi';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    shopId: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // Fetch shops for dropdown (optional)
  useEffect(() => {
    // TODO: Fetch shops if needed
    // For now, shopId is optional
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(''); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const credentials = {
        username: formData.username.trim(),
        password: formData.password
      };

      const result = await login(credentials);

      if (result.success) {
        if (result.data?.accessToken) {
          localStorage.setItem('token', result.data.accessToken);
          const from = '/shop/selection';
          navigate(from, { replace: true });
        }
        else {
          navigate('/otp/verify', {
            replace: true,
            state: {
              from: location.state?.from,
              sessionId: result.data?.sessionId,
              email: result.data?.email,
              mobile: result.data?.mobile,
              username: result.data?.username,
              firstname: result.data?.firstname,
              lastname: result.data?.lastname,
              otp: result.data?.otp // For testing purposes, remove in production
            }
          });
        }
      } else {
        setError(result.message || 'Invalid username or password');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <main className="login-shell">
        <aside className="login-brand-panel">
          <div className="login-brand-lockup">
            <span className="login-brand-mark">
              <img src={`${apiBasePath}/logo/logo.png`} alt="" />
            </span>
            <span className="login-brand-name">Saleh Gareeb <strong>POS</strong></span>
          </div>
          <div className="login-brand-copy">
            <span className="login-brand-overline">RETAIL OPERATIONS</span>
            <h1>Everything in your shop, in one place.</h1>
            <p>Sign in to manage orders, customers, payments, and daily work from your shop workspace.</p>
          </div>
          <div className="login-brand-bottom">
            <span className="login-brand-shield"><FiShield /></span>
            <span><strong>Private shop access</strong><small>Only authorized team members can sign in.</small></span>
          </div>
          <div className="login-brand-orbit login-brand-orbit--one" />
          <div className="login-brand-orbit login-brand-orbit--two" />
        </aside>

        <section className="login-card">
          <div className="login-header">
            <span className="login-form-kicker">STAFF SIGN IN</span>
            <h2>Welcome back</h2>
            <p>Enter your account details to continue.</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username">
              <FiUser className="input-icon" />
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
              autoComplete="username"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FiLock className="input-icon" />
              Password
            </label>
            <div className="login-password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button type="button" className="login-password-toggle" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || !formData.username || !formData.password}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn />
                Sign In
              </>
            )}
          </button>
          </form>

          <div className="login-footer">
            <span className="login-footer-line" />
            <p>Need help accessing your shop?</p>
            <small>Contact your administrator</small>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Login;
