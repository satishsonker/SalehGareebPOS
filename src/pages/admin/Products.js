import React, { useState } from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiPlus } from 'react-icons/fi';
import DataGrid from '../../components/DataGrid';
import './AdminPages.css';

function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: 'Laptop Pro 15', category: 'Electronics', price: 1299.99, stock: 45, status: 'Active' },
    { id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 29.99, stock: 120, status: 'Active' },
    { id: 3, name: 'Mechanical Keyboard', category: 'Electronics', price: 149.99, stock: 80, status: 'Active' },
    { id: 4, name: 'Gaming Chair', category: 'Furniture', price: 299.99, stock: 25, status: 'Active' },
    { id: 5, name: 'USB-C Cable', category: 'Accessories', price: 19.99, stock: 200, status: 'Active' },
    { id: 6, name: 'Monitor 27"', category: 'Electronics', price: 399.99, stock: 30, status: 'Active' },
    { id: 7, name: 'Webcam HD', category: 'Electronics', price: 79.99, stock: 60, status: 'Active' },
    { id: 8, name: 'Desk Lamp', category: 'Furniture', price: 49.99, stock: 90, status: 'Active' },
  ]);

  const [loading, setLoading] = useState(false);

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      align: 'center',
    },
    {
      key: 'name',
      header: 'Product Name',
    },
    {
      key: 'category',
      header: 'Category',
    },
    {
      key: 'price',
      header: 'Price',
      format: (value) => `$${value.toFixed(2)}`,
      align: 'right',
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'center',
      render: (value) => (
        <span style={{
          color: value < 50 ? 'var(--danger-color)' : value < 100 ? '#f39c12' : 'var(--text-primary)',
          fontWeight: value < 50 ? 'bold' : 'normal'
        }}>
          {value}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      render: (value) => (
        <span style={{
          padding: '0.25rem 0.75rem',
          borderRadius: '12px',
          fontSize: '0.85rem',
          backgroundColor: value === 'Active' ? '#d4edda' : '#f8d7da',
          color: value === 'Active' ? '#155724' : '#721c24',
        }}>
          {value}
        </span>
      ),
    },
  ];

  const handleReload = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Products reloaded');
      setLoading(false);
    }, 1000);
  };

  const handleAction = (action, row) => {
    switch (action) {
      case 'view':
        alert(`Viewing product: ${row.name}\nPrice: $${row.price}\nStock: ${row.stock}`);
        break;
      case 'edit':
        alert(`Editing product: ${row.name}`);
        // In real app: open edit modal or navigate to edit page
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete "${row.name}"?`)) {
          setProducts(products.filter(item => item.id !== row.id));
        }
        break;
      default:
        break;
    }
  };

  const handleAddProduct = () => {
    alert('Add new product functionality');
    // In real app: open add product modal or navigate to add page
  };

  const handleExport = () => {
    alert('Export products to CSV/Excel');
    // In real app: implement export functionality
  };

  const handleFilter = () => {
    alert('Open filter options');
    // In real app: open filter modal
  };

  // Custom toolbar with button group (icon-only with tooltips)
  const customToolbar = (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
        <div className="toolbar-button-group">
          <button
            className="toolbar-button"
            onClick={handleFilter}
            title="Filter products"
            aria-label="Filter products"
          >
            <FiFilter />
          </button>
          <button
            className="toolbar-button"
            onClick={handleExport}
            title="Export products to CSV/Excel"
            aria-label="Export products"
          >
            <FiDownload />
          </button>
          <button
            className="toolbar-button reload-button"
            onClick={handleReload}
            disabled={loading}
            title="Reload products list"
            aria-label="Reload products"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </button>
          <button
            className="toolbar-button primary-button"
            onClick={handleAddProduct}
            title="Add new product"
            aria-label="Add new product"
          >
            <FiPlus />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="admin-page">
      <div className="page-header">
        <h2>Products Management</h2>
      </div>
      <DataGrid
        data={products}
        columns={columns}
        onAction={handleAction}
        onReload={handleReload}
        loading={loading}
        pageSize={5}
        searchPlaceholder="Search products by name, category..."
        emptyMessage="No products found"
        actionButtons={{
          view: true,
          edit: true,
          delete: true,
        }}
        toolbar={customToolbar}
      />
    </div>
  );
}

export default Products;
