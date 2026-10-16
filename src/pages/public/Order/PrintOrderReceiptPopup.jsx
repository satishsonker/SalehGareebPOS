import React, { useState, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print';
import { commonLogic } from '../../../utils/commonLogic';
import ButtonBox from '../../../components/BottonBox/ButtonBox';
import InvoicePrintLayout from '../Print/InvoicePrintLayout';
import { getOrderById } from '../../../services/api/ordersApi';
import './PrintOrderReceiptPopup.css';

export default function PrintOrderReceiptPopup({
    orderId,
    modelId,
    setPrintReceiptHandler,
    showInPupop = true,
    onClosePrintOrderReceiptPopup,
    isOpen = false,
}) {
    modelId = "printOrderReceiptPopupModal" + commonLogic.defaultIfEmpty(modelId, "");
    var printRef = useRef();
    const [finalOrder, setFinalOrder] = useState([]);
    const [mainData, setMainData] = useState({ id: orderId, orderNo: '000' });
    const [loading, setLoading] = useState(false);
    const [printError, setPrintError] = useState('');

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Invoice-${mainData?.orderNo || 'Order'}`,
        pageStyle: '@page order-invoice { size: A4 portrait; margin: 8mm; } html, body { margin: 0; padding: 0; background: #fff; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }'
    });

    useEffect(() => {
        if (typeof setPrintReceiptHandler === 'function') {
            setPrintReceiptHandler(printRef.current);
        }
    }, [setPrintReceiptHandler, orderId]);
    useEffect(() => {
        if (orderId === undefined || orderId < 1) return undefined;
        let active = true;
        setLoading(true);
        setPrintError('');
        setFinalOrder([]);

        getOrderById(orderId)
            .then(response => {
                const data = response?.data?.data ?? response?.data;
                if (!active || !data) return;
                setMainData(data);
                const vatRate = parseFloat(process.env.REACT_APP_VAT || '5');
                const rows = (data.orderDetails || [])
                    .filter(item => !item.isCancelled && !item.isDeleted && !['cancelled', 'canceled'].includes(String(item.status || '').toLowerCase()))
                    .map(item => ({
                        ...item,
                        qty: 1,
                        vatAmount: Number(item.vatAmount ?? commonLogic.calculateVAT(Number(item.subtotalAmount || 0), vatRate).vatAmount),
                    }));
                setFinalOrder(rows);
            })
            .catch(error => {
                if (active) setPrintError(error.message || 'Unable to load the invoice.');
            })
            .finally(() => { if (active) setLoading(false); });

        return () => { active = false; };
    }, [orderId]);
    if (orderId === undefined || mainData === undefined)
        return null;

    if (orderId < 1)
        return null;

    return (
        <>
            {showInPupop && isOpen &&
                <div className="receipt-popup-backdrop" id={modelId} role="dialog" aria-modal="true" aria-labelledby={modelId + "Label"}>
                    <div className="receipt-popup-dialog" role="document">
                        <div className="receipt-popup-header">
                            <h5 className="receipt-popup-title" id={modelId + "Label"}>Print Order Receipt</h5>
                            <button type="button" onClick={() => onClosePrintOrderReceiptPopup?.()} className="receipt-popup-close" aria-label="Close">×</button>
                        </div>
                        <div className="receipt-popup-body">
                            {loading && <div className="receipt-popup-state">Preparing invoice…</div>}
                            {printError && <div className="receipt-popup-state receipt-popup-state--error">{printError}</div>}
                            {!loading && !printError && <InvoicePrintLayout mainData={mainData} printRef={printRef} finalOrder={finalOrder} />}
                        </div>
                        <div className="receipt-popup-footer">
                            <button type="button" className="receipt-popup-print" onClick={handlePrint} disabled={loading || Boolean(printError)}>
                                <i className='bi bi-printer'></i> Print Invoice
                            </button>
                            <ButtonBox type="cancel" modelDismiss={true} className="btn-sm" onClickHandler={() => onClosePrintOrderReceiptPopup?.()}></ButtonBox>
                        </div>
                    </div>
                </div>
            }
            {!showInPupop &&
                <InvoicePrintLayout mainData={mainData} printRef={printRef} finalOrder={finalOrder}></InvoicePrintLayout>
            }
        </>
    )
}
