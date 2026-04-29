import React, { useState, useEffect } from 'react';
import { FiRefreshCw, FiDownload, FiFilter, FiPlus, FiDatabase, FiTag, FiFileText, FiHash } from 'react-icons/fi';
import DataGrid from '../../../components/DataGrid';
import Modal from '../../../components/Modal/Modal';
import Button from '../../../components/Button/Button';
import TextBox from '../../../components/TextBox/TextBox';
import Select from '../../../components/Select/Select';
import Sw from '../../../components/Switch/Switch';
import { useNotification } from '../../../components/Notification';
import { getMasterDatas, getMasterDataTypes, createMasterData, getMasterDataById, deleteMasterData, updateMasterData } from '../../../services/api/masterDataApi';
import './MasterData.css';
import { mergeValidationErrorsFromApi } from '../../../utils/apiError';
import { tableHeaderFormat } from '../../../utils/tableHeaderFormat';
import { commonLogic } from '../../../utils/commonLogic';

function MasterData() {
    const { success, error: showError, info, confirm } = useNotification();
    const [items, setItems] = useState([]);
    const [pageNo, setPageNo] = useState(1);
    const [pageSize] = useState(10);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [filterBy, setFilterBy] = useState({})
    const [addFormData, setAddFormData] = useState({
        masterDataType: '',
        code: '',
        displayValue: '',
        remark: '',
        displayOrder: 1,
        canDelete: true,
        dataType: 'string',
    });
    const [addFormErrors, setAddFormErrors] = useState({});
    const [editFormErrors, setEditFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [masterDataType, setMasterDataType] = useState([{}]);

    useEffect(() => {
        var query = `pageNo=${pageNo}&pageSize=${pageSize}`;
        query += `&${commonLogic.toQueryString(filterBy,'filterBy')}`;
        fetchMasterDatas(query);
        fetchMasterDataTypes();
    }, [pageNo, pageSize]);

    const filterMasterData = (e) => {
        var { name, value } = e.target;
        var model = filterBy;
        model[name] = value;
        setFilterBy({ ...model, [name]: value });
      
         var query = `pageNo=1&pageSize=${pageSize}`;
        query += `&${commonLogic.toQueryString(filterBy,'filterBy')}`;
        fetchMasterDatas(query);
    }

    const fetchMasterDatas = async (query) => {
        setLoading(true);
        try {
            const response = await getMasterDatas(query);
            if (response.success && response.data) {
                setItems(response.data?.data || []);
                setTotalRecords(response.data?.totalRecords ?? 0);
            }
        } catch (error) {
            console.error('Failed to fetch master data:', error);
            showError('Failed to load master data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchMasterDataTypes = async () => {
        setLoading(true);
        try {
            const response = await getMasterDataTypes();
            if (response.success && response.data) {
                setMasterDataType(response.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch master data types:', error);
            showError('Failed to load master data types. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReload = () => {
        var query = `pageNo=1&pageSize=${pageSize}`;
        query += `&${commonLogic.toQueryString(filterBy,'filterBy')}`;
        fetchMasterDatas(query);
    };

    const handleAdd = () => {
        setAddFormData({
            type: '',
            key: '',
            value: '',
            remark: '',
            displayOrder: 1,
            dataType: 'string',
            canDelete: true,
        });
        setAddFormErrors({});
        setAddModalOpen(true);
    };

    const handleSaveAdd = async () => {
        const errors = {};

        if (!addFormData.masterDataType || addFormData.masterDataType.trim() === '') {
            errors.masterDataType = 'Master Data Type is required';
        }
        if (!addFormData.code || addFormData.code.trim() === '') {
            errors.code = 'Code is required';
        }
        if (!addFormData.dataType || addFormData.dataType.trim() === '') {
            errors.dataType = 'Data Type is required';
        }
        if (!addFormData.displayValue || addFormData.displayValue.trim() === '') {
            errors.displayValue = 'Display Value is required';
        }

        setAddFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            showError('Please fill in all required fields correctly');
            return;
        }

        setSaving(true);
        try {
            const response = await createMasterData(addFormData);
            if (response.success) {
                success('Master data created successfully');
                setAddModalOpen(false);
                setAddFormData({ masterDataType: '', dataType: '', code: '', displayValue: '', remark: '', displayOrder: 1, canDelete: true });
                setAddFormErrors({});
                fetchMasterDatas();
            } else {
                showError(response.message || 'Failed to create master data');
            }
        } catch (error) {
            console.error('Failed to create master data:', error);
            mergeValidationErrorsFromApi(error, setAddFormErrors);
            showError(error.message || 'Failed to create master data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleExport = () => {
        info('Export master data to CSV/Excel');
    };

    const handleFilter = () => {
        info('Filter master data');
    };

    const handleAction = async (action, row) => {
        switch (action) {
            case 'view':
                try {
                    const response = await getMasterDataById(row.id);
                    setSelectedItem(response.success && response.data ? response.data : row);
                    setViewModalOpen(true);
                } catch (error) {
                    console.error('Failed to fetch master data details:', error);
                    setSelectedItem(row);
                    setViewModalOpen(true);
                }
                break;
            case 'edit':
                try {
                    const response = await getMasterDataById(row.id);
                    const data = response.success && response.data ? response.data : row;
                    setSelectedItem(data);
                    setEditFormData({
                        type: data.type || '',
                        key: data.key || '',
                        value: data.value || '',
                        remark: data.remark || '',
                        displayOrder: data.displayOrder ?? 1,
                    });
                    setEditFormErrors({});
                    setEditModalOpen(true);
                } catch (error) {
                    console.error('Failed to fetch master data details:', error);
                    setSelectedItem(row);
                    setEditFormData({
                        type: row.type || '',
                        key: row.key || '',
                        value: row.value || '',
                        remark: row.remark || '',
                        displayOrder: row.displayOrder ?? 1,
                    });
                    setEditFormErrors({});
                    setEditModalOpen(true);
                }
                break;
            case 'delete':
                confirm({
                    type: 'danger',
                    title: 'Delete Master Data',
                    message: `Are you sure you want to delete "${row.key}"? This action cannot be undone.`,
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                }).then(async (confirmed) => {
                    if (confirmed) {
                        try {
                            setLoading(true);
                            const response = await deleteMasterData(row.id);
                            if (response.success) {
                                success('Master data deleted successfully');
                                fetchMasterDatas();
                            } else {
                                showError(response.message || 'Failed to delete master data. Please try again.');
                            }
                        } catch (error) {
                            console.error('Failed to delete master data:', error);
                            showError(error.message || 'Failed to delete master data. Please try again.');
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
        if (!selectedItem) return;

        const errors = {};

        if (!editFormData.type || editFormData.type.trim() === '') {
            errors.type = 'Type is required';
        }
        if (!editFormData.key || editFormData.key.trim() === '') {
            errors.key = 'Key is required';
        }
        if (!editFormData.value || editFormData.value.trim() === '') {
            errors.value = 'Value is required';
        }

        setEditFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            showError('Please fill in all required fields correctly');
            return;
        }

        setSaving(true);
        try {
            const response = await updateMasterData(selectedItem.id, editFormData);
            if (response.success) {
                success('Master data updated successfully');
                setEditModalOpen(false);
                setSelectedItem(null);
                setEditFormErrors({});
                fetchMasterDatas();
            } else {
                showError(response.message || 'Failed to update master data');
            }
        } catch (error) {
            console.error('Failed to update master data:', error);
            mergeValidationErrorsFromApi(error, setEditFormErrors);
            showError(error.message || 'Failed to update master data. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const columns = tableHeaderFormat.masterData;

    const customToolbar = (
        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.25rem', border: '1px solid var(--border-color)', borderRadius: '6px', padding: '0.25rem', backgroundColor: 'var(--bg-primary)' }}>
                <Select
                    options={masterDataType?.map((type) => ({ value: type, label: type }))}
                    placeholder="Filter by type..."
                    value={filterBy.masterDataType}  
                    onChange={e=>filterMasterData({ target: { name: 'masterDataType', value: e,type:'select-ine' } })}
                />

                <Button
                    variant="ghost"
                    icon={<FiFilter />}
                    onClick={handleFilter}
                    title="Filter master data"
                    aria-label="Filter"
                />
                <Button
                    variant="ghost"
                    icon={<FiDownload />}
                    onClick={handleExport}
                    title="Export master data to CSV/Excel"
                    aria-label="Export"
                />
                <Button
                    variant="ghost"
                    icon={<FiRefreshCw />}
                    onClick={handleReload}
                    disabled={loading}
                    loading={loading}
                    title="Reload master data"
                    aria-label="Reload"
                />
            </div>
            <Button
                variant="primary"
                icon={<FiPlus />}
                onClick={handleAdd}
                title="Add new master data"
                aria-label="Add new"
            >
                Add Data
            </Button>
        </div>
    );
    const onChange = (e) => {
        var { name, value } = e.target;
        var model = addFormData;
        if (name === "displayValue") {
            value = value.trimStart();
            model.code = value.toUpperCase().replace(/\s+/g, '_');
            if (addFormErrors.displayValue) setAddFormErrors({ ...addFormErrors, displayValue: '' });
            if (addFormErrors.code) setAddFormErrors({ ...addFormErrors, code: '' });
        }
        setAddFormData({ ...model, [name]: value });
        if (addFormErrors[name]) setAddFormErrors({ ...addFormErrors, [name]: '' });
    }

    const onEditChange = (e) => {
        var { name, value } = e.target;
        var model = editFormData;
        if (name === "displayValue") {
            value = value.trimStart();
            model.code = value.toUpperCase().replace(/\s+/g, '_');
            if (editFormErrors.displayValue) setEditFormErrors({ ...editFormErrors, displayValue: '' });
            if (editFormErrors.code) setEditFormErrors({ ...editFormErrors, code: '' });
        }
        setEditFormData({ ...model, [name]: value });
        if (editFormErrors[name]) setEditFormErrors({ ...editFormErrors, [name]: '' });
    }
    return (
        <div className="master-data">
            <DataGrid
                data={items}
                columns={columns}
                onAction={handleAction}
                loading={loading}
                pageSize={pageSize}
                serverSide={true}
                page={pageNo}
                totalRecords={totalRecords}
                onPageChange={setPageNo}
                searchPlaceholder="Search by type, key, value..."
                printTitle="Master Data"
                emptyMessage="No master data found"
                defaultActions={{
                    view: true,
                    edit: true,
                    delete: true,
                    print: false,
                }}
                toolbar={customToolbar}
                showPagination={true}
            />

            {/* View Modal */}
            <Modal
                isOpen={viewModalOpen}
                onClose={() => {
                    setViewModalOpen(false);
                    setSelectedItem(null);
                }}
                title="Master Data Details"
                size="medium"
                type="info"
            >
                {selectedItem && (
                    <div className="modal-form">
                        <div className="detail-row">
                            <label>ID:</label>
                            <span>{selectedItem.id}</span>
                        </div>
                        <div className="detail-row">
                            <label>Type:</label>
                            <span>{selectedItem.type || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <label>Key:</label>
                            <span>{selectedItem.key || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <label>Value:</label>
                            <span>{selectedItem.value || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <label>Remark:</label>
                            <span>{selectedItem.remark || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <label>Display Order:</label>
                            <span>{selectedItem.displayOrder ?? 'N/A'}</span>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setSelectedItem(null);
                    setEditFormData({});
                    setEditFormErrors({});
                }}
                title="Edit Master Data"
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
                            setSelectedItem(null);
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
                {selectedItem && (
                    <div className="modal-form">
                        <div className='form-group'>
                            <Select
                            label="Type"
                            required={true}
                            options={masterDataType?.map((type) => ({ value: type, label: type }))}
                            placeholder="Filter by type..."
                            onChange={e => onEditChange({ target: { name: 'masterDataType', value: e } })}
                            name="masterDataType"
                            value={editFormData.masterDataType}
                            error={editFormErrors.masterDataType}
                            leftIcon={<FiDatabase />}
                        />
                    </div>
                        <div className="form-group">
                            <TextBox
                                id="edit-displayValue"
                                label="Display Value"
                                required={true}
                                name="displayValue"
                                value={editFormData.displayValue || ''}
                                onChange={onChange}
                                placeholder="Enter display value"
                                leftIcon={<FiDatabase />}
                                error={editFormErrors.displayValue}
                            />
                        </div>
                        <div className="form-group">
                            <TextBox
                                id="edit-code"
                                label="Code"
                                required={true}
                                name="code"
                                disabled={true}
                                value={editFormData.code || ''}
                                onChange={onChange}
                                placeholder="Automatic code generation based on value"
                                leftIcon={<FiTag />}
                                error={editFormErrors.code}
                            />
                        </div>
                        <div className="form-group">
                            <TextBox
                                id="edit-value"
                                label="Display Order"
                                type="number"
                                required={true}
                                name="displayOrder"
                                value={editFormData.displayOrder || ''}
                                onChange={onChange}
                                placeholder="Enter display order"
                                leftIcon={<FiFileText />}
                                error={editFormErrors.displayOrder}
                            />
                        </div>
                        <div className="form-group">
                            <TextBox
                                id="edit-value"
                                label="Data Type"
                                required={true}
                                value={editFormData.dataType || ''}
                                onChange={(e) => {
                                    setEditFormData({ ...editFormData, dataType: e.target.value });
                                    if (editFormErrors.dataType) setEditFormErrors({ ...editFormErrors, dataType: '' });
                                }}
                                placeholder="Enter data type (e.g. string, number, boolean)"
                                leftIcon={<FiFileText />}
                                error={editFormErrors.dataType}
                            />
                        </div>
                        <div className="form-group">
                            <TextBox
                                id="edit-remark"
                                label="Remark"
                                value={editFormData.remark || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, remark: e.target.value })}
                                placeholder="Enter remark (optional)"
                            />
                        </div>
                        <div className="form-group">
                            <TextBox
                                id="edit-displayOrder"
                                label="Display Order"
                                type="number"
                                value={editFormData.displayOrder ?? 1}
                                onChange={(e) => setEditFormData({ ...editFormData, displayOrder: parseInt(e.target.value) || 1 })}
                                placeholder="Enter display order"
                                leftIcon={<FiHash />}
                                min={1}
                                step={1}
                            />
                        </div>
                    </div>
                )}
            </Modal>

            {/* Add Modal */}
            <Modal
                isOpen={addModalOpen}
                onClose={() => {
                    setAddModalOpen(false);
                    setAddFormData({ masterDataType: '', code: '', displayValue: '', remark: '', displayOrder: 1, canDelete: true });
                    setAddFormErrors({});
                }}
                title="Add Master Data"
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
                            setAddFormData({ masterDataType: '', code: '', displayValue: '', remark: '', displayOrder: 1, canDelete: true });
                        },
                        variant: 'secondary',
                        disabled: saving,
                    },
                    {
                        label: 'Create',
                        onClick: handleSaveAdd,
                        variant: 'primary',
                        disabled: saving,
                    },
                ]}
            >
                <div className="modal-form">
                    <div className="form-group">
                        <Select
                            label="Type"
                            required={true}
                            options={masterDataType?.map((type) => ({ value: type, label: type }))}
                            placeholder="Filter by type..."
                            onChange={e => onChange({ target: { name: 'masterDataType', value: e } })}
                            name="masterDataType"
                            value={addFormData.masterDataType}
                            error={addFormErrors.masterDataType}
                            leftIcon={<FiDatabase />}
                        />
                    </div>
                    <div className="form-group">
                        <TextBox
                            id="add-value"
                            label="Value"
                            required={true}
                            name="displayValue"
                            value={addFormData.displayValue}
                            onChange={onChange}
                            placeholder="Enter data value"
                            leftIcon={<FiFileText />}
                            error={addFormErrors.displayValue}
                        />
                    </div>
                    <div className="form-group">
                        <TextBox
                            id="add-code"
                            label="Code"
                            required={true}
                            name="code"
                            value={addFormData.code}
                            onChange={onChange}
                            placeholder="Automatic code generation based on value"
                            leftIcon={<FiTag />}
                            error={addFormErrors.code}
                            disabled={true}
                        />
                    </div>
                    <div className="form-group">
                        <TextBox
                            id="add-remark"
                            label="Remark"
                            name="remark"
                            value={addFormData.remark}
                            onChange={onChange}
                            placeholder="Enter remark (optional)"
                        />
                    </div>
                    <div className="form-group">
                        <TextBox
                            id="add-displayOrder"
                            label="Display Order"
                            type="number"
                            name="displayOrder"
                            value={addFormData.displayOrder}
                            onChange={onChange}
                            placeholder="Enter display order"
                            leftIcon={<FiHash />}
                            showVirtualKeyboard={false}
                            min={1}
                            step={1}
                        />
                    </div>
                    <div className="form-group">
                        <TextBox
                            id="add-dataType"
                            label="Data Type"
                            type="text"
                            name="dataType"
                            value={addFormData.dataType}
                            onChange={onChange}
                            placeholder="Enter data type (e.g. string, number, boolean)"
                            leftIcon={<FiHash />}
                            showVirtualKeyboard={false}
                            min={1}
                            step={1}
                        />
                    </div>
                    <div className='form-group'>
                        <Sw id="add-canDelete"
                            label="Can Delete"
                            labelPosition="left"
                            name="canDelete"
                            checked={addFormData.canDelete}
                            onChange={e => onChange({ target: { name: 'canDelete', value: e } })}
                            onLabel="YES"
                            offLabel="NO"
                            size="large"
                        />

                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default MasterData;
