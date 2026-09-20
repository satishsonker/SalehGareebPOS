import React, { useState } from 'react'
import './AddCustomerModel.css';
import { createCustomerBasic } from '../../../services/api/customersApi';
import {
    FiUser,
    FiPhone,
    FiMail,
    FiX,
    FiSave,
    FiFlag
} from 'react-icons/fi';
import Modal from '../../../components/Modal/Modal';
export default function AddCustomerModel({ order, setOrder, addCustomerModalOpen, setAddCustomerModalOpen, emirateList }) {
    const emptyCustomer = {
        firstName: '',
        mobile: ''
    };

    const [customerError, setCustomerError] = useState({
        message: ''
    });
    const handleCustomerChange = (e) => {
        const { name, value } = e.target;
        setOrder(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddCustomer = async () => {
        setCustomerError({
            message: ''
        });

        if (!order?.firstName?.trim()) {
            setCustomerError({
                message: 'First name is required.'
            });
            return;
        }

        if (!order?.mobile?.trim()) {
            setCustomerError({
                message: 'Mobile number is required.'
            });
            return;
        }

        try {

            // Replace with your API
            const response = await createCustomerBasic({
                firstName: order?.firstName,
                mobile: order?.mobile,
                isd: order?.isd,
                emirateId: order?.emirateId
            });
            if (response?.success) {
                setAddCustomerModalOpen(false);
                setOrder(prev => ({
                    ...prev,
                    ["customerId"]: response.id
                }));
            }

        } catch (error) {
            setCustomerError({
                message:
                    error?.response?.data?.message ||
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
                size="mid"
                type="default"
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
                                        value={order?.customerName}
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
                                        value={order?.lastName}
                                        onChange={handleCustomerChange}
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>

                            {/* Mobile */}
                            <div className="customer-field">
                                <label>Mobile<span>*</span></label>
                                <div className="customer-input">
                                    <span className="customer-country-code">+971</span>
                                    <FiPhone size={14} />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={order?.mobile}
                                        onChange={handleCustomerChange}
                                        placeholder="Enter mobile number"
                                    />
                                </div>
                            </div>

                            {/* Emirate */}
                            <div className="customer-field">
                                <label>Emirate <span>*</span></label>
                                <vic className="customer-input">
                                    <div className="customer-select">
                                        <select name='emirateId'
                                           
                                            onChange={handleCustomerChange}
                                            value={order?.emirateId}>
                                            <option>Select a Emirate</option>
                                            {emirateList?.map((ele, index) => {
                                                return <option key={index} value={ele?.id}>{ele?.displayValue}</option>
                                            })}
                                        </select>
                                    </div>
                                </vic>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}
