import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiPlus } from 'react-icons/fi';
import DataGrid from '../../../components/DataGrid';
import { getShops, createShop, updateShop, deleteShop } from '../../../services/api/adminApi';

function ShopsMasterData() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch shops on component mount
  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await getShops();
      if (response.success && response.data) {
        setShops(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
      alert('Failed to load shops. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchShops();
  };

  const handleAddShop = () => {
    // TODO: Open add shop modal
    alert('Add Shop functionality - Open modal to add new shop');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export shops to CSV/Excel');
  };

  const handleFilter = () => {
    // TODO: Open filter modal
    alert('Filter shops');
  };

  const handleAction = async (action, row) => {
    switch (action) {
      case 'view':
        alert(`View Shop: ${row.name}\nCode: ${row.code}\nAddress: ${row.address}\nPhone: ${row.phone}\nEmail: ${row.email}`);
        break;
      case 'edit':
        // TODO: Open edit modal
        alert(`Edit Shop: ${row.name}`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete shop "${row.name}"?`)) {
          try {
            const response = await deleteShop(row.id);
            if (response.success) {
              alert('Shop deleted successfully');
              fetchShops(); // Reload shops
            } else {
              alert(response.message || 'Failed to delete shop');
            }
          } catch (error) {
            console.error('Failed to delete shop:', error);
            alert('Failed to delete shop. Please try again.');
          }
        }
        break;
      default:
        break;
    }
  };

  const columns = [
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      align: 'center',
    },
    {
      key: 'name',
      header: 'Shop Name',
    },
    {
      key: 'code',
      header: 'Code',
      width: '120px',
    },
    {
      key: 'address',
      header: 'Address',
    },
    {
      key: 'phone',
      header: 'Phone',
      width: '150px',
    },
    {
      key: 'email',
      header: 'Email',
    },
    {
      key: 'trn',
      header: 'TRN',
      width: '120px',
    },
  ];

  // Custom toolbar with button group
  const customToolbar = (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
        <div className="toolbar-button-group">
          <button
            className="toolbar-button"
            onClick={handleFilter}
            title="Filter shops"
            aria-label="Filter"
          >
            <FiFilter />
          </button>
          <button
            className="toolbar-button"
            onClick={handleExport}
            title="Export shops to CSV/Excel"
            aria-label="Export"
          >
            <FiDownload />
          </button>
          <button
            className="toolbar-button reload-button"
            onClick={handleReload}
            disabled={loading}
            title="Reload shops list"
            aria-label="Reload"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </button>
          <button
            className="toolbar-button primary-button"
            onClick={handleAddShop}
            title="Add new shop"
            aria-label="Add new"
          >
            <FiPlus />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="shops-master-data">
      <DataGrid
        data={shops}
        columns={columns}
        onAction={handleAction}
        loading={loading}
        pageSize={10}
        searchPlaceholder="Search shops by name, code, address..."
        emptyMessage="No shops found"
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

export default ShopsMasterData;
