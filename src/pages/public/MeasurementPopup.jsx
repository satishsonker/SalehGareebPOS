import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiCheck, FiDownload, FiEye, FiImage, FiLoader, FiSave, FiUpload, FiX
} from 'react-icons/fi';
import { getOrderById, getCustomerMeasurements, updateItemMeasurement, uploadSubOrderImage } from '../../services/api/ordersApi';
import { getMasterDataByType } from '../../services/api/masterDataApi';
import { getWorkTypeDescriptions, getWorkTypes } from '../../services/api/workTypeApi';
import { apiRequest } from '../../utils/api';
import { apiBasePath } from '../../services/api/commonApi';
import './MeasurementPopup.css';

const measurementFields = [
  ['length', 'Length'], ['chest', 'Chest'], ['waist', 'Waist'], ['hip', 'Hips'],
  ['bottom', 'Bottom'], ['sleeve', 'Sleeve'], ['sleeveLoose', 'Sleeve Loose'], ['shoulder', 'Shoulder'],
  ['neck', 'Neck'], ['deep', 'Deep'], ['backDown', 'Back Down'], ['extra', 'Extra']
];

function unwrapData(response) {
  let value = response?.data ?? response;
  if (value?.data !== undefined) value = value.data;
  if (value?.data !== undefined && !Array.isArray(value)) value = value.data;
  return value;
}

function imageUrl(path) {
  if (!path) return '';
  return /^https?:\/\//i.test(path) ? path : `${apiBasePath}${path.startsWith('/') ? '' : '/'}${path}`;
}

function initialMeasurement(item) {
  const data = item?.measurement || {};
  return {
    ...data,
    description: item?.description || item?.note || data.description || '',
    customerRefName: data.customerRefName || '',
    shape: data.shape || '',
    modelNo: data.modelNo || '',
    modelImageUrl: data.modelImageUrl || '',
    notes: data.notes || '',
    workTypes: (item?.workTypes || []).map(workType => ({
      ...workType,
      workDescriptions: [...(workType.workDescriptions || [])]
    }))
  };
}

