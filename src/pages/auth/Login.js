import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiLock, FiLogIn } from 'react-icons/fi';
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
  const [shops, setShops] = useState([]);

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
        password: formData.password,
        ...(formData.shopId && { shopId: parseInt(formData.shopId) }),
      };

      const result = await login(credentials);

      if (result.success) {
        // Redirect to intended page or default to admin
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
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
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <FiLogIn />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to continue to Saleh Gareeb POS</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
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
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="shopId">
              Shop (Optional)
            </label>
            <input
              type="number"
              id="shopId"
              name="shopId"
              value={formData.shopId}
              onChange={handleChange}
              placeholder="Shop ID (optional)"
              autoComplete="off"
              disabled={loading}
            />
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
          <p>Need help? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
