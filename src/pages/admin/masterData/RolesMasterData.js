import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiPlus, FiEye, FiEdit, FiTrash2, FiShield, FiKey } from 'react-icons/fi';
import DataGrid from '../../../components/DataGrid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import TextBox from '../../../components/TextBox/TextBox';
import { useNotification } from '../../../components/Notification';
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from '../../../services/api/roleApi';
import './RolesMasterData.css';

function RolesMasterData() {
  const { success, error: showError, warning, info, confirm } = useNotification();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [addFormData, setAddFormData] = useState({
    name: '',
    code: '',
    description: '',
    isAdmin: false,
  });
  const [addFormErrors, setAddFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await getRoles(1, 1000);
      if (response.success && response.data) {
        setRoles(response.data?.data || response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      showError('Failed to load roles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchRoles();
  };

  const handleAddRole = () => {
        setAddFormData({
          name: '',
          code: '',
          description: '',
          isAdmin: false,
        });
        setAddFormErrors({});
        setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    // Reset errors
    const errors = {};

    // Validate required fields
    if (!addFormData.name || addFormData.name.trim() === '') {
      errors.name = 'Role name is required';
    }
    if (!addFormData.code || addFormData.code.trim() === '') {
      errors.code = 'Role code is required';
    }

    setAddFormErrors(errors);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      showError('Please fill in all required fields correctly');
      return;
    }

    setSaving(true);
    try {
      const response = await createRole(addFormData);
      if (response.success) {
        success('Role created successfully');
        setAddModalOpen(false);
        setAddFormData({
          name: '',
          code: '',
          description: '',
          isAdmin: false,
        });
        setAddFormErrors({});
        fetchRoles();
      } else {
        showError(response.message || 'Failed to create role');
      }
    } catch (error) {
      console.error('Failed to create role:', error);
      showError(error.message || 'Failed to create role. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    info('Export roles to CSV/Excel');
  };

  const handleFilter = () => {
    info('Filter roles');
  };

  const handleAction = async (action, row) => {
    switch (action) {
      case 'view':
        try {
          const response = await getRoleById(row.id);
          if (response.success && response.data) {
            setSelectedRole(response.data);
            setViewModalOpen(true);
          } else {
            setSelectedRole(row);
            setViewModalOpen(true);
          }
        } catch (error) {
          console.error('Failed to fetch role details:', error);
          setSelectedRole(row);
          setViewModalOpen(true);
        }
        break;
      case 'edit':
        try {
          const response = await getRoleById(row.id);
          if (response.success && response.data) {
            setSelectedRole(response.data);
            setEditFormData({
              name: response.data.name || '',
              code: response.data.code || '',
              description: response.data.description || '',
              isAdmin: response.data.isAdmin || false,
            });
            setEditFormErrors({});
            setEditModalOpen(true);
          } else {
            setSelectedRole(row);
            setEditFormData({
              name: row.name || '',
              code: row.code || '',
              description: row.description || '',
              isAdmin: row.isAdmin || false,
            });
            setEditFormErrors({});
            setEditModalOpen(true);
          }
        } catch (error) {
          console.error('Failed to fetch role details:', error);
          setSelectedRole(row);
          setEditFormData({
            name: row.name || '',
            code: row.code || '',
            description: row.description || '',
            isAdmin: row.isAdmin || false,
          });
          setEditModalOpen(true);
        }
        break;
      case 'delete':
        confirm({
          type: 'danger',
          title: 'Delete Role',
          message: `Are you sure you want to delete role "${row.name}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
        }).then(async (confirmed) => {
          if (confirmed) {
            try {
              setLoading(true);
              const response = await deleteRole(row.id);
              if (response.success) {
                success('Role deleted successfully');
                fetchRoles();
              } else {
                showError(response.message || 'Failed to delete role');
              }
            } catch (error) {
              console.error('Failed to delete role:', error);
              showError(error.message || 'Failed to delete role. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        });
        break;
      default:
        break;
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedRole) return;

    // Reset errors
    const errors = {};

    // Validate required fields
    if (!editFormData.name || editFormData.name.trim() === '') {
      errors.name = 'Role name is required';
    }
    if (!editFormData.code || editFormData.code.trim() === '') {
      errors.code = 'Role code is required';
    }

    setEditFormErrors(errors);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      showError('Please fill in all required fields correctly');
      return;
    }

    setSaving(true);
    try {
      const response = await updateRole(selectedRole.id, editFormData);
      if (response.success) {
        success('Role updated successfully');
        setEditModalOpen(false);
        setSelectedRole(null);
        setEditFormErrors({});
        fetchRoles();
      } else {
        showError(response.message || 'Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
      showError(error.message || 'Failed to update role. Please try again.');
    } finally {
      setSaving(false);
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
      header: 'Admin Role',
      width: '120px',
      align: 'center',
      render: (value) => (
        <span style={{ color: value ? 'var(--danger-color)' : 'var(--success-color)' }}>
          {value ? 'Yes' : 'No'}
        </span>
      ),
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

      {/* View Role Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedRole(null);
        }}
        title="Role Details"
        size="medium"
        type="info"
      >
        {selectedRole && (
          <div className="role-details-modal">
            <div className="detail-row">
              <label>ID:</label>
              <span>{selectedRole.id}</span>
            </div>
            <div className="detail-row">
              <label>Name:</label>
              <span>{selectedRole.name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Code:</label>
              <span>{selectedRole.code || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Description:</label>
              <span>{selectedRole.description || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Admin Role:</label>
              <span style={{ 
                color: selectedRole.isAdmin ? 'var(--danger-color)' : 'var(--success-color)',
                fontWeight: '600'
              }}>
                {selectedRole.isAdmin ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Role Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedRole(null);
          setEditFormData({});
          setEditFormErrors({});
        }}
        title="Edit Role"
        size="medium"
        type="default"
        showCloseButton={true}
        closeOnOverlayClick={!saving}
        loading={saving}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setEditModalOpen(false);
              setSelectedRole(null);
              setEditFormData({});
              setEditFormErrors({});
            },
            variant: 'secondary',
            disabled: saving,
          },
          {
            label: 'Save Changes',
            onClick: handleSaveEdit,
            variant: 'primary',
            disabled: saving,
          },
        ]}
      >
        {selectedRole && (
          <div className="role-edit-modal">
            <div className="form-group">
              <TextBox
                id="edit-name"
                label="Role Name"
                required={true}
                value={editFormData.name || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, name: e.target.value });
                  if (editFormErrors.name) {
                    setEditFormErrors({ ...editFormErrors, name: '' });
                  }
                }}
                placeholder="Enter role name"
                leftIcon={<FiShield />}
                error={editFormErrors.name}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-code"
                label="Code"
                required={true}
                value={editFormData.code || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, code: e.target.value });
                  if (editFormErrors.code) {
                    setEditFormErrors({ ...editFormErrors, code: '' });
                  }
                }}
                placeholder="Enter role code"
                leftIcon={<FiKey />}
                error={editFormErrors.code}
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-description">Description</label>
              <TextBox
                id="edit-description"
                value={editFormData.description || ''}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Enter role description"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-isAdmin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  id="edit-isAdmin"
                  checked={editFormData.isAdmin || false}
                  onChange={(e) => setEditFormData({ ...editFormData, isAdmin: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span>Admin Role</span>
              </label>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Role Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddFormData({
            name: '',
            code: '',
            description: '',
            isAdmin: false,
          });
          setAddFormErrors({});
        }}
        title="Add New Role"
        size="medium"
        type="default"
        showCloseButton={true}
        closeOnOverlayClick={!saving}
        loading={saving}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setAddModalOpen(false);
              setAddFormData({
                name: '',
                code: '',
                description: '',
                isAdmin: false,
              });
            },
            variant: 'secondary',
            disabled: saving,
          },
          {
            label: 'Create Role',
            onClick: handleSaveAdd,
            variant: 'primary',
            disabled: saving,
          },
        ]}
      >
        <div className="role-add-modal">
          <div className="form-group">
            <TextBox
              id="add-name"
              label="Role Name"
              required={true}
              value={addFormData.name}
              onChange={(e) => {
                setAddFormData({ ...addFormData, name: e.target.value });
                if (addFormErrors.name) {
                  setAddFormErrors({ ...addFormErrors, name: '' });
                }
              }}
              placeholder="Enter role name"
              leftIcon={<FiShield />}
              error={addFormErrors.name}
            />
          </div>
          <div className="form-group">
            <TextBox
              id="add-code"
              label="Code"
              required={true}
              value={addFormData.code}
              onChange={(e) => {
                setAddFormData({ ...addFormData, code: e.target.value });
                if (addFormErrors.code) {
                  setAddFormErrors({ ...addFormErrors, code: '' });
                }
              }}
              placeholder="Enter role code"
              leftIcon={<FiKey />}
              error={addFormErrors.code}
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-description">Description</label>
            <TextBox
              id="add-description"
              value={addFormData.description}
              onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })}
              placeholder="Enter role description"
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-isAdmin" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                id="add-isAdmin"
                checked={addFormData.isAdmin || false}
                onChange={(e) => setAddFormData({ ...addFormData, isAdmin: e.target.checked })}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span>Admin Role</span>
            </label>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default RolesMasterData;
