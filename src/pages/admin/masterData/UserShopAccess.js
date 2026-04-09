import React, { useState, useEffect, useMemo } from 'react';
import { FiRefreshCw, FiUsers, FiShoppingBag, FiSearch, FiX, FiUserPlus, FiUserMinus, FiCheck } from 'react-icons/fi';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import { useNotification } from '../../../components/Notification';
import { getUsers } from '../../../services/api/usersApi';
import { getShops } from '../../../services/api/shopApi';
import { getAllShopAccess, grantBulkShopAccess, removeShopAccess } from '../../../services/api/accessControlApi';
import './UserShopAccess.css';

function UserShopAccess() {
  const { success, error: showError } = useNotification();

  const [shops, setShops] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [shopAccessList, setShopAccessList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shopSearch, setShopSearch] = useState('');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [modalLoading] = useState(false);
  const [addUserSearch, setAddUserSearch] = useState('');
  const [selectedNewUserIds, setSelectedNewUserIds] = useState(new Set());
  const [saving, setSaving] = useState(false);
  const [removingUserId, setRemovingUserId] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [shopsRes, usersRes, accessRes] = await Promise.all([
        getShops(1, 100),
        getUsers(1, 100),
        getAllShopAccess(),
      ]);
      if (shopsRes.success && shopsRes.data) setShops(shopsRes.data?.data || []);
      if (usersRes.success && usersRes.data) setAllUsers(usersRes.data?.data || []);
      if (accessRes.success && accessRes.data) setShopAccessList(accessRes.data?.data || accessRes.data || []);
    } catch (err) {
      showError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Build shopId → access records map
  const shopAccessMap = useMemo(() => {
    const map = {};
    shopAccessList.forEach((record) => {
      if (!map[record.shopId]) map[record.shopId] = [];
      map[record.shopId].push(record);
    });
    return map;
  }, [shopAccessList]);

  // Filtered shops for main view
  const filteredShops = useMemo(() => {
    if (!shopSearch.trim()) return shops;
    const q = shopSearch.toLowerCase();
    return shops.filter(
      (s) => s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q) || s.address?.toLowerCase().includes(q)
    );
  }, [shops, shopSearch]);

  // Current users with access for selected shop
  const currentAccessRecords = useMemo(() => {
    if (!selectedShop) return [];
    return shopAccessMap[selectedShop.id] || [];
  }, [selectedShop, shopAccessMap]);

  // Users eligible to add (not already having access)
  const accessedUserIds = useMemo(
    () => new Set(currentAccessRecords.map((r) => r.userId)),
    [currentAccessRecords]
  );

  const eligibleUsers = useMemo(() => {
    return allUsers.filter((u) => !accessedUserIds.has(u.id) && !u.isBlocked);
  }, [allUsers, accessedUserIds]);

  const filteredEligible = useMemo(() => {
    if (!addUserSearch.trim()) return eligibleUsers;
    const q = addUserSearch.toLowerCase();
    return eligibleUsers.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q)
    );
  }, [eligibleUsers, addUserSearch]);

  const openModal = (shop) => {
    setSelectedShop(shop);
    setModalOpen(true);
    setAddUserSearch('');
    setSelectedNewUserIds(new Set());
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedShop(null);
    setAddUserSearch('');
    setSelectedNewUserIds(new Set());
  };

  const toggleUserSelection = (userId) => {
    setSelectedNewUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedNewUserIds(new Set(filteredEligible.map((u) => u.id)));
  };

  const clearSelection = () => setSelectedNewUserIds(new Set());

  const handleGrantAccess = async () => {
    if (selectedNewUserIds.size === 0) return;
    setSaving(true);
    try {
      await grantBulkShopAccess({ shopId: selectedShop.id, userIds: [...selectedNewUserIds] });
      success(`Access granted to ${selectedNewUserIds.size} user${selectedNewUserIds.size !== 1 ? 's' : ''}`);
      setSelectedNewUserIds(new Set());
      setAddUserSearch('');
      // Refresh access list
      const accessRes = await getAllShopAccess();
      if (accessRes.success && accessRes.data) setShopAccessList(accessRes.data?.data || accessRes.data || []);
    } catch (err) {
      showError(err.message || 'Failed to grant access. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAccess = async (record) => {
    if (removingUserId) return;
    setRemovingUserId(record.userId);
    try {
      await removeShopAccess(record.userId, selectedShop.id);
      success(`Access removed for "${record.userFullName || record.username}"`);
      const accessRes = await getAllShopAccess();
      if (accessRes.success && accessRes.data) setShopAccessList(accessRes.data?.data || accessRes.data || []);
    } catch (err) {
      showError(err.message || 'Failed to remove access. Please try again.');
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <div className="user-shop-access">
      {/* Toolbar */}
      <div className="usa-toolbar">
        <div className="usa-search-wrap">
          <FiSearch className="usa-search-icon" />
          <input
            type="text"
            className="usa-search-input"
            placeholder="Search shops by name, code, address..."
            value={shopSearch}
            onChange={(e) => setShopSearch(e.target.value)}
          />
          {shopSearch && (
            <button className="usa-search-clear" onClick={() => setShopSearch('')} aria-label="Clear">
              <FiX />
            </button>
          )}
        </div>
        <Button
          variant="ghost"
          icon={<FiRefreshCw className={loading ? 'spinning' : ''} />}
          onClick={fetchAll}
          disabled={loading}
          title="Reload"
          aria-label="Reload"
        />
      </div>

      {/* Shops grid */}
      {loading ? (
        <div className="usa-page-loading">
          <div className="usa-spinner" />
          <span>Loading shops...</span>
        </div>
      ) : filteredShops.length === 0 ? (
        <div className="usa-page-empty">
          <FiShoppingBag size={40} />
          <p>No shops found</p>
        </div>
      ) : (
        <div className="usa-shops-grid">
          {filteredShops.map((shop) => {
            const accessCount = (shopAccessMap[shop.id] || []).length;
            return (
              <div key={shop.id} className="usa-shop-card">
                <div className="usa-shop-card-header">
                  <div className="usa-shop-icon-wrap">
                    <FiShoppingBag />
                  </div>
                  <div className="usa-shop-name-wrap">
                    <h3>{shop.name}</h3>
                    <span className="usa-shop-code">{shop.code}</span>
                  </div>
                  <div className={`usa-user-count ${accessCount > 0 ? 'has-users' : ''}`}>
                    <FiUsers />
                    <span>{accessCount}</span>
                  </div>
                </div>

                {shop.address && <p className="usa-shop-addr">{shop.address}</p>}

                <div className="usa-shop-meta">
                  {shop.phone && <span>{shop.phone}</span>}
                  {shop.email && <span>{shop.email}</span>}
                </div>

                {/* Access avatars preview */}
                {accessCount > 0 && (
                  <div className="usa-access-avatars">
                    {(shopAccessMap[shop.id] || []).slice(0, 5).map((rec) => (
                      <div key={rec.userId} className="usa-avatar" title={rec.userFullName || rec.username}>
                        {(rec.userFullName || rec.username || '?')[0].toUpperCase()}
                      </div>
                    ))}
                    {accessCount > 5 && (
                      <div className="usa-avatar more">+{accessCount - 5}</div>
                    )}
                  </div>
                )}

                <div className="usa-shop-card-footer">
                  <Button
                    variant="primary"
                    icon={<FiUsers />}
                    onClick={() => openModal(shop)}
                    size="small"
                  >
                    Manage Users
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manage Users Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={selectedShop ? `Manage Users — ${selectedShop.name}` : 'Manage Users'}
        size="large"
        type="default"
        showCloseButton={true}
        closeOnOverlayClick={!saving && !removingUserId}
      >
        {selectedShop && (
          <div className="usa-modal-body">
            {/* Shop info bar */}
            <div className="usa-modal-shop-bar">
              <FiShoppingBag />
              <div>
                <span className="usa-modal-shop-name">{selectedShop.name}</span>
                <span className="usa-modal-shop-code">{selectedShop.code}</span>
              </div>
              {selectedShop.address && <span className="usa-modal-shop-addr">{selectedShop.address}</span>}
            </div>

            {modalLoading ? (
              <div className="usa-loading"><div className="usa-spinner" /><span>Loading...</span></div>
            ) : (
              <div className="usa-modal-sections">
                {/* Current access users */}
                <div className="usa-section">
                  <div className="usa-section-header">
                    <h4><FiUsers /> Current Access <span className="usa-section-count">{currentAccessRecords.length}</span></h4>
                  </div>
                  {currentAccessRecords.length === 0 ? (
                    <div className="usa-section-empty">No users have access to this shop yet.</div>
                  ) : (
                    <div className="usa-current-users">
                      {currentAccessRecords.map((record) => (
                        <div key={record.userId} className={`usa-current-user-row ${removingUserId === record.userId ? 'removing' : ''}`}>
                          <div className="usa-user-avatar-sm">
                            {(record.userFullName || record.username || '?')[0].toUpperCase()}
                          </div>
                          <div className="usa-user-details">
                            <span className="usa-user-full-name">{record.userFullName || record.username}</span>
                            <span className="usa-user-email-sm">{record.userEmail}</span>
                          </div>
                          <button
                            className="usa-remove-btn"
                            onClick={() => handleRemoveAccess(record)}
                            disabled={!!removingUserId}
                            title="Remove access"
                            aria-label="Remove access"
                          >
                            {removingUserId === record.userId ? <div className="usa-mini-spinner" /> : <FiUserMinus />}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add users section */}
                <div className="usa-section">
                  <div className="usa-section-header">
                    <h4><FiUserPlus /> Add Users <span className="usa-section-count">{eligibleUsers.length} available</span></h4>
                    {eligibleUsers.length > 0 && (
                      <div className="usa-bulk-actions">
                        <button className="usa-link-btn" onClick={selectAll} disabled={saving}>Select all ({filteredEligible.length})</button>
                        {selectedNewUserIds.size > 0 && (
                          <button className="usa-link-btn" onClick={clearSelection} disabled={saving}>Clear</button>
                        )}
                      </div>
                    )}
                  </div>

                  {eligibleUsers.length === 0 ? (
                    <div className="usa-section-empty">All users already have access to this shop.</div>
                  ) : (
                    <>
                      <div className="usa-add-search-wrap">
                        <FiSearch className="usa-add-search-icon" />
                        <input
                          type="text"
                          className="usa-add-search-input"
                          placeholder="Search users to add..."
                          value={addUserSearch}
                          onChange={(e) => setAddUserSearch(e.target.value)}
                        />
                        {addUserSearch && (
                          <button className="usa-search-clear" onClick={() => setAddUserSearch('')}>
                            <FiX />
                          </button>
                        )}
                      </div>

                      <div className="usa-add-users-list">
                        {filteredEligible.length === 0 ? (
                          <div className="usa-section-empty">No users match your search.</div>
                        ) : (
                          filteredEligible.map((user) => {
                            const isSelected = selectedNewUserIds.has(user.id);
                            return (
                              <div
                                key={user.id}
                                className={`usa-add-user-row ${isSelected ? 'selected' : ''}`}
                                onClick={() => toggleUserSelection(user.id)}
                              >
                                <div className={`usa-checkbox ${isSelected ? 'checked' : ''}`}>
                                  {isSelected && <FiCheck />}
                                </div>
                                <div className="usa-user-avatar-sm">
                                  {(user.firstName || user.username || '?')[0].toUpperCase()}
                                </div>
                                <div className="usa-user-details">
                                  <span className="usa-user-full-name">
                                    {user.firstName || ''} {user.lastName || ''}
                                    {!user.firstName && !user.lastName ? user.username : ''}
                                  </span>
                                  <span className="usa-user-email-sm">{user.email}</span>
                                </div>
                                <span className={`usa-role-badge-sm ${user.roleCode?.toLowerCase() === 'admin' ? 'admin' : 'user'}`}>
                                  {user.roleCode || 'user'}
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {selectedNewUserIds.size > 0 && (
                        <div className="usa-grant-bar">
                          <span>{selectedNewUserIds.size} user{selectedNewUserIds.size !== 1 ? 's' : ''} selected</span>
                          <Button
                            variant="primary"
                            icon={saving ? null : <FiUserPlus />}
                            onClick={handleGrantAccess}
                            disabled={saving}
                            loading={saving}
                          >
                            Grant Access
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default UserShopAccess;
