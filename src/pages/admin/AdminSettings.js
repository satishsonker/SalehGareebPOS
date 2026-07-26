import React, { useState, useEffect, useCallback } from 'react';
import { FiRefreshCw, FiSave, FiAlertCircle, FiLoader } from 'react-icons/fi';
import TextBox from '../../components/TextBox/TextBox';
import Select from '../../components/Select/Select';
import Switch from '../../components/Switch/Switch';
import Button from '../../components/Button/Button';
import { useNotification } from '../../components/Notification';
import {
  getAdminSettings, updateAdminSetting, bulkUpdateAdminSettings,
} from '../../services/api/adminSettingApi';
import './AdminSettings.css';

// ── Helpers ───────────────────────────────────────────────────────
function parseOptions(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(o => (typeof o === 'string' ? { value: o, label: o } : o));
  if (typeof raw === 'string') {
    try { return parseOptions(JSON.parse(raw)); }
    catch { return raw.split(',').map(s => ({ value: s.trim(), label: s.trim() })); }
  }
  return [];
}

function castValue(dataType, raw) {
  const dt = (dataType || 'string').toLowerCase();
  if (dt === 'boolean' || dt === 'bool') {
    if (typeof raw === 'boolean') return raw;
    return raw === 'true' || raw === '1' || raw === 1;
  }
  return raw ?? '';
}

function serializeValue(dataType, val) {
  const dt = (dataType || 'string').toLowerCase();
  if (dt === 'boolean' || dt === 'bool') return String(val);
  return String(val ?? '');
}

// ── Dynamic Setting Control ───────────────────────────────────────
function SettingControl({ setting, value, onChange, error }) {
  const dt = (setting.dataType || 'string').toLowerCase();
  const id = `setting-${setting.id}`;
  const label = setting.name;
  const common = { label, required: setting.isRequired, helperText: setting.description, error };

  if (dt === 'boolean' || dt === 'bool') {
    return (
      <div className="form-group as-switch-group">
        <span className="as-switch-label">
          {label}{setting.isRequired && <span className="as-required">*</span>}
        </span>
        {setting.description && <span className="as-hint">{setting.description}</span>}
        <Switch
          id={id}
          checked={!!value}
          onChange={onChange}
          onLabel="ON"
          offLabel="OFF"
          size="medium"
          labelPosition="right"
          error={error}
        />
      </div>
    );
  }

  if (dt === 'select' || dt === 'dropdown') {
    const opts = parseOptions(setting.options);
    return (
      <div className="form-group">
        <Select
          {...common}
          options={opts}
          value={value}
          onChange={onChange}
          placeholder={setting.placeholder || `Select ${label}...`}
          showSearch={opts.length > 6}
          size="medium"
        />
      </div>
    );
  }

  if (dt === 'textarea') {
    return (
      <div className="form-group as-full">
        <label htmlFor={id} className="as-label">
          {label}{setting.isRequired && <span className="as-required">*</span>}
        </label>
        {setting.description && <span className="as-hint">{setting.description}</span>}
        <textarea
          id={id}
          className={`as-textarea${error ? ' as-textarea--error' : ''}`}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={setting.placeholder || ''}
          rows={4}
        />
        {error && <span className="as-field-error">{error}</span>}
      </div>
    );
  }

  if (dt === 'color') {
    return (
      <div className="form-group">
        <label className="as-label">
          {label}{setting.isRequired && <span className="as-required">*</span>}
        </label>
        {setting.description && <span className="as-hint">{setting.description}</span>}
        <div className="as-color-row">
          <input
            type="color"
            id={id}
            className="as-color-input"
            value={value || '#000000'}
            onChange={e => onChange(e.target.value)}
          />
          <span className="as-color-hex">{value || '#000000'}</span>
        </div>
        {error && <span className="as-field-error">{error}</span>}
      </div>
    );
  }

  const typeMap = {
    number: 'tel', integer: 'tel', decimal: 'tel',
    email: 'email', url: 'url', password: 'password',
    date: 'date', datetime: 'datetime-local',
  };

  return (
    <div className="form-group">
      <TextBox
        {...common}
        id={id}
        type={typeMap[dt] || 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={setting.placeholder || `Enter ${label.toLowerCase()}...`}
        min={setting.min}
        max={setting.max}
      />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
function AdminSettings() {
  const { success, error: showError } = useNotification();

  const [allSettings, setAllSettings] = useState([]);
  const [groups, setGroups] = useState([]);
  const [values, setValues] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminSettings();
      if (res.success && res.data) {
        const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
        setAllSettings(list);
        setGroups([...new Set(list.map(s => s.group || s.category || 'General'))]);
        const initial = {};
        list.forEach(s => { initial[s.id] = castValue(s.dataType, s.value); });
        setValues(initial);
        setIsDirty(false);
        setErrors({});
      } else {
        showError(res.message || 'Failed to load settings');
      }
    } catch (e) {
      showError(e.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (setting, val) => {
    setValues(prev => ({ ...prev, [setting.id]: val }));
    setIsDirty(true);
    if (errors[setting.id]) setErrors(prev => ({ ...prev, [setting.id]: '' }));
  };

  const handleSave = async () => {
    const errs = {};
    allSettings.forEach(s => {
      const val = values[s.id];
      if (s.isRequired && (val === '' || val === null || val === undefined))
        errs[s.id] = `${s.name} is required`;
    });
    if (Object.keys(errs).length) {
      setErrors(errs);
      showError('Please fix the highlighted fields');
      return;
    }

    setSaving(true);
    try {
      const payload = allSettings.map(s => ({
        id: s.id,
        value: serializeValue(s.dataType, values[s.id]),
      }));

      let res;
      try {
        res = await bulkUpdateAdminSettings(payload);
      } catch {
        const results = await Promise.all(
          allSettings.map(s =>
            updateAdminSetting(s.id, { value: serializeValue(s.dataType, values[s.id]) })
          )
        );
        res = {
          success: results.every(r => r.success),
          message: results.find(r => !r.success)?.message,
        };
      }

      if (res.success) {
        success('Settings saved successfully');
        setIsDirty(false);
      } else {
        showError(res.message || 'Save failed');
      }
    } catch (e) {
      showError(e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-page">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="as-header-title">
          <h2>Settings</h2>
          {isDirty && (
            <span className="as-unsaved-badge">
              <FiAlertCircle size={12} /> Unsaved changes
            </span>
          )}
        </div>
        <div className="as-header-actions">
          <Button
            variant="ghost"
            icon={<FiRefreshCw />}
            onClick={fetchSettings}
            loading={loading}
            disabled={loading || saving}
            title="Reload"
          />
          <Button
            variant="primary"
            icon={<FiSave />}
            onClick={handleSave}
            loading={saving}
            disabled={saving || !isDirty}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────── */}
      {loading && allSettings.length === 0 ? (
        <div className="as-state-center">
          <FiLoader className="as-spin" size={28} />
          <p>Loading settings…</p>
        </div>
      ) : allSettings.length === 0 ? (
        <div className="as-state-center">
          <p>No settings available.</p>
        </div>
      ) : (
        <div className="settings-container">
          {groups.map(group => {
            const groupSettings = allSettings.filter(
              s => (s.group || s.category || 'General') === group
            );
            return (
              <div key={group} className="settings-section">
                <h3>{group}</h3>
                <div className="as-fields-grid">
                  {groupSettings.map(setting => (
                    <SettingControl
                      key={setting.id}
                      setting={setting}
                      value={values[setting.id] ?? ''}
                      onChange={val => handleChange(setting, val)}
                      error={errors[setting.id]}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminSettings;
