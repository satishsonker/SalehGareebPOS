import React, { useEffect, useState } from 'react'
import './NewOrderPage.css'
import OrderPriceSelector from './OrderPriceSelector';
import Modal from '../../../components/Modal/Modal';
import { FiTag, FiSave, FiPlus, FiUser, FiPhone, FiCalendar, FiImage, FiX, FiFolder, FiCamera, FiChevronRight, FiEye, FiEdit2, FiStar, FiClock, FiAlertCircle, FiAlertTriangle, FiTruck, FiFeather, FiMinus, FiRefreshCw } from 'react-icons/fi';
import { FcFlowChart } from 'react-icons/fc';
import { FaCrown, FaTag } from "react-icons/fa";
import WorkTypeSelector from './WorkTypeSelector';
import SubOrderConfig from './SubOrderConfig';
import WorkDescriptionSelector from './WorkDescriptionSelector';
import PaymentSelector from './PaymentSelector';
import OrderSummary from './OrderSummary';
import { getEmirates, getMasterDataByTypes } from '../../../services/api/masterDataApi';
import { getCustomers, createCustomerBasic } from '../../../services/api/customersApi';
import { createOrder } from '../../../services/api/ordersApi';
import { multipleGet } from '../../../utils/api';
import NumericKeypad from '../../../components/NumericKeypad/NumericKeypad';
import DatePickerModal from '../../../components/DatePicker/DatePickerModal';
import { commonLogic } from '../../../utils/commonLogic';
import AddCustomerModel from './AddCustomerModel';
import SubOrderDetailList from './SubOrderDetailList';
import { enums } from '../../../utils/enums';
import StatusModal from '../../../components/StatusModel/StatusModel';
import { getWorkTypes } from '../../../services/api/workTypeApi';
export default function NewOrderPage() {
  const EMPTY_CREATE_ORDER = () => ({
    id: Date.now(),
    isd: '+971',
    mobile: '',
    customerId: 0,
    customerName: '',
    emirateId: 0,
    employeeId: 1,
    customerClass: 'Regular',
    price: 0,
    priceGrage: '',
    orderDate: new Date().toISOString().split('T')[0],
    deliveryDate: '',
    orderDetails: [],
    selectedSubOrderIndex: 0,
    paymentMode: 'VISA',
    subTotal: 0,
    totalAmount: 0,
    advanceAmount: 0,
    balanceAmount: 0,
    bookingType: '',
    urgency: '',
    orderNo: '12345'
  });
  const [workTypeList, setWorkTypeList] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [keypadMode, setKeypadMode] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState('')
  const [customerList, setCustomerList] = useState([])
  const [emirateList, setEmirateList] = useState([])
  const [openPriceModel, setOpenPriceModel] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [workTypeSelectorModalOpen, setWorkTypeSelectorModalOpen] = useState(false)
  const [order, setOrder] = useState(EMPTY_CREATE_ORDER());
  const [isdCountry, setIsdCountry] = useState({ code: '+971', name: 'UAE', short: 'ARE' });
  const [phone, setPhone] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [reviewOrderModalOpen, setReviewOrderModalOpen] = useState(false);
  const [isCustomerExits, setIsCustomerExits] = useState(true);
  const [addCustomerModalOpen, setAddCustomerModalOpen] = useState(false);
  const [validationSummaryModalOpen, setValidationSummaryModalOpen] = useState(false);
  const [paymentModeList, setPaymentModeList] = useState([])
  const [bookingTypeList, setBookingTypeList] = useState([]);
  const [urgencyList, setUrgencyList] = useState([]);
  const [neckLineList, setNeckLineList] = useState([]);
  const [sleeveList, setSleeveList] = useState([]);
  const [lengthList, setLengthList] = useState([]);
  const [advanceAmount, setAdvanceAmount] = useState(0);
  const [advancePercent, setAdvancePercent] = useState(50);
  const [StatusModelData, setStatusModelData] = useState({ isOpen: false, title: '', message: '', type: 'info', onConfirm: null });
  const openPhoneKeypad = () => setKeypadMode('phone');
  const closeKeypad = () => setKeypadMode(null);
  const handleSave = () => {
    if (!ValidateOrder()) {
      return;
    }
    createOrder(order)
      .then(response => {
        var statusData = {
          isOpen: response.success,
          title: response.message,
          type: response.success ? 'success' : 'warn',
          buttonText: response.success ? 'Print' : "Ok",
          showCloseButton: response.success
        };
        if (response.success) {
          statusData.message = ` Order No: ${response.data}`;
          setOrder({...EMPTY_CREATE_ORDER})
        }
        setStatusModelData({ ...statusData });
      })
      .catch(error => {
        var statusData = { isOpen: false, title: 'Something went wrong', type: 'error' };
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
    multipleGet([getCustomers(1, 100), getEmirates(), getMasterDataByTypes([enums.masterDataCode.paymentMode, enums.masterDataCode.bookingType, enums.masterDataCode.urgency, enums.masterDataCode.length, enums.masterDataCode.neckline, enums.masterDataCode.sleeve]), getWorkTypes()])
      .then(([customersRes, emiratesRes, masterDataRes, workTypesRes]) => {
        setCustomerList(customersRes.data.data);
        setEmirateList(emiratesRes.data.data);
        setPaymentModeList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.paymentMode) || []);
        setBookingTypeList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.bookingType) || []);
        setUrgencyList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.urgency) || []);
        setLengthList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.length) || []);
        setNeckLineList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.neckline) || []);
        setSleeveList(masterDataRes.data.data.filter(item => item.masterDataType?.toLowerCase() === enums.masterDataCode.sleeve) || []);
        if (workTypesRes.data.filter(x => x.code === '0').length === 0) {
          workTypesRes.data?.push({ id: 0, code: '0', name: 'All' });
        }
        setWorkTypeList(workTypesRes.data || []);
      })
      .catch(err => console.error('Failed to load order prices or customers:', err));
  }, []);

  const onNumericPadChangeHandler = ({ name, value }) => {
    var model = order;
    model[name] = value;
    if (name !== 'mobile') return;

    const customer = customerList.find(
      ({ isdCode, mobile }) =>
        `${isdCode}${mobile}` === `${order.isd}${value}`
    );

    if (!customer) {
      model.customerId = 0;
      model.customerName = '';
      model.customerClass = '';
      model.emirateId = 0;
      setIsCustomerExits(false);
      setAddCustomerModalOpen(true);
      return;
    }

    model.customerId = customer.id;
    model.emirateId = customer.emirateId;
    model.customerName = `${customer.firstName} ${customer.lastName}`;
    model.customerClass = customer.customerClass;
    setOrder({ ...model });
    setIsCustomerExits(true);
    setAddCustomerModalOpen(false);
  };
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
      <div className='wrap'>
        <div className="panel customer-row">
          <div className="field-grid">
            <div className="field">
              <label>Phone Number</label>
              <input type="text" onClick={openPhoneKeypad} placeholder="+971 · Enter phone" value={order?.isd + order?.mobile} />
            </div>
            <div className="field">
              <label>Customer Name</label>
              <input type="text" value={order?.customerName} placeholder="Enter customer name" />
            </div>
            <div className="field">
              <label>Emirate</label>
              <select value={order?.emirateId} disabled={order?.customerId > 0} name='emirateId' onChange={e => { setOrder(pre => ({ ...pre, ["emirateId"]: e.target.value })) }}>
                <option>Select a Emirate</option>
                {emirateList?.map((ele, index) => {
                  return <option key={index} value={ele?.id}>{ele?.displayValue}</option>
                })}
              </select>
            </div>
            <div className="field">
              <label>Order Date</label>
              <input type="text" value={commonLogic.formatDate(new Date())} />
            </div>
            <div className="field">
              <label>Delivery Date</label>
              <input type="text" placeholder="Select date" value={commonLogic.formatDate(order?.deliveryDate)} readOnly
                onClick={() => setIsDatePickerOpen(true)} />
            </div>
            <div className="field">
              <label>Price</label>
              <button className="rate-btn" id="openRateModal" onClick={e => setOpenPriceModel(true)} style={{ width: '100%' }}>
                <span>Select Price</span>
                <span className="arrow">›</span>
              </button>
            </div>
            <div className="field">
              <label>Customer Type</label>
              <div className="customer-type">
                {['Regular', 'VIP', 'VVIP'].map((ele, index) => {
                  return <button key={index} className={`pill-btn ${order?.customerClass?.toLocaleLowerCase() === ele.toLocaleLowerCase() ? 'active' : ''}`}>{ele}</button>
                })}
              </div>
            </div>
          </div>
          {/* <SubOrderList order={order} setOrder={setOrder} /> */}

        </div>
        <div className='order-details'>
          <div className="panel">
            <div className="panel-header">
              <div>Total Suborder : {order.orderDetails?.length}</div>
            </div>
            <div className="subconfig-panel" style={{ paddingBottom: '0' }}>
              <SubOrderDetailList order={order} workTypeList={workTypeList} setOrder={setOrder} setWorkTypeSelectorModalOpen={setWorkTypeSelectorModalOpen} workTypeList={workTypeList} />
              <WorkTypeSelector options={{ order, setOrder, workTypeList, workTypeSelectorModalOpen, setWorkTypeSelectorModalOpen, neckLineList, lengthList, sleeveList }} />
            </div>
          </div>
          <div>
            <div className="panel order-summary-panel">
              <div className="payment-column actionButtons-container">
                <button type="button" className="btn btn-danger actionButtons" onClick={() => setReviewOrderModalOpen(true)}>
                  <FiRefreshCw />
                  Reset
                </button>
                <button type="button" className="btn btn-success actionButtons" onClick={handleSave}>
                  <FiSave />
                  Save Order
                </button>

              </div>
            </div>
            <div className='panel'>
              {/* <WorkDescriptionSelector order={order} setOrder={setOrder} /> */}
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
                  {commonLogic.advancePercentage.map(percent => (
                    <button
                      key={percent}
                      type="button"
                      className={`advance-option ${advancePercent === percent ? 'active' : ''}`}
                      onClick={() => {
                        const amount = Math.round(((totalAmount * percent) / 100) / 50) * 50;
                        setAdvancePercent(percent);
                        handleAdvanceChange({ target: { value: amount } });
                      }}
                    >
                      {percent}%
                    </button>
                  ))}

                  {/* <button
                    type="button"
                    className={`advance-option ${advancePercent === null ? 'active' : ''
                      }`}
                    onClick={() => {
                      setAdvancePercent(null);
                      setAdvanceAmount(0);
                    }}
                  >
                    Custom
                  </button> */}
                </div>
                <OrderSummary order={order} setOrder={setOrder} paymentModalOpen={paymentModalOpen} setPaymentModalOpen={setPaymentModalOpen} setReviewOrderModalOpen={setReviewOrderModalOpen} setValidationSummaryModalOpen={setValidationSummaryModalOpen} />
              </div>
            </div>

          </div>

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
      <PaymentSelector order={order} setOrder={setOrder} paymentModalOpen={paymentModalOpen} setPaymentModalOpen={setPaymentModalOpen} />
      <NumericKeypad
        isOpen={keypadMode === 'phone'}
        value={phone}
        name="mobile"
        onChange={setPhone}
        onConfirm={onNumericPadChangeHandler}
        onClose={closeKeypad}
        label="Phone Number"
        maxLength={15}
      />
      <DatePickerModal
        isOpen={isDatePickerOpen}
        value={order?.deliveryDate}
        label="Delivery Date"
        disablePastDates={true}
        onChange={setDeliveryDate}
        onConfirm={(date) => {
          console.log("Selected Date:", date);
          setOrder({ ...order, ["deliveryDate"]: date });
        }}
        onClose={() => setIsDatePickerOpen(false)}
      />
      <StatusModal
        isOpen={StatusModelData.isOpen}
        type={StatusModelData.type}
        title={StatusModelData.title}
        message={StatusModelData.message}
        onConfirm={() => {
          setStatusModelData({ ...StatusModelData, isOpen: false });
        }}
        onClose={() => {
          setStatusModelData({ ...StatusModelData, isOpen: false });
        }}
      />
      <AddCustomerModel emirateList={emirateList} order={order} setOrder={setOrder} addCustomerModalOpen={addCustomerModalOpen} setAddCustomerModalOpen={setAddCustomerModalOpen}></AddCustomerModel>
    </>
  )
}
