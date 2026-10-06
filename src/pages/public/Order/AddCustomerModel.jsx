import React, { useState, useEffect } from 'react'
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
                message: 'Mobile number is required.'
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
                setAddCustomerModalOpen(false);
                setOrder(prev => ({
                    ...prev,
                    ["customerId"]: response.id,
                    firstName: customerModel.firstName,
                    lastName: customerModel.lastName,
                    emirateId: customerModel.emirateId
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
                                        value={customerModel?.customerName}
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
                                    <span className="customer-country-code">+971</span>
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
                                <vic className="customer-input">
                                    <div className="customer-select">
                                        <select name='emirateId'
                                            onChange={handleCustomerChange}
                                            value={customerModel?.emirateId}>
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
