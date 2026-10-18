import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PasswordRecovery() {
  const location = useLocation();
  const navigate = useNavigate();
  const { forgotPassword, resetPassword } = useAuth();
  const resetMode = location.pathname.endsWith('/reset');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState(new URLSearchParams(location.search).get('code') || '');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async event => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    try {
      if (resetMode) {
        const response = await resetPassword({ resetCode, newPassword });
        setMessage(response.message || 'Password reset. You can sign in now.');
        window.setTimeout(() => navigate('/login', { replace: true }), 1200);
      } else {
        const response = await forgotPassword(email);
        setMessage(response.message || 'If the account exists, password reset instructions have been sent.');
      }
    } catch (requestError) {
      setError(requestError.message || 'Could not complete the request.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="login-container"><section className="login-card">
    <div className="login-header"><span className="login-form-kicker">ACCOUNT RECOVERY</span><h2>{resetMode ? 'Choose a new password' : 'Reset your password'}</h2><p>{resetMode ? 'Enter the reset code from your email and choose a new password.' : 'Enter your account email. If it matches an account, we will send reset instructions.'}</p></div>
    <form onSubmit={submit} className="login-form">
      {error && <div className="error-message" role="alert">{error}</div>}
      {message && <div className="error-message" role="status">{message}</div>}
      {resetMode ? <>
        <label htmlFor="resetCode">Reset code</label><input id="resetCode" value={resetCode} onChange={event => setResetCode(event.target.value)} required />
        <label htmlFor="newPassword">New password</label><input id="newPassword" type="password" autoComplete="new-password" minLength={8} value={newPassword} onChange={event => setNewPassword(event.target.value)} required />
      </> : <>
        <label htmlFor="email">Account email</label><input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
      </>}
      <button className="login-button" type="submit" disabled={loading}>{loading ? 'Please wait…' : resetMode ? 'Set new password' : 'Send reset instructions'}</button>
    </form>
    <div className="login-footer"><Link to="/login">Back to sign in</Link></div>
  </section></main>;
}
