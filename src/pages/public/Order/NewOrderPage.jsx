import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import './NewOrderPage.css'
import OrderPriceSelector from './OrderPriceSelector';
import { FiSave, FiClock, FiAlertCircle, FiAlertTriangle, FiTruck, FiFeather, FiMinus, FiRefreshCw, FiPrinter, FiShoppingBag, FiUser, FiLayers, FiPlus, FiDollarSign } from 'react-icons/fi';
import WorkTypeSelector from './WorkTypeSelector';
import OrderSummary from './OrderSummary';
import { getEmirates, getMasterDataByTypes } from '../../../services/api/masterDataApi';
import { getCustomers } from '../../../services/api/customersApi';
import { createOrder, suggestDeliveryDate } from '../../../services/api/ordersApi';
import { multipleGet } from '../../../utils/api';
import NumericKeypad from '../../../components/NumericKeypad/NumericKeypad';
import DatePickerModal from '../../../components/DatePicker/DatePickerModal';
import { commonLogic } from '../../../utils/commonLogic';
import AddCustomerModel from './AddCustomerModel';
import SubOrderDetailList from './SubOrderDetailList';
import { enums } from '../../../utils/enums';
import StatusModal from '../../../components/StatusModel/StatusModel';
import { getWorkTypes } from '../../../services/api/workTypeApi';
import PrintOrderReceiptPopup from './PrintOrderReceiptPopup';
export default function NewOrderPage() {
  const navigate = useNavigate();
  const vat = parseFloat(process.env.REACT_APP_VAT?? '5');
  const EMPTY_CREATE_ORDER = () => ({
    orderId: 0,
    isd: '+971',
    mobile: '',
    customerId: 0,
    customerName: '',
    emirateId: 0,
    employeeId: 1,
    customerClass: 'Regular',
    price: 0,
    priceGragde: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    orderDetails: [],
    selectedSubOrderIndex: 0,
    paymentMode: 'VISA',
    subTotal: 0,
    vat:vat,
    totalAmount: 0,
    advanceAmount: 0,
    balanceAmount: 0,
    bookingType: '',
    urgency: '',
    orderNo: '12345',
    Ledgers:[]
  });
  const [workTypeList, setWorkTypeList] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState()
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [keypadMode, setKeypadMode] = useState(null);
  const [customerList, setCustomerList] = useState([])
  const [emirateList, setEmirateList] = useState([])
  const [openPriceModel, setOpenPriceModel] = useState(false);
  const [advancePercentageList, setAdvancePercentageList] = useState([])
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [workTypeSelectorModalOpen, setWorkTypeSelectorModalOpen] = useState(false)
  const [order, setOrder] = useState(EMPTY_CREATE_ORDER());
  const [isdCountry, setIsdCountry] = useState({ code: '+971', name: 'UAE', short: 'ARE' });
  const [phone, setPhone] = useState('');
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [paymentModeList, setPaymentModeList] = useState([])
  const [bookingTypeList, setBookingTypeList] = useState([]);
  const [urgencyList, setUrgencyList] = useState([]);
  const [neckLineList, setNeckLineList] = useState([]);
  const [sleeveList, setSleeveList] = useState([]);
  const [lengthList, setLengthList] = useState([]);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [advancePercent, setAdvancePercent] = useState(0);
  const [statusModelData, setStatusModelData] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  const [showPrintReceiptPopup, setShowPrintReceiptPopup] = useState(false);
  const openPhoneKeypad = () => setKeypadMode('phone');
   const openCustomeAdvanceAmountKeypad = () => setKeypadMode('advance');
  const closeKeypad = () => setKeypadMode(null);
  const handlePrint = () => {
    setStatusModelData((prev) => ({ ...prev, isOpen: false }));
    setShowPrintReceiptPopup(true);
  }
  const handleSave = () => {
    if (!ValidateOrder()) {
      return;
    }
    order.subTotalAmount=order.subTotal;
    order.vat=vat;
    order.Ledgers=[];
    createOrder(order)
      .then(response => {
        const createdOrder = response?.data?.data ?? response?.data;
        var statusData = {
          isOpen: response.success,
          title: response.message,
          type: response.success ? 'success' : 'warn',
          buttonText: response.success ? 'OK' : "Ok",
          showCloseButton: response.success,
          onConfirm: response.success ? resetOrder : undefined,
          buttons: response.success ? [{
            buttonText: 'Print', handler: handlePrint, icon: <FiPrinter />
          }, {
            buttonText: 'Order Search', handler: () => navigate('/orders/search')
          }] : []
        };
        if (response.success) {
          statusData.message = `Order No: ${createdOrder?.orderNo} created successfully.`;
          const actualDate = typeof createdOrder?.deliveryDate === 'string' ? createdOrder.deliveryDate.slice(0, 10) : '';
          if (actualDate && actualDate !== order.deliveryDate) {
            statusData.message += ` Daily capacity was reached, so delivery was moved to ${commonLogic.formatDate(actualDate)}.`;
            setOrder(previous => ({ ...previous, deliveryDate: actualDate }));
          }
        }
        setStatusModelData({ ...statusData });
        if (response.success) setOrder(pre=>({...pre,["orderId"]:createdOrder?.id}));
      })
      .catch(error => {
        var statusData = { isOpen: true, title: 'Something went wrong', message: 'An error occurred while creating the order.', type: 'error',buttonText:'Ok',showCloseButton:true };
        setStatusModelData({ ...statusData });
      });
  };

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

  const ValidateOrder = () => {
    var errorObject = null;
    if (order.deliveryDate === '') {
      errorObject = { isOpen: true, title: 'Invalid Delivery Date', message: 'Select delivery date', type: 'error' };
    }
    if (order?.customerId <= 0) {
      errorObject = { isOpen: true, title: 'Invalid Customer', message: 'Select Customer.', type: 'error' };
    }
    if (order?.orderDetails.length === 0) {
      errorObject = { isOpen: true, title: 'No Sub orders', message: 'Add at least one sub order.', type: 'error' };
    }
    order?.orderDetails?.map(ele => {
      if (!ele.workTypes || ele.workTypes.length === 0) {
        errorObject = { isOpen: true, title: 'Invalid work type', message: `No work type selected for ${ele?.orderNo}`, type: 'error' };
      }
      // if (ele.workDescriptions?.length === 0)
      //   errorObject={ isOpen: true, title: 'Invalid work description', message: `No work description selected for ${ele?.orderNo}`, type: 'error' });
    })
    if (errorObject) {
      setStatusModelData({ ...errorObject })
      return false;
    }
    return true;
  }

  useEffect(() => {
    multipleGet([getCustomers(1, 100), getEmirates(), getMasterDataByTypes([enums.masterDataCode.paymentMode, enums.masterDataCode.bookingType, enums.masterDataCode.urgency, enums.masterDataCode.length, enums.masterDataCode.neckline, enums.masterDataCode.sleeve, enums.masterDataCode.advancePercentage]), getWorkTypes()])
      .then(([customersRes, emiratesRes, masterDataRes, workTypesRes]) => {
        setCustomerList(customersRes.data.data);
        setEmirateList(emiratesRes.data.data);
        setPaymentModeList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.paymentMode) || []);
        setBookingTypeList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.bookingType) || []);
        setUrgencyList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.urgency) || []);
        setLengthList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.length) || []);
        setNeckLineList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.neckline) || []);
        setSleeveList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.sleeve) || []);
        setAdvancePercentageList(masterDataRes?.data?.data?.filter((item) => item.masterDataType?.toLowerCase() === enums.masterDataCode.advancePercentage));
        if (workTypesRes.data.filter(x => x.code === '0').length === 0) {
          workTypesRes.data?.push({ id: 0, code: '0', name: 'All' });
        }
        setWorkTypeList(workTypesRes.data || []);
      })
      .catch(err => console.error('Failed to load order prices or customers:', err));
  }, []);
  const onCustomAdvanceAmountChange = ({ name, value }) => {
    setAdvanceAmount(value);
    setOrder(pre=>({...pre,["advanceAmount"]:value}));
  }
  const onNumericPadChangeHandler = ({ name, value }) => {
    if (name !== 'mobile') {
      setOrder(previous => ({ ...previous, [name]: value }));
      return;
    }

    const customer = customerList.find(
      ({ isdCode, mobile }) =>
        `${isdCode}${mobile}` === `${order.isd}${value}`
    );

    if (!customer) {
      setOrder(previous => ({ ...previous, mobile: value, customerId: 0, customerName: '', customerClass: 'Regular', emirateId: 0 }));
      setAddCustomerModalOpen(true);
      return;
    }

    setOrder(previous => ({ ...previous, mobile: value, customerId: customer.id, emirateId: customer.emirateId, customerName: `${customer.firstName} ${customer.lastName}`.trim(), customerClass: customer.customerClass || 'Regular' }));
    setAddCustomerModalOpen(false);
  };
  const resetOrder = () => {
    setOrder(EMPTY_CREATE_ORDER());
    setPhone('');
    setAdvanceAmount(0);
    setAdvancePercent(0);
    setAddCustomerModalOpen(false);
  };
  const handleAdvanceChange = (e,percentObj) => {
    var percent=parseFloat(percentObj?.code);
    var advanceAmount=(totalAmount*percent)/100;
    const value = Math.min(
      (Math.ceil(advanceAmount / 100) * 100),
      totalAmount
    );

    setOrder({ ...order, ["advanceAmount"] : value });
    setAdvancePercent(parseFloat(percentObj?.code));
  }
  return (
    <>
      <div className='new-order-page'>
        <header className="create-order-heading">
          <div className="create-order-title-icon"><FiShoppingBag /></div>
          <div>
            <h1>Create order</h1>
            <p className="create-order-subtitle">New sale · enter customer and garment details</p>
          </div>
          <div className="pos-order-ref">{order?.orderId ? `Order #${order.orderNo}` : 'NEW ORDER'}</div>
        </header>
        <div className="panel customer-row">
          <div className="create-section-heading">
            <span className="create-section-icon"><FiUser /></span>
            <div><h2>Customer &amp; delivery</h2><p>Customer details and promised delivery date</p></div>
          </div>
          <div className="field-grid">
            <div className="field">
              <label>Phone Number</label>
              <input type="text" onClick={openPhoneKeypad} placeholder="+971 · Enter phone" value={order?.isd + order?.mobile} readOnly aria-label="Customer phone number" />
            </div>
            <div className="field">
              <label>Customer Name</label>
              <input type="text" value={order?.customerName || ''} placeholder="Enter phone to find customer" readOnly />
            </div>
            <div className="field">
              <label>Emirate</label>
              <select value={order?.emirateId} disabled={order?.customerId > 0} name='emirateId' onChange={e => { setOrder(pre => ({ ...pre, ["emirateId"]: e.target.value })) }}>
                <option value="0">Select emirate</option>
                {emirateList?.map((ele, index) => {
                  return <option key={index} value={ele?.id}>{ele?.displayValue}</option>
                })}
              </select>
            </div>
            <div className="field">
              <label>Order Date</label>
              <input type="text" value={commonLogic.formatDate(new Date())} readOnly />
            </div>
            <div className="field">
              <label>Delivery Date</label>
              <input type="text" placeholder="Select date" value={order?.deliveryDate ? commonLogic.formatDate(order.deliveryDate) : ''} readOnly
                onClick={() => setIsDatePickerOpen(true)} />
            </div>
            <div className="field">
              <label>Price</label>
              <button type="button" className="rate-btn" id="openRateModal" onClick={() => setOpenPriceModel(true)} style={{ width: '100%' }}>
                <span>{order?.price ? `${order.price} AED · ${order.priceGragde || 'Selected rate'}` : 'Select price'}</span>
                <span className="arrow">›</span>
              </button>
            </div>
            <div className="field">
              <label>Customer Type</label>
              <div className="customer-type">
                {['Regular', 'VIP', 'VVIP'].map((ele, index) => {
                  return <button type="button" key={index} onClick={() => setOrder(previous => ({ ...previous, customerClass: ele }))} className={`pill-btn ${order?.customerClass?.toLocaleLowerCase() === ele.toLocaleLowerCase() ? 'active' : ''}`}>{ele}</button>
                })}
              </div>
            </div>
          </div>
          {/* <SubOrderList order={order} setOrder={setOrder} /> */}

        </div>
        <div className='order-details pos-workspace'>
          <div className="panel order-entry-panel">
            <div className="panel-header">
              <div className="create-section-heading compact">
                <span className="create-section-icon"><FiLayers /></span>
                <div><h2>Garments</h2><p>Items and work requested</p></div>
              </div>
              <div className="pos-item-toolbar">
                <span className="create-order-count">{order?.orderDetails?.length || 0} items</span>
                <button type="button" className="pos-add-item" onClick={() => setOpenPriceModel(true)}><FiPlus /> Add garment</button>
              </div>
            </div>
            <div className="subconfig-panel" style={{ paddingBottom: '0' }}>
              {order?.orderDetails?.length === 0 && (
                <div className="pos-empty-items">
                  <span><FiShoppingBag /></span>
                  <strong>No garments added</strong>
                  <p>Select a price and quantity to start this order.</p>
                  <button type="button" onClick={() => setOpenPriceModel(true)}><FiPlus /> Add first garment</button>
                </div>
              )}
              <SubOrderDetailList order={order} workTypeList={workTypeList} setOrder={setOrder} setWorkTypeSelectorModalOpen={setWorkTypeSelectorModalOpen} />
              <WorkTypeSelector options={{ order, setOrder, workTypeList, workTypeSelectorModalOpen, setWorkTypeSelectorModalOpen, neckLineList, lengthList, sleeveList }} />
            </div>
          </div>
          <aside className="pos-checkout">
            <section className="pos-summary-card">
              <div className="pos-checkout-heading"><FiDollarSign /><span>Checkout summary</span></div>
              <OrderSummary order={order} setOrder={setOrder} paymentModalOpen={paymentModalOpen} setPaymentModalOpen={setPaymentModalOpen} />
            </section>
            <section className="panel pos-payment-card">
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
                        {mode?.code?.toLowerCase() === 'cheque' && '▣'}
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
                        {mode?.code?.toLowerCase() === 'normal' && <FiClock />}
                        {mode?.code?.toLowerCase() === 'urgent' && <FiAlertCircle />}
                        {mode?.code?.toLowerCase() === 'v._urgent' && <FiAlertTriangle />}
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
                        {mode?.code?.toLowerCase() === 'heavy' && <FiTruck />}
                        {mode?.code?.toLowerCase() === 'light' && <FiFeather />}
                        {mode?.code?.toLowerCase() === 'normal' && <FiMinus />}
                      </span>
                      <span>{mode?.displayValue}</span>
                    </button>
                  ))}
                </div>


                <div className="payment-section-title">
                  Advance Payment
                </div>
                <div className="advance-options">
                  <button
                    type="button"
                    className={`advance-option ${advancePercent == null ? 'active' : '' }`}
                    onClick={() => {
                      openCustomeAdvanceAmountKeypad()
                      setAdvancePercent(null);
                      setAdvanceAmount(0);
                    }}
                  >
                    Custom
                  </button>
                  {advancePercentageList?.map((percentObj, index) => (
                    <button
                      key={index}
                      type="button"
                      className={`advance-option ${advancePercent == percentObj?.code ? 'active' : ''}`}
                      onClick={e =>handleAdvanceChange(e,percentObj) }
                    >
                      {percentObj?.displayValue}
                    </button>
                  ))}

                </div>
              </div>
            </section>
            <div className="pos-checkout-actions">
              <button type="button" className="pos-reset-button" onClick={resetOrder} disabled={!order?.customerId && !order?.orderDetails?.length}>
                <FiRefreshCw /> Reset
              </button>
              <button type="button" className="pos-print-button" onClick={handlePrint} disabled={!order?.orderId}>
                <FiPrinter /> Print
              </button>
              <button type="button" className="pos-save-button" onClick={handleSave}>
                <FiSave /> Save order
              </button>
            </div>
          </aside>

          {/* <div className="invoice-strip">
            <div className="selected-rate-chip">
              <div className="swatch" id="rateSwatch">—</div>
              <div>
                <div className="label">Selected Rate</div>
                <div className="value" id="rateValueLabel">No rate selected</div>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <OrderPriceSelector order={order} setOrder={setOrder} openPriceModel={openPriceModel} setOpenPriceModel={setOpenPriceModel}></OrderPriceSelector>
      <NumericKeypad
        isOpen={keypadMode === 'phone'}
        value={phone}
        name="mobile"
        onChange={setPhone}
        onConfirm={onNumericPadChangeHandler}
        onClose={closeKeypad}
        label="Phone Number"
        maxLength={15}
        maxRange={9999999999}
      />
      <NumericKeypad
        isOpen={keypadMode === 'advance'}
        value={advanceAmount}
        name="mobile"
        onChange={setAdvanceAmount}
        onConfirm={onCustomAdvanceAmountChange}
        onClose={closeKeypad}
        label="Advance Amount"
        maxLength={7}
        maxRange={order?.totalAmount} 
        showMaxValue={true}
      />
      <DatePickerModal
        isOpen={isDatePickerOpen}
        value={order?.deliveryDate}
        label="Delivery Date"
        disablePastDates={true}
        onChange={setDeliveryDate}
        onConfirm={async (date) => {
          setIsDatePickerOpen(false);
          try {
            const response = await suggestDeliveryDate({ requestedDate: date, subOrderCount: Math.max(order.orderDetails.length, 1) });
            const suggestion = response?.data?.data ?? response?.data;
            const suggestedDate = typeof suggestion?.suggestedDate === 'string' ? suggestion.suggestedDate.slice(0, 10) : date;
            setOrder(previous => ({ ...previous, deliveryDate: suggestedDate }));
            if (suggestion?.wasAdjusted || suggestedDate !== date) {
              setStatusModelData({ isOpen: true, title: 'Delivery date adjusted', message: `Daily production capacity is ${suggestion.dailyCapacity} suborders. Delivery date moved to ${commonLogic.formatDate(suggestedDate)}.`, type: 'info', buttonText: 'OK', showCloseButton: true });
            }
          } catch (error) {
            setStatusModelData({ isOpen: true, title: 'Unable to check production capacity', message: error?.message || 'Please try selecting the delivery date again.', type: 'error', buttonText: 'OK', showCloseButton: true });
          }
        }}
        onClose={() => setIsDatePickerOpen(false)}
      />
      <StatusModal
        isOpen={statusModelData.isOpen}
        type={statusModelData.type}
        title={statusModelData.title}
        message={statusModelData.message}
        buttonText={statusModelData.buttonText}
        showCloseButton={statusModelData.showCloseButton}
        buttons={statusModelData.buttons}
        onConfirm={() => {
          setStatusModelData({ ...statusModelData, isOpen: false });
          if (statusModelData.onConfirm) {
            statusModelData.onConfirm();
          }
        }}
        onClose={() => {
          setStatusModelData({ ...statusModelData, isOpen: false });
        }}
      />
      <AddCustomerModel emirateList={emirateList} order={order} setOrder={setOrder} addCustomerModalOpen={addCustomerModalOpen} setAddCustomerModalOpen={setAddCustomerModalOpen}></AddCustomerModel>
      <PrintOrderReceiptPopup
        isOpen={showPrintReceiptPopup}
        onClosePrintOrderReceiptPopup={() => setShowPrintReceiptPopup(false)}
        setPrintReceiptHandler={() => {}}
        showInPupop={true}
        orderId={order?.orderId}
        modelId={order?.orderId || 'print-order-receipt'}
      />
    </>
  )
}
