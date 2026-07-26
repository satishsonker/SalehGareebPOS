import React, { useState, useEffect, useCallback } from 'react';
import {
  FiRefreshCw, FiZap, FiServer, FiLayers,
} from 'react-icons/fi';
import Button from '../../components/Button/Button';
import { useNotification } from '../../components/Notification';
import {
  getCacheActions, triggerCache, triggerAllCache, triggerCacheByGroup,
} from '../../services/api/cacheApi';
import './CacheManagement.css';

function CacheManagement() {
  const { success, error: showError } = useNotification();

  const [actions, setActions]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [triggering, setTriggering] = useState(null); // key or 'all' or 'group:X'

  // ── Fetch ────────────────────────────────────────────────────────
  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCacheActions();
      const data = Array.isArray(res) ? res : (res?.data || res?.items || []);
      setActions(data);
    } catch (e) {
      showError(e.message || 'Failed to load cache actions');
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => { fetchActions(); }, [fetchActions]);

  // ── Trigger one ──────────────────────────────────────────────────
  const handleTrigger = async (action) => {
    setTriggering(action.key);
    try {
      await triggerCache(action.key);
      success(`"${action.displayName}" refreshed`);
    } catch (e) {
      showError(e.message || 'Trigger failed');
    } finally {
      setTriggering(null);
    }
  };

  // ── Trigger group ────────────────────────────────────────────────
  const handleTriggerGroup = async (group) => {
    setTriggering(`group:${group}`);
    try {
      await triggerCacheByGroup(group);
      success(`Group "${group}" refreshed`);
    } catch (e) {
      showError(e.message || 'Trigger group failed');
    } finally {
      setTriggering(null);
    }
  };

  // ── Trigger all ──────────────────────────────────────────────────
  const handleTriggerAll = async () => {
    setTriggering('all');
    try {
      await triggerAllCache();
      success('All cache actions triggered');
    } catch (e) {
      showError(e.message || 'Trigger all failed');
    } finally {
      setTriggering(null);
    }
  };

  // ── Group actions ────────────────────────────────────────────────
  const groups = [...new Set(actions.map(a => a.group || 'General'))];

  const isBusy = triggering !== null || loading;

  return (
    <div className="admin-page">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <FiServer className="page-icon" />
          <h2>Cache Management</h2>
        </div>
        <div className="cm-header-actions">
          <Button
            variant="ghost"
            icon={<FiRefreshCw className={loading ? 'cm-spin' : ''} />}
            onClick={fetchActions}
            disabled={isBusy}
            title="Reload actions"
          />
          <Button
            variant="primary"
            icon={<FiZap />}
            onClick={handleTriggerAll}
            loading={triggering === 'all'}
            disabled={isBusy || actions.length === 0}
            title="Trigger all cache refreshes"
          >
            Trigger All
          </Button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      {loading ? (
        <div className="cm-empty">
          <FiRefreshCw className="cm-spin" size={24} />
          <span>Loading…</span>
        </div>
      ) : actions.length === 0 ? (
        <div className="cm-empty">
          <FiServer size={32} />
          <span>No cache actions registered.</span>
        </div>
      ) : (
        groups.map(group => {
          const groupActions = actions.filter(a => (a.group || 'General') === group);
          const isGroupTriggering = triggering === `group:${group}`;
          return (
            <div key={group} className="cm-group-section">
              <div className="cm-group-header">
                <div className="cm-group-title">
                  <FiLayers size={15} />
                  <span>{group}</span>
                  <span className="cm-group-count">{groupActions.length}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<FiZap />}
                  onClick={() => handleTriggerGroup(group)}
                  loading={isGroupTriggering}
                  disabled={isBusy}
                  title={`Trigger all in "${group}"`}
                >
                  Trigger Group
                </Button>
              </div>

              <div className="cm-table-wrap">
                <table className="cm-table">
                  <thead>
                    <tr>
                      <th>Display Name</th>
                      <th>Service</th>
                      <th>Method</th>
                      <th className="cm-actions-col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groupActions.map(action => {
                      const isTriggering = triggering === action.key;
                      return (
                        <tr key={action.key}>
                          <td className="cm-display-name">{action.displayName}</td>
                          <td><span className="cm-service-badge">{action.service}</span></td>
                          <td><span className="cm-method-cell">{action.method}</span></td>
                          <td className="cm-actions-cell">
                            <button
                              className={`cm-action-btn cm-action-btn--trigger${isTriggering ? ' cm-action-btn--loading' : ''}`}
                              onClick={() => handleTrigger(action)}
                              disabled={isBusy}
                              title="Trigger this cache refresh"
                            >
                              {isTriggering
                                ? <FiRefreshCw size={13} className="cm-spin" />
                                : <FiZap size={13} />}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default CacheManagement;
