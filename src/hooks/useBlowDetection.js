import { useCallback, useRef, useState } from "react";

export default function useBlowDetection({
  threshold = 0.18,
  holdMs = 450,
  onBlow
} = {}) {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [blowError, setBlowError] = useState("");

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const startedAtRef = useRef(0);
  const hasTriggeredRef = useRef(false);

  const stopListening = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }

    audioContextRef.current = null;
    analyserRef.current = null;
    startedAtRef.current = 0;
    hasTriggeredRef.current = false;
    setIsListening(false);
    setVolume(0);
  }, []);

  const analyze = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const buffer = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(buffer);

    let sum = 0;
    for (let i = 0; i < buffer.length; i += 1) {
      const value = (buffer[i] - 128) / 128;
      sum += value * value;
    }

    const rms = Math.sqrt(sum / buffer.length);
    const boosted = Math.min(1, rms * 9);
    setVolume(boosted);

    const now = performance.now();

    if (boosted >= threshold) {
      if (!startedAtRef.current) {
        startedAtRef.current = now;
      }

      if (!hasTriggeredRef.current && now - startedAtRef.current >= holdMs) {
        hasTriggeredRef.current = true;
        onBlow?.();
        return;
      }
    } else {
      startedAtRef.current = 0;
    }

    rafRef.current = requestAnimationFrame(analyze);
  }, [holdMs, onBlow, threshold]);

  const startListening = useCallback(async () => {
    setBlowError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      const msg = "Trình duyệt không hỗ trợ micro.";
      setBlowError(msg);
      throw new Error(msg);
    }

    stopListening();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        video: false
      });

      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.35;

      source.connect(analyser);

      streamRef.current = stream;
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      setIsListening(true);
      rafRef.current = requestAnimationFrame(analyze);
    } catch (error) {
      const msg = "Không thể mở micro. Hãy cấp quyền micro cho trình duyệt.";
      setBlowError(msg);
      throw error;
    }
  }, [analyze, stopListening]);

  return {
    isListening,
    volume,
    blowError,
    startListening,
    stopListening
  };
}
