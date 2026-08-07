import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FiTag, FiSave, FiPlus, FiUser, FiPhone, FiCalendar, FiImage, FiX, FiFolder, FiCamera, FiChevronRight, FiEye, FiEdit2, FiStar } from 'react-icons/fi';
import { FcFlowChart } from 'react-icons/fc';
import { FaCrown, FaTag } from "react-icons/fa";
import CameraCapture from '../../../components/Camera/CameraCapture';
import IsdSelect from '../../../components/PhoneInput/IsdSelect';
import NumericKeypad from '../../../components/NumericKeypad/NumericKeypad';
import { getEmirates } from '../../../services/api/masterDataApi';
import { getWorkTypes } from '../../../services/api/workTypeApi';
import { getCustomers, createCustomerBasic } from '../../../services/api/customersApi';
import { } from '../../../services/api/ordersApi';
import Modal from '../../../components/Modal/Modal';
import './CreateOrder.css';
import { multipleGet } from '../../../utils/api';
import Select from '../../../components/Select/Select';
import DatePickerModal from "../../../components/DatePicker/DatePickerModal";
import { useNotification } from '../../../components/Notification';
import {
  KeyboardProvider,
  VirtualKeyboard,
  KeyboardInput,
  DatePicker
} from "../../../components/VirtualKeyboard";
import StepHeading from './StepHeading';
import WorkTypeSelector from './WorkTypeSelector';
import Field from '../../../components/Field/Field';
import SubOrderConfig from './SubOrderConfig';
import OrderPriceSelector from './OrderPriceSelector';

// ── Constants ────────────────────────────────────────────────────

const EMPTY_CREATE_ORDER = () => ({
  id: Date.now(),
  isd: '+971',
  mobile: '',
  customerId: 0,
  customerName: '',
  emirateId: 0,
  customerClass: 'Regular',
  orderDate: new Date().toISOString().split('T')[0],
  deliveryDate: '',
  orderDetails: []
});

const MEASUREMENT_FIELDS = [
  { key: 'chest', label: 'Chest' },
  { key: 'back', label: 'Back' },
  { key: 'hands', label: 'Hands' },
  { key: 'height', label: 'Height' },
  { key: 'neck', label: 'Neck' },
  { key: 'deep', label: 'Deep' },
];

function todayLabel() {
  return new Date().toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });
}

