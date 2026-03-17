import React, { useState } from 'react';
import DataGrid from '../../components/DataGrid';
import './AdminPages.css';

function Orders() {
  const [orders, setOrders] = useState([
    { id: 1, orderId: '#ORD-001', customer: 'John Doe', date: '2024-01-15', total: 299.97, status: 'Completed' },
    { id: 2, orderId: '#ORD-002', customer: 'Jane Smith', date: '2024-01-15', total: 149.98, status: 'Pending' },
    { id: 3, orderId: '#ORD-003', customer: 'Bob Johnson', date: '2024-01-14', total: 89.99, status: 'Completed' },
    { id: 4, orderId: '#ORD-004', customer: 'Alice Brown', date: '2024-01-13', total: 459.99, status: 'Shipped' },
    { id: 5, orderId: '#ORD-005', customer: 'Charlie Wilson', date: '2024-01-12', total: 199.99, status: 'Pending' },
    { id: 6, orderId: '#ORD-006', customer: 'Diana Prince', date: '2024-01-11', total: 349.99, status: 'Completed' },
  ]);

  const [loading, setLoading] = useState(false);

  const columns = [
    {
      key: 'orderId',
      header: 'Order ID',
      width: '120px',
    },
    {
      key: 'customer',
      header: 'Customer',
    },
    {
      key: 'date',
      header: 'Date',
      width: '120px',
    },
    {
      key: 'total',
      header: 'Total',
      format: (value) => `$${value.toFixed(2)}`,
      align: 'right',
      width: '120px',
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      width: '120px',
      render: (value) => {
        const statusConfig = {
          'Completed': { bg: '#d4edda', color: '#155724' },
          'Pending': { bg: '#fff3cd', color: '#856404' },
          'Shipped': { bg: '#d1ecf1', color: '#0c5460' },
          'Cancelled': { bg: '#f8d7da', color: '#721c24' },
        };
        const config = statusConfig[value] || statusConfig['Pending'];
        return (
          <span style={{
            padding: '0.25rem 0.75rem',
            borderRadius: '12px',
            fontSize: '0.85rem',
            fontWeight: 500,
            backgroundColor: config.bg,
            color: config.color,
          }}>
            {value}
          </span>
        );
      },
    },
  ];

  const handleReload = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Orders reloaded');
      setLoading(false);
    }, 1000);
  };

  const handleAction = (action, row) => {
    switch (action) {
      case 'view':
        alert(`Viewing order: ${row.orderId}\nCustomer: ${row.customer}\nTotal: $${row.total}\nStatus: ${row.status}`);
        break;
      case 'edit':
        alert(`Editing order: ${row.orderId}`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete order ${row.orderId}?`)) {
          setOrders(orders.filter(item => item.id !== row.id));
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Orders Management</h2>
      </div>
      <DataGrid
        data={orders}
        columns={columns}
        onReload={handleReload}
        onAction={handleAction}
        loading={loading}
        pageSize={5}
        searchPlaceholder="Search orders by ID, customer..."
        emptyMessage="No orders found"
        actionButtons={{
          view: true,
          edit: false,
          delete: true,
        }}
      />
    </div>
  );
}

export default Orders;
