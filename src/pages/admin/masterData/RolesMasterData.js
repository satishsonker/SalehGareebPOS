import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiPlus } from 'react-icons/fi';
import DataGrid from '../../../components/DataGrid';
import { getRoles, createRole, updateRole, deleteRole } from '../../../services/api/adminApi';

function RolesMasterData() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await getRoles();
      if (response.success && response.data) {
        setRoles(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      alert('Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchRoles();
  };

  const handleAddRole = () => {
    // TODO: Open add role modal
    alert('Add Role functionality - Open modal to add new role');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export roles to CSV/Excel');
  };

  const handleFilter = () => {
    // TODO: Open filter modal
    alert('Filter roles');
  };

  const handleAction = async (action, row) => {
    switch (action) {
      case 'view':
        alert(`View Role: ${row.name}\nCode: ${row.code}\nDescription: ${row.description || 'N/A'}\nIs Admin: ${row.isAdmin ? 'Yes' : 'No'}`);
        break;
      case 'edit':
        // TODO: Open edit modal
        alert(`Edit Role: ${row.name}`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete role "${row.name}"?`)) {
          try {
            const response = await deleteRole(row.id);
            if (response.success) {
              alert('Role deleted successfully');
              fetchRoles(); // Reload roles
            } else {
              alert(response.message || 'Failed to delete role');
            }
          } catch (error) {
            console.error('Failed to delete role:', error);
            alert('Failed to delete role. Please try again.');
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
      header: 'Role Name',
    },
    {
      key: 'code',
      header: 'Code',
      width: '120px',
    },
    {
      key: 'description',
      header: 'Description',
    },
    {
      key: 'isAdmin',
      header: 'Is Admin',
      width: '100px',
      align: 'center',
      render: (value) => (value ? 'Yes' : 'No'),
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
            title="Filter roles"
            aria-label="Filter"
          >
            <FiFilter />
          </button>
          <button
            className="toolbar-button"
            onClick={handleExport}
            title="Export roles to CSV/Excel"
            aria-label="Export"
          >
            <FiDownload />
          </button>
          <button
            className="toolbar-button reload-button"
            onClick={handleReload}
            disabled={loading}
            title="Reload roles list"
            aria-label="Reload"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </button>
          <button
            className="toolbar-button primary-button"
            onClick={handleAddRole}
            title="Add new role"
            aria-label="Add new"
          >
            <FiPlus />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="roles-master-data">
      <DataGrid
        data={roles}
        columns={columns}
        onAction={handleAction}
        loading={loading}
        pageSize={10}
        searchPlaceholder="Search roles by name, code, description..."
        emptyMessage="No roles found"
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

export default RolesMasterData;
