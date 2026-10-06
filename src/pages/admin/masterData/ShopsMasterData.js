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
  const EMPTY_SHOP = {
    name: '',
    code: '',
    address1: '',
    address2: '',
    address3: '',
    phone: '',
    mobile: '',
    email: '',
    customerSupportHeading: '',
    customerSupportNumber: '',
    ar_name: '',
    ar_address1: '',
    ar_address2: '',
    ar_address3: '',
    ar_phone: '',
    ar_mobile: '',
    ar_customerSupportNumber: '',
    ar_customerSupportHeading: '',
    trn: ''
  }
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
  const [addFormData, setAddFormData] = useState(EMPTY_SHOP);
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
    setAddFormData(EMPTY_SHOP);
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
    if (!addFormData.address1 || addFormData.address1.trim() === '') {
      errors.address1 = 'Address is required';
    }
    if (!addFormData.address2 || addFormData.address2.trim() === '') {
      errors.address2 = 'Address is required';
    }
    if (!addFormData.mobile || addFormData.mobile.trim() === '') {
      errors.mobile = 'Mobile is required';
    }

    if (!addFormData.email || addFormData.email.trim() === '') {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addFormData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!addFormData.trn || addFormData.trn.trim() === '') {
      errors.trn = 'TRN is required';
    }

    if (!addFormData.ar_name || addFormData.ar_name.trim() === '') {
      errors.ar_name = 'Arabic shop name is required';
    }
    if (!addFormData.ar_address1 || addFormData.ar_address1.trim() === '') {
      errors.ar_address1 = 'Arabic Address is required';
    }
    if (!addFormData.ar_address2 || addFormData.ar_address2.trim() === '') {
      errors.ar_address2 = 'Arabic Address line2  is required';
    }
    if (!addFormData.ar_mobile || addFormData.ar_mobile.trim() === '') {
      errors.ar_mobile = 'Arabic Mobile is required';
    }

    if (!addFormData.customerSupportNumber || addFormData.customerSupportNumber.trim() === '') {
      errors.customerSupportNumber = 'Customer support number is required';
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
        setAddFormData(EMPTY_SHOP);
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
              code: response.data.code || '',
              name: response.data.name || '',
              address1: response.data.address1 || '',
              address2: response.data.address2 || '',
              address3: response.data.address3 || '',
              city: response.data.city || '',
              country: response.data.country || '',
              phone: response.data.phone || '',
              mobile: response.data.mobile || '',
              email: response.data.email || '',
              trn: response.data.trn || '',
              arName: response.data.arName || '',
              arAddress1: response.data.arAddress1 || '',
              arAddress2: response.data.arAddress2 || '',
              arAddress3: response.data.arAddress3 || '',
              arPhone: response.data.arPhone || '',
              arMobile: response.data.arMobile || '',
              arCity: response.data.arCity || '',
              arCountry: response.data.arCountry || '',
              customerSupportNumber: response.data.customerSupportNumber || '',
              arCustomerSupportNumber: response.data.arCustomerSupportNumber || '',
              arCustomerSupportHeading: response.data.arCustomerSupportHeading || '',
              customerSupportHeading: response.data.customerSupportHeading || ''
            });
            setEditFormErrors({});
            setEditModalOpen(true);
          } else {
            setSelectedShop(row);
            setEditFormData({
              code: row.code || '',
              name: row.name || '',
              address1: row.address1 || '',
              address2: row.address2 || '',
              address3: row.address3 || '',
              phone: row.phone || '',
              mobile: row.mobile || '',
              email: row.email || '',
              trn: row.trn || '',
              city: row.city || '',
              country: row.country || '',
              arName: row.arName || '',
              arAddress1: row.arAddress1 || '',
              arAddress2: row.arAddress2 || '',
              arAddress3: row.arAddress3 || '',
              arPhone: row.arPhone || '',
              arMobile: row.arMobile || '',
              arCity: row.arCity || '',
              arCountry: row.arCountry || '',
              customerSupportNumber: row.customerSupportNumber || '',
              arCustomerSupportNumber: row.arCustomerSupportNumber || '',
              arCustomerSupportHeading: row.arCustomerSupportHeading || '',
              customerSupportHeading: row.customerSupportHeading || ''
            });
            setEditFormErrors({});
            setEditModalOpen(true);
          }
        } catch (error) {
          console.error('Failed to fetch shop details:', error);
          setSelectedShop(row);
          setEditFormData({
            code: row.code || '',
            name: row.name || '',
            address1: row.address1 || '',
            address2: row.address2 || '',
            address3: row.address3 || '',
            phone: row.phone || '',
            mobile: row.mobile || '',
            email: row.email || '',
            trn: row.trn || '',
            city: row.city || '',
            country: row.country || '',
            arName: row.arName || '',
            arAddress1: row.arAddress1 || '',
            arAddress2: row.arAddress2 || '',
            arAddress3: row.arAddress3 || '',
            arPhone: row.arPhone || '',
            arMobile: row.arMobile || '',
            arCity: row.arCity || '',
            arCountry: row.arCountry || '',
            customerSupportNumber: row.customerSupportNumber || '',
            arCustomerSupportNumber: row.arCustomerSupportNumber || '',
            arCustomerSupportHeading: row.arCustomerSupportHeading || '',
            customerSupportHeading: row.customerSupportHeading || ''
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
    if (!editFormData.code || editFormData.code.trim() === '') {
      errors.code = 'Shop code is required';
    }
    if (!editFormData.name || editFormData.name.trim() === '') {
      errors.name = 'Shop name is required';
    }
    if (!editFormData.address1 || editFormData.address1.trim() === '') {
      errors.address1 = 'Address is required';
    }
    if (!editFormData.address2 || editFormData.address2.trim() === '') {
      errors.address2 = 'Address line 2 is required';
    }
    if (!editFormData.mobile || editFormData.mobile.trim() === '') {
      errors.mobile = 'Mobile is required';
    }

    if (!editFormData.arName || editFormData.arName.trim() === '') {
      errors.arName = 'Arabic shop name is required';
    }
    if (!editFormData.arAddress1 || editFormData.arAddress1.trim() === '') {
      errors.arAddress1 = 'Arabic address is required';
    }
    if (!editFormData.arAddress2 || editFormData.arAddress2.trim() === '') {
      errors.arAddress2 = 'Arabic address line 2 is required';
    }
     if (!editFormData.city || editFormData.city.trim() === '') {
      errors.city = 'City is required';
    }
     if (!editFormData.arCity || editFormData.arCity.trim() === '') {
      errors.arCity = 'Arabic city is required';
    }
     if (!editFormData.country || editFormData.country.trim() === '') {
      errors.country = 'Country is required';
    }
     if (!editFormData.arCountry || editFormData.arCountry.trim() === '') {
      errors.arCountry = 'Arabic country is required';
    }
    if (!editFormData.arMobile || editFormData.arMobile.trim() === '') {
      errors.arMobile = 'Arabic mobile is required';
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
       setEditFormData({ ...editFormData, "id": selectedShop.id });
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

  const columns = tableHeaderFormat.masterShopData;
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
              <span>{selectedShop.name || 'N/A'}-{selectedShop.arName || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaCode /> Code:</label>
              <span>{selectedShop.code || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaMapLocation /> Address:</label>
              <span>{selectedShop.address || 'N/A'}-{selectedShop.arAddress || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaMapLocation /> Address Line 2:</label>
              <span>{selectedShop.address2 || 'N/A'}-{selectedShop.arAddress2 || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaMapLocation /> Address Line 3:</label>
              <span>{selectedShop.address3 || 'N/A'}-{selectedShop.arAddress3 || 'N/A'}</span>
            </div>
             <div className="detail-row">
              <label><FaMapLocation /> Address Line 3:</label>
              <span>{selectedShop.address3 || 'N/A'}-{selectedShop.arAddress3 || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaMapLocation /> City:</label>
              <span>{selectedShop.city || 'N/A'}-{selectedShop.arCity || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaMapLocation /> Country:</label>
              <span>{selectedShop.country || 'N/A'}-{selectedShop.arCountry || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaPhone /> Phone:</label>
              <span>{selectedShop.phone || 'N/A'}</span>
            </div>
             <div className="detail-row">
              <label><FaPhone /> Mobile:</label>
              <span>{selectedShop.mobile || 'N/A'}-{selectedShop.arMobile || 'N/A'}</span>
            </div>
            <div className="detail-row">
              <label><FaRegEnvelope /> Email:</label>
              <span>{selectedShop.email || 'N/A'}</span>
            </div>
             <div className="detail-row">
              <label><FaRegEnvelope /> Customer Support Number:</label>
              <span>{selectedShop.customerSupportNumber || 'N/A'}-{selectedShop.arCustomerSupportNumber || 'N/A'}</span>
            </div>
             <div className="detail-row">
              <label><FaRegEnvelope /> Customer Support Header:</label>
              <span>{selectedShop.customerSupportHeader || 'N/A'}-{selectedShop.arCustomerSupportHeader || 'N/A'}</span>
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
                id="edit-arName"
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
              <TextBox
                id="edit-arName"
                label="Arabic Shop Name"
                required={true}
                value={editFormData.arName || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "arName": e.target.value });
                  if (editFormErrors.arName) {
                    setEditFormErrors({ ...editFormErrors, "arName": '' });
                  }
                }}
                placeholder="Enter Arabic shop name"
                leftIcon={<FaHouseFlag />}
                error={editFormErrors.arName}
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
                value={editFormData.address1 || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "address1": e.target.value });
                  if (editFormErrors.address1) {
                    setEditFormErrors({ ...editFormErrors, "address1": '' });
                  }
                }}
                placeholder="Enter shop address"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.address1}
              />
              <TextBox
                id="edit-address"
                label="Arabic Address Line`` 1"
                required={true}
                value={editFormData.arAddress1 || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "arAddress1": e.target.value });
                  if (editFormErrors.arAddress1) {
                    setEditFormErrors({ ...editFormErrors, "arAddress1": '' });
                  }
                }}
                placeholder="Enter shop address"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.arAddress1}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-address"
                label="Address Line 2"
                required={true}
                value={editFormData.address2 || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "address2": e.target.value });
                  if (editFormErrors.address2) {
                    setEditFormErrors({ ...editFormErrors, "address2": '' });
                  }
                }}
                placeholder="Enter shop address"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.address2}
              />
              <TextBox
                id="edit-address"
                label="Arabic Address Line 2"
                required={true}
                value={editFormData.arAddress2 || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "arAddress2": e.target.value });
                  if (editFormErrors.arAddress2) {
                    setEditFormErrors({ ...editFormErrors, "arAddress2": '' });
                  }
                }}
                placeholder="Enter shop address"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.arAddress2}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-address"
                label="Address Line 3"
                value={editFormData.address3 || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "address3": e.target.value });
                  if (editFormErrors.address3) {
                    setEditFormErrors({ ...editFormErrors, "address3": '' });
                  }
                }}
                placeholder="Enter shop address"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.address3}
              />
              <TextBox
                id="edit-address"
                label="Arabic Address Line 3"
                value={editFormData.arAddress3 || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "arAddress3": e.target.value });
                  if (editFormErrors.arAddress3) {
                    setEditFormErrors({ ...editFormErrors, "arAddress3": '' });
                  }
                }}
                placeholder="Enter shop address"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.arAddress3}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-city"
                label="City"
                required={true}
                value={editFormData.city || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, city: e.target.value });
                  if (editFormErrors.city) {
                    setEditFormErrors({ ...editFormErrors, city: '' });
                  }
                }}
                placeholder="Enter shop city"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.city}
              />
              <TextBox
                id="edit-ar-city"
                label="Arabic City"
                required={true}
                value={editFormData.arCity || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "arCity": e.target.value });
                  if (editFormErrors.arCity) {
                    setEditFormErrors({ ...editFormErrors, "arCity": '' });
                  }
                }}
                placeholder="Enter shop city in arabic"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.arCity}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-country"
                label="Country"
                required={true}
                value={editFormData.country || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, country: e.target.value });
                  if (editFormErrors.country) {
                    setEditFormErrors({ ...editFormErrors, country: '' });
                  }
                }}
                placeholder="Enter shop country"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.country}
              />
              <TextBox
                id="edit-ar-country"
                label="Arabic Country"
                required={true}
                value={editFormData.arCountry || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "arCountry": e.target.value });
                  if (editFormErrors.arCountry) {
                    setEditFormErrors({ ...editFormErrors, "arCountry": '' });
                  }
                }}
                placeholder="Enter shop country in arabic"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.arCountry}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-mobile"
                label="Mobile"
                required={true}
                type="tel"
                value={editFormData.mobile || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, mobile: e.target.value });
                  if (editFormErrors.mobile) {
                    setEditFormErrors({ ...editFormErrors, mobile: '' });
                  }
                }}
                placeholder="Enter mobile number"
                leftIcon={<FaPhone />}
                showVirtualKeyboard={true}
                error={editFormErrors.mobile}
              />
              <TextBox
                id="edit-ar-mobile"
                label="Arabic Mobile"
                required={true}
                type="tel"
                value={editFormData.arMobile || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "arMobile": e.target.value });
                  if (editFormErrors.arMobile) {
                    setEditFormErrors({ ...editFormErrors, "arMobile": '' });
                  }
                }}
                placeholder="Enter mobile number"
                leftIcon={<FaPhone />}
                showVirtualKeyboard={true}
                error={editFormErrors.arMobile}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-phone"
                label="Phone"
                type="tel"
                value={editFormData.phone || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "phone": e.target.value });
                  if (editFormErrors.phone) {
                    setEditFormErrors({ ...editFormErrors, "phone": '' });
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
                  setEditFormData({ ...editFormData, "email": e.target.value });
                  if (editFormErrors.email) {
                    setEditFormErrors({ ...editFormErrors, "email": '' });
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
                  setEditFormData({ ...editFormData, "trn": e.target.value });
                  if (editFormErrors.trn) {
                    setEditFormErrors({ ...editFormErrors, "trn": '' });
                  }
                }}
                placeholder="Enter TRN"
                error={editFormErrors.trn}
              />
            </div>
            <div className="form-group">
              <TextBox
                id="edit-customerSupportNumber"
                label="Customer Support Number"
                value={editFormData.customerSupportNumber || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "customerSupportNumber": e.target.value });
                  if (editFormErrors.customerSupportNumber) {
                    setEditFormErrors({ ...editFormErrors, "customerSupportNumber": '' });
                  }
                }}
                placeholder="Enter customer support number"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.customerSupportNumber}
              />
              <TextBox
                id="edit-ar-customerSupportNumber"
                label="Arabic Customer Support Number"
                value={editFormData.arCustomerSupportNumber || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "arCustomerSupportNumber": e.target.value });
                  if (editFormErrors.arCustomerSupportNumber) {
                    setEditFormErrors({ ...editFormErrors, "arCustomerSupportNumber": '' });
                  }
                }}
                placeholder="Enter customer support number in arabic"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.arCustomerSupportNumber}
              />
            </div>
              <div className="form-group">
              <TextBox
                id="edit-customerSupportHeader"
                label="Customer Support Header"
                value={editFormData.customerSupportHeader || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "customerSupportHeader": e.target.value });
                  if (editFormErrors.customerSupportHeader) {
                    setEditFormErrors({ ...editFormErrors, "customerSupportHeader": '' });
                  }
                }}
                placeholder="Enter customer support header"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.customerSupportHeader}
              />
              <TextBox
                id="edit-ar-customerSupportHeader"
                label="Arabic Customer Support Header"
                value={editFormData.arCustomerSupportHeader || ''}
                onChange={(e) => {
                  setEditFormData({ ...editFormData, "arCustomerSupportHeader": e.target.value });
                  if (editFormErrors.arCustomerSupportHeader) {
                    setEditFormErrors({ ...editFormErrors, "arCustomerSupportHeader": '' });
                  }
                }}
                placeholder="Enter customer support header in arabic"
                leftIcon={<FaMapLocation />}
                error={editFormErrors.arCustomerSupportHeader}
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
          setAddFormData(EMPTY_SHOP);
          setAddFormErrors({});
        }}
        title="Add New Shop"
        size="large"
        type="default"
        showCloseButton={true}
        closeOnOverlayClick={!saving}
        loading={saving}
        actions={[
          {
            label: 'Cancel',
            onClick: () => {
              setAddModalOpen(false);
              setAddFormData(EMPTY_SHOP);
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
            <TextBox
              label="Arabic Shop Name"
              id="add-ar-name"
              value={addFormData.arName}
              onChange={(e) => {
                setAddFormData({ ...addFormData, arName: e.target.value });
                if (addFormErrors.arName) {
                  setAddFormErrors({ ...addFormErrors, arName: '' });
                }
              }}
              placeholder="Enter shop name"
              required={true}
              leftIcon={<FaHouseFlag />}
              error={addFormErrors.arName}
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
              value={addFormData.address1}
              onChange={(e) => {
                setAddFormData({ ...addFormData, address1: e.target.value });
                if (addFormErrors.address1) {
                  setAddFormErrors({ ...addFormErrors, address1: '' });
                }
              }}
              placeholder="Enter shop address"
              leftIcon={<FaMapLocation />}
              error={addFormErrors.address1}
            />
            <TextBox
              label="Arabic Address"
              required={true}
              id="add-ar-address"
              value={addFormData.arAddress1}
              onChange={(e) => {
                setAddFormData({ ...addFormData, arAddress1: e.target.value });
                if (addFormErrors.arAddress1) {
                  setAddFormErrors({ ...addFormErrors, arAddress1: '' });
                }
              }}
              placeholder="Enter shop address"
              leftIcon={<FaMapLocation />}
              error={addFormErrors.arAddress1}
            />
          </div>
          <div className="form-group">
            <TextBox
              label="Address Line 2"
              required={true}
              id="add-address"
              value={addFormData.address2}
              onChange={(e) => {
                setAddFormData({ ...addFormData, address2: e.target.value });
                if (addFormErrors.address2) {
                  setAddFormErrors({ ...addFormErrors, address2: '' });
                }
              }}
              placeholder="Enter shop address"
              leftIcon={<FaMapLocation />}
              error={addFormErrors.address2}
            />
            <TextBox
              label="Arabic Address Line 2"
              required={true}
              id="add-ar-address"
              value={addFormData.arAddress2}
              onChange={(e) => {
                setAddFormData({ ...addFormData, arAddress2: e.target.value });
                if (addFormErrors.arAddress2) {
                  setAddFormErrors({ ...addFormErrors, arAddress2: '' });
                }
              }}
              placeholder="Enter shop address"
              leftIcon={<FaMapLocation />}
              error={addFormErrors.arAddress2}
            />
          </div>
          <div className="form-group">
            <TextBox
              label="Address Line 3"
              required={true}
              id="add-address"
              value={addFormData.address3}
              onChange={(e) => {
                setAddFormData({ ...addFormData, address3: e.target.value });
                if (addFormErrors.address3) {
                  setAddFormErrors({ ...addFormErrors, address3: '' });
                }
              }}
              placeholder="Enter shop address"
              leftIcon={<FaMapLocation />}
              error={addFormErrors.address3}
            />
            <TextBox
              label="Arabic Address Line 3"
              required={true}
              id="add-ar-address"
              value={addFormData.arAddress3}
              onChange={(e) => {
                setAddFormData({ ...addFormData, arAddress3: e.target.value });
                if (addFormErrors.arAddress3) {
                  setAddFormErrors({ ...addFormErrors, arAddress3: '' });
                }
              }}
              placeholder="Enter shop address"
              leftIcon={<FaMapLocation />}
              error={addFormErrors.arAddress3}
            />
          </div>
          <div className="form-group">
            <TextBox
              id="add-mobile"
              label="Mobile"
              required={true}
              type="tel"
              value={addFormData.mobile}
              onChange={(e) => {
                setAddFormData({ ...addFormData, mobile: e.target.value });
                if (addFormErrors.mobile) {
                  setAddFormErrors({ ...addFormErrors, mobile: '' });
                }
              }}
              placeholder="Enter mobile number"
              leftIcon={<FaPhone />}
              showVirtualKeyboard={true}
              error={addFormErrors.mobile}
            />
            <TextBox
              id="add-ar-mobile"
              label="Arabic Mobile"
              required={true}
              type="tel"
              value={addFormData.arMobile}
              onChange={(e) => {
                setAddFormData({ ...addFormData, arMobile: e.target.value });
                if (addFormErrors.arMobile) {
                  setAddFormErrors({ ...addFormErrors, arMobile: '' });
                }
              }}
              placeholder="Enter Arabic mobile number"
              leftIcon={<FaPhone />}
              showVirtualKeyboard={true}
              error={addFormErrors.arMobile}
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
