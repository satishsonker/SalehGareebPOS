import React, { useState, useEffect, useCallback } from 'react';
import {
  FiX, FiInfo, FiAlertTriangle, FiAlertCircle,
  FiCheckCircle, FiBell,
} from 'react-icons/fi';
import { getActiveSystemNotifications } from '../../services/api/systemNotificationApi';
import './SystemNotificationBanner.css';

const DISMISSED_KEY = 'sn_dismissed';

// How often to re-check for new/expired notifications (ms)
const POLL_INTERVAL = 60_000;

function getDismissed() {
  try { return new Set(JSON.parse(sessionStorage.getItem(DISMISSED_KEY) || '[]')); }
  catch { return new Set(); }
}

function saveDismissed(set) {
  try { sessionStorage.setItem(DISMISSED_KEY, JSON.stringify([...set])); }
  catch { /* ignore */ }
}

const TYPE_CONFIG = {
  Info:         { icon: FiInfo,          cls: 'snb--info' },
  Warning:      { icon: FiAlertTriangle, cls: 'snb--warning' },
  Error:        { icon: FiAlertCircle,   cls: 'snb--error' },
  Success:      { icon: FiCheckCircle,   cls: 'snb--success' },
  Announcement: { icon: FiBell,          cls: 'snb--announcement' },
};

function isWithinSchedule(n) {
  const now = Date.now();

  // Must be active
  if (n.isActive === false) return false;

  // If scheduledAt set, must have passed
  if (n.scheduledAt && new Date(n.scheduledAt).getTime() > now) return false;

  // If validTo / sentAt used as end boundary — check expiry
  const end = n.validTo || n.expiresAt || null;
  if (end && new Date(end).getTime() < now) return false;

  return true;
}

function SystemNotificationBanner() {
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed]         = useState(getDismissed);

  const fetchActive = useCallback(async () => {
    try {
      const res = await getActiveSystemNotifications();
      if (res.success) {
        const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        // Client-side schedule filter as safety net
        setNotifications(list.filter(isWithinSchedule));
      }
    } catch {
      // Silently fail — banner is non-critical
    }
  }, []);

  // Initial fetch + polling
  useEffect(() => {
    fetchActive();
    const timer = setInterval(fetchActive, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchActive]);

  const dismiss = (id) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(next);
  };

  // Non-dismissible notifications always show; dismissible ones respect sessionStorage
  const visible = notifications.filter(n => n.isDismissible === false || !dismissed.has(n.id));
  if (visible.length === 0) return null;

  return (
    <div className="snb-stack" role="region" aria-label="System notifications">
      {visible.map(n => {
        const cfg = TYPE_CONFIG[n.notificationType] || TYPE_CONFIG.Info;
        const Icon = cfg.icon;
        const canDismiss = n.isDismissible !== false;
        return (
          <div key={n.id} className={`snb-banner ${cfg.cls}`} role="alert">
            <span className="snb-icon"><Icon size={16} /></span>
            <div className="snb-body">
              {n.title && <span className="snb-title">{n.title}</span>}
              {n.message && <span className="snb-message">{n.message}</span>}
            </div>
            {canDismiss && (
              <button
                className="snb-close"
                onClick={() => dismiss(n.id)}
                aria-label="Dismiss notification"
              >
                <FiX size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default SystemNotificationBanner;
