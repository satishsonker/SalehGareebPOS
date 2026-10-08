import React, { memo } from 'react';
import Label from '../../../components/Label/Label';
import { commonLogic } from '../../../utils/commonLogic';

const OrderCommonHeaderComponent = memo(({ 
    orderNo, 
    salesman, 
    customerName, 
    orderDate, 
    contact, 
    orderDeliveryDate, 
    invoiceNo, 
    taxInvoiceNo 
}) => {
    return (
        <div className="card-header py-3 bg-light border-bottom" style={{ borderColor: '#dfe3e8' }}>
            <div className="row g-3 align-items-start">
                <div className="col-12 col-md-6 col-lg-3">
                    {taxInvoiceNo !== undefined ? (
                        <>
                            <Label isUpperCase={true} fontSize='12px' bold={true} text="Invoice No" />
                            <div className='fw-bold' style={{ fontSize: '1rem', letterSpacing: '0.02em' }}>{taxInvoiceNo}</div>
                            <div style={{ height: '10px' }} />
                            <Label isUpperCase={true} fontSize='12px' bold={true} text="Order No" />
                            <div className='fw-bold' style={{ fontFamily: 'Saira Stencil One', fontSize: '1.8rem', lineHeight: 1.2 }}>{orderNo}</div>
                        </>
                    ) : (
                        <>
                            <Label isUpperCase={true} fontSize='13px' bold={true} text="Order No" />
                            <div className='fw-bold' style={{ fontFamily: 'Saira Stencil One', fontSize: '2rem', lineHeight: 1.2 }}>{orderNo}</div>
                        </>
                    )}
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <Label isUpperCase={true} fontSize='12px' bold={true} text="Customer Name" />
                    <div className='fw-bold text-uppercase' style={{ fontSize: '1.05rem', lineHeight: 1.4 }}>{customerName || '—'}</div>
                    <div style={{ height: '10px' }} />
                    <Label isUpperCase={true} fontSize='12px' bold={true} text="Order Date" />
                    <div style={{ lineHeight: 1.5 }}>{commonLogic.getHtmlDate(orderDate, 'ddmmyyyy') || '—'}</div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <Label isUpperCase={true} fontSize='12px' bold={true} text="Contact No." />
                    <div style={{ lineHeight: 1.5 }}>{contact || '—'}</div>
                    <div style={{ height: '10px' }} />
                    <Label isUpperCase={true} fontSize='12px' bold={true} text="Delivery Date" />
                    <div style={{ lineHeight: 1.5 }}>{commonLogic.getHtmlDate(orderDeliveryDate, 'ddmmyyyy') || '—'}</div>
                </div>

                <div className="col-12 col-md-6 col-lg-3">
                    <Label isUpperCase={true} fontSize='12px' bold={true} text="Salesman" />
                    <div className='fw-bold' style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{salesman || '—'}</div>

                    {invoiceNo !== undefined && (
                        <>
                            <div style={{ height: '10px' }} />
                            <Label isUpperCase={true} fontSize='12px' bold={true} text="Invoice No" />
                            <div className='fw-bold' style={{ fontSize: '0.95rem', lineHeight: 1.5 }}>{invoiceNo}</div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
});

OrderCommonHeaderComponent.displayName = 'OrderCommonHeaderComponent';

export default OrderCommonHeaderComponent;
