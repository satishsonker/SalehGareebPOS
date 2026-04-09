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

// ── Helpers ───────────────────────────────────────────────────

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

// AppNotificationDto → notificationType: "Info"|"Warning"|"Success"|"Alert"
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

// EnumUserActivityType labels
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

// ── Component ─────────────────────────────────────────────────

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

  // Re-render timestamps every 30 s
  useEffect(() => {
    const id = setInterval(() => tick((v) => v + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Close panel on outside click
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

  // Position dropdown under the bell button
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const style = { top: rect.bottom + window.scrollY + 8 };
    if (dropdownAlign === 'right') style.right = window.innerWidth - rect.right;
    else                           style.left  = rect.left;
    setDropdownStyle(style);
  }, [open, dropdownAlign]);

  // Refresh notifications when panel opens
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Load activities when tab is first activated
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
        // Shape: ApiResponse<PagingResponseDto<UserActivityDto>>
        // res.data.data = UserActivityDto[]
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

  // ── Render ─────────────────────────────────────────────────

  return (
    <>
      {/* Bell button */}
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

      {/* Dropdown — rendered in body portal */}
      {open && createPortal(
        <div ref={panelRef} className="nb-panel" style={dropdownStyle}>

          {/* ── Header ──────────────────────────────────────── */}
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
                    <button className="nb-text-btn" onClick={markAllAsRead} title="Mark all as read">
                      <FiCheck /> All read
                    </button>
                  )}
                  <button
                    className="nb-text-btn"
                    onClick={fetchNotifications}
                    title="Refresh"
                    disabled={notifLoading}
                  >
                    <FiRefreshCw className={notifLoading ? 'nb-spin' : ''} />
                  </button>
                </>
              )}
              {activeTab === 'activities' && (
                <button
                  className="nb-text-btn"
                  onClick={handleRefreshActivities}
                  title="Refresh"
                  disabled={actLoading}
                >
                  <FiRefreshCw className={actLoading ? 'nb-spin' : ''} />
                </button>
              )}
            </div>
          </div>

          {/* ── Tabs ────────────────────────────────────────── */}
          <div className="nb-tabs">
            <button
              className={`nb-tab${activeTab === 'notifications' ? ' nb-tab--active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              <FiBell />
              Notifications
              {unreadCount > 0 && (
                <span className="nb-tab-badge">{unreadCount}</span>
              )}
            </button>
            <button
              className={`nb-tab${activeTab === 'activities' ? ' nb-tab--active' : ''}`}
              onClick={() => setActiveTab('activities')}
            >
              <FiActivity />
              Activity
            </button>
          </div>

          {/* ── Notifications tab ────────────────────────────── */}
          {activeTab === 'notifications' && (
            <div className="nb-list">
              {notifLoading && notifications.length === 0 && (
                <div className="nb-status">
                  <span className="nb-spinner" /> Loading...
                </div>
              )}
              {notifError && (
                <div className="nb-status nb-status--error">{notifError}</div>
              )}
              {!notifLoading && !notifError && notifications.length === 0 && (
                <div className="nb-empty">
                  <FiBell className="nb-empty-icon" />
                  <p>No notifications yet</p>
                </div>
              )}
              {notifications.map((n) => {
                // AppNotificationDto fields: id, title, message, isRead, notificationType, createdAt, link
                const meta = getNotifMeta(n.notificationType);
                return (
                  <div
                    key={n.id}
                    className={`nb-item nb-item--${meta.cls}${n.isRead ? ' nb-item--read' : ''}`}
                    onClick={() => handleItemClick(n)}
                  >
                    <span className="nb-item-icon">{meta.icon}</span>
                    <div className="nb-item-body">
                      {n.title && <p className="nb-item-title">{n.title}</p>}
                      <p className="nb-item-message">{n.message}</p>
                      <div className="nb-item-footer">
                        <span className="nb-item-time">{formatRelativeTime(n.createdAt)}</span>
                        {n.link && (
                          <span className="nb-item-link">
                            <FiLink /> View
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="nb-item-actions">
                      {!n.isRead && (
                        <button
                          className="nb-item-btn"
                          onClick={(e) => handleMarkRead(e, n.id)}
                          title="Mark as read"
                        >
                          <FiCheck />
                        </button>
                      )}
                      <button
                        className="nb-item-btn nb-item-btn--remove"
                        onClick={(e) => handleRemove(e, n.id)}
                        title="Delete"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Activities tab ───────────────────────────────── */}
          {activeTab === 'activities' && (
            <div className="nb-list">
              {actLoading && activities.length === 0 && (
                <div className="nb-status">
                  <span className="nb-spinner" /> Loading...
                </div>
              )}
              {actError && (
                <div className="nb-status nb-status--error">{actError}</div>
              )}
              {!actLoading && !actError && activities.length === 0 && (
                <div className="nb-empty">
                  <FiActivity className="nb-empty-icon" />
                  <p>No activity found</p>
                </div>
              )}
              {activities.map((a) => (
                // UserActivityDto: id, userId, userName, activityType, description,
                //                  entityName, entityId, ipAddress, timestamp
                <div key={a.id} className="nb-item nb-item--activity nb-item--read">
                  <span className="nb-item-icon nb-item-icon--activity">
                    {getActivityIcon(a.activityType)}
                  </span>
                  <div className="nb-item-body">
                    <p className="nb-item-title">{getActivityLabel(a.activityType)}</p>
                    {a.description && (
                      <p className="nb-item-message">{a.description}</p>
                    )}
                    <div className="nb-activity-meta">
                      {a.entityName && a.entityId && (
                        <span className="nb-activity-tag">
                          {a.entityName} #{a.entityId}
                        </span>
                      )}
                      {a.ipAddress && (
                        <span className="nb-activity-tag nb-activity-tag--ip">
                          <FiMonitor /> {a.ipAddress}
                        </span>
                      )}
                    </div>
                    <div className="nb-item-footer">
                      <span className="nb-item-time">{formatRelativeTime(a.timestamp)}</span>
                      {a.userName && (
                        <span className="nb-activity-user">
                          <FiUser /> {a.userName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>,
        document.body
      )}
    </>
  );
}

export default NotificationBell;
