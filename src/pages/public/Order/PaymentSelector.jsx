import React, { useEffect, useState } from 'react'
import './PaymentSelector.css'
import Modal from '../../../components/Modal/Modal'
import { FiAlertCircle, FiAlertTriangle, FiClock, FiFeather, FiMinus, FiSave, FiTrash, FiTruck, FiX } from 'react-icons/fi';
import { getMasterDataByTypes } from '../../../services/api/masterDataApi';
import { enums } from '../../../utils/enums';

export default function PaymentSelector({ order, setOrder, paymentModalOpen, setPaymentModalOpen }) {
    const [paymentMode, setPaymentMode] = useState('UPI');
    const [advanceAmount, setAdvanceAmount] = useState(0);
    const [advancePercent, setAdvancePercent] = useState(50);
    const [paymentModeList, setPaymentModeList] = useState([])
    const [bookingTypeList, setBookingTypeList] = useState([]);
    const [urgencyList, setUrgencyList] = useState([]);
    const orderSubTotal = 0;
    const subTotal = order?.orderDetails?.reduce(
        (sum, item) => sum + Number(item.price || 0),
        0
    );

    const vatAmount = subTotal * 0.05;

    const totalAmount = subTotal + vatAmount;

    const totalAdvance = Math.min(
        Number(advanceAmount) || 0,
        totalAmount
    );

    const balanceDue = totalAmount - totalAdvance;
    useEffect(() => {
        if (paymentModalOpen) {
            const defaultAdvance = totalAmount * 0.10;

            setAdvancePercent(10);
            setAdvanceAmount(defaultAdvance);
        }
    }, [paymentModalOpen, totalAmount]);

    useEffect(() => {
        getMasterDataByTypes([enums.masterDataCode.paymentMode,enums.masterDataCode.bookingType,enums.masterDataCode.urgency])
            .then((response) => {
                setPaymentModeList(response?.data?.data?.filter((item) => item.masterDataType?.toLowerCase() === enums.masterDataCode.paymentMode) || []);
                setBookingTypeList(response?.data?.data?.filter((item) => item.masterDataType?.toLowerCase() === enums.masterDataCode.bookingType) || []);
                setUrgencyList(response?.data?.data?.filter((item) => item.masterDataType?.toLowerCase() === enums.masterDataCode.urgency) || []);
            }).catch((error) => {
                console.error('Error fetching payment mode:', error);
            });
    }, []);

    const handlePaymentConfirm = () => {
        setPaymentModalOpen(false);
    }

    const handleAdvanceChange = (e) => {
        const value = Math.min(
            Math.max(Number(e.target.value) || 0, 0),
            totalAmount
        );

        setOrder({ ...order, ["advanceAmount"]: value });
        setAdvancePercent(null);
    }

    return (
        <>
            <Modal
                isOpen={paymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                title={`Payment - ${order?.orderDetails?.[order?.selectedSubOrderIndex]?.orderNo ??
                    'New Order'
                    }`}
                size="xlarge"
                type="default"
                showCloseButton
                closeOnOverlayClick
                footer={
                    <div className="op-footer">
                        <div style={{ visibility: 'hidden' }}></div>
                        <div className="op-footer__right">
                            <button className="op-btn op-btn--danger" onClick={() => setPaymentModalOpen(false)} >
                                <FiX size={15} /> Cancel
                            </button>

                            <button className="op-btn op-btn--save" onClick={handlePaymentConfirm} >
                                <FiSave size={15} />
                                Confirm Payment
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="payment-grid">

                    {/* COLUMN 1 - PAYMENT MODE */}
                    <div className="payment-column">
                        <div className="payment-section-title">
                            Payment Mode
                        </div>

                        <div className="payment-modes">
                            {paymentModeList?.map(mode => (
                                <button
                                    key={mode?.code}
                                    type="button"
                                    className={`payment-mode ${order?.paymentMode === mode?.displayValue ? 'active' : ''}`}
                                    onClick={() => setOrder({ ...order, ["paymentMode"]: mode?.displayValue })}
                                >
                                    <span className="payment-mode-icon">
                                        {mode?.code?.toLowerCase() === 'banktransfer' && '↯'}
                                        {mode?.code?.toLowerCase() === 'cash' && '↯↯'}
                                        {mode?.code?.toLowerCase() === 'visa' && '▣'}
                                    </span>
                                    <span>{mode?.displayValue}</span>
                                </button>
                            ))}
                        </div>

                         <div className="payment-section-title">
                           Urgency
                        </div>

                        <div className="payment-modes">
                            {urgencyList?.map(mode => (
                                <button
                                    key={mode?.code}
                                    type="button"
                                    className={`payment-mode ${order?.urgency === mode?.displayValue ? 'active' : ''}`}
                                    onClick={() => setOrder({ ...order, ["urgency"]: mode?.displayValue })}
                                >
                                    <span className="payment-mode-icon">
                                        {mode?.code?.toLowerCase() === 'normal' && <FiClock/>}
                                        {mode?.code?.toLowerCase() === 'urgent' && <FiAlertCircle/>}
                                        {mode?.code?.toLowerCase() === 'v._urgent' && <FiAlertTriangle/>}
                                    </span>
                                    <span>{mode?.displayValue}</span>
                                </button>
                            ))}
                        </div>

                         <div className="payment-section-title">
                           Booking Type
                        </div>

                        <div className="payment-modes">
                            {bookingTypeList?.map(mode => (
                                <button
                                    key={mode?.code}
                                    type="button"
                                    className={`payment-mode ${order?.bookingType === mode?.displayValue ? 'active' : ''}`}
                                    onClick={() => setOrder({ ...order, ["bookingType"]: mode?.displayValue })}
                                >
                                    <span className="payment-mode-icon">
                                        {mode?.code?.toLowerCase() === 'heavy' && <FiTruck/>}
                                        {mode?.code?.toLowerCase() === 'light' && <FiFeather/>}
                                        {mode?.code?.toLowerCase() === 'normal' && <FiMinus/>}
                                    </span>
                                    <span>{mode?.displayValue}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* COLUMN 2 - ADVANCE */}
                    <div className="payment-column">
                        <div className="payment-section-title">
                            Advance Amount
                        </div>

                        {/* Percentage buttons */}
                        <div className="advance-options">
                            {[10, 20, 30, 40, 50].map(percent => (
                                <button
                                    key={percent}
                                    type="button"
                                    className={`advance-option ${advancePercent === percent ? 'active' : ''}`}
                                    onClick={() => {
                                        const amount = (totalAmount * percent) / 100;
                                        setAdvancePercent(percent);
                                        handleAdvanceChange({ target: { value: amount } });
                                    }}
                                >
                                    {percent}%
                                </button>
                            ))}

                            <button
                                type="button"
                                className={`advance-option ${advancePercent === null ? 'active' : ''
                                    }`}
                                onClick={() => {
                                    setAdvancePercent(null);
                                    setAdvanceAmount(0);
                                }}
                            >
                                Custom
                            </button>
                        </div>

                        {/* Advance amount */}
                        <div className="payment-advance">
                            <span className="payment-currency">
                                AED
                            </span>

                            <input
                                type="number"
                                min="0"
                                max={totalAmount}
                                value={order?.advanceAmount || 0}
                                disabled={advancePercent !== null}
                                onChange={handleAdvanceChange}
                                placeholder="Enter amount"
                            />
                        </div>

                        {/* Selected percentage */}
                        {advancePercent !== null && (
                            <div className="advance-calculation">
                                {advancePercent}% of {totalAmount.toLocaleString()} AED
                                <strong>
                                    = {Number(advanceAmount).toLocaleString()} AED
                                </strong>
                            </div>
                        )}
                    </div>

                    {/* COLUMN 3 - SUMMARY */}
                    <div className="payment-column">
                        <div className="payment-section-title">
                            Order Summary
                        </div>
                        <div className="payment-summary">
                            <div className="payment-summary-row">
                                <span>Sub Total</span>
                                <strong>
                                    {order?.subTotal?.toLocaleString()} AED
                                </strong>
                            </div>
                            <div className="payment-summary-row">
                                <span>VAT <small>(5%)</small></span>
                                <strong>
                                    {order?.vatAmount?.toLocaleString()} AED
                                </strong>
                            </div>
                            <div className="payment-summary-divider" />
                            <div className="payment-summary-row total">
                                <span>Total Amount</span>
                                <strong>
                                    {order?.totalAmount?.toLocaleString()} AED
                                </strong>
                            </div>
                            <div className="payment-summary-row advance">
                                <span>Total Advance</span>
                                <strong>
                                    {order?.advanceAmount?.toLocaleString()} AED
                                </strong>
                            </div>
                            <div className="payment-balance">
                                <span>Balance Due</span>
                                <strong>
                                    {order?.balanceAmount?.toLocaleString()} AED
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    )
}
