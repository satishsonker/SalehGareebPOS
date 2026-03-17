import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiPlus } from 'react-icons/fi';
import DataGrid from '../../../components/DataGrid';
import Modal from '../../../components/Modal/Modal';
import { getUsers, getUserById, updateUser, deleteUser, blockUser, unblockUser } from '../../../services/api/usersApi';
import './UsersMasterData.css';

function UsersMasterData() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [pageNo, pageSize]);

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
    // TODO: Open add user modal
    alert('Add User functionality - Open modal to add new user');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    alert('Export users to CSV/Excel');
  };

  const handleFilter = () => {
    // TODO: Open filter modal
    alert('Filter users');
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
            });
            setEditModalOpen(true);
          } else {
            // Use row data if API fails
            setSelectedUser(row);
            setEditFormData({
              firstName: row.firstName || '',
              lastName: row.lastName || '',
              email: row.email || '',
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
          });
          setEditModalOpen(true);
        }
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete user "${row.username}"? This action cannot be undone.`)) {
          try {
            setLoading(true);
            const response = await deleteUser(row.id);
            if (response.success) {
              alert('User deleted successfully');
              fetchUsers(); // Reload users
            } else {
              alert(response.message || 'Failed to delete user');
            }
          } catch (error) {
            console.error('Failed to delete user:', error);
            alert(error.message || 'Failed to delete user. Please try again.');
          } finally {
            setLoading(false);
          }
        }
        break;
      case 'block':
        if (window.confirm(`Are you sure you want to block user "${row.username}"?`)) {
          try {
            setLoading(true);
            const response = await blockUser(row.id, { userId: row.id });
            if (response.success) {
              alert('User blocked successfully');
              fetchUsers(); // Reload users
            } else {
              alert(response.message || 'Failed to block user');
            }
          } catch (error) {
            console.error('Failed to block user:', error);
            alert(error.message || 'Failed to block user. Please try again.');
          } finally {
            setLoading(false);
          }
        }
        break;
      case 'unblock':
        if (window.confirm(`Are you sure you want to unblock user "${row.username}"?`)) {
          try {
            setLoading(true);
            const response = await unblockUser(row.id);
            if (response.success) {
              alert('User unblocked successfully');
              fetchUsers(); // Reload users
            } else {
              alert(response.message || 'Failed to unblock user');
            }
          } catch (error) {
            console.error('Failed to unblock user:', error);
            alert(error.message || 'Failed to unblock user. Please try again.');
          } finally {
            setLoading(false);
          }
        }
        break;
      default:
        break;
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    
    setSaving(true);
    try {
      const response = await updateUser(selectedUser.id, editFormData);
      if (response.success) {
        alert('User updated successfully');
        setEditModalOpen(false);
        setSelectedUser(null);
        fetchUsers(); // Reload users
      } else {
        alert(response.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Failed to update user:', error);
      alert(error.message || 'Failed to update user. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const columns = [{
      key: 'profilePicturePath',
      header: 'Image',
      width: '100px',
      align: 'center',
      render: (value) => (
        <img src={value ? `${process.env.REACT_APP_API_URL || 'https://localhost:7194'}/images/${value}` : '/default-profile.png'} alt="Profile" className="profile-picture" />
      ),
    },
    {
      key: 'id',
      header: 'ID',
      width: '80px',
      align: 'center',
    },
    {
      key: 'username',
      header: 'Username',
      width: '150px',
    },
    {
      key: 'email',
      header: 'Email',
      width: '200px',
    },
    {
      key: 'mobile',
      header: 'Mobile',
      width: '150px',
      render: (value) => {
        if (!value) return 'No Mobile';
        <span>
          <a href={`tel:${value}`} style={{ color: 'var(--primary-color)' }}>
           <i className="fas fa-phone" style={{ marginRight: '0.25rem' }}></i>
          </a> {value}
        </span>
      },
    },
    {
      key: 'isAdmin',
      header: 'Role',
      width: '100px',
      align: 'center',
      render: (value) => (
        <span style={{ color: value ? 'var(--danger-color)' : 'var(--success-color)' }}>
          {value ? 'Admin' : 'Normal User'}
        </span>
      ),
    },
    {
      key: 'firstName',
      header: 'First Name',
      width: '150px',
    },
    {
      key: 'lastName',
      header: 'Last Name',
      width: '150px',
    },
    {
      key: 'isBlocked',
      header: 'Status',
      width: '100px',
      align: 'center',
      render: (value) => (
        <span style={{ color: value ? 'var(--danger-color)' : 'var(--success-color)' }}>
          {value ? 'Blocked' : 'Active'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      width: '150px',
      render: formatDate,
    },
     {
      key: 'lastLoginAt',
      header: 'Last Login',
      width: '150px',
      render: formatDate,
    },
     {
      key: 'lastLoginAttempt',
      header: 'Last Login Attempt',
      width: '150px',
      render: formatDate,
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
            title="Filter users"
            aria-label="Filter"
          >
            <FiFilter />
          </button>
          <button
            className="toolbar-button"
            onClick={handleExport}
            title="Export users to CSV/Excel"
            aria-label="Export"
          >
            <FiDownload />
          </button>
          <button
            className="toolbar-button reload-button"
            onClick={handleReload}
            disabled={loading}
            title="Reload users list"
            aria-label="Reload"
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} />
          </button>
          <button
            className="toolbar-button primary-button"
            onClick={handleAddUser}
            title="Add new user"
            aria-label="Add new"
          >
            <FiPlus />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="users-master-data">
      <DataGrid
        data={users}
        columns={columns}
        onAction={handleAction}
        loading={loading}
        pageSize={10}
        searchPlaceholder="Search users by username, email, name..."
        emptyMessage="No users found"
        actionButtons={{
          view: true,
          edit: true,
          delete: true,
          block: true,
          unblock: true,
        }}
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
              <span>{formatDate(selectedUser.createdAt)}</span>
            </div>
            {selectedUser.updatedAt && (
              <div className="detail-row">
                <label>Updated At:</label>
                <span>{formatDate(selectedUser.updatedAt)}</span>
              </div>
            )}
            {selectedUser.lastLoginAt && (
              <div className="detail-row">
                <label>Last Login:</label>
                <span>{formatDate(selectedUser.lastLoginAt)}</span>
              </div>
            )}
            {selectedUser.lastLoginAttempt && (
              <div className="detail-row">
                <label>Last Login Attempt:</label>
                <span>{formatDate(selectedUser.lastLoginAttempt)}</span>
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
      >
        {selectedUser && (
          <div className="user-edit-modal">
            <div className="form-group">
              <label htmlFor="edit-username">Username</label>
              <input
                type="text"
                id="edit-username"
                value={selectedUser.username || ''}
                disabled
                className="form-input"
              />
              <small className="form-help">Username cannot be changed</small>
            </div>
            <div className="form-group">
              <label htmlFor="edit-email">Email *</label>
              <input
                type="email"
                id="edit-email"
                value={editFormData.email || ''}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-firstName">First Name</label>
              <input
                type="text"
                id="edit-firstName"
                value={editFormData.firstName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="edit-lastName">Last Name</label>
              <input
                type="text"
                id="edit-lastName"
                value={editFormData.lastName || ''}
                onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                className="form-input"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedUser(null);
                  setEditFormData({});
                }}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveEdit}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default UsersMasterData;
