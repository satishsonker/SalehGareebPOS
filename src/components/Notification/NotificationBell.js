import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FiBell, FiCheckCircle, FiAlertCircle, FiAlertTriangle,
  FiInfo, FiCheck, FiX, FiRefreshCw, FiActivity,
  FiLink, FiUser, FiMonitor, FiShield
} from 'react-icons/fi';
import { useNotification } from './NotificationContext';
import { useAuth } from '../../contexts/AuthContext';
import { getUserActivities } from '../../services/api/notificationApi';
import './NotificationBell.css';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 5)     return 'just now';
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

const NOTIF_TYPE_META = {
  info:    { icon: <FiInfo />,           cls: 'info',    label: 'Info'    },
  warning: { icon: <FiAlertTriangle />,  cls: 'warning', label: 'Warning' },
  success: { icon: <FiCheckCircle />,    cls: 'success', label: 'Success' },
  alert:   { icon: <FiAlertCircle />,    cls: 'alert',   label: 'Alert'   },
};

function getNotifMeta(notificationType) {
  const key = (notificationType || 'info').toLowerCase();
  return NOTIF_TYPE_META[key] || NOTIF_TYPE_META.info;
}

const ACTIVITY_TYPE_LABELS = {
  passwordchange:      'Password Changed',
  login:               'Login',
  logout:              'Logout',
  failedlogin:         'Failed Login',
  otprequest:          'OTP Requested',
  otpverification:     'OTP Verified',
  accountlockout:      'Account Locked',
  accountunlock:       'Account Unlocked',
  profileupdate:       'Profile Updated',
  rolechange:          'Role Changed',
  passwordresetrequest:'Password Reset',
};

function getActivityLabel(activityType) {
  if (!activityType) return 'Activity';
  return ACTIVITY_TYPE_LABELS[activityType.toLowerCase().replace(/\s/g, '')] || activityType;
}

function getActivityIcon(activityType) {
  const key = (activityType || '').toLowerCase().replace(/\s/g, '');
  if (['login', 'logout', 'failedlogin', 'otprequest', 'otpverification', 'accountlockout', 'accountunlock'].includes(key))
    return <FiShield />;
  if (['profileupdate', 'passwordchange', 'passwordresetrequest', 'rolechange'].includes(key))
    return <FiUser />;
  return <FiMonitor />;
}

function NotificationBell({ dropdownAlign = 'right' }) {
  const {
    notifications, unreadCount, notifLoading, notifError,
    fetchNotifications, markAsRead, markAllAsRead, removeNotification,
  } = useNotification();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [activities, setActivities] = useState([]);
  const [actLoading, setActLoading] = useState(false);
  const [actError, setActError] = useState(null);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const [, tick] = useState(0);

  const btnRef   = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const id = setInterval(() => tick((v) => v + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        btnRef.current  && !btnRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const style = { top: rect.bottom + window.scrollY + 8 };
    if (dropdownAlign === 'right') style.right = window.innerWidth - rect.right;
    else                           style.left  = rect.left;
    setDropdownStyle(style);
  }, [open, dropdownAlign]);

  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  useEffect(() => {
    if (activeTab !== 'activities' || !open || !user?.userId) return;
    if (activities.length > 0) return;
    loadActivities();
  }, [activeTab, open, user?.userId]);

  const loadActivities = () => {
    if (!user?.userId) return;
    setActLoading(true);
    setActError(null);
    getUserActivities(user.userId)
      .then((res) => {
        setActivities(res?.data?.data ?? []);
      })
      .catch((err) => setActError(err.message || 'Failed to load activities'))
      .finally(() => setActLoading(false));
  };

  const handleRefreshActivities = () => {
    setActivities([]);
    loadActivities();
  };

  const handleMarkRead = (e, id) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleRemove = (e, id) => {
    e.stopPropagation();
    removeNotification(id);
  };

  const handleItemClick = (n) => {
    if (!n.isRead) markAsRead(n.id);
    if (n.link) window.open(n.link, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <button
        ref={btnRef}
        className={`nb-btn${open ? ' nb-btn--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        title="Notifications"
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ''}`}
      >
        <FiBell />
        {unreadCount > 0 && (
          <span className="nb-badge">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && createPortal(
        <div ref={panelRef} className="nb-panel" style={dropdownStyle}>
          <div className="nb-header">
            <span className="nb-header-title">
              Notifications
              {unreadCount > 0 && (
                <span className="nb-header-count">{unreadCount} new</span>
              )}
            </span>
            <div className="nb-header-actions">
              {activeTab === 'notifications' && (
                <>
                  {unreadCount > 0 && (
                    <button className="nb-text-btn" onClick={markAllAsRead} title="Mark all as read">Mark all</button>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="nb-tabs">
            <button className={`nb-tab${activeTab === 'notifications' ? ' active' : ''}`} onClick={() => setActiveTab('notifications')}>Notifications</button>
            <button className={`nb-tab${activeTab === 'activities' ? ' active' : ''}`} onClick={() => setActiveTab('activities')}>Activities</button>
          </div>

          <div className="nb-content">
            {activeTab === 'notifications' ? (
              <div className="nb-list">
                {notifLoading && <div className="nb-loading">Loading...</div>}
                {notifError && <div className="nb-error">{notifError}</div>}
                {notifications?.map(n => (
                  <div key={n.id} className={`nb-item ${n.isRead ? 'read' : 'unread'}`} onClick={() => handleItemClick(n)}>
                    <div className="nb-item-icon">{getNotifMeta(n.type).icon}</div>
                    <div className="nb-item-body">
                      <div className="nb-item-title">{n.title}</div>
                      <div className="nb-item-meta">{formatRelativeTime(n.createdAt)}</div>
                    </div>
                    <div className="nb-item-actions">
                      {!n.isRead && <button onClick={(e) => handleMarkRead(e, n.id)} title="Mark as read"><FiCheck /></button>}
                      <button onClick={(e) => handleRemove(e, n.id)} title="Remove"><FiX /></button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="nb-activities">
                {actLoading && <div className="nb-loading">Loading...</div>}
                {actError && <div className="nb-error">{actError}</div>}
                {activities.map(a => (
                  <div key={a.id} className="nb-activity">
                    <div className="nb-activity-icon">{getActivityIcon(a.activityType)}</div>
                    <div className="nb-activity-body">
                      <div className="nb-activity-title">{getActivityLabel(a.activityType)}</div>
                      <div className="nb-activity-meta">{formatRelativeTime(a.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

export default NotificationBell;
