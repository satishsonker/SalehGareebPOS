import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiPlus, FiEye, FiMail, FiUser, FiEdit, FiTrash2, FiLock, FiUnlock, FiKey, FiPhoneCall, FiPrinter,FiShield } from 'react-icons/fi';
import DataGrid from '../../../components/DataGrid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import TextBox from '../../../components/TextBox/TextBox';
import Select from '../../../components/Select/Select';
import CountrySelect from '../../../components/CountrySelect/CountrySelect';
import { useNotification } from '../../../components/Notification';
import { getUsers, getUserById, updateUser, deleteUser, blockUser, unblockUser, register } from '../../../services/api/usersApi';
import { getRoles } from '../../../services/api/roleApi';
import { tableHeaderFormat } from '../../../utils/tableHeaderFormat';
import { commonLogic } from '../../../utils/commonLogic';
import { mergeValidationErrorsFromApi } from '../../../utils/apiError';
import './UsersMasterData.css';

function UsersMasterData() {
  const { success, error: showError, warning, info, confirm } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [addFormData, setAddFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    isdCode: '',
    mobile: '',
    roleId:0,
    id:0,
  });
  const [roles, setRoles] = useState([]);
  const [addFormErrors, setAddFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch users and roles on component mount
  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [pageNo, pageSize]);

  const fetchRoles = async () => {
    try {
      const response = await getRoles(1, 1000);
      if (response.success && response.data) {
        setRoles(response.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers(pageNo, pageSize);
      if (response.success && response.data) {
        setUsers(response.data?.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchUsers(pageNo, pageSize);
  };

  const handleAddUser = () => {
    setAddFormData({
      username: '',
      email: '',
      password: '',
      roleId: 0,
      firstName: '',
      lastName: '',
      isdCode: '',
      mobile: '',
      id: 0,
    });
    setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    // Reset errors
    const errors = {};

    // Validate required fields
    if (!addFormData.username || addFormData.username.trim() === '') {
      errors.username = 'Username is required';
    } else if (addFormData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
    }

    if (!addFormData.email || addFormData.email.trim() === '') {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(addFormData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!addFormData.password || addFormData.password.trim() === '') {
      errors.password = 'Password is required';
    } else if (addFormData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!addFormData.roleId || addFormData.roleId === 0) {
      errors.roleId = 'Role is required';
    }

    setAddFormErrors(errors);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      showError('Please fill in all required fields correctly');
      return;
    }

    setSaving(true);
    try {
      const response = await register({
        username: addFormData.username,
        email: addFormData.email,
        password: addFormData.password,
        roleId: parseInt(addFormData.roleId),
        firstName: addFormData.firstName || null,
        lastName: addFormData.lastName || null,
      });
      if (response.success) {
        success('User created successfully');
        setAddModalOpen(false);
        setAddFormData({
          username: '',
          email: '',
          password: '',
          roleId: 0,
          firstName: '',
          lastName: '',
          isdCode: '',
          mobile: '',
          id: 0,
        });
        setAddFormErrors({});
        fetchUsers(); // Reload users
      } else {
        showError(response.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Failed to create user:', error);
      mergeValidationErrorsFromApi(error, setAddFormErrors);
      showError(error.message || 'Failed to create user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    info('Export users to CSV/Excel');
  };

  const handleFilter = () => {
    // TODO: Open filter modal
    info('Filter users');
  };

  const handleAction = async (action, row) => {
    switch (action) {
      case 'view':
        try {
          // Fetch full user details
          const response = await getUserById(row.id);
          if (response.success && response.data) {
            setSelectedUser(response.data);
            setViewModalOpen(true);
          } else {
            // Use row data if API fails
            setSelectedUser(row);
            setViewModalOpen(true);
          }
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          // Use row data if API fails
          setSelectedUser(row);
          setViewModalOpen(true);
        }
        break;
      case 'edit':
        try {
          // Fetch full user details for editing
          const response = await getUserById(row.id);
          if (response.success && response.data) {
            setSelectedUser(response.data);
            setEditFormData({
              firstName: response.data.firstName || '',
              lastName: response.data.lastName || '',
              email: response.data.email || '',
              isdCode: response.data.isdCode || '',
              mobile: response.data.mobile || '',
              roleId: response.data.roleId || 0,
              id: response.data.id || 0,
            });
            setEditModalOpen(true);
          } else {
            // Use row data if API fails
            setSelectedUser(row);
            setEditFormData({
              firstName: row.firstName || '',
              lastName: row.lastName || '',
              email: row.email || '',
              isdCode: row.isdCode || '',
              mobile: row.mobile || '',
              roleId: row.roleId || 0,
              id: row.id || 0,
            });
            setEditModalOpen(true);
          }
        } catch (error) {
          console.error('Failed to fetch user details:', error);
          // Use row data if API fails
          setSelectedUser(row);
          setEditFormData({
            firstName: row.firstName || '',
            lastName: row.lastName || '',
            email: row.email || '',
            isdCode: row.isdCode || '',
            mobile: row.mobile || '',
            roleId: row.roleId || 0,
            id: row.id || 0,
          });
          setEditModalOpen(true);
        }
        break;
      case 'delete':
        confirm({
          type: 'danger',
          title: 'Delete User',
          message: `Are you sure you want to delete user "${row.username}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
        }).then(async (confirmed) => {
          if (confirmed) {
            try {
              setLoading(true);
              const response = await deleteUser(row.id);
              if (response.success) {
                success('User deleted successfully');
                fetchUsers(); // Reload users
              } else {
                showError(response.message || 'Failed to delete user');
              }
            } catch (error) {
              console.error('Failed to delete user:', error);
              showError(error.message || 'Failed to delete user. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        });
        break;
      case 'block':
        confirm({
          type: 'warning',
          title: 'Block User',
          message: `Are you sure you want to block user "${row.username}"?`,
          confirmText: 'Block',
          cancelText: 'Cancel',
        }).then(async (confirmed) => {
          if (confirmed) {
            try {
              setLoading(true);
              const response = await blockUser(row.id, { userId: row.id });
              if (response.success) {
                success('User blocked successfully');
                fetchUsers(); // Reload users
              } else {
                showError(response.message || 'Failed to block user');
              }
            } catch (error) {
              console.error('Failed to block user:', error);
              showError(error.message || 'Failed to block user. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        });
        break;
      case 'unblock':
        confirm({
          type: 'confirm',
          title: 'Unblock User',
          message: `Are you sure you want to unblock user "${row.username}"?`,
          confirmText: 'Unblock',
          cancelText: 'Cancel',
        }).then(async (confirmed) => {
          if (confirmed) {
            try {
              setLoading(true);
              const response = await unblockUser(row.id);
              if (response.success) {
                success('User unblocked successfully');
                fetchUsers(); // Reload users
              } else {
                showError(response.message || 'Failed to unblock user');
              }
            } catch (error) {
              console.error('Failed to unblock user:', error);
              showError(error.message || 'Failed to unblock user. Please try again.');
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
    if (!selectedUser) return;

    // Reset errors
    const errors = {};

    // Validate required fields
    if (!editFormData.email || editFormData.email.trim() === '') {
      errors.email = 'Email is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editFormData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    if (!editFormData.isdCode || editFormData.isdCode.trim() === '') {
      errors.isdCode = 'ISD code is required';
    }

    if (!editFormData.mobile || editFormData.mobile.trim() === '') {
      errors.mobile = 'Mobile number is required';
    }

    setEditFormErrors(errors);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      showError('Please fill in all required fields correctly');
      return;
    }

    setSaving(true);
    try {
      const response = await updateUser(selectedUser.id, editFormData);
      if (response.success) {
        success('User updated successfully');
        setEditModalOpen(false);
        setSelectedUser(null);
        setEditFormErrors({});
        fetchUsers(); // Reload users
      } else {
        showError(response.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      mergeValidationErrorsFromApi(error, setEditFormErrors);
      showError(error.message || 'Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Custom toolbar with button group
  const customToolbar = (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem', backgroundColor: 'var(--bg-primary)' }}>
          <Button
            variant="ghost"
            icon={<FiFilter />}
            onClick={handleFilter}
            title="Filter users"
            aria-label="Filter"
          />
          <Button
            variant="ghost"
            icon={<FiDownload />}
            onClick={handleExport}
            title="Export users to CSV/Excel"
            aria-label="Export"
          />
           <Button
            variant="ghost"
            icon={<FiPrinter />}
            onClick={handleExport}
            title="Print users list"
            aria-label="Export"
          />
          <Button
            variant="ghost"
            icon={<FiRefreshCw />}
            onClick={handleReload}
            disabled={loading}
            loading={loading}
            title="Reload users list"
            aria-label="Reload"
          />
           <Button
          variant="ghost"
          icon={<FiPlus />}
          onClick={handleAddUser}
          title="Add new user"
          aria-label="Add new"
        />
        </div>
       
      </div>
    </>
  );

  return (
    <div className="users-master-data">
      <DataGrid
        data={users}
        columns={tableHeaderFormat.masterUserData}
        onAction={handleAction}
        loading={loading}
        pageSize={10}
        searchPlaceholder="Search users by username, email, name..."
        emptyMessage="No users found"
        defaultActions={{
          view: true,
          edit: true,
          delete: true,
          print: true,
        }}
        actionMenuItems={[
          {
            id: 'block',
            label: 'Block',
            icon: <FiLock />,
            action: 'block',
            visible: (row) => !row.isBlocked,
            className: 'block-action',
          },
          {
            id: 'unblock',
            label: 'Unblock',
            icon: <FiUnlock />,
            action: 'unblock',
            visible: (row) => row.isBlocked,
            className: 'unblock-action',
          },
           {
            id: 'changePassword',
            label: 'Change Password',
            icon: <FiKey />,
            action: 'changePassword',
            visible: (row) => !row.isBlocked,
            className: 'change-password-action',
          },
           {
            id: 'changeRole',
            label: 'Change Role',
            icon: <FiShield />,
            action: 'changeRole',
            visible: (row) => !row.isBlocked,
            className: 'change-role-action',
          },
        ]}
        toolbar={customToolbar}
      />

      {/* View User Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedUser(null);
        }}
        title="User Details"
        size="medium"
        type="info"
        showCloseButton={true}
        closeOnOverlayClick={true}
      >
        {selectedUser && (
          <div className="user-details-modal">
            <div className="detail-row">
              <label>ID:</label>
              <span>{selectedUser.id}</span>
            </div>
            <div className="detail-row">
              <label>Username:</label>
              <span>{selectedUser.username || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Email:</label>
              <span>{selectedUser.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>First Name:</label>
              <span>{selectedUser.firstName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Last Name:</label>
              <span>{selectedUser.lastName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label>Status:</label>
              <span style={{
                color: selectedUser.isBlocked ? 'var(--danger-color)' : 'var(--success-color)',
                fontWeight: '600'
              }}>
                {selectedUser.isBlocked ? 'Blocked' : 'Active'}
              </span>
            </div>
            <div className="detail-row">
              <label>Admin:</label>
              <span style={{
                color: selectedUser.isAdmin ? 'var(--danger-color)' : 'var(--text-secondary)',
                fontWeight: '600'
              }}>
                {selectedUser.isAdmin ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="detail-row">
              <label>Created At:</label>
              <span>{commonLogic.formatDate(selectedUser.createdAt)}</span>
            </div>
            {selectedUser.updatedAt && (
              <div className="detail-row">
                <label>Updated At:</label>
                <span>{commonLogic.formatDate(selectedUser.updatedAt)}</span>
              </div>
            )}
            {selectedUser.lastLoginAt && (
              <div className="detail-row">
                <label>Last Login:</label>
                <span>{commonLogic.formatDate(selectedUser.lastLoginAt)}</span>
              </div>
            )}
            {selectedUser.lastLoginAttempt && (
              <div className="detail-row">
                <label>Last Login Attempt:</label>
                <span>{commonLogic.formatDate(selectedUser.lastLoginAttempt)}</span>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedUser(null);
          setEditFormData({});
        }}
        title="Edit User"
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
              setSelectedUser(null);
              setEditFormData({});
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
        {selectedUser && (
          <div className="user-edit-modal">
            <div className="form-group">
              <TextBox
                type="text"
                label="Username"
                id="edit-username"
                value={selectedUser.username || ''}
                disabled
                className="form-input"
                leftIcon={<FiUser />}
              />
              <small className="form-help">Username cannot be changed</small>
            </div>
            <div className="form-group">
              <TextBox
                type="email"
                label="Email"
                required={true}
                id="edit-email"
                value={editFormData.email || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, email: e.target.value });
                  if (editFormErrors.email) {
                    setEditFormErrors({ ...editFormErrors, email: '' });
                  }
                }}
                className="form-input"
                leftIcon={<FiMail />}
                error={editFormErrors.email}
              />
            </div>
            <div className='form-group'>
              <CountrySelect
                label="ISD Code"
                value={editFormData?.isdCode || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, isdCode: e.isd });
                  if (editFormErrors.isdCode) {
                    setEditFormErrors({ ...editFormErrors, isdCode: '' });
                  }
                }}
                showFlag={true}
                showISD={true}
                required={true}
                error={editFormErrors.isdCode}
              />
            </div>
            <div className="form-group">
              <TextBox
                label="Mobile"
                type="number"
                id="edit-mobile"
                placeholder="Enter mobile number"
                value={editFormData.mobile || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, mobile: e.target.value });
                  if (editFormErrors.mobile) {
                    setEditFormErrors({ ...editFormErrors, mobile: '' });
                  }
                }}
                leftIcon={<FiPhoneCall />}
                showVirtualKeyboard={true}
                required={true}
                min={0}
                error={editFormErrors.mobile}
                step={1}
              />
            </div>
            <div className="form-group">
              <TextBox
                label="First Name"
                leftIcon={<FiUser />}
                required={true}
                type="text"
                id="edit-firstName"
                value={editFormData.firstName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <TextBox
                leftIcon={<FiUser />}
                label="Last Name"
                type="text"
                id="edit-lastName"
                value={editFormData.lastName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <Select
                label="Role"
                options={roles.map((role) => ({ value: role.id, label: role.name }))}
                value={editFormData.roleId || ''}
                onChange={(value) => setEditFormData({ ...editFormData, roleId: value })}
                required={true}
              />
              
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddFormData({
            username: '',
            email: '',
            password: '',
            roleId: '',
            firstName: '',
            lastName: '',
          });
        }}
        title="Add New User"
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
                username: '',
                email: '',
                password: '',
                roleId: '',
                firstName: '',
                lastName: '',
              });
            },
            variant: 'secondary',
            disabled: saving,
          },
          {
            label: 'Create User',
            onClick: handleSaveAdd,
            variant: 'primary',
            disabled: saving,
          },
        ]}
      >
        <div className="user-edit-modal">
          <div className="form-group">
            <label htmlFor="add-username">Username *</label>
            <input
              type="text"
              id="add-username"
              value={addFormData.username}
              onChange={(e) => setAddFormData({ ...addFormData, username: e.target.value })}
              className="form-input"
              required
              minLength={3}
              maxLength={50}
              placeholder="Enter username (min 3 characters)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-email">Email *</label>
            <input
              type="email"
              id="add-email"
              value={addFormData.email}
              onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
              className="form-input"
              required
              placeholder="Enter email address"
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-password">Password *</label>
            <input
              type="password"
              id="add-password"
              value={addFormData.password}
              onChange={(e) => setAddFormData({ ...addFormData, password: e.target.value })}
              className="form-input"
              required
              minLength={6}
              placeholder="Enter password (min 6 characters)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-roleId">Role *</label>
            <select
              id="add-roleId"
              value={addFormData.roleId}
              onChange={(e) => setAddFormData({ ...addFormData, roleId: e.target.value })}
              className="form-input"
              required
            >
              <option value="">Select a role</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} {role.isAdmin ? '(Admin)' : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="add-firstName">First Name</label>
            <input
              type="text"
              id="add-firstName"
              value={addFormData.firstName}
              onChange={(e) => setAddFormData({ ...addFormData, firstName: e.target.value })}
              className="form-input"
              placeholder="Enter first name (optional)"
            />
          </div>
          <div className="form-group">
            <label htmlFor="add-lastName">Last Name</label>
            <input
              type="text"
              id="add-lastName"
              value={addFormData.lastName}
              onChange={(e) => setAddFormData({ ...addFormData, lastName: e.target.value })}
              className="form-input"
              placeholder="Enter last name (optional)"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default UsersMasterData;
