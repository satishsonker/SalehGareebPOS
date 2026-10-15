import React from 'react';
import { commonLogic } from '../../../utils/commonLogic';
import { useAuth } from '../../../contexts/AuthContext';
import { apiBasePath } from '../../../services/api/commonApi';
import './InvoiceHead.css';

export default function InvoiceHead({ receiptType = 'TAX INVOICE', hideTrnNo = false }) {
    const { selectedShop } = useAuth();
    const companyName = process.env.REACT_APP_COMPANY_NAME || 'Saleh Gareeb';
    const companySubname = process.env.REACT_APP_COMPANY_SUBNAME || '';
    const logo = selectedShop?.logo || `${apiBasePath}/logo/logo.png`;
    const trn = commonLogic.defaultIfEmpty(selectedShop?.trn, process.env.REACT_APP_COMPANY_TRN);
    const addressLeft = [
        commonLogic.defaultIfEmpty(selectedShop?.address1, 'Near Immigration Bridge'),
        commonLogic.defaultIfEmpty(selectedShop?.address2, 'Old Airport Road'),
        selectedShop?.address3,
        commonLogic.defaultIfEmpty(selectedShop?.addressCity, 'Abu Dhabi - U.A.E'),
        `P.O. Box: ${commonLogic.defaultIfEmpty(selectedShop?.postBox, '75038')}`,
        `Tel: ${commonLogic.defaultIfEmpty(selectedShop?.phone, '02-4436530')}`,
        `Mobile: ${commonLogic.defaultIfEmpty(selectedShop?.mobile, process.env.REACT_APP_COMPANY_MOBILE)}`,
    ].filter(Boolean);
    const addressRight = [
        selectedShop?.ar_addressline1 || 'Near Immigration Bridge',
        selectedShop?.ar_addressline2 || 'Old Airport Road',
        selectedShop?.ar_addressline3,
        selectedShop?.ar_address_city || 'Abu Dhabi - U.A.E',
        `ص.ب: ${selectedShop?.ar_postbox || '75038'}`,
        `هاتف: ${selectedShop?.ar_phone || '02-4436530'}`,
        `جوال: ${selectedShop?.ar_mobile || process.env.REACT_APP_COMPANY_MOBILE || ''}`,
    ].filter(Boolean);

    return (
        <div className="receipt-brand-header">
            <div className="receipt-brand-header__side receipt-brand-header__side--left">
                <strong>{commonLogic.defaultIfEmpty(selectedShop?.name, companyName)}</strong>
                <strong>{commonLogic.defaultIfEmpty(selectedShop?.code, companySubname)}</strong>
                {addressLeft.map((line, index) => <span key={`en-${index}`}>{line}</span>)}
            </div>
            <div className="receipt-brand-header__center">
                <img src={logo} alt="Company logo" onError={event => { event.currentTarget.style.visibility = 'hidden'; }} />
                <strong>{receiptType}</strong>
                {!hideTrnNo && trn && <span>TRN: {trn}</span>}
            </div>
            <div className="receipt-brand-header__side receipt-brand-header__side--right" dir="rtl">
                <strong>{commonLogic.defaultIfEmpty(selectedShop?.ar_name, companyName)}</strong>
                <strong>{commonLogic.defaultIfEmpty(selectedShop?.ar_code, companySubname)}</strong>
                {addressRight.map((line, index) => <span key={`ar-${index}`}>{line}</span>)}
            </div>
            {(selectedShop?.en_cust_support_number || process.env.REACT_APP_COMPANY_CUSTOMER_CARE) && (
                <div className="receipt-brand-header__support">
                    {selectedShop?.en_cust_support_heading || 'Customer Support'}: {selectedShop?.en_cust_support_number || process.env.REACT_APP_COMPANY_CUSTOMER_CARE}
                </div>
            )}
        </div>
    );
}
