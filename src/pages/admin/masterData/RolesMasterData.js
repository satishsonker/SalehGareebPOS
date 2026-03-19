import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiPlus, FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import DataGrid from '../../../components/DataGrid';
import Button from '../../../components/Button/Button';
import { getRoles, createRole, updateRole, deleteRole } from '../../../services/api/roleApi';

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
        <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem', backgroundColor: 'var(--bg-primary)' }}>
          <Button
            variant="ghost"
            icon={<FiFilter />}
            onClick={handleFilter}
            title="Filter roles"
            aria-label="Filter"
          />
          <Button
            variant="ghost"
            icon={<FiDownload />}
            onClick={handleExport}
            title="Export roles to CSV/Excel"
            aria-label="Export"
          />
          <Button
            variant="ghost"
            icon={<FiRefreshCw />}
            onClick={handleReload}
            disabled={loading}
            loading={loading}
            title="Reload roles list"
            aria-label="Reload"
          />
        </div>
        <Button
          variant="primary"
          icon={<FiPlus />}
          onClick={handleAddRole}
          title="Add new role"
          aria-label="Add new"
        >
          Add Role
        </Button>
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
        defaultActions={{
          view: true,
          edit: true,
          delete: true,
          print: false,
        }}
        toolbar={customToolbar}
      />
    </div>
  );
}

export default RolesMasterData;
