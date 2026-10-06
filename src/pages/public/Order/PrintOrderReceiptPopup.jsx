import React, { useState, useEffect, useRef } from 'react'
import { commonLogic } from '../../../utils/commonLogic';
import ButtonBox from '../../../components/BottonBox/ButtonBox';
import Dropdown from '../../../components/Dropdown/Dropdown';
import InvoicePrintLayout from '../Print/InvoicePrintLayout';
import {getOrderById} from '../../../services/api/ordersApi'
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
    const [orderNos, setOrderNos] = useState([]);
    const [selectOrderId, setSelectOrderId] = useState(0);

    useEffect(() => {
        if (typeof setPrintReceiptHandler === 'function') {
            setPrintReceiptHandler(printRef.current);
        }
    }, [setPrintReceiptHandler, orderId]);
    const vat = parseFloat(process.env.REACT_APP_VAT);
    let cancelledOrDeletedSubTotal = 0;
    let cancelledOrDeletedTotal = 0;
    let cancelledOrDeletedVatTotal = 0;
    let cancelledOrDeletedOrderDetails = mainData?.orderDetails?.filter(x => x.isCancelled || x.isDeleted);
    if (cancelledOrDeletedOrderDetails?.length > 0) {
        cancelledOrDeletedSubTotal = 0;
        cancelledOrDeletedVatTotal = 0;
        cancelledOrDeletedTotal = 0;
        cancelledOrDeletedOrderDetails?.forEach(element => {
            cancelledOrDeletedSubTotal += element.subTotalAmount;
            cancelledOrDeletedVatTotal += (element.totalAmount - element.subTotalAmount);
            cancelledOrDeletedTotal += element.totalAmount;
        });
    }

    useEffect(() => {
        if (mainData?.contact1 !== undefined && mainData?.contact1 !== "") {
            // Api.Get(apiUrls.orderController.getByOrderNoByContact + mainData?.contact1?.replace('+', ""))
            //     .then(res => {
            //         setOrderNos(res.data);
            //     })
        }
    }, [mainData.contact1]);


    useEffect(() => {
        if (orderId === undefined || orderId < 1)
            return;

       getOrderById(orderId)
            .then(res => {
                setMainData(res.data);
                let activeOrderDetails = res.data?.orderDetails?.filter(x => !x.isCancelled && !x.isDeleted);
                if (activeOrderDetails === undefined || activeOrderDetails.length === 0)
                    return;
                //Filter cancelled and deleted order details
                const orderChecker = [];
                const orders = [];
                activeOrderDetails?.forEach(res => {
                    var orderindex = orderChecker.indexOf(res.workType + res.totalInvoiced);
                    res.vatAmount = 0;
                    res.vatAmount += commonLogic.calculateVAT(res.subTotalAmount, vat).vatAmount;
                    if (orderindex === -1) {
                        res.qty = 1;
                        orders.push(res);
                        orderChecker.push(res.workType + res.totalAmount);
                    }
                    else {
                        orders[orderindex].qty += 1;
                        orders[orderindex].subTotalAmount += res.subTotalAmount;
                        orders[orderindex].totalAmount += res.totalAmount;
                        orders[orderindex].vatAmount += res.vatAmount;
                    }
                });
                for (let i = 0; i < 10; i++) {
                    if ((orders?.length % 8) !== 0)
                        orders.push({});
                }
                setFinalOrder(orders);
            });


    }, [orderId, selectOrderId])
    if (orderId === undefined || mainData === undefined)
        return null;

    const SetSelectedOrderNo = (e) => {
        setSelectOrderId(e.target.value);
    }

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
                            <div className='row'>
                                <div className='col-3 fw-bold'>
                                    Print for another order
                                </div>
                                <div className='col-9'>
                                    <Dropdown className="form-control-sm" data={orderNos} onChange={SetSelectedOrderNo} text="orderNo" value={selectOrderId} elementKey="id" searchable={true} />
                                </div>
                            </div>
                            <InvoicePrintLayout mainData={mainData} printRef={printRef} finalOrder={finalOrder}></InvoicePrintLayout>
                        </div>
                        <div className="receipt-popup-footer">
                            <ButtonBox type="cancel" modelDismiss={true} className="btn-sm" onClickHandler={() => onClosePrintOrderReceiptPopup?.()}></ButtonBox>
                            {/* <ReactToPrint
                                trigger={() => {
                                    return <button className='btn btn-sm btn-success' data-bs-dismiss="modal"><i className='bi bi-printer'></i> Print</button>
                                }}
                                content={(el) => (printRef.current)}
                            /> */}
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