// ── Sub-components ───────────────────────────────────────────────
function SectionCard({ title, icon: Icon, action, children }) {
  return (
    <div className="co-card">
      {title && (
        <div className="co-card__header">
          <span className="co-card__title">
            {Icon && <Icon className="co-card__title-icon" />}
            {title}
          </span>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
function CreateOrder() {

  const [customerName, setCustomerName] = useState('');
  const [customerList, setCustomerList] = useState([])
  const [emirateList, setEmirateList] = useState([])
  const [workTypeList, setWorkTypeList] = useState([])
  const [phone, setPhone] = useState('');
  const [isdCountry, setIsdCountry] = useState({ code: '+971', name: 'UAE', short: 'ARE' }); // default: Saudi Arabia
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isCustomerExits, setIsCustomerExits] = useState(true);
  // Dates
  const [deliveryDate, setDeliveryDate] = useState('');

  // Items
  const [createdOrder, setCreatedOrder] = useState(EMPTY_CREATE_ORDER());
  const [activeItemIdx, setActiveItemIdx] = useState(0);

  // Custom price UI state
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Numeric keypad — shared for phone + custom price
  // mode: null | 'phone' | 'price'
  const [keypadMode, setKeypadMode] = useState(null);

  // Order preview modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [customerSaveOpen, setCustomerSaveOpen] = useState(false);
  const openPhoneKeypad = () => setKeypadMode('phone');
  const closeKeypad = () => setKeypadMode(null);

  // Image source picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);   // [{deviceId, label}]
  const [activeCam, setActiveCam] = useState(null); // {deviceId, label}
  const [cameraOpen, setCameraOpen] = useState(false);
  const [camLoading, setCamLoading] = useState(false);
  const fileInputRef = useRef(null);
  const pickerRef = useRef(null);
  const { success, error: showError, confirm } = useNotification();

  const activeItem = createdOrder?.orderDetails[activeItemIdx];
  useEffect(() => {
    multipleGet([getCustomers(1, 100), getEmirates(), getWorkTypes()])
      .then(([ customersRes, emiratesRes, workTypesRes]) => {        
        setCustomerList(customersRes.data.data);
        setEmirateList(emiratesRes.data.data);
        var workTypes = workTypesRes.data;
        (workTypes || []).push({ id: 0, code: 0, name: 'All', icon: 'FaCheckDouble' });
        setWorkTypeList(workTypesRes.data);
      })
      .catch(err => console.error('Failed to load order prices or customers:', err));
  }, []);

  const updateActiveItem = useCallback((patch) => {
    var model = createdOrder;
    if (patch?.updateType === 'orderDetails') {
      if (patch?.name === 'customPrice') {
        if (patch.value === '') {
          model.orderDetails[activeItemIdx][patch?.name] = '';
        }
        else
          model.orderDetails[activeItemIdx][patch?.name] = patch.value;
      }
      else
        model.orderDetails[activeItemIdx][patch?.name] = patch.value;
      setCreatedOrder({ ...model });
    }
    else {
      model[patch.name] = patch.value;
    }
    setCreatedOrder({ ...model });
  }, [activeItemIdx]);

  const addItem = () => {
    const newItem = EMPTY_CREATE_ORDER();
    setCreatedOrder(prev => [...prev, newItem]);
    setActiveItemIdx(createdOrder.orderDetails.length);
    setShowCustomInput(false);
  };

  const removeItem = (idx, e) => {
    e.stopPropagation();
    if (createdOrder.orderDetails?.length === 1) return;
    const next = createdOrder.orderDetails.filter((_, i) => i !== idx);
    setCreatedOrder(prev => ({ ...prev, orderDetails: next }));
    setActiveItemIdx(Math.min(activeItemIdx, next?.length - 1));
  };

  const selectPrice = (price) => {
    updateActiveItem({ name: 'price', value: price.price, updateType: 'orderDetails' });
    updateActiveItem({ name: 'customPrice', value: '', updateType: 'orderDetails' });
    updateActiveItem({ name: 'price', value: price.price });
    updateActiveItem({ name: 'customPrice', value: '' });
    updateActiveItem({ name: 'priceGrade', value: price.grade });
    updateActiveItem({ name: 'priceGrade', value: price.grade, updateType: 'orderDetails' });
    setShowCustomInput(false);
  };

  const applyCustomPrice = () => {
    const val = parseFloat(activeItem?.customPrice);
    if (!isNaN(val) && val > 0) updateActiveItem({ name: 'price', value: val, updateType: 'orderDetails' });
  };

  const addImages = useCallback((newImgs) => {
    setCreatedOrder(prev => prev?.map((item, i) =>
      i === activeItemIdx ? { ...item, images: [...item.images, ...newImgs] } : item
    ));
  }, [activeItemIdx]);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map(f => ({ file: f, url: URL.createObjectURL(f) }));
    addImages(previews);
    e.target.value = '';
    setPickerOpen(false);
  };

  const removeImage = (imgIdx) => {
    updateActiveItem({ name: 'images', value: activeItem?.orderDetails?.images.filter((_, i) => i !== imgIdx), updateType: 'orderDetails' });
  };

  // Close picker on outside click
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => { if (pickerRef.current && !pickerRef.current.contains(e.target)) setPickerOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  // Enumerate cameras (requests permission first to get labels)
  const openPicker = async () => {
    setPickerOpen(p => !p);
    if (cameraDevices?.length > 0) return; // already loaded
    setCamLoading(true);
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
      tempStream.getTracks().forEach(t => t.stop());
      const all = await navigator.mediaDevices.enumerateDevices();
      const cams = all
        .filter(d => d.kind === 'videoinput')
        .map((d, i) => ({ deviceId: d.deviceId, label: d.label || `Camera ${i + 1}` }));
      setCameraDevices(cams);
    } catch {
      setCameraDevices([]); // no camera / permission denied
    } finally {
      setCamLoading(false);
    }
  };

  const launchCamera = (cam) => {
    setActiveCam(cam);
    setCameraOpen(true);
    setPickerOpen(false);
  };

  const handleCameraCapture = (img) => {
    addImages([img]);
    setCameraOpen(false);
  };

  const handleSave = () => {
    // TODO: wire up to order API
    console.log('Save order', { customerName, phone: `${isdCountry.code}${phone}`, deliveryDate, createdOrder });
    setPreviewOpen(false);
  };

  const handleCustomerSave = () => {
    // TODO: wire up to order API
    var data = {
      firstName: createdOrder.customerName,
      isdCode: isdCountry.code,
      mobile: phone,
      emirateId: createdOrder.emirateId,
    };
    console.log('Save Customer', data);
    createCustomerBasic(data).then(res => {
      showError(res?.message);
      var model = createdOrder;
      model.customerId = res.data?.id;
      model.customerName = `${res.data?.firstName} ${res.data?.lastName}`.trim();
      setCreatedOrder({ ...model });
      console.debug(res);
      console.debug(createdOrder);
      setIsCustomerExits(true);
    }).catch(err => {
      showError("Customer not Saved!!")
      console.error(err);
      setIsCustomerExits(false);
    });
    setCustomerSaveOpen(false);
  };

  const itemLabel = (item, idx) => `Item ${idx + 1}`;
  const itemSub = (item) => item.price ? `${item.price.toLocaleString()} ب.د` : 'No price';
  const renderOption = (option) => (
    <>
      {option.icon}
      <span style={{ flex: 1 }}>{option.label}</span>
      <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {option.price}
      </span>
    </>
  );
  const renderValue = (selected) => {
    if (!selected) return <span className="custom-select-placeholder">Select a plan</span>;
    return (
      <div className="custom-select-value">
        {selected.icon}
        <span>{selected.label}</span>
        <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {selected.price}
        </span>
      </div>
    );
  };

  const onCreateOrderInputChangeHandler = (e) => {
    const { name, value } = e.target;
    setCreatedOrder(prev => ({ ...prev, [name]: value }));
  }

  const onNumericPadChangeHandler = ({ name, value }) => {
    const updateField = (fieldName, fieldValue) =>
      onCreateOrderInputChangeHandler({
        target: {
          name: fieldName,
          value: fieldValue,
        },
      });

    // Update the edited field
    updateField(name, value);

    if (name !== 'mobile') return;

    const customer = customerList.find(
      ({ isdCode, mobile }) =>
        `${isdCode}${mobile}` === `${createdOrder.isd}${value}`
    );

    if (!customer) {
      updateField('customerId', 0);
      updateField('customerName', '');
      updateField('customerClass', '');
      updateField('emirateId', 0);
      setIsCustomerExits(false);
      return;
    }

    updateField('customerId', customer.id);
    updateField('emirateId', customer.emirateId);
    updateField('customerName', `${customer.firstName} ${customer.lastName}`);
    updateField('customerClass', customer.customerClass);
    setIsCustomerExits(true);
  };

  return (
    <div className="co-root">
      {/* ── 1st column ─────────────────────────── */}
      <div className="co-col co-col--left">
        <SectionCard title="Customer Info">

          <Field label={<><FiPhone className="co-field__icon" /> Phone Number</>}>
            <div className={`co-phone-wrap ${keypadMode === 'phone' ? 'co-phone-wrap--active' : ''}`}>
              <IsdSelect value={isdCountry} onChange={setIsdCountry} />
              <input
                className="co-input co-input--phone co-input--keypad"
                placeholder="Enter phone"
                readOnly
                value={phone}
                onClick={openPhoneKeypad}
              />
            </div>
          </Field>
          <Field label={<><FiUser className="co-field__icon" /> Customer Name</>}>
            <div className='inline-field'>
              <KeyboardInput
                keyboard="alphabet"
                value={createdOrder.customerName}
                onChange={onCreateOrderInputChangeHandler}
                label="Customer Name"
                name="customerName"
                placeholder="Enter customer name"
                className="co-input"
                disabled={createdOrder.customerId > 0}
              />
              {!isCustomerExits && <button disabled={createdOrder.customerName?.length < 3} className="co-btn co-btn--add" onClick={e => setCustomerSaveOpen(true)}>
                <FiPlus /> Add Customer
              </button>
              }
            </div>
          </Field>
          <Field label={<><FcFlowChart className="co-field__icon" /> Emirate</>}>
            <Select
              options={emirateList.map(e => ({ value: e.id, label: e.displayValue }))}
              value={createdOrder?.emirateId}
              onChange={(val) => { updateActiveItem({ "name": "emirateId", value: val }) }}
              name="emirateId"
              placeholder="Search and select..."
              showSearch={false}
              renderOption={renderOption}
              renderValue={renderValue}
            />
          </Field>
          <div className="inline-field">
            <Field label="Order Date">
              <div className="co-input co-input--readonly">{todayLabel()}</div>
            </Field>
            <Field label="Delivery Date">
              <div className="co-input-wrap">
                <input
                  className="co-input"
                  type="text"
                  value={deliveryDate}
                  icon=""
                  readOnly
                  onClick={() => setIsDatePickerOpen(true)}
                />
                {!deliveryDate && <span className="co-date-placeholder">Select date</span>}
              </div>
              <DatePickerModal
                isOpen={isDatePickerOpen}
                value={deliveryDate}
                label="Delivery Date"
                disablePastDates={true}
                onChange={setDeliveryDate}
                onConfirm={(date) => {
                  console.log("Selected Date:", date);
                  setDeliveryDate(date);
                }}
                onClose={() => setIsDatePickerOpen(false)}
              />
            </Field>
          </div>
          <div className="inline-field-column">
            <Field label="Customer Type">
            </Field>
            <div className="inline-field">
              <div className={`text-icon ${createdOrder.customerClass === 'Regular' ? 'active' : ''}`}><FiUser /><span>Regular</span></div>
              <div className={`text-icon ${createdOrder.customerClass === 'VIP' ? 'active' : ''}`}><FiStar /><span>VIP</span></div>
              <div className={`text-icon ${createdOrder.customerClass === 'VVIP' ? 'active' : ''}`}><FaCrown /><span>VVIP</span></div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* ── 2nd column ───────────────────────── */}
      <OrderPriceSelector order={createdOrder} setOrder={setCreatedOrder} />


      {/* ── 3rd column ──────────────────────────
      <div className="co-col co-col--mid">
        <div className="co-card co-card--scroll">
          <div className="co-card__header">
            <span className="co-card__title">
              <FiTag className="co-card__title-icon" />
              Measurements — Item {activeItemIdx + 1}
            </span>
          </div>

          <div className="co-grid-2">
            {MEASUREMENT_FIELDS.map(({ key, label }) => (
              <Field key={key} label={label}>
                <input
                  className="co-input co-input--center"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={activeItem?.[key]}
                  onChange={e => updateActiveItem({ name: key, value: e.target.value, updateType: 'orderDetails' })}
                />
              </Field>
            ))}
          </div>

          <Field label="Arm Loose">
            <input
              className="co-input co-input--center"
              type="number"
              min="0"
              placeholder="0"
              value={activeItem?.armLoose}
              onChange={e => updateActiveItem({ name: 'armLoose', value: e.target.value, updateType: 'orderDetails' })}
            />
          </Field>

          <Field label="Notes">
            <textarea
              className="co-textarea"
              placeholder="Special instructions"
              rows={4}
              value={activeItem?.notes}
              onChange={e => updateActiveItem({ name: 'notes', value: e.target.value, updateType: 'orderDetails' })}
            />
          </Field>

          <div className="co-field">
            <label className="co-field__label">Images</label>
            <div className="co-images">
              {activeItem?.images?.map((img, i) => (
                <div key={i} className="co-img-thumb">
                  <img src={img.url} alt={`item-${i}`} />
                  <button className="co-img-thumb__remove" onClick={() => removeImage(i)}><FiX size={12} /></button>
                </div>
              ))}
                */}

      {/* Add image button + source picker */}
      {/* <div className="co-img-picker-wrap" ref={pickerRef}>
                <button className="co-img-add" onClick={openPicker} title="Add image">
                  <FiImage size={22} />
                </button>

                {pickerOpen && (
                  <div className="co-img-picker">*/}
      {/* From computer */}
      {/*   <button className="co-img-picker__item" onClick={() => { fileInputRef.current?.click(); setPickerOpen(false); }}>
                      <span className="co-img-picker__icon co-img-picker__icon--folder"><FiFolder size={16} /></span>
                      <span className="co-img-picker__label">From Computer</span>
                    </button>
                    */}

      {/* Camera divider */}
      {/*     <div className="co-img-picker__divider">
                      <FiCamera size={12} /> Camera
                    </div>

                    {camLoading && (
                      <div className="co-img-picker__loading">
                        <span className="co-img-picker__spinner" /> Detecting cameras…
                      </div>
                    )}

                    {!camLoading && cameraDevices?.length === 0 && (
                      <div className="co-img-picker__empty">No cameras detected</div>
                    )}

                    {!camLoading && cameraDevices?.map(cam => (
                      <button key={cam.deviceId} className="co-img-picker__item" onClick={() => launchCamera(cam)}>
                        <span className="co-img-picker__icon co-img-picker__icon--cam"><FiCamera size={16} /></span>
                        <span className="co-img-picker__label">{cam.label}</span>
                        <FiChevronRight size={14} className="co-img-picker__arrow" />
                      </button>
                    ))}
                  </div>
                )}
                */}

      {/* Hidden file input */}
      {/* <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div> */}

      {/* ── 3rd column ────────────────────────── */}
      <div className="co-col co-col--mid">
         {/* ── 3/1 column ────────────────────────── */}
        <div className="co-card co-card--scroll">
          <div className="co-card__header">
            <div className="justify-between">
              <StepHeading step={2} title="Work Steps + Qty" />
             {createdOrder?.orderDetails?.[activeItemIdx]?.price>0 && <div className="selected-price"> {createdOrder?.orderDetails?.[activeItemIdx]?.price} AED . {createdOrder?.orderDetails?.[activeItemIdx]?.priceGrade}</div>}
            </div>
          </div>

          <WorkTypeSelector activeIndex={activeItemIdx} WorkTypeList={workTypeList} order={createdOrder} setOrder={setCreatedOrder} />
        </div>
         {/* ── 3/2 column ────────────────────────── */}
         <div className="co-card co-card--scroll">
          <div className="co-card__header">
            <div className="justify-between">
              <StepHeading step="Per Sub Config" showStep={false} />
             <div className="selected-price"> {createdOrder?.orderDetails?.length || 0} Sub Orders</div>
            </div>
          </div>

          <SubOrderConfig order={createdOrder} />
        </div>
      </div>

      {/* ── 4th column ────────────────────────── */}
      <div className="co-col co-col--mid">
        <div className="co-card co-card--scroll">
          <div className="co-card__header">
            <span className="co-card__title">
              <FiTag className="co-card__title-icon" />
              Measurements — Item {activeItemIdx + 1}
            </span>
          </div>

          <Field label="Person Name">
            <input
              className="co-input"
              placeholder="Who is this for?"
              value={activeItem?.personName}
              onChange={e => updateActiveItem({ name: 'personName', value: e.target.value, updateType: 'orderDetails' })}
            />
          </Field>

          <div className="co-grid-2">
            {MEASUREMENT_FIELDS.map(({ key, label }) => (
              <Field key={key} label={label}>
                <input
                  className="co-input co-input--center"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={activeItem?.[key]}
                  onChange={e => updateActiveItem({ name: key, value: e.target.value, updateType: 'orderDetails' })}
                />
              </Field>
            ))}
          </div>

          <Field label="Arm Loose">
            <input
              className="co-input co-input--center"
              type="number"
              min="0"
              placeholder="0"
              value={activeItem?.armLoose}
              onChange={e => updateActiveItem({ name: 'armLoose', value: e.target.value, updateType: 'orderDetails' })}
            />
          </Field>

          <Field label="Notes">
            <textarea
              className="co-textarea"
              placeholder="Special instructions"
              rows={4}
              value={activeItem?.notes}
              onChange={e => updateActiveItem({ name: 'notes', value: e.target.value, updateType: 'orderDetails' })}
            />
          </Field>

          <div className="co-field">
            <label className="co-field__label">Images</label>
            <div className="co-images">
              {activeItem?.images?.map((img, i) => (
                <div key={i} className="co-img-thumb">
                  <img src={img.url} alt={`item-${i}`} />
                  <button className="co-img-thumb__remove" onClick={() => removeImage(i)}><FiX size={12} /></button>
                </div>
              ))}

              {/* Add image button + source picker */}
              <div className="co-img-picker-wrap" ref={pickerRef}>
                <button className="co-img-add" onClick={openPicker} title="Add image">
                  <FiImage size={22} />
                </button>

                {pickerOpen && (
                  <div className="co-img-picker">
                    {/* From computer */}
                    <button className="co-img-picker__item" onClick={() => { fileInputRef.current?.click(); setPickerOpen(false); }}>
                      <span className="co-img-picker__icon co-img-picker__icon--folder"><FiFolder size={16} /></span>
                      <span className="co-img-picker__label">From Computer</span>
                    </button>

                    {/* Camera divider */}
                    <div className="co-img-picker__divider">
                      <FiCamera size={12} /> Camera
                    </div>

                    {camLoading && (
                      <div className="co-img-picker__loading">
                        <span className="co-img-picker__spinner" /> Detecting cameras…
                      </div>
                    )}

                    {!camLoading && cameraDevices?.length === 0 && (
                      <div className="co-img-picker__empty">No cameras detected</div>
                    )}

                    {!camLoading && cameraDevices?.map(cam => (
                      <button key={cam.deviceId} className="co-img-picker__item" onClick={() => launchCamera(cam)}>
                        <span className="co-img-picker__icon co-img-picker__icon--cam"><FiCamera size={16} /></span>
                        <span className="co-img-picker__label">{cam.label}</span>
                        <FiChevronRight size={14} className="co-img-picker__arrow" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Order Preview Modal ──────────────────── */}
      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Order Summary"
        size="large"
        type="default"
        showCloseButton
        closeOnOverlayClick
        footer={
          <div className="op-footer">
            <button className="op-btn op-btn--ghost" onClick={() => setPreviewOpen(false)}>
              <FiEdit2 size={15} /> Edit Order
            </button>
            <div className="op-footer__right">
              <button className="op-btn op-btn--danger" onClick={() => { setPreviewOpen(false); }}>
                <FiX size={15} /> Cancel
              </button>
              <button className="op-btn op-btn--save" onClick={handleSave}>
                <FiSave size={15} /> Save Order
              </button>
            </div>
          </div>
        }
      >
        <div className="op-body">
          {/* Customer & dates */}
          <div className="op-section-grid">
            <div className="op-section">
              <h4 className="op-section__title"><FiUser size={14} /> Customer</h4>
              <div className="op-row"><span className="op-lbl">Name</span><span className="op-val">{customerName || <em>—</em>}</span></div>
              <div className="op-row"><span className="op-lbl">Phone</span><span className="op-val">{phone ? `${isdCountry.code} ${phone}` : <em>—</em>}</span></div>
            </div>
            <div className="op-section">
              <h4 className="op-section__title"><FiCalendar size={14} /> Dates</h4>
              <div className="op-row"><span className="op-lbl">Order Date</span><span className="op-val">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span></div>
              <div className="op-row"><span className="op-lbl">Delivery</span><span className="op-val">{deliveryDate ? new Date(deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : <em>Not set</em>}</span></div>
            </div>
          </div>

          {/* Items */}
          <div className="op-items">
            {createdOrder.orderDetails?.map((item, idx) => (
              <div key={idx + 1} className="op-item">
                <div className="op-item__header">
                  <span className="op-item__title">Item {idx + 1}{item?.personName ? ` — ${item?.personName}` : ''}</span>
                  {item?.price
                    ? <span className="op-item__price">{item?.price.toLocaleString()} ب.د</span>
                    : <span className="op-item__price op-item__price--none">No price</span>
                  }
                </div>

                {/* Measurements */}
                <div className="op-measurements">
                  {[
                    ['Chest', item?.chest], ['Back', item?.back],
                    ['Hands', item?.hands], ['Height', item?.height],
                    ['Neck', item?.neck], ['Deep', item?.deep],
                    ['Arm Loose', item?.armLoose],
                  ].map(([lbl, val]) => val ? (
                    <div key={lbl} className="op-meas-row">
                      <span className="op-meas-lbl">{lbl}</span>
                      <span className="op-meas-val">{val}</span>
                    </div>
                  ) : null)}
                </div>

                {/* Notes */}
                {item?.notes && (
                  <div className="op-notes"><span className="op-lbl">Notes</span><p>{item?.notes}</p></div>
                )}

                {/* Images */}
                {item?.images?.length > 0 && (
                  <div className="op-images">
                    {item?.images.map((img, i) => (
                      <img key={i} src={img.url} alt={`item-${idx}-img-${i}`} className="op-img-thumb" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Total */}
          {createdOrder.orderDetails?.length > 1 && (
            <div className="op-total">
              <span>Total</span>
              <span>{createdOrder.orderDetails.reduce((s, it) => s + (it.price || 0), 0).toLocaleString()} ب.د</span>
            </div>
          )}
        </div>
      </Modal>

      {/* ── Save Customer Modal ──────────────────── */}
      <Modal
        isOpen={customerSaveOpen}
        onClose={() => setCustomerSaveOpen(false)}
        title="Save Customer"
        size="mid"
        type="default"
        showCloseButton
        closeOnOverlayClick
        footer={
          <div className="op-footer">
            <div className="op-footer__right">
              <button className="op-btn op-btn--danger" onClick={() => { setCustomerSaveOpen(false); }}>
                <FiX size={15} /> Cancel
              </button>
              <button className="op-btn op-btn--save" onClick={handleCustomerSave}>
                <FiSave size={15} /> Save Customer
              </button>
            </div>
          </div>
        }
      >
        <div className="op-body">
          {/* Customer & Phone Number */}
          <div className="op-section-grid-single">
            <div className="op-section">
              <h4 className="op-section__title"><FiUser size={14} /> Customer</h4>
              <div className="op-row"><span className="op-lbl">Name</span><span className="op-val">{createdOrder.customerName || <em>—</em>}</span></div>
              <div className="op-row"><span className="op-lbl">Phone</span><span className="op-val">{phone ? `${isdCountry.code} ${phone}` : <em>—</em>}</span></div>
              <div className="op-row"><span className="op-lbl">Emirate</span><span className="op-val">{createdOrder.emirateId ? emirateList.find(e => e.id === createdOrder.emirateId)?.name : <em>—</em>}</span></div>
            </div>
          </div>
        </div>
      </Modal>


      {/* Numeric keypad — phone */}
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

     

      {/* Camera capture modal */}
      <CameraCapture
        isOpen={cameraOpen}
        deviceId={activeCam?.deviceId ?? null}
        deviceLabel={activeCam?.label ?? 'Camera'}
        onCapture={handleCameraCapture}
        onClose={() => setCameraOpen(false)}
      />
    </div>
  );
}

export default CreateOrder;
