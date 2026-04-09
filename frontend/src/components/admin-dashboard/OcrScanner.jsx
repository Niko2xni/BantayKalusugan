import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, FileImage } from "lucide-react";

/**
 * Reusable OCR scanner component.
 *
 * Provides two input modes:
 *   1. File upload (drag-and-drop or click to browse)
 *   2. Live camera capture via WebRTC
 *
 * Props:
 *   - onScanComplete(result) — called with { extractedData, imageUrl, rawText }
 *   - scanEndpoint — e.g. "/api/admin/ocr/scan-vitals"
 *   - apiBaseUrl — base URL of the backend
 *   - buttonLabel — text shown on the trigger button
 */
export default function OcrScanner({
  onScanComplete,
  scanEndpoint,
  apiBaseUrl = "http://localhost:8000",
  buttonLabel = "Scan Document",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ── Upload via file picker / drag-drop ──
  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("File too large. Maximum 10 MB.");
      return;
    }

    setPreview(URL.createObjectURL(file));
    setError("");
    await submitImage(file);
  }, []);

  // ── Camera helpers ──
  const startCamera = useCallback(async () => {
    setError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setError("Camera access denied. Please allow camera permissions or use file upload instead.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      setPreview(canvas.toDataURL("image/jpeg"));
      stopCamera();
      await submitImage(file);
    }, "image/jpeg", 0.9);
  }, [stopCamera]);

  // ── Submit image to backend ──
  const submitImage = async (file) => {
    setIsScanning(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${apiBaseUrl}${scanEndpoint}`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server error ${res.status}`);
      }

      const result = await res.json();
      onScanComplete(result);
      setIsOpen(false);
      setPreview(null);
    } catch (err) {
      setError(err.message || "Scan failed. Please try again or enter data manually.");
    } finally {
      setIsScanning(false);
    }
  };

  // ── Drag-and-drop ──
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  };

  // ── Close / cleanup ──
  const handleClose = () => {
    stopCamera();
    setIsOpen(false);
    setPreview(null);
    setError("");
    setIsScanning(false);
  };

  // ── Trigger button ──
  if (!isOpen) {
    return (
      <button
        type="button"
        className="ocr-trigger-btn"
        onClick={() => setIsOpen(true)}
      >
        <Camera size={16} />
        {buttonLabel}
      </button>
    );
  }

  // ── Scanner panel ──
  return (
    <div className="ocr-panel">
      <div className="ocr-panel-header">
        <h4 className="ocr-panel-title">
          <FileImage size={16} />
          Document Scanner
        </h4>
        <button className="modal-close-btn" onClick={handleClose} type="button">
          <X size={16} />
        </button>
      </div>

      {error && <p className="ocr-error">{error}</p>}

      {isScanning ? (
        <div className="ocr-scanning">
          <Loader2 size={32} className="ocr-spinner" />
          <p>Analyzing document...</p>
          <p className="ocr-scanning-sub">Uploading & extracting text via Azure AI</p>
        </div>
      ) : cameraActive ? (
        <div className="ocr-camera-view">
          <video ref={videoRef} autoPlay playsInline muted className="ocr-video" />
          <canvas ref={canvasRef} style={{ display: "none" }} />
          <div className="ocr-camera-actions">
            <button type="button" className="btn-save" onClick={capturePhoto}>
              <Camera size={16} /> Capture
            </button>
            <button type="button" className="btn-cancel" onClick={stopCamera}>
              Cancel
            </button>
          </div>
        </div>
      ) : preview ? (
        <div className="ocr-preview">
          <img src={preview} alt="Document preview" className="ocr-preview-img" />
        </div>
      ) : (
        <div className="ocr-input-area">
          <div
            className="ocr-dropzone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload size={28} />
            <p>Drag & drop an image here or click to browse</p>
            <span className="ocr-dropzone-hint">Supports JPG, PNG, WebP • Max 10 MB</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          <div className="ocr-divider">
            <span>or</span>
          </div>

          <button type="button" className="ocr-camera-btn" onClick={startCamera}>
            <Camera size={18} />
            Use Camera / Webcam
          </button>
        </div>
      )}
    </div>
  );
}
