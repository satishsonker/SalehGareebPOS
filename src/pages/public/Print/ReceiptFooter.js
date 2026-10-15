import React from 'react';
import useAppSettings from '../../../hooks/useApplicationSettings';
import { commonLogic } from '../../../utils/commonLogic';
import './ReceiptFooter.css';

export default function ReceiptFooter({ message = 'THANK YOU FOR YOUR BUSINESS' }) {
    const settings = useAppSettings();
    const website = commonLogic.defaultIfEmpty(settings?.en_company_website?.value, process.env.REACT_APP_COMPANY_WEBSITE);
    const email = commonLogic.defaultIfEmpty(settings?.en_company_email?.value, process.env.REACT_APP_COMPANY_EMAIL);
    const mobile = commonLogic.defaultIfEmpty(settings?.en_company_telephone?.value, process.env.REACT_APP_COMPANY_MOBILE);

    return (
        <footer className="invoice-print__footer">
            <strong>{message}</strong>
            <div>
                {website && <span>{website}</span>}
                {email && <span>{email}</span>}
                {mobile && <span>{mobile}</span>}
            </div>
        </footer>
    );
}
