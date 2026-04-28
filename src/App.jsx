import { useEffect, useState } from "react";
import { Camera, Cake, PartyPopper, Sparkles } from "lucide-react";

import { birthdayConfig } from "./config/birthdayConfig";

import MainLayout from "./components/layout/MainLayout";
import Header from "./components/layout/Header";
import Button from "./components/ui/Button";

import CameraPreview from "./components/camera/CameraPreview";
import PhotoCapture from "./components/camera/PhotoCapture";

import BirthdayCake from "./components/cake/BirthdayCake";

import ConfettiEffect from "./components/effects/ConfettiEffect";
import FireworksCanvas from "./components/effects/FireworksCanvas";
import FloatingBalloons from "./components/effects/FloatingBalloons";

import TypingGreeting from "./components/greeting/TypingGreeting";
import BirthdayCard from "./components/greeting/BirthdayCard";

import MemoryGallery from "./components/gallery/MemoryGallery";
import WishWall from "./components/wish/WishWall";
import GiftCatcherGame from "./components/game/GiftCatcherGame";
import AudioControls from "./components/audio/AudioControls";

import useCamera from "./hooks/useCamera";
import useBlowDetection from "./hooks/useBlowDetection";

export default function App() {
  const [isSessionStarted, setIsSessionStarted] = useState(false);
  const [isBlown, setIsBlown] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [message, setMessage] = useState("Bấm bắt đầu rồi thổi vào micro để tắt nến nhé!");
  const [theme, setTheme] = useState("dark");

  const {
    videoRef,
    isCameraOn,
    cameraError,
    startCamera,
    stopCamera
  } = useCamera();

  const {
    isListening,
    volume,
    blowError,
    startListening,
    stopListening
  } = useBlowDetection({
    threshold: birthdayConfig.blowThreshold,
    holdMs: birthdayConfig.blowHoldMs,
    onBlow: handleBlowSuccess
  });

  async function handleStartBlowing() {
    try {
      setIsSessionStarted(true);
      setMessage("Camera và micro đang bật. Bạn hãy thổi một hơi thật mạnh nha!");
      await startCamera();
      await startListening();
    } catch (error) {
      setMessage("Không thể bật camera hoặc micro. Hãy kiểm tra quyền truy cập của trình duyệt.");
      console.error(error);
    }
  }

  function handleBlowSuccess() {
    if (isBlown) return;

    setIsBlown(true);
    setShowCelebration(true);
    setMessage("Tuyệt vời! Nến đã tắt hết rồi 🎉");

    stopListening();
    stopCamera();

    window.setTimeout(() => {
      setShowCelebration(false);
    }, 5000);
  }

  function handleReset() {
    setIsBlown(false);
    setShowCelebration(false);
    setIsSessionStarted(false);
    setMessage("Bấm bắt đầu rồi thổi vào micro để tắt nến nhé!");
    stopListening();
    stopCamera();
  }

  useEffect(() => {
    return () => {
      stopListening();
      stopCamera();
    };
  }, []);

  const progressPercent = Math.min(100, Math.round(volume * 100));

  return (
    <MainLayout theme={theme}>
      <FloatingBalloons />
      <FireworksCanvas active={isBlown} />
      <ConfettiEffect fire={showCelebration} />

      <Header
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
      />

      <AudioControls />

      <CameraPreview
        videoRef={videoRef}
        isCameraOn={isCameraOn}
        error={cameraError}
      />

      <main className="hero-section">
        <section className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={18} />
            Birthday Interactive Web
          </p>

          <TypingGreeting
            text={`${birthdayConfig.greeting} ${birthdayConfig.recipientName}!`}
          />

          <p className="hero-description">
            {birthdayConfig.shortWish}
          </p>

          <div className="status-card">
            <div className="status-line">
              <span>Trạng thái:</span>
              <strong>{isBlown ? "Đã tắt nến" : isListening ? "Đang nghe tiếng thổi" : "Chưa bắt đầu"}</strong>
            </div>

            <div className="volume-meter" aria-label="Độ mạnh âm thanh micro">
              <div style={{ width: `${progressPercent}%` }} />
            </div>

            <p className="status-message">{message}</p>

            {(cameraError || blowError) && (
              <p className="error-message">
                {cameraError || blowError}
              </p>
            )}
          </div>

          <div className="hero-actions">
            {!isBlown ? (
              <Button onClick={handleStartBlowing} disabled={isListening}>
                <Camera size={18} />
                {isListening ? "Đang chờ bạn thổi..." : "Bắt đầu thổi"}
              </Button>
            ) : (
              <Button onClick={handleReset} variant="secondary">
                <Cake size={18} />
                Thử lại
              </Button>
            )}

            <a className="ghost-link" href="#photo-mode">
              <PartyPopper size={18} />
              Chụp ảnh kỷ niệm
            </a>
          </div>
        </section>

        <section className="cake-stage" aria-label="Bánh sinh nhật">
          <BirthdayCake
            candleCount={birthdayConfig.candleCount}
            isBlown={isBlown}
            layers={birthdayConfig.cakeLayers}
          />
        </section>
      </main>

      {isBlown && (
        <section className="after-party">
          <BirthdayCard />
          <PhotoCapture id="photo-mode" />
          <MemoryGallery />
          <WishWall />
          <GiftCatcherGame />
        </section>
      )}

      {!isBlown && (
        <section className="locked-preview">
          <h2>Phần bất ngờ đang chờ phía sau 🎁</h2>
          <p>Hãy thổi tắt nến để mở thiệp, gallery, quiz và chế độ chụp ảnh kỷ niệm.</p>
        </section>
      )}
    </MainLayout>
  );
}
