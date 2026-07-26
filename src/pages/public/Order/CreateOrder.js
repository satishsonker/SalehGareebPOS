import React, { useState, useCallback, useRef, useEffect } from 'react';
import { FiTag, FiSave, FiPlus, FiUser, FiPhone, FiCalendar, FiImage, FiX, FiFolder, FiCamera, FiChevronRight, FiEye, FiEdit2, FiStar } from 'react-icons/fi';
import { FcFlowChart } from 'react-icons/fc';
import { FaCrown } from "react-icons/fa";
import CameraCapture from '../../../components/Camera/CameraCapture';
import IsdSelect from '../../../components/PhoneInput/IsdSelect';
import NumericKeypad from '../../../components/NumericKeypad/NumericKeypad';
import { getEmirates } from '../../../services/api/masterDataApi';
import { getCustomers } from '../../../services/api/customersApi';
import { } from '../../../services/api/ordersApi';
import { getOrderPrices } from '../../../services/api/orderPriceApi';
import Modal from '../../../components/Modal/Modal';
import './CreateOrder.css';
import { multipleGet } from '../../../utils/api';
import Select from '../../../components/Select/Select';
import DatePickerModal from "../../../components/DatePicker/DatePickerModal";
import {
  KeyboardProvider,
  VirtualKeyboard,
  KeyboardInput,
  DatePicker
} from "../../../components/VirtualKeyboard";

// ── Constants ────────────────────────────────────────────────────

