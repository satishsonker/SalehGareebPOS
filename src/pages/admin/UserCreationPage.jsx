import React, { useEffect, useState } from 'react';
import { FiUserPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useNotification } from '../../components/Notification';
import { register } from '../../services/api/usersApi';
import { getRoles } from '../../services/api/roleApi';
import './UserCreationPage.css';

const initialForm = { username: '', email: '', password: '', firstName: '', lastName: '', mobile: '', isdCode: '', roleId: '' };
const unwrap = response => response?.data?.data ?? response?.data ?? response;

export default function UserCreationPage() {
  const { success, error: showError } = useNotification();
  const [form, setForm] = useState(initialForm);
  const [roles, setRoles] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRoles(1, 100).then(response => {
      const payload = unwrap(response);
      setRoles(payload?.data || payload || []);
    }).catch(() => showError('Could not load roles.'));
  }, [showError]);

  const change = event => setForm(current => ({ ...current, [event.target.name]: event.target.value }));
  const submit = async event => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await register({ ...form, email: form.email.trim() || null, roleId: Number(form.roleId) });
      if (result?.success === false) throw new Error(result.message || 'Could not create user.');
      success('User created successfully.');
      setForm(initialForm);
    } catch (err) {
      showError(err.message || 'Could not create user.');
    } finally {
      setSaving(false);
    }
  };

  return <section className="user-create-page">
    <header className="user-create-heading"><span><FiUserPlus /></span><div><h2>Create User</h2><p>Create an account and assign its role. Email is optional.</p></div><Link to="/admin/system-data">Manage users</Link></header>
    <form className="user-create-card" onSubmit={submit}>
      <div className="user-create-grid">
        <label>Username *<input name="username" value={form.username} onChange={change} minLength={3} maxLength={50} required autoComplete="username" /></label>
        <label>Email<input type="email" name="email" value={form.email} onChange={change} maxLength={100} autoComplete="email" placeholder="Optional" /></label>
        <label>Password *<input type="password" name="password" value={form.password} onChange={change} minLength={6} maxLength={100} required autoComplete="new-password" /></label>
        <label>Role *<select name="roleId" value={form.roleId} onChange={change} required><option value="">Select a role</option>{roles.map(role => <option key={role.id} value={role.id}>{role.name}{role.isAdmin ? ' (Admin)' : ''}</option>)}</select></label>
        <label>First name<input name="firstName" value={form.firstName} onChange={change} maxLength={100} /></label>
        <label>Last name<input name="lastName" value={form.lastName} onChange={change} maxLength={100} /></label>
        <label>ISD code<input name="isdCode" value={form.isdCode} onChange={change} maxLength={4} placeholder="e.g. +971" /></label>
        <label>Mobile<input type="tel" name="mobile" value={form.mobile} onChange={change} maxLength={15} /></label>
      </div>
      <footer><button type="reset" onClick={() => setForm(initialForm)} disabled={saving}>Clear</button><button type="submit" disabled={saving}>{saving ? 'Creating…' : 'Create user'}</button></footer>
    </form>
  </section>;
}
