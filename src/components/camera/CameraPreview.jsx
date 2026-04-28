export default function CameraPreview({ videoRef, isCameraOn, error }) {
  return (
    <aside className={`camera-preview ${isCameraOn ? "show" : ""}`}>
      <div className="camera-frame">
        <video
          ref={videoRef}
          className="camera-video"
          muted
          playsInline
          autoPlay
        />
        <div className="camera-label">
          {isCameraOn ? "Camera đang bật" : "Camera"}
        </div>
      </div>

      {error && <p className="camera-error">{error}</p>}
    </aside>
  );
}
