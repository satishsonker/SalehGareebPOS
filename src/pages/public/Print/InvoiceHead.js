import React from 'react';
import useAppSettings from '../../../hooks/useApplicationSettings'
import { commonLogic } from '../../../utils/commonLogic';

import { useAuth } from '../../../contexts/AuthContext';
export default function InvoiceHead({ receiptType = "TAX INVOICE", hideTrnNo = false }) {
    const applicationSettings = useAppSettings();
    const { logout, user, selectedShop } = useAuth();
    const {
        REACT_APP_COMPANY_NAME,
        REACT_APP_COMPANY_SUBNAME,
        REACT_APP_COMPANY_MOBILE,
        REACT_APP_LOGO,
        REACT_APP_COMPANY_CUSTOMER_CARE,
        REACT_APP_COMPANY_TRN
    } = process.env;

    // Define common styles
    const styles = {
        smallText: { fontSize: '12px' },
        fontSizeMid: { fontSize: '15px' },
        fontSizeBig: { fontSize: '17px' },
        largeText: { fontSize: '22px' },
        logo: { width: '39%', height: '100px' },
        trn: { fontSize: '12px', padding: '4px', borderRadius: '1000px', border: '1px solid black' },
        customerSupport: { fontSize: '12px', padding: '4px' }
    };

    // Reusable component for address lines
    const AddressLine = ({ text, alignment = 'start', bold = false,style=styles.fontSizeSmall }) => (
        <div className={`text-${alignment} ${bold ? 'fw-bold' : ''}`} style={style}>
            {text}
        </div>
    );

    return (
        <div className="row" style={{ paddingRight: "0px !important"}}>
            <div className="col-4">
                <AddressLine text={commonLogic.defaultIfEmpty(selectedShop.name,REACT_APP_COMPANY_NAME)} alignment="start" bold={true} />
                <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.code, REACT_APP_COMPANY_SUBNAME)} alignment="start" bold={true} />
                <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.address1, "Near Immigration Bridge")} alignment="start" />
                <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.address2, "Old Airport Road")} alignment="start" />
                {commonLogic.defaultIfEmpty(selectedShop?.address3,"")!=="" && <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.address3,"")} alignment="start" />}
                <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.addressCity, "Abu Dhabi - U.A.E")} alignment="start" />
                <AddressLine text={`P.O. Box :${commonLogic.defaultIfEmpty(selectedShop?.postBox, "75038")}`} alignment="start" />
                <AddressLine text={`Tel :  ${commonLogic.defaultIfEmpty(selectedShop?.phone, "02-4436530")}`} alignment="start" />
                <AddressLine text={`Mobile : ${commonLogic.defaultIfEmpty(selectedShop?.mobile, REACT_APP_COMPANY_MOBILE)}`} alignment="start" />
            </div>

            <div className="col-4 p-0">
                <div className="text-center">
                    <img style={styles.logo} src={selectedShop?.logo??'https://localhost:7194/logo/logo.png'} alt="Company Logo" />
                    <div className="text-center text-uppercase" style={styles.smallText}>{receiptType}</div>
                    {!hideTrnNo && (
                        <div className="text-center" style={styles.trnStyle}>
                            TRN : {commonLogic.defaultIfEmpty(selectedShop?.trn, REACT_APP_COMPANY_TRN)}
                        </div>
                    )}                   
                </div>
            </div>

            <div className="col-4" style={{paddingRight: "0px !important"}}>
                <AddressLine style={styles.fontSizeBig} text={commonLogic.defaultIfEmpty(selectedShop?.ar_name,REACT_APP_COMPANY_NAME)} alignment="end" bold={true} />
                <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.ar_code,REACT_APP_COMPANY_SUBNAME)} alignment="end" bold={true} />
                <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.ar_addressline1,"Near Immigration Bridge")} alignment="end" />
                <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.ar_addressline2,"Old Airport Road")} alignment="end" />
                {commonLogic.defaultIfEmpty(selectedShop?.ar_addressline3,"")!=="" && <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.ar_addressline3,"")} alignment="end" />}
                <AddressLine text={commonLogic.defaultIfEmpty(selectedShop?.ar_address_city,"Abu Dhabi - U.A.E")} alignment="end" />
                <AddressLine text={`ص.ب :${commonLogic.defaultIfEmpty(selectedShop?.ar_postbox,"75038")}`} alignment="end" />
                <AddressLine text={`هاتف :  ${commonLogic.defaultIfEmpty(selectedShop?.ar_phone,"02-4436530")}`} alignment="end" />
                <AddressLine text={`جوال : ${commonLogic.defaultIfEmpty(selectedShop?.ar_mobile,REACT_APP_COMPANY_MOBILE)}`} alignment="end" />
            </div>
            <div className='col-12 text-center fw-bold'>
            {(commonLogic.defaultIfEmpty(selectedShop?.en_cust_support_number, REACT_APP_COMPANY_CUSTOMER_CARE) !== undefined && (commonLogic.defaultIfEmpty(selectedShop?.en_cust_support_number, REACT_APP_COMPANY_CUSTOMER_CARE)) !== '') && (
                        <div className="text-center text-uppercase " style={styles.fontSizeMid}>
                            {commonLogic.defaultIfEmpty(selectedShop?.en_cust_support_heading, "Customer Support")} : {commonLogic.defaultIfEmpty(selectedShop?.en_cust_support_number, REACT_APP_COMPANY_CUSTOMER_CARE)}
                        </div>
                    )}
            </div>
        </div>
    );
}
