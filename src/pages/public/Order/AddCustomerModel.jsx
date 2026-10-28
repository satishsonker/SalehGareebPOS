import React, { useState, useEffect } from 'react'
import './AddCustomerModel.css';
import { createCustomerBasic } from '../../../services/api/customersApi';
import {
    FiUser,
    FiPhone,
    FiX,
    FiSave,
    FiFlag
} from 'react-icons/fi';
import Modal from '../../../components/Modal/Modal';
import { commonLogic } from '../../../utils/commonLogic';
export default function AddCustomerModel({ order, setOrder, addCustomerModalOpen, setAddCustomerModalOpen, emirateList }) {
    const EMPTY_CUSTOMER = {
        firstName: '',
        mobile: order?.mobile,
        emirateId: '',
        lastName: '',
        isdCode: '+971'
    };

    useEffect(() => {
        setCustomerModel(pre => ({ ...pre, ["mobile"]: order?.mobile }))
    }, [order?.mobile]);

    const [customerModel, setCustomerModel] = useState(EMPTY_CUSTOMER);
    const [customerError, setCustomerError] = useState({
        message: ''
    });

    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        var data = value;
        if (name?.toLowerCase() === "firstname" || name?.toLowerCase() === "lastname") {
            data = commonLogic.capitalizeFirstLetter(data);
        }
        setCustomerModel(prev => ({
            ...prev,
            [name]: data
        }));
    };

    const handleAddCustomer = async () => {
        setCustomerError({
            message: ''
        });

        if (!customerModel?.firstName?.trim()) {
            setCustomerError({
                message: 'First name is required.'
            });
            return;
        }

        if (!customerModel?.mobile?.trim()) {
            setCustomerError({
                message: 'Mobile number is required.'
            });
            return;
        }
        if (customerModel?.mobile?.length < 7) {
            setCustomerError({
                message: 'Mobile number is invalid.'
            });
            return;
        }
        if (!customerModel?.emirateId?.trim()) {
            setCustomerError({
                message: 'Please select an emirate.'
            });
            return;
        }

        try {

            // Replace with your API
            const response = await createCustomerBasic({
                firstName: customerModel?.firstName,
                mobile: customerModel?.mobile,
                isdCode: customerModel?.isdCode,
                emirateId: customerModel?.emirateId,
                lastName: customerModel.lastName
            });
            if (response?.success) {
                const created = response?.data?.data ?? response?.data ?? response;
                setAddCustomerModalOpen(false);
                setOrder(prev => ({
                    ...prev,
                    customerId: created?.id ?? 0,
                    customerName: `${created?.firstName ?? customerModel.firstName} ${created?.lastName ?? customerModel.lastName}`.trim(),
                    mobile: created?.mobile ?? customerModel.mobile,
                    isd: created?.isdCode ?? customerModel.isdCode,
                    firstName: created?.firstName ?? customerModel.firstName,
                    lastName: created?.lastName ?? customerModel.lastName,
                    emirateId: created?.emirateId ?? customerModel.emirateId,
                    customerClass: created?.customerClass ?? 'Regular'
                }));
            }

        } catch (error) {
            setCustomerError({
                message:
                    error?.message ||
                    'Unable to create customer.'
            });
        }
    };
    return (
        <>
            <Modal
                isOpen={addCustomerModalOpen}
                onClose={() => setAddCustomerModalOpen(false)}
                title="Add Customer"
                size="medium"
                type="default"
                className="customer-modal-dialog"
                showCloseButton
                closeOnOverlayClick
                footer={
                    <div className="op-footer">
                        <div></div>
                        <div className="op-footer__right">
                            <button type="button" className="op-btn op-btn--danger" onClick={() => setAddCustomerModalOpen(false)} >
                                <FiX size={15} />
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="op-btn op-btn--save"
                                onClick={handleAddCustomer}
                            >
                                <FiSave size={15} />
                                Save Customer
                            </button>

                        </div>
                    </div>
                }
            >
                <div className="customer-modal">

                    {/* Error */}
                    {customerError?.message && (
                        <div className="customer-error">
                            {customerError.message}
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="customer-section">

                        <div className="customer-section-title">
                            <FiUser size={14} />
                            Customer Information
                        </div>

                        <div className="customer-form-grid">
                            {/* First Name */}
                            <div className="customer-field">
                                <label>First Name<span>*</span></label>
                                <div className="customer-input">
                                    <FiUser size={14} />
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={customerModel?.firstName || ''}
                                        onChange={handleCustomerChange}
                                        placeholder="Enter first name"
                                    />
                                </div>
                            </div>

                            {/* Last Name */}
                            <div className="customer-field">
                                <label>Last Name</label>
                                <div className="customer-input">
                                    <FiUser size={14} />
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={customerModel?.lastName}
                                        onChange={handleCustomerChange}
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="customer-field">
                                <label>Mobile<span>*</span></label>
                                <div className="customer-input">
                                    <span className="customer-country-code">{customerModel?.isdCode || '+971'}</span>
                                    <FiPhone size={14} />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={customerModel?.mobile}
                                        onChange={handleCustomerChange}
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                            </div>

                            {/* Emirate */}
                            <div className="customer-field">
                                <label>Emirate <span>*</span></label>
                                <div className="customer-input customer-input--select">
                                    <FiFlag size={14} aria-hidden="true" />
                                    <select name="emirateId"
                                        onChange={handleCustomerChange}
                                        value={customerModel?.emirateId || ''}>
                                        <option value="">Select an emirate</option>
                                        {emirateList?.map((ele) => (
                                            <option key={ele?.id} value={ele?.id}>{ele?.displayValue}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}
