import { useRef, useState } from "react";
import { Camera, Download, RefreshCcw, VideoOff } from "lucide-react";

import Button from "../ui/Button";
import useCamera from "../../hooks/useCamera";
import { birthdayConfig } from "../../config/birthdayConfig";
import captureElement from "../../utils/captureElement";
import downloadImage from "../../utils/downloadImage";

export default function PhotoCapture({ id }) {
  const cardRef = useRef(null);
  const canvasRef = useRef(null);
  const [snapshot, setSnapshot] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const {
    videoRef,
    isCameraOn,
    cameraError,
    startCamera,
    stopCamera
  } = useCamera();

  function captureFromCamera() {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    setSnapshot(dataUrl);
    stopCamera();
  }

  async function handleStartCamera() {
    setSnapshot("");
    await startCamera();
  }

  function handleRetake() {
    setSnapshot("");
    startCamera();
  }

  async function saveCard() {
    if (!cardRef.current) return;

    setIsSaving(true);

    try {
      const dataUrl = await captureElement(cardRef.current);
      downloadImage(dataUrl, `birthday-card-${birthdayConfig.recipientName}.png`);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="section-card photo-section" id={id}>
      <div className="section-heading">
        <div>
          <h2>Chụp ảnh kỷ niệm</h2>
          <p>Web sẽ ghép ảnh của bạn vào một chiếc thiệp sinh nhật rồi tải về máy.</p>
        </div>
      </div>

      <div className="photo-grid">
        <div className="photo-controls">
          <div className="photo-camera-box">
            <video
              ref={videoRef}
              className={`photo-video ${isCameraOn ? "is-visible" : "is-hidden"}`}
              muted
              playsInline
              autoPlay
            />

            {!isCameraOn && snapshot && (
              <img className="photo-video is-visible" src={snapshot} alt="Ảnh đã chụp" />
            )}

            {!isCameraOn && !snapshot && (
              <div className="photo-placeholder">
                <Camera size={40} />
                <p>Bấm bật camera để xem live preview và chụp ảnh kỷ niệm.</p>
              </div>
            )}
          </div>

          {cameraError && <p className="error-message">{cameraError}</p>}

          <div className="hero-actions">
            {!isCameraOn && !snapshot && (
              <Button onClick={handleStartCamera}>
                <Camera size={18} />
                Bật camera
              </Button>
            )}

            {isCameraOn && (
              <>
                <Button onClick={captureFromCamera}>
                  <Camera size={18} />
                  Chụp ảnh
                </Button>

                <Button variant="secondary" onClick={stopCamera}>
                  <VideoOff size={18} />
                  Tắt camera
                </Button>
              </>
            )}

            {snapshot && !isCameraOn && (
              <Button variant="secondary" onClick={handleRetake}>
                <RefreshCcw size={18} />
                Chụp lại
              </Button>
            )}
          </div>
        </div>

        <div className="photo-card-area">
          <div className="download-card" ref={cardRef}>
            <div className="download-card-bg">
              <span className="decor decor-1">🎈</span>
              <span className="decor decor-2">✨</span>
              <span className="decor decor-3">🎂</span>
              <span className="decor decor-4">🎁</span>

              <div className="download-photo-frame">
                {snapshot ? (
                  <img src={snapshot} alt="Khoảnh khắc sinh nhật" />
                ) : (
                  <div className="download-photo-empty">
                    Ảnh của bạn sẽ hiện ở đây
                  </div>
                )}
              </div>

              <h3>{birthdayConfig.photoCaption}</h3>
              <h2>Happy Birthday {birthdayConfig.recipientName}</h2>
              <p>{birthdayConfig.cardMessage}</p>
            </div>
          </div>

          <Button onClick={saveCard} disabled={!snapshot || isSaving}>
            <Download size={18} />
            {isSaving ? "Đang lưu..." : "Lưu ảnh về máy"}
          </Button>
        </div>
      </div>

      <canvas ref={canvasRef} hidden />
    </section>
  );
}
