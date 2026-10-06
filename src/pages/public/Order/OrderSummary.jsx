import React, { useEffect } from 'react'

export default function OrderSummary({ order, paymentModalOpen, setPaymentModalOpen, setReviewOrderModalOpen, setOrder, setValidationSummaryModalOpen, validationErrors }) {

    useEffect(() => {
        const subTotal = order?.orderDetails?.reduce((sum, item) => sum + Number(item.price || 0), 0);

        const vatAmount = subTotal * 0.05;
        const totalAmount = subTotal + vatAmount;
        const totalAdvance = Math.min(
            Number(order?.advanceAmount) || 0,
            totalAmount
        );

        var model = order;
        model.subTotal = subTotal;
        model.totalAmount = totalAmount;
        model.advanceAmount = totalAdvance;
        model.balanceAmount = totalAmount - totalAdvance;
        model.vatAmount = vatAmount;
        setOrder({ ...model });
    }, [order?.advanceAmount, order.orderDetails]);

    const handleOrderSummaryPupupOpen = () => {
        if (validationErrors?.length > 0)
            setValidationSummaryModalOpen(true);
        else
            setReviewOrderModalOpen(true);
    }

    return (
        <>
            {/* Header */}
            {/* <div className="col-title"> Order Summary </div> */}

            <div className="order-summary-content">
                {/* Summary */}
                <div className="order-summary-details">
                    <div className="order-summary-row">
                        <strong> <span>Sub Total</span></strong>                       
                        <strong> {order?.subTotal?.toLocaleString()} AED</strong>
                    </div>
                    <div className="order-summary-row">
                       <strong> <span>VAT (5%)</span></strong>
                        <strong> {order?.vatAmount?.toLocaleString()} AED </strong>
                    </div>
                    <div className="order-summary-divider" />
                    <div className="order-summary-row order-summary-total">
                        <span>Total</span>
                        <strong>
                            {order?.totalAmount?.toLocaleString()} AED
                        </strong>
                    </div>
                    <div className="order-summary-row order-summary-advance">
                        <strong><span>Advance (Rounded to 100)</span></strong>
                        <strong> {order?.advanceAmount?.toLocaleString()} AED </strong>
                    </div>
                    <div className="order-summary-balance">
                        <div>
                            <span>Balance Due</span>
                        </div>
                        <strong>
                            {order?.balanceAmount?.toLocaleString()} AED
                        </strong>
                    </div>
                </div>

                {/* Payment Action */}
                {/* <div className="order-summary-payment">

                    <div className="order-summary-payment-title">
                        Payment
                    </div>

                    <div className="order-summary-payment-status">
                        {order?.totalAdvance > 0 ? (
                            <>
                                <span className="payment-status-dot"></span>
                                Advance received
                            </>
                        ) : (
                            <>
                                <span className="payment-status-dot pending"></span>
                                Payment pending
                            </>
                        )}
                    </div>

                    <button
                        type="button" className="op-btn op-btn--save order-summary-payment-btn"
                        onClick={() => setPaymentModalOpen(true)} >
                        Set Payment
                    </button>
                    <button type="button" style={{ marginTop: '10px' }} className="op-btn op-btn--save order-summary-payment-btn" onClick={handleOrderSummaryPupupOpen} >
                        Review Order
                    </button>
                </div> */}
            </div>
        </>
    )
}