const EMPTY_CREATE_ORDER = () => ({
  id: Date.now(),
  isd: '+971',
  mobile: '',
  emirate: '',
  customerId: 0,
  customerName: '',
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

function Field({ label, children }) {
  return (
    <div className="co-field">
      <label className="co-field__label">{label}</label>
      {children}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────
function CreateOrder() {

  const [customerName, setCustomerName] = useState('');
  const [customerList, setCustomerList] = useState([])
  const [emirates, setEmirates] = useState([])
  const [phone, setPhone] = useState('');
  const [isdCountry, setIsdCountry] = useState({ code: '+971', name: 'UAE', short: 'ARE' }); // default: Saudi Arabia
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
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

  const openPhoneKeypad = () => setKeypadMode('phone');
  const openPriceKeypad = () => setKeypadMode('price');
  const closeKeypad = () => setKeypadMode(null);

  // Image source picker
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cameraDevices, setCameraDevices] = useState([]);   // [{deviceId, label}]
  const [activeCam, setActiveCam] = useState(null); // {deviceId, label}
  const [cameraOpen, setCameraOpen] = useState(false);
  const [camLoading, setCamLoading] = useState(false);
  const fileInputRef = useRef(null);
  const pickerRef = useRef(null);

  const activeItem = createdOrder[activeItemIdx];

  const [presetPrices, setPresetPrices] = useState([]);
  useEffect(() => {
    multipleGet([getOrderPrices(), getCustomers(1, 100), getEmirates()])
      .then(([pricesRes, customersRes, emiratesRes]) => {
        setPresetPrices(pricesRes.data.data);
        setCustomerList(customersRes.data.data);
        setEmirates(emiratesRes.data.data);
      })
      .catch(err => console.error('Failed to load order prices or customers:', err));
  }, []);

  const updateActiveItem = useCallback((patch) => {
    setCreatedOrder(prev => prev.map((item, i) => i === activeItemIdx ? { ...item, ...patch } : item));
  }, [activeItemIdx]);

  const addItem = () => {
    const newItem = EMPTY_CREATE_ORDER();
    setCreatedOrder(prev => [...prev, newItem]);
    setActiveItemIdx(createdOrder.length);
    setShowCustomInput(false);
  };

  const removeItem = (idx, e) => {
    e.stopPropagation();
    if (createdOrder.length === 1) return;
    const next = createdOrder.filter((_, i) => i !== idx);
    setCreatedOrder(next);
    setActiveItemIdx(Math.min(activeItemIdx, next.length - 1));
  };

  const selectPrice = (price) => {
    updateActiveItem({ price, customPrice: '' });
    setShowCustomInput(false);
  };

  const applyCustomPrice = () => {
    const val = parseFloat(activeItem?.customPrice);
    if (!isNaN(val) && val > 0) updateActiveItem({ price: val });
  };

  const addImages = useCallback((newImgs) => {
    setCreatedOrder(prev => prev.map((item, i) =>
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
    updateActiveItem({ images: activeItem?.images.filter((_, i) => i !== imgIdx) });
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
    if (cameraDevices.length > 0) return; // already loaded
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
  const onNumericPadChangeHandler = (e) => {
    var event = {
      target: e
    };
    onCreateOrderInputChangeHandler(event);
    if (e?.name === 'mobile') {
      const customer = customerList.find(x => `${x.isdCode}${x.mobile}` === `${createdOrder.isd}${e?.value}`);
      if (customer) {
        event.target = {
          name: 'customerId',
          value: customer.id
        };
        onCreateOrderInputChangeHandler(event);
        event.target = {
          name: 'customerName',
          value: `${customer.firstName} ${customer.lastName}`
        };
        onCreateOrderInputChangeHandler(event);
        event.target = {
          name: 'customerClass',
          value: customer.customerClass
        };
        onCreateOrderInputChangeHandler(event);
      }
    }
  }

  return (
    <div className="co-root">
      {/* ── Left column ─────────────────────────── */}
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
          </Field>
          <Field label={<><FcFlowChart className="co-field__icon" /> Emirate</>}>
            <Select
              options={emirates.map(e => ({ value: e.id, label: e.displayValue }))}
              value={createdOrder.emirate}
              onChange={(val) => (val)}
              name="emirate"
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
              <div className={ `text-icon ${createdOrder.customerClass === 'Regular' ? 'active' : ''}` }><FiUser /><span>Regular</span></div>
              <div className={ `text-icon ${createdOrder.customerClass === 'VIP' ? 'active' : ''}` }><FiStar /><span>VIP</span></div>
              <div className={ `text-icon ${createdOrder.customerClass === 'VVIP' ? 'active' : ''}` }><FaCrown /><span>VVIP</span></div>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Dates">

        </SectionCard>
        <SectionCard
          title={`Items (${createdOrder.length})`}
          icon={FiUser}
          action={
            <button className="co-btn co-btn--add" onClick={addItem}>
              <FiPlus /> Add Item
            </button>
          }
        >
          <div className="co-items-list">
            {createdOrder?.orderDetails?.map((item, idx) => (
              <div
                key={item.id}
                className={`co-item-tab ${idx === activeItemIdx ? 'co-item-tab--active' : ''}`}
                onClick={() => { setActiveItemIdx(idx); setShowCustomInput(false); }}
              >
                <div className="co-item-tab__info">
                  <span className="co-item-tab__name">{itemLabel(item, idx)}</span>
                  <span className="co-item-tab__sub">{itemSub(item)}</span>
                </div>
                {createdOrder?.orderDetails?.length > 1 && (
                  <button className="co-item-tab__remove" onClick={(e) => removeItem(idx, e)}>
                    <FiX size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Middle column ───────────────────────── */}
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
              onChange={e => updateActiveItem({ personName: e.target.value })}
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
                  onChange={e => updateActiveItem({ [key]: e.target.value })}
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
              onChange={e => updateActiveItem({ armLoose: e.target.value })}
            />
          </Field>

          <Field label="Notes">
            <textarea
              className="co-textarea"
              placeholder="Special instructions"
              rows={4}
              value={activeItem?.notes}
              onChange={e => updateActiveItem({ notes: e.target.value })}
            />
          </Field>

          <div className="co-field">
            <label className="co-field__label">Images</label>
            <div className="co-images">
              {activeItem?.images.map((img, i) => (
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

                    {!camLoading && cameraDevices.length === 0 && (
                      <div className="co-img-picker__empty">No cameras detected</div>
                    )}

                    {!camLoading && cameraDevices.map(cam => (
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

      {/* ── Right column ────────────────────────── */}
      <div className="co-col co-col--right">
        <div className="co-card">
          <div className="co-card__header">
            <span className="co-card__title">Price (ب.د) — Item {activeItemIdx + 1}</span>
          </div>

          {/* Selected price display */}
          <div className={`co-price-display ${activeItem?.price ? 'co-price-display--set' : ''}`}>
            {activeItem?.price
              ? <><span className="co-price-display__label">Selected Price</span><span className="co-price-display__val">{activeItem?.price.toLocaleString()} ب.د</span></>
              : <span className="co-price-display__placeholder">No price selected</span>
            }
          </div>

          <div className="co-price-grid">
            {presetPrices?.map(p => (
              <button
                key={p}
                className={`co-price-btn ${activeItem?.price === p ? 'co-price-btn--selected' : ''}`}
                onClick={() => selectPrice(p?.price)}
              >
                {p?.price.toLocaleString()}
              </button>
            ))}
          </div>

          {showCustomInput ? (
            <div className="co-custom-row">
              <input
                className={`co-input co-input--center co-input--keypad ${keypadMode === 'price' ? 'co-input--keypad-open' : ''}`}
                readOnly
                placeholder="Enter amount"
                value={activeItem?.customPrice}
                onClick={openPriceKeypad}
              />
              <button className="co-btn co-btn--ghost co-btn--sm" onClick={() => { setShowCustomInput(false); closeKeypad(); }}>Cancel</button>
            </div>
          ) : (
            <button
              className={`co-custom-btn ${activeItem?.price > 5000 ? 'co-custom-btn--selected' : ''}`}
              onClick={() => { setShowCustomInput(true); setTimeout(openPriceKeypad, 50); }}
            >
              Custom (Above 5000 ب.د)
            </button>
          )}
        </div>

        <button className="co-preview-btn" onClick={() => setPreviewOpen(true)}>
          <FiEye size={18} />
          Preview Order
        </button>
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
              <div key={item?.id} className="op-item">
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
                {item?.images.length > 0 && (
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
          {createdOrder.length > 1 && (
            <div className="op-total">
              <span>Total</span>
              <span>{createdOrder.reduce((s, it) => s + (it.price || 0), 0).toLocaleString()} ب.د</span>
            </div>
          )}
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

      {/* Numeric keypad — custom price */}
      <NumericKeypad
        isOpen={keypadMode === 'price'}
        name="orderPrice"
        value={activeItem?.customPrice}
        onChange={val => updateActiveItem({ customPrice: val })}
        onConfirm={val => {
          const n = parseFloat(val);
          if (!isNaN(n) && n > 0) updateActiveItem({ price: n, customPrice: val });
        }}
        onClose={closeKeypad}
        label="Custom Price (ب.د)"
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