export default function MeasurementPopup({ order, onClose, onSaved }) {
  const [currentOrder, setCurrentOrder] = useState(order || null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [measurement, setMeasurement] = useState(() => initialMeasurement(order?.orderDetails?.[0]));
  const [history, setHistory] = useState([]);
  const [shapes, setShapes] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [models, setModels] = useState([]);
  const [workDescriptionList, setWorkDescriptionList] = useState([]);
  const [workTypeList, setWorkTypeList] = useState([]);
  const [imageType, setImageType] = useState('model');
  const [subOrderImages, setSubOrderImages] = useState([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState('');
  const [copyFromSubOrderId, setCopyFromSubOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomSource, setZoomSource] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const imageInput = useRef(null);

  const loadSubOrderImages = async itemId => {
    if (!itemId) { setSubOrderImages([]); return; }
    const results = await Promise.allSettled([
      apiRequest(`/media/module/suborder-${itemId}-unstitched`),
      apiRequest(`/media/module/suborder-${itemId}-stitched`)
    ]);
    setSubOrderImages(results.flatMap(result => result.status === 'fulfilled' ? (unwrapData(result.value) || []) : []));
  };

  useEffect(() => {
    if (!order?.id) return;
    let active = true;
    const loadOrder = async () => {
      setLoading(true);
      try {
        const response = await getOrderById(order.id);
        const detail = unwrapData(response) || order;
        if (!active) return;
        setCurrentOrder(detail);
        setSelectedIndex(0);
        setMeasurement(initialMeasurement(detail?.orderDetails?.[0]));
      } catch {
        if (active) {
          setCurrentOrder(order);
          setMeasurement(initialMeasurement(order?.orderDetails?.[0]));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    loadOrder();
    return () => { active = false; };
  }, [order]);

  useEffect(() => {
    if (!currentOrder?.customerId) return;
    let active = true;
    Promise.allSettled([
      getCustomerMeasurements(currentOrder.customerId),
      getMasterDataByType('shape'),
      getMasterDataByType('size'),
      apiRequest('/DesignModels?pageNo=1&pageSize=100'),
      getWorkTypeDescriptions(),
      getWorkTypes()
    ]).then(([historyResult, shapeResult, sizeResult, modelResult, descriptionsResult, workTypesResult]) => {
      if (!active) return;
      if (historyResult.status === 'fulfilled') setHistory(unwrapData(historyResult.value) || []);
      if (shapeResult.status === 'fulfilled') setShapes(unwrapData(shapeResult.value) || []);
      if (sizeResult.status === 'fulfilled') setSizes(unwrapData(sizeResult.value) || []);
      if (modelResult.status === 'fulfilled') setModels(unwrapData(modelResult.value) || []);
      if (descriptionsResult.status === 'fulfilled') setWorkDescriptionList(unwrapData(descriptionsResult.value) || []);
      if (workTypesResult.status === 'fulfilled') setWorkTypeList(unwrapData(workTypesResult.value) || []);
    });
    return () => { active = false; };
  }, [currentOrder?.customerId]);

  const subOrders = useMemo(() => currentOrder?.orderDetails || [], [currentOrder]);
  const savedSizes = useMemo(() => [...new Set(history.map(entry => entry.size).filter(Boolean))], [history]);
  const availableSizes = useMemo(() => [...new Set([
    ...sizes.map(size => size.value || size.displayValue || size.name).filter(Boolean),
    ...savedSizes
  ])], [sizes, savedSizes]);
  const selectedSubOrder = subOrders[selectedIndex] || null;

  useEffect(() => {
    setMeasurement(initialMeasurement(selectedSubOrder));
    setSelectedHistoryId('');
    setNotice('');
    setError('');
  }, [selectedIndex, selectedSubOrder, subOrders]);

  useEffect(() => { loadSubOrderImages(selectedSubOrder?.id); }, [selectedSubOrder]);

  const updateMeasurement = (field, value) => {
    setMeasurement(previous => ({ ...previous, [field]: value }));
  };

  const applyHistoryMeasurement = () => {
    const previousMeasurement = history.find(entry => String(entry.id) === String(selectedHistoryId));
    if (!previousMeasurement) return;
    setMeasurement(current => ({ ...current, ...previousMeasurement, notes: current.notes || previousMeasurement.notes || '' }));
    setNotice('Saved customer measurement loaded. Save to apply it to this suborder.');
    setError('');
  };

  const applySubOrderMeasurement = event => {
    const source = subOrders.find(item => String(item.id) === String(event.target.value));
    if (!source) return;
    setMeasurement(current => ({
      ...current,
      ...(source.measurement || {}),
      customerRefName: source.measurement?.customerRefName || source.measurementCustomerName || current.customerRefName,
      workTypes: (source.workTypes || []).map(workType => ({
        ...workType,
        workDescriptions: [...(workType.workDescriptions || [])]
      }))
    }));
    setNotice(`Measurement copied from ${source.orderNo || 'the selected suborder'}. Save to apply it.`);
    setError('');
  };

  const selectModel = modelId => {
    const model = models.find(entry => String(entry.id) === String(modelId));
    if (!model) return;
    const media = [...(model.medias || [])].sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))[0];
    setMeasurement(current => ({
      ...current,
      modelNo: model.code || model.name || '',
      modelImageUrl: media?.relativePath || current.modelImageUrl
    }));
  };

  const uploadImage = async file => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Choose an image file.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const response = await uploadSubOrderImage(selectedSubOrder.id, file, imageType);
      const uploaded = unwrapData(response);
      const uploadedPath = typeof uploaded === 'string' ? uploaded : uploaded?.relativePath;
      if (!uploadedPath) throw new Error('The image upload did not return a path.');
      if (imageType === 'model') updateMeasurement('modelImageUrl', uploadedPath);
      await loadSubOrderImages(selectedSubOrder.id);
      setNotice(`${imageType === 'model' ? 'Model reference' : imageType === 'unstitched' ? 'Unstitched' : 'Stitched'} image uploaded.`);
    } catch (uploadError) {
      setError(uploadError.message || 'Could not upload the reference image.');
    } finally {
      setUploading(false);
      if (imageInput.current) imageInput.current.value = '';
    }
  };

  const toggleWorkDescription = (workTypeId, description) => {
    setMeasurement(current => ({
      ...current,
      workTypes: (current.workTypes || []).map(workType => {
        if (String(workType.workTypeId ?? workType.id) !== String(workTypeId)) return workType;
        const descriptions = workType.workDescriptions || [];
        const exists = descriptions.some(item => String(item.id) === String(description.id));
        return {
          ...workType,
          workDescriptions: exists
            ? descriptions.filter(item => String(item.id) !== String(description.id))
            : [...descriptions, description]
        };
      })
    }));
  };

  const toggleWorkType = workType => {
    const id = workType.id ?? workType.workTypeId;
    const existing = (measurement.workTypes || []).find(item => String(item.workTypeId ?? item.id) === String(id));
    if (existing?.isSaved) {
      setError('A completed work type cannot be removed.');
      return;
    }
    setError('');
    setMeasurement(current => {
      const next = existing
        ? (current.workTypes || []).filter(item => String(item.workTypeId ?? item.id) !== String(id))
        : [...(current.workTypes || []), {
          ...workType,
          workTypeId: id,
          workDescriptions: workDescriptionList
            .filter(description => description.isDefault === true && String(description.workTypeCode) === String(workType.code))
            .map(description => ({ id: description.id, name: description.name, orderWorkTypeId: id }))
        }];
      return { ...current, workTypes: next };
    });
  };

  const handleSave = async () => {
    if (!currentOrder || !selectedSubOrder?.id) return;
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await updateItemMeasurement(selectedSubOrder.id, measurement);
      const response = await getOrderById(currentOrder.id);
      const savedOrder = unwrapData(response) || currentOrder;
      setCurrentOrder(savedOrder);
      setMeasurement(initialMeasurement(savedOrder.orderDetails?.[selectedIndex]));
      onSaved?.(savedOrder);
      setNotice('Measurement saved successfully.');
    } catch (saveError) {
      setError(saveError.message || 'Could not save this measurement.');
    } finally {
      setSaving(false);
    }
  };

  if (!currentOrder) return null;
  const imageSrc = imageUrl(measurement.modelImageUrl);

  return (
    <div className="measurement-popup so-modal__content">
      <div className="measurement-popup__toolbar">
        <div className="measurement-popup__order-ref">
          <span>Suborder</span>
          <strong>{selectedSubOrder?.orderNo || `Item ${selectedIndex + 1}`}</strong>
          <span className="measurement-popup__divider" />
          <span>Quantity</span><strong>{selectedSubOrder?.quantity || 1}</strong>
          {selectedSubOrder?.grade && <><span className="measurement-popup__divider" /><span>Grade</span><strong>{selectedSubOrder.grade}</strong></>}
        </div>
        <div className="measurement-popup__tools">
          <label className="measurement-popup__select-wrap"><span>Already Used Model</span>
            <select defaultValue="" onChange={event => selectModel(event.target.value)}>
              <option value="">Select model</option>
              {models.map(model => <option key={model.id} value={model.id}>{model.code} · {model.name}</option>)}
            </select>
          </label>
          <label className="measurement-popup__select-wrap"><span>Pre Measurement</span>
            <select value={selectedHistoryId} onChange={event => setSelectedHistoryId(event.target.value)}>
              <option value="">Select saved measurement</option>
              {history.map((entry, index) => <option key={entry.id || index} value={entry.id}>{entry.customerRefName || entry.size || `Measurement ${index + 1}`}</option>)}
            </select>
          </label>
          <button className="measurement-popup__get-button" type="button" onClick={applyHistoryMeasurement} disabled={!selectedHistoryId}>
            <FiDownload /> Get Measurement
          </button>
          <label className="measurement-popup__select-wrap"><span>Copy from this order</span>
            <select value={copyFromSubOrderId} onChange={event => { setCopyFromSubOrderId(event.target.value); applySubOrderMeasurement(event); }}>
              <option value="">Select another suborder</option>
              {subOrders.filter(item => String(item.id) !== String(selectedSubOrder?.id)).map(item => <option key={item.id} value={item.id}>{item.orderNo}</option>)}
            </select>
          </label>
        </div>
      </div>

      {subOrders.length > 1 && <div className="measurement-popup__suborders" role="tablist" aria-label="Order suborders">
        {subOrders.map((item, index) => <button key={item.id || index} type="button" role="tab" aria-selected={index === selectedIndex} className={index === selectedIndex ? 'is-active' : ''} onClick={() => setSelectedIndex(index)}>
          {item.orderNo || `Suborder ${index + 1}`}
        </button>)}
      </div>}

      {loading ? <div className="measurement-popup__loading"><FiLoader className="so-button-spinner" /> Loading measurement…</div> : selectedSubOrder ? <>
        <div className="measurement-popup__main">
          <div className="measurement-popup__fields">
            {measurementFields.map(([field, label]) => <label className="measurement-popup__field" key={field}>
              <span>{label}</span>
              <input type="text" inputMode="decimal" value={measurement[field] ?? ''} onChange={event => updateMeasurement(field, event.target.value)} />
            </label>)}
            <label className="measurement-popup__field measurement-popup__field--size">
              <span>Size</span><input type="text" value={measurement.size ?? ''} onChange={event => updateMeasurement('size', event.target.value)} />
            </label>
            <label className="measurement-popup__field measurement-popup__field--description">
              <span>Description</span><textarea rows="1" value={measurement.description ?? ''} onChange={event => updateMeasurement('description', event.target.value)} />
            </label>
            <label className="measurement-popup__field measurement-popup__field--customer-ref">
              <span>Customer Name</span><input type="text" value={measurement.customerRefName ?? ''} onChange={event => updateMeasurement('customerRefName', event.target.value)} />
            </label>
            <label className="measurement-popup__field measurement-popup__field--model-no">
              <span>Model No</span><input type="text" value={measurement.modelNo ?? ''} onChange={event => updateMeasurement('modelNo', event.target.value)} />
            </label>
          </div>

          <div className="measurement-popup__reference">
            <span className="measurement-popup__hint">Click image to zoom</span>
            <button className={`measurement-popup__image ${imageSrc ? 'has-image' : ''}`} type="button" onClick={() => { if (imageSrc) { setZoomSource(imageSrc); setZoomOpen(true); } }} aria-label={imageSrc ? 'Zoom reference image' : 'No reference image selected'}>
              {imageSrc ? <img src={imageSrc} alt="Measurement model reference" /> : <span><FiImage /><small>Model reference image</small></span>}
            </button>
            <div className="measurement-popup__image-actions">
              <input ref={imageInput} type="file" accept="image/*" hidden onChange={event => uploadImage(event.target.files?.[0])} />
              <select aria-label="Image type" value={imageType} onChange={event => setImageType(event.target.value)}>
                <option value="model">Model reference</option><option value="unstitched">Unstitched</option><option value="stitched">Stitched</option>
              </select>
              <button type="button" onClick={() => imageInput.current?.click()} disabled={uploading}>{uploading ? <FiLoader className="so-button-spinner" /> : <FiUpload />} {uploading ? 'Uploading…' : 'Upload image'}</button>
              {imageSrc && <a href={imageSrc} download target="_blank" rel="noreferrer" aria-label="Open reference image"><FiEye /></a>}
            </div>
            {subOrderImages.length > 0 && <div className="measurement-popup__gallery" aria-label="Suborder images">
              {subOrderImages.map(image => <button type="button" key={image.id} onClick={() => { setZoomSource(imageUrl(image.relativePath)); setZoomOpen(true); }} title={image.originalName}>
                <img src={imageUrl(image.thumbRelativePath || image.relativePath)} alt={image.altText || image.originalName || 'Suborder image'} />
                <small>{image.module?.split('-').pop() || 'Image'}</small>
              </button>)}
            </div>}
          </div>
        </div>

        <div className="measurement-popup__options">
          <label className="measurement-popup__field"><span>Shape</span>
            <select value={measurement.shape ?? ''} onChange={event => updateMeasurement('shape', event.target.value)}>
              <option value="">Select shape</option>
              {shapes.map((shape, index) => <option key={shape.id || index} value={shape.code || shape.displayValue}>{shape.displayValue || shape.name || shape.code}</option>)}
            </select>
          </label>
          <label className="measurement-popup__field"><span>Saved Size</span>
            <select value={savedSizes.includes(measurement.size) ? measurement.size : ''} onChange={event => event.target.value && updateMeasurement('size', event.target.value)}>
              <option value="">Choose a saved size</option>
              {availableSizes.map(size => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
        </div>

        <div className="measurement-popup__worktypes">
          <div className="measurement-popup__worktype-choices" aria-label="Assigned work types">
            {workTypeList.filter(item => String(item.code) !== '0').map((workType, index) => {
              const id = workType.id ?? workType.workTypeId;
              const selected = (measurement.workTypes || []).some(item => String(item.workTypeId ?? item.id) === String(id));
              return <button type="button" key={id || index} className={selected ? 'is-selected' : ''} aria-pressed={selected} onClick={() => toggleWorkType(workType)}>{workType.name || workType.code}</button>;
            })}
          </div>
          {(measurement.workTypes || selectedSubOrder.workTypes || []).map((workType, index) => <section className="measurement-popup__work-card" key={workType.workTypeId || workType.id || index}>
            <h3><FiCheck /> {workType.name || workType.code || 'Work type'}</h3>
            <div className="measurement-popup__chips">{workDescriptionList.filter(description => String(description.workTypeCode) === String(workType.code)).map((description, descriptionIndex) => {
              const selected = (workType.workDescriptions || []).some(item => String(item.id) === String(description.id));
              return <button type="button" key={description.id || descriptionIndex} className={selected ? 'is-selected' : ''} aria-pressed={selected} onClick={() => toggleWorkDescription(workType.workTypeId || workType.id, description)}>{description.name}</button>;
            })}</div>
          </section>)}
          {!selectedSubOrder.workTypes?.length && <div className="measurement-popup__empty">No work types assigned to this suborder.</div>}
        </div>
      </> : <div className="measurement-popup__empty">No suborders found.</div>}

      {(error || notice) && <div className={`measurement-popup__message ${error ? 'is-error' : 'is-success'}`} role={error ? 'alert' : 'status'}>{error || notice}</div>}
      <div className="measurement-popup__footer">
        <span>Order #{currentOrder.orderNo || currentOrder.id}</span>
        <div><button className="measurement-popup__close" type="button" onClick={onClose} disabled={saving}>Close</button>
          <button className="measurement-popup__save" type="button" onClick={handleSave} disabled={saving || loading || uploading || !selectedSubOrder}>
            {saving ? <FiLoader className="so-button-spinner" /> : <FiSave />} {saving ? 'Saving…' : 'Save Measurement'}
          </button>
        </div>
      </div>

      {zoomOpen && <button className="measurement-popup__zoom" type="button" onClick={() => setZoomOpen(false)} aria-label="Close image zoom"><span><FiX /></span><img src={zoomSource || imageSrc} alt="Zoomed measurement reference" /></button>}
    </div>
  );
}
