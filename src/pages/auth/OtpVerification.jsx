import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiLock, FiLogIn, FiRefreshCw } from 'react-icons/fi';
import { apiBasePath } from '../../services/api/commonApi';
import './Login.css';

const RESEND_COOLDOWN_SECONDS = 60;

function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, validateOtp, resendOtp } = useAuth();
  const [formData, setFormData] = useState({
    otp: '',
    sessionId: ''
  });
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [resendMessage, setResendMessage] = useState('');
  const [error, setError] = useState('');

  const [userData, setUserData] = useState({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    }

    const user = localStorage.getItem('user');
    if (user) {
      setUserData(JSON.parse(user));
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    const sessionIdFromState = location.state?.sessionId;
    const sessionIdFromStorage = localStorage.getItem('sessionId');
    const sessionId = sessionIdFromState || sessionIdFromStorage || '';

    if (!sessionId) {
      navigate('/login', { replace: true });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      sessionId
    }));
    setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
  }, [location.state, navigate]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCooldownSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldownSeconds]);

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
        otp: formData.otp.trim(),
        sessionId: formData.sessionId
      };

      const result = await validateOtp(credentials);

      if (result.success) {
        // Redirect to intended page or default to admin
        const from = location.state?.from?.pathname || '/admin';
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Invalid OTP or session ID');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during OTP verification');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.sessionId || cooldownSeconds > 0) return;

    setError('');
    setResendMessage('');
    setResendLoading(true);

    try {
      const result = await resendOtp(formData.sessionId);

      if (result.success) {
        setResendMessage(result.message || 'OTP resent successfully.');
        setCooldownSeconds(RESEND_COOLDOWN_SECONDS);
      } else {
        setError(result.message || 'Unable to resend OTP right now.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while resending OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  const contactInfo = `${location.state?.mobile} & ${location.state?.email}` || 'your registered contact';
  const canResend = cooldownSeconds === 0 && !resendLoading && !loading;

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-icon">
            <img src={`${apiBasePath}/logo/logo.png`} alt="Saleh Gareeb POS Icon" className="logo" />
          </div>
          <h1>Welcome Back {userData?.firstName}</h1>
          <div className='alert alert-primary small' role="alert">
            Please enter the OTP sent to {contactInfo}
          </div>
          <p>OTP {location.state.otp}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {resendMessage && (
            <div className="success-message">
              {resendMessage}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="otp">
              <FiLock className="input-icon" />
              OTP
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              placeholder="Enter 6 digit OTP"
              required
              autoComplete="one-time-code"
              disabled={loading || resendLoading}
            />
            <div className='small mute text-danger'>OTP valid for 5 minutes</div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || !formData.otp.trim()}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <FiLogIn />
                Verify OTP
              </>
            )}
          </button>

       <div className='d-flex' style={{display: 'flex',flexDirection: 'row',justifyContent: 'space-between'}}>
           <button
            type="button"
            className="login-button"
            onClick={handleResendOtp}
            disabled={!canResend}
            style={{ marginTop: '10px',width:'46%' }}
          >
            {resendLoading ? (
              <>
                <span className="spinner"></span>
                Resending...
              </>
            ) : (
              <>
                <FiRefreshCw />
                {cooldownSeconds > 0 ? `Resend OTP in ${cooldownSeconds}s` : 'Resend OTP'}
              </>
            )}
          </button>
          <button
           type="button"
            className="login-button" style={{width:'46%'}}
            >
            Cancel
          </button>
       </div>
        </form>

        <div className="login-footer">
          <p>Need help? Contact your administrator</p>
        </div>
      </div>
    </div>
  );
}

export default OtpVerification;
