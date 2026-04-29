import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCamera, FiRotateCcw, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import './CameraCapture.css';

/**
 * CameraCapture
 * Props:
 *   isOpen      boolean
 *   deviceId    string | null   — specific camera deviceId; null = default camera
 *   deviceLabel string          — shown in the header
 *   onCapture   ({ file, url }) => void
 *   onClose     () => void
 */
function CameraCapture({ isOpen, deviceId, deviceLabel = 'Camera', onCapture, onClose }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [captured,   setCaptured]   = useState(null); // { blob, url }
  const [camError,   setCamError]   = useState('');
  const [streaming,  setStreaming]  = useState(false);

  // Start / stop camera stream
  useEffect(() => {
    if (!isOpen) return;

    setCaptured(null);
    setCamError('');
    setStreaming(false);

    const constraints = {
      video: deviceId ? { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
                      : { width: { ideal: 1280 }, height: { ideal: 720 } },
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => setStreaming(true);
        }
      })
      .catch(err => {
        const msg =
          err.name === 'NotAllowedError'  ? 'Camera permission denied. Please allow camera access.' :
          err.name === 'NotFoundError'    ? 'No camera found on this device.' :
          err.name === 'NotReadableError' ? 'Camera is already in use by another application.' :
          'Unable to access camera.';
        setCamError(msg);
      });

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, [isOpen, deviceId]);

  // Capture frame from video
  const capture = () => {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob);
      setCaptured({ blob, url });
    }, 'image/jpeg', 0.92);
  };

  const retake = () => setCaptured(null);

  const usePhoto = () => {
    if (!captured) return;
    const file = new File([captured.blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
    onCapture({ file, url: captured.url });
    handleClose();
  };

  const handleClose = () => {
    setCaptured(null);
    setCamError('');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="cc-overlay" onClick={handleClose}>
      <div className="cc-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="cc-header">
          <FiCamera size={18} />
          <span>{deviceLabel}</span>
          <button className="cc-close" onClick={handleClose}><FiX size={18} /></button>
        </div>

        {/* Viewfinder */}
        <div className="cc-viewfinder">
          {camError ? (
            <div className="cc-error">
              <FiAlertCircle size={36} />
              <p>{camError}</p>
            </div>
          ) : (
            <>
              {/* Live video — hidden when captured */}
              <video
                ref={videoRef}
                className={`cc-video ${captured ? 'cc-video--hidden' : ''}`}
                autoPlay
                playsInline
                muted
              />
              {/* Captured preview */}
              {captured && (
                <img src={captured.url} alt="Captured" className="cc-preview" />
              )}
              {/* Loading overlay */}
              {!streaming && !camError && !captured && (
                <div className="cc-loading">
                  <div className="cc-spinner" />
                  <span>Starting camera…</span>
                </div>
              )}
              {/* Corner guides */}
              {!captured && (
                <>
                  <span className="cc-corner cc-corner--tl" />
                  <span className="cc-corner cc-corner--tr" />
                  <span className="cc-corner cc-corner--bl" />
                  <span className="cc-corner cc-corner--br" />
                </>
              )}
            </>
          )}
        </div>

        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {/* Actions */}
        {!camError && (
          <div className="cc-actions">
            {captured ? (
              <>
                <button className="cc-btn cc-btn--ghost" onClick={retake}>
                  <FiRotateCcw size={16} /> Retake
                </button>
                <button className="cc-btn cc-btn--primary" onClick={usePhoto}>
                  <FiCheck size={16} /> Use Photo
                </button>
              </>
            ) : (
              <button
                className="cc-shutter"
                onClick={capture}
                disabled={!streaming}
                title="Capture"
              >
                <span className="cc-shutter__ring" />
                <span className="cc-shutter__dot" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default CameraCapture;
