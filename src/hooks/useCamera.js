import { useCallback, useRef, useState } from "react";

export default function useCamera() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraOn(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = "Trình duyệt không hỗ trợ camera.";
      setCameraError(msg);
      throw new Error(msg);
    }

    stopCamera();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCameraOn(true);
      return stream;
    } catch (error) {
      const msg = "Không thể mở camera. Hãy cấp quyền camera cho trình duyệt.";
      setCameraError(msg);
      throw error;
    }
  }, [stopCamera]);

  return {
    videoRef,
    isCameraOn,
    cameraError,
    startCamera,
    stopCamera
  };
}
