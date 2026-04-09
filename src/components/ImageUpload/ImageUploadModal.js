import React, { useState, useRef } from 'react';
import { FiUpload, FiTrash2, FiCamera, FiX, FiImage } from 'react-icons/fi';
import Modal from '../Modal/Modal';
import Button from '../Button/Button';
import './ImageUploadModal.css';

const API_BASE = process.env.REACT_APP_API_URL || 'https://localhost:7194';

/**
 * ImageUploadModal
 *
 * Props:
 *   isOpen         boolean
 *   onClose        () => void
 *   title          string
 *   currentImagePath  string|null  — relative path returned by API (e.g. "profiles/abc.jpg")
 *   onUpload       (file: File) => Promise<void>
 *   onDelete       () => Promise<void>
 *   uploading      boolean
 *   deleting       boolean
 *   acceptTypes    string  — e.g. "image/jpeg,image/png,image/webp"  (default: all images)
 *   maxSizeMB      number  — default 5
 */
function ImageUploadModal({
  isOpen,
  onClose,
  title = 'Change Image',
  currentImagePath = null,
  onUpload,
  onDelete,
  uploading = false,
  deleting = false,
  acceptTypes = 'image/jpeg,image/png,image/webp,image/gif',
  maxSizeMB = 5,
}) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [sizeError, setSizeError] = useState('');
  const fileInputRef = useRef(null);

  const currentUrl = currentImagePath
    ? `${API_BASE}/${currentImagePath}`
    : null;

  const displayUrl = previewUrl || currentUrl;
  const busy = uploading || deleting;

  const handleFileSelect = (file) => {
    if (!file) return;
    setSizeError('');
    if (file.size > maxSizeMB * 1024 * 1024) {
      setSizeError(`File is too large. Maximum size is ${maxSizeMB} MB.`);
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e) => {
    handleFileSelect(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return;
    await onUpload(selectedFile);
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    await onDelete();
    setPreviewUrl(null);
    setSelectedFile(null);
  };

  const handleClose = () => {
    if (busy) return;
    setPreviewUrl(null);
    setSelectedFile(null);
    setSizeError('');
    onClose();
  };

  const cancelPreview = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setSizeError('');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="small"
      type="default"
      showCloseButton={true}
      closeOnOverlayClick={!busy}
    >
      <div className="iup-body">
        {/* Current / preview image */}
        <div
          className={`iup-drop-zone ${dragOver ? 'drag-over' : ''} ${displayUrl ? 'has-image' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !busy && fileInputRef.current?.click()}
        >
          {displayUrl ? (
            <>
              <img src={displayUrl} alt="Preview" className="iup-preview-img" />
              {previewUrl && (
                <div className="iup-new-badge">New</div>
              )}
              <div className="iup-overlay">
                <FiCamera />
                <span>Click or drag to change</span>
              </div>
            </>
          ) : (
            <div className="iup-placeholder">
              <FiImage size={40} />
              <span>Click or drag an image here</span>
              <small>JPG, PNG, WEBP up to {maxSizeMB} MB</small>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleInputChange}
            style={{ display: 'none' }}
          />
        </div>

        {sizeError && <p className="iup-error">{sizeError}</p>}

        {/* Actions */}
        <div className="iup-actions">
          {selectedFile ? (
            <>
              <Button
                variant="secondary"
                icon={<FiX />}
                onClick={cancelPreview}
                disabled={busy}
                size="small"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                icon={<FiUpload />}
                onClick={handleUpload}
                disabled={busy}
                loading={uploading}
                size="small"
              >
                Upload
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                icon={<FiUpload />}
                onClick={() => fileInputRef.current?.click()}
                disabled={busy}
                size="small"
              >
                {currentUrl ? 'Change Image' : 'Upload Image'}
              </Button>
              {currentUrl && onDelete && (
                <Button
                  variant="danger"
                  icon={<FiTrash2 />}
                  onClick={handleDelete}
                  disabled={busy}
                  loading={deleting}
                  size="small"
                >
                  Delete Image
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ImageUploadModal;
