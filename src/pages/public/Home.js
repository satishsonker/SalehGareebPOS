import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity, FiAlertCircle, FiArrowUpRight, FiCalendar,
  FiChevronRight, FiDollarSign, FiPackage,
  FiRefreshCw, FiShoppingBag, FiTrendingUp,
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { getAccessibleTiles } from '../../services/api/tileApiService';
import { getOrders } from '../../services/api/ordersApi';
import * as FiIcons from 'react-icons/fi';
import './Home.css';

const ORDER_LIMIT = 100;
const money = value => Number(value || 0).toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const statusOf = order => String(order?.statusStr ?? order?.status ?? 'Active').trim().toLowerCase();
const orderCode = order => Number(order?.statusCode ?? order?.statusId ?? (typeof order?.status === 'number' ? order.status : NaN));
const orderDate = order => {
  const date = new Date(order?.orderDate);
  return Number.isNaN(date.getTime()) ? null : date;
};
const dateKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const unwrap = response => {
  const envelope = response?.data && response.data.success !== undefined ? response.data : response;
  return envelope?.data ?? envelope ?? {};
};
const formatDate = value => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en-AE', { day: '2-digit', month: 'short', year: 'numeric' });
};
const titleCase = value => String(value || 'Active').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, letter => letter.toUpperCase());

function MetricCard({ icon: Icon, label, value, detail, tone, loading }) {
  return <article className={`dash-metric dash-metric--${tone}`}>
    <div className="dash-metric__top"><span>{label}</span><i><Icon /></i></div>
    {loading ? <span className="dash-skeleton dash-skeleton--metric" /> : <strong>{value}</strong>}
    <small>{detail}</small>
  </article>;
}

