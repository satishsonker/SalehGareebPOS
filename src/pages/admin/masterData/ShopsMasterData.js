import React, { useState, useEffect } from 'react';
import { FaArrowRotateRight, FaDownload, FaFilter, FaPlus, FaIdCard, FaCode, FaMapLocation, FaPhone, FaRegEnvelope, FaHouseFlag, FaCamera } from 'react-icons/fa6';
import DataGrid from '../../../components/DataGrid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import TextBox from '../../../components/TextBox/TextBox';
import { useNotification } from '../../../components/Notification';
import { getShops, getShopById, createShop, updateShop, deleteShop, uploadShopPicture, deleteShopPicture } from '../../../services/api/shopApi';
import ImageUploadModal from '../../../components/ImageUpload/ImageUploadModal';
import './ShopsMasterData.css';
import { tableHeaderFormat } from '../../../utils/tableHeaderFormat';
import { mergeValidationErrorsFromApi } from '../../../utils/apiError';

function ShopsMasterData() {
  const { success, error: showError, warning, info, confirm } = useNotification();
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [addFormData, setAddFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    trn: '',
  });
  const [addFormErrors, setAddFormErrors] = useState({});
  const [editFormErrors, setEditFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [pictureModalOpen, setPictureModalOpen] = useState(false);
  const [pictureShop, setPictureShop] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchShops();
  }, [pageNo, pageSize]);

  const fetchShops = async () => {
    setLoading(true);
    try {
      const response = await getShops(pageNo, pageSize);
      if (response.success && response.data) {
        setShops(response.data.data || []);
        setTotalRecords(response.data.totalRecords ?? 0);
      }
    } catch (error) {
      console.error('Failed to fetch shops:', error);
      showError('Failed to load shops. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReload = () => {
    fetchShops();
  };

  const handleAddShop = () => {
        setAddFormData({
          name: '',
          code: '',
          address: '',
          phone: '',
          email: '',
          trn: '',
        });
        setAddFormErrors({});
        setAddModalOpen(true);
  };

  const handleSaveAdd = async () => {
    // Reset errors
    const errors = {};

    // Validate required fields
    if (!addFormData.name || addFormData.name.trim() === '') {
      errors.name = 'Shop name is required';
    }
    if (!addFormData.code || addFormData.code.trim() === '') {
      errors.code = 'Shop code is required';
    }
    if (!addFormData.address || addFormData.address.trim() === '') {
      errors.address = 'Address is required';
    }
    if (!addFormData.phone || addFormData.phone.trim() === '') {
      errors.phone = 'Phone is required';
    }
    if (!addFormData.email || addFormData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!addFormData.trn || addFormData.trn.trim() === '') {
      errors.trn = 'TRN is required';
    }

    setAddFormErrors(errors);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      showError('Please fill in all required fields correctly');
      return;
    }

    setSaving(true);
    try {
      const response = await createShop(addFormData);
      if (response.success) {
        success('Shop created successfully');
        setAddModalOpen(false);
        setAddFormData({
          name: '',
          code: '',
          address: '',
          phone: '',
          email: '',
          trn: '',
        });
        setAddFormErrors({});
        fetchShops();
      } else {
        showError(response.message || 'Failed to create shop');
      }
    } catch (error) {
      console.error('Failed to create shop:', error);
      mergeValidationErrorsFromApi(error, setAddFormErrors);
      showError(error.message || 'Failed to create shop. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    info('Export shops to CSV/Excel');
  };

  const handleFilter = () => {
    info('Filter shops');
  };

  const handleAction = async (action, row) => {
    switch (action) {
      case 'view':
        try {
          const response = await getShopById(row.id);
          if (response.success && response.data) {
            setSelectedShop(response.data);
            setViewModalOpen(true);
          } else {
            setSelectedShop(row);
            setViewModalOpen(true);
          }
        } catch (error) {
          console.error('Failed to fetch shop details:', error);
          setSelectedShop(row);
          setViewModalOpen(true);
        }
        break;
      case 'edit':
        try {
          const response = await getShopById(row.id);
          if (response.success && response.data) {
            setSelectedShop(response.data);
            setEditFormData({
              name: response.data.name || '',
              code: response.data.code || '',
              address: response.data.address || '',
              phone: response.data.phone || '',
              email: response.data.email || '',
              trn: response.data.trn || '',
            });
            setEditFormErrors({});
            setEditModalOpen(true);
          } else {
            setSelectedShop(row);
            setEditFormData({
              name: row.name || '',
              code: row.code || '',
              address: row.address || '',
              phone: row.phone || '',
              email: row.email || '',
              trn: row.trn || '',
            });
            setEditFormErrors({});
            setEditModalOpen(true);
          }
        } catch (error) {
          console.error('Failed to fetch shop details:', error);
          setSelectedShop(row);
          setEditFormData({
            name: row.name || '',
            code: row.code || '',
            address: row.address || '',
            phone: row.phone || '',
            email: row.email || '',
            trn: row.trn || '',
          });
          setEditModalOpen(true);
        }
        break;
      case 'delete':
        confirm({
          type: 'danger',
          title: 'Delete Shop',
          message: `Are you sure you want to delete shop "${row.name}"? This action cannot be undone.`,
          confirmText: 'Delete',
          cancelText: 'Cancel',
        }).then(async (confirmed) => {
          if (confirmed) {
            try {
              setLoading(true);
              const response = await deleteShop(row.id);
              if (response.success) {
                success('Shop deleted successfully');
                fetchShops();
              } else {
                showError(response.message || 'Failed to delete shop');
              }
            } catch (error) {
              console.error('Failed to delete shop:', error);
              showError(error.message || 'Failed to delete shop. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        });
        break;
      case 'changePicture':
        setPictureShop(row);
        setPictureModalOpen(true);
        break;
      default:
        break;
    }
  };

  const handleUploadShopImage = async (file) => {
    setUploading(true);
    try {
      const response = await uploadShopPicture(pictureShop.id, file);
      if (response.success) {
        success('Shop image updated successfully');
        fetchShops();
      } else {
        showError(response.message || 'Failed to upload image');
      }
    } catch (err) {
      showError(err.message || 'Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteShopImage = async () => {
    setUploading(true);
    try {
      const response = await deleteShopPicture(pictureShop.id);
      if (response.success) {
        success('Shop image removed');
        fetchShops();
      } else {
        showError(response.message || 'Failed to remove shop image');
      }
    } catch (err) {
      showError(err.message || 'Failed to remove image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedShop) return;

    // Reset errors
    const errors = {};

    // Validate required fields
    if (!editFormData.name || editFormData.name.trim() === '') {
      errors.name = 'Shop name is required';
    }
    if (!editFormData.code || editFormData.code.trim() === '') {
      errors.code = 'Shop code is required';
    }
    if (!editFormData.address || editFormData.address.trim() === '') {
      errors.address = 'Address is required';
    }
    if (!editFormData.phone || editFormData.phone.trim() === '') {
      errors.phone = 'Phone is required';
    }
    if (!editFormData.email || editFormData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!editFormData.trn || editFormData.trn.trim() === '') {
      errors.trn = 'TRN is required';
    }

    setEditFormErrors(errors);

    // If there are errors, don't submit
    if (Object.keys(errors).length > 0) {
      showError('Please fill in all required fields correctly');
      return;
    }

    setSaving(true);
    try {
      const response = await updateShop(selectedShop.id, editFormData);
      if (response.success) {
        success('Shop updated successfully');
        setEditModalOpen(false);
        setSelectedShop(null);
        setEditFormErrors({});
        fetchShops();
      } else {
        showError(response.message || 'Failed to update shop');
      }
    } catch (error) {
      console.error('Failed to update shop:', error);
      mergeValidationErrorsFromApi(error, setEditFormErrors);
      showError(error.message || 'Failed to update shop. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const columns =tableHeaderFormat.masterShopData;
  // Custom toolbar with button group
  const customToolbar = (
    <>
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem', backgroundColor: 'var(--bg-primary)' }}>
          <Button
            variant="ghost"
            icon={<FaFilter />}
            onClick={handleFilter}
            title="Filter shops"
            aria-label="Filter"
          />
          <Button
            variant="ghost"
            icon={<FaDownload />}
            onClick={handleExport}
            title="Export shops to CSV/Excel"
            aria-label="Export"
          />
          <Button
            variant="ghost"
            icon={<FaArrowRotateRight />}
            onClick={handleReload}
            disabled={loading}
            loading={loading}
            title="Reload shops list"
            aria-label="Reload"
          /> 
          <Button
          variant="ghost"
          icon={<FaPlus />}
          onClick={handleAddShop}
          title="Add new shop"
          aria-label="Add new"
        />
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
        pageSize={pageSize}
        serverSide={true}
        page={pageNo}
        totalRecords={totalRecords}
        onPageChange={setPageNo}
        printTitle="Shops"
        searchPlaceholder="Search shops by name, code, address..."
        emptyMessage="No shops found"
        defaultActions={{
          view: true,
          edit: true,
          delete: true,
          print: false,
        }}
        actionMenuItems={[
          {
            id: 'changePicture',
            label: 'Change Image',
            icon: <FaCamera />,
            action: 'changePicture',
            visible: () => true,
          },
        ]}
        toolbar={customToolbar}
      />

      {/* View Shop Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedShop(null);
        }}
        title="Shop Details"
        size="medium"
        type="info"
      >
        {selectedShop && (
          <div className="modal-form">
            <div className="detail-row">
              <label><FaHouseFlag /> ID:</label>
              <span>{selectedShop.id}</span>
            </div>
            <div className="detail-row">
              <label><FaHouseFlag /> Name:</label>
              <span>{selectedShop.name || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaCode /> Code:</label>
              <span>{selectedShop.code || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaMapLocation /> Address:</label>
              <span>{selectedShop.address || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaPhone /> Phone:</label>
              <span>{selectedShop.phone || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaRegEnvelope /> Email:</label>
              <span>{selectedShop.email || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaIdCard /> TRN:</label>
              <span>{selectedShop.trn || 'N/A'}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Shop Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedShop(null);
          setEditFormData({});
          setEditFormErrors({});
        }}
        title="Edit Shop"
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
              setSelectedShop(null);
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
        {selectedShop && (
          <div className="modal-form">
            <div className="form-group">
              <TextBox
                id="edit-name"
                label="Shop Name"
                required={true}
                value={editFormData.name || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, name: e.target.value });
                  if (editFormErrors.name) {
                    setEditFormErrors({ ...editFormErrors, name: '' });
                  }
                }}
                placeholder="Enter shop name"
                leftIcon={<FaHouseFlag />}
                error={editFormErrors.name}
              />
            </div>
            <div className="form-group">
              <TextBox
                label="Shop Code"
                required={true}
                id="edit-code"
                value={editFormData.code || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, code: e.target.value });
                  if (editFormErrors.code) {
                    setEditFormErrors({ ...editFormErrors, code: '' });
                  }
                }}
                placeholder="Enter shop code"  
                leftIcon={<FaCode />}
                error={editFormErrors.code}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-address"
                label="Address"
                required={true}
                value={editFormData.address || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, address: e.target.value });
                  if (editFormErrors.address) {
                    setEditFormErrors({ ...editFormErrors, address: '' });
                  }
                }}
                placeholder="Enter shop address"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.address}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-phone"
                label="Phone"
                required={true}
                type="tel"
                value={editFormData.phone || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, phone: e.target.value });
                  if (editFormErrors.phone) {
                    setEditFormErrors({ ...editFormErrors, phone: '' });
                  }
                }}
                placeholder="Enter phone number"
                leftIcon={<FaPhone />}
                showVirtualKeyboard={true}
                error={editFormErrors.phone}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-email"
                label="Email"
                required={true}
                type="email"
                value={editFormData.email || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, email: e.target.value });
                  if (editFormErrors.email) {
                    setEditFormErrors({ ...editFormErrors, email: '' });
                  }
                }}
                placeholder="Enter email address"
                leftIcon={<FaRegEnvelope />}
                error={editFormErrors.email}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-trn"
                label="TRN"
                leftIcon={<FaIdCard />}
                required={true}
                value={editFormData.trn || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, trn: e.target.value });
                  if (editFormErrors.trn) {
                    setEditFormErrors({ ...editFormErrors, trn: '' });
                  }
                }}
                placeholder="Enter TRN"
                error={editFormErrors.trn}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Add Shop Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setAddFormData({
            name: '',
            code: '',
            address: '',
            phone: '',
            email: '',
            trn: '',
          });
          setAddFormErrors({});
        }}
        title="Add New Shop"
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
                address: '',
                phone: '',
                email: '',
                trn: '',
              });
            },
            variant: 'secondary',
            disabled: saving,
          },
          {
            label: 'Create Shop',
            onClick: handleSaveAdd,
            variant: 'primary',
            disabled: saving,
          },
        ]}
      >
        <div className="modal-form">
          <div className="form-group">
            <TextBox
            label="Shop Name"
              id="add-name"
              value={addFormData.name}
              onChange={(e) => {
                setAddFormData({ ...addFormData, name: e.target.value });
                if (addFormErrors.name) {
                  setAddFormErrors({ ...addFormErrors, name: '' });
                }
              }}
              placeholder="Enter shop name"
              required={true}
              leftIcon={<FaHouseFlag />}
              error={addFormErrors.name}
            />
          </div>
          <div className="form-group">
            <TextBox
              label="Shop Code"
              required={true}
              id="add-code"
              value={addFormData.code}
              onChange={(e) => {
                setAddFormData({ ...addFormData, code: e.target.value });
                if (addFormErrors.code) {
                  setAddFormErrors({ ...addFormErrors, code: '' });
                }
              }}
              placeholder="Enter shop code"
              leftIcon={<FaCode />}
              error={addFormErrors.code}
            />
          </div>
          <div className="form-group">
            <TextBox
              label="Address"
              required={true}
              id="add-address"
              value={addFormData.address}
              onChange={(e) => {
                setAddFormData({ ...addFormData, address: e.target.value });
                if (addFormErrors.address) {
                  setAddFormErrors({ ...addFormErrors, address: '' });
                }
              }}
              placeholder="Enter shop address"
              leftIcon={<FaMapLocation />}
              error={addFormErrors.address}
            />
          </div>
          <div className="form-group">
            <TextBox
              id="add-phone"
              label="Phone"
              required={true}
              type="tel"
              value={addFormData.phone}
              onChange={(e) => {
                setAddFormData({ ...addFormData, phone: e.target.value });
                if (addFormErrors.phone) {
                  setAddFormErrors({ ...addFormErrors, phone: '' });
                }
              }}
              placeholder="Enter phone number"
              leftIcon={<FaPhone />}
              showVirtualKeyboard={true}
              error={addFormErrors.phone}
            />
          </div>
          <div className="form-group">
            <TextBox
              id="add-email"
              type="email"
              label="Email"
              required={true}
              value={addFormData.email}
              onChange={(e) => {
                setAddFormData({ ...addFormData, email: e.target.value });
                if (addFormErrors.email) {
                  setAddFormErrors({ ...addFormErrors, email: '' });
                }
              }}
              placeholder="Enter email address"
              leftIcon={<FaRegEnvelope />}
              error={addFormErrors.email}
            />
          </div>
          <div className="form-group">
            <TextBox
              label="TRN"
              required={true}
              id="add-trn"
              value={addFormData.trn}
              onChange={(e) => {
                setAddFormData({ ...addFormData, trn: e.target.value });
                if (addFormErrors.trn) {
                  setAddFormErrors({ ...addFormErrors, trn: '' });
                }
              }}
              placeholder="Enter TRN"
              leftIcon={<FaIdCard />}
              error={addFormErrors.trn}
            />
          </div>
        </div>
      </Modal>

      {/* Shop Image Modal */}
      <ImageUploadModal
        isOpen={pictureModalOpen}
        onClose={() => { setPictureModalOpen(false); setPictureShop(null); }}
        title={pictureShop ? `Shop Image — ${pictureShop.name}` : 'Shop Image'}
        currentImagePath={pictureShop?.shopImagePath || null}
        onUpload={handleUploadShopImage}
        onDelete={handleDeleteShopImage}
        uploading={uploading}
        deleting={uploading}
      />
    </div>
  );
}

export default ShopsMasterData;