function Home() {
  const navigate = useNavigate();
  const { user, selectedShop } = useAuth();
  const [tiles, setTiles] = useState([]);
  const [orders, setOrders] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const firstName = user?.firstName || user?.username || 'there';
  const today = new Date();
  const todayKey = dateKey(today);
  const greeting = today.getHours() < 12 ? 'Good morning' : today.getHours() < 17 ? 'Good afternoon' : 'Good evening';

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    const [ordersResult, tilesResult] = await Promise.allSettled([
      getOrders(1, ORDER_LIMIT, ''),
      getAccessibleTiles(),
    ]);

    if (ordersResult.status === 'fulfilled') {
      const payload = unwrap(ordersResult.value);
      setOrders(Array.isArray(payload.data) ? payload.data : []);
      setTotalRecords(Number(payload.totalRecords || 0));
    } else {
      setOrders([]);
      setTotalRecords(0);
      setError(ordersResult.reason?.message || 'Could not load order activity.');
    }

    if (tilesResult.status === 'fulfilled') {
      const payload = unwrap(tilesResult.value);
      setTiles(Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : []);
    } else if (ordersResult.status === 'fulfilled') {
      setTiles([]);
      setError(tilesResult.reason?.message || 'Could not load your shop tile permissions.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const shop = selectedShop || (() => {
      try { return JSON.parse(localStorage.getItem('selectedShop') || sessionStorage.getItem('selectedShop') || 'null'); }
      catch { return null; }
    })();
    if (!shop?.id) {
      navigate('/shop-selection', { replace: true });
      return;
    }
    loadDashboard();
  }, [loadDashboard, navigate, refreshKey, selectedShop]);

  const stats = useMemo(() => {
    const todayDate = new Date(`${todayKey}T00:00:00`);
    const sorted = [...orders].sort((a, b) => (orderDate(b)?.getTime() || 0) - (orderDate(a)?.getTime() || 0));
    const todaysOrders = orders.filter(order => {
      const date = orderDate(order);
      return date && dateKey(date) === todayKey;
    });
    const openOrders = orders.filter(order => {
      const code = orderCode(order);
      const status = statusOf(order);
      return ![6, 8, 9].includes(code) && !['delivered', 'cancelled', 'canceled', 'deleted'].includes(status);
    });
    const receivables = orders.reduce((total, order) => total + Math.max(0, Number(order.balanceDue ?? order.balanceAmount ?? 0)), 0);
    const todayValue = todaysOrders.reduce((total, order) => total + Number(order.totalInvoiced ?? order.totalAmount ?? 0), 0);
    const nextWeek = new Date(todayDate);
    nextWeek.setDate(todayDate.getDate() + 7);
    const dueSoon = orders.filter(order => {
      const delivery = order?.deliveryDate ? new Date(order.deliveryDate) : null;
      const status = statusOf(order);
      return delivery && !Number.isNaN(delivery.getTime()) && delivery >= todayDate && delivery <= nextWeek && !['delivered', 'cancelled', 'canceled', 'deleted'].includes(status);
    });
    const trend = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(todayDate);
      date.setDate(todayDate.getDate() - (6 - index));
      const key = dateKey(date);
      const dayOrders = orders.filter(order => {
        const created = orderDate(order);
        return created && dateKey(created) === key;
      });
      return { key, label: date.toLocaleDateString('en', { weekday: 'short' }), count: dayOrders.length, amount: dayOrders.reduce((sum, order) => sum + Number(order.totalInvoiced ?? order.totalAmount ?? 0), 0) };
    });
    const trendMax = Math.max(1, ...trend.map(day => day.count));
    const pipeline = [
      { label: 'Active', codes: [1], names: ['active'], tone: 'blue' },
      { label: 'In progress', codes: [2, 4], names: ['processing', 'packing'], tone: 'amber' },
      { label: 'Completed', codes: [3], names: ['completed'], tone: 'green' },
      { label: 'Delivered', codes: [6], names: ['delivered'], tone: 'slate' },
    ].map(stage => ({ ...stage, count: orders.filter(order => stage.codes.includes(orderCode(order)) || stage.names.includes(statusOf(order))).length }));
    return { sorted, todaysOrders, openOrders, receivables, todayValue, dueSoon, trend, trendMax, pipeline };
  }, [orders, todayKey]);

  const actions = tiles.map((tile, index) => ({ ...tile, Icon: FiIcons[tile.icon] || FiShoppingBag, tone: ['blue', 'violet', 'green', 'amber', 'rose'][index % 5] }));

  return <div className="home-root">
    <section className="dash-welcome">
      <div>
        <div className="dash-eyebrow"><span className="dash-live-dot" /> POINT OF SALE</div>
        <h1>{greeting}, {firstName}</h1>
        <p>{today.toLocaleDateString('en-AE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} <span>·</span> Your shop at a glance</p>
        </div>
      <div className="dash-welcome__right">
        <div className="dash-shop"><span>Current shop</span><strong>{selectedShop?.shopName || selectedShop?.name || 'Selected shop'}</strong></div>
        <button type="button" className="dash-refresh" onClick={() => setRefreshKey(key => key + 1)} disabled={loading} aria-label="Refresh dashboard"><FiRefreshCw className={loading ? 'is-spinning' : ''} /></button>
      </div>
    </section>

    {error && <div className="dash-error"><FiAlertCircle /><span>{error}</span><button type="button" onClick={() => setRefreshKey(key => key + 1)}>Try again</button></div>}

    <section className="dash-metrics" aria-label="Shop overview">
      <MetricCard icon={FiShoppingBag} label="Orders today" value={stats.todaysOrders.length} detail={`AED ${money(stats.todayValue)} order value`} tone="blue" loading={loading} />
      <MetricCard icon={FiActivity} label="Open orders" value={stats.openOrders.length} detail="Orders still being handled" tone="violet" loading={loading} />
      <MetricCard icon={FiDollarSign} label="Receivables" value={`AED ${money(stats.receivables)}`} detail="Outstanding balance in recent orders" tone="green" loading={loading} />
      <MetricCard icon={FiCalendar} label="Due this week" value={stats.dueSoon.length} detail="Orders with delivery dates in 7 days" tone="amber" loading={loading} />
    </section>

    <section className="dash-actions-section">
      <div className="dash-section-heading"><div><h2>Quick actions</h2><p>Jump into your daily POS tasks</p></div><span>{actions.length} shortcuts</span></div>
      <div className="dash-actions">
        {actions.map((action, index) => {
          const Icon = action.Icon || FiShoppingBag;
          return <button type="button" key={action.id || action.path || action.label || index} className={`dash-action dash-action--${action.tone || 'blue'}`} onClick={() => action.path && navigate(action.path)} disabled={!action.path}>
            <span className="dash-action__icon"><Icon /></span><span className="dash-action__copy"><strong>{action.label || action.title}</strong><small>{action.subtitle || 'Open workspace'}</small></span><FiArrowUpRight className="dash-action__arrow" />
          </button>;
        })}
      </div>
      {!loading && actions.length === 0 && <p className="dash-data-note">No tiles are assigned to your account for this shop. Ask an administrator to grant access.</p>}
    </section>

    <div className="dash-lower-grid">
      <section className="dash-panel dash-trend-panel">
        <div className="dash-section-heading"><div><h2>Order activity</h2><p>Orders created over the last 7 days</p></div><span className="dash-panel__badge"><FiTrendingUp /> 7 days</span></div>
        {loading ? <div className="dash-chart-loading"><span className="dash-skeleton" /><span className="dash-skeleton" /><span className="dash-skeleton" /></div> : <div className="dash-chart" role="img" aria-label="Order count by day for the last seven days">
          {stats.trend.map(day => <div className="dash-chart__day" key={day.key} title={`${day.count} orders · AED ${money(day.amount)}`}><strong>{day.count}</strong><div className="dash-chart__track"><i style={{ height: `${Math.max(day.count ? 12 : 4, (day.count / stats.trendMax) * 100)}%` }} /></div><span>{day.label}</span></div>)}
        </div>}
        <div className="dash-pipeline-heading"><strong>Order pipeline</strong><span>{totalRecords.toLocaleString()} total orders</span></div>
        <div className="dash-pipeline">{stats.pipeline.map(stage => <div className="dash-pipeline__item" key={stage.label}><span><i className={`dash-pipeline__dot dash-pipeline__dot--${stage.tone}`} />{stage.label}</span><strong>{loading ? '—' : stage.count}</strong></div>)}</div>
      </section>

      <section className="dash-panel dash-recent-panel">
        <div className="dash-section-heading"><div><h2>Recent orders</h2><p>Latest customer activity</p></div><button type="button" className="dash-text-link" onClick={() => navigate('/orders/search')}>View all <FiChevronRight /></button></div>
        {loading ? <div className="dash-recent-loading"><span className="dash-skeleton" /><span className="dash-skeleton" /><span className="dash-skeleton" /></div> : stats.sorted.length ? <div className="dash-recent-list">
          {stats.sorted.slice(0, 6).map(order => {
            const status = statusOf(order);
            const canceled = ['cancelled', 'canceled'].includes(status) || orderCode(order) === 8;
            return <button type="button" className="dash-recent-row" key={order.id} onClick={() => navigate('/orders/search')}>
              <span className={`dash-recent-row__icon ${canceled ? 'is-cancelled' : ''}`}><FiPackage /></span>
              <span className="dash-recent-row__main"><strong>#{order.orderNo || order.id}</strong><small>{order.customerName || 'Customer'} · {formatDate(order.orderDate)}</small></span>
              <span className="dash-recent-row__amount"><strong>AED {money(order.totalInvoiced ?? order.totalAmount)}</strong><small className={canceled ? 'is-cancelled' : ''}>{titleCase(status)}</small></span>
              <FiChevronRight className="dash-recent-row__chevron" />
            </button>;
          })}
        </div> : <div className="dash-empty"><FiPackage /><span>No order activity yet.</span><button type="button" onClick={() => navigate('/orders/create')}>Create the first order <FiChevronRight /></button></div>}
      </section>
    </div>

    {!loading && totalRecords > orders.length && <p className="dash-data-note">Dashboard activity summarizes the latest {orders.length.toLocaleString()} orders.</p>}
  </div>;
}

export default Home;
