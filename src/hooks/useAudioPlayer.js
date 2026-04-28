import { useEffect, useRef, useState } from "react";

export default function useAudioPlayer(src, { loop = true, volume = 0.45 } = {}) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioError, setAudioError] = useState("");

  useEffect(() => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = volume;
    audioRef.current = audio;

    audio.addEventListener("error", () => {
      setAudioError("Chưa có file nhạc hoặc file nhạc không phát được.");
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [loop, src, volume]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    setAudioError("");

    try {
      if (audio.paused) {
        await audio.play();
        setIsPlaying(true);
      } else {
        audio.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      setAudioError("Trình duyệt chặn phát nhạc. Hãy bấm lại sau khi tương tác với trang.");
      setIsPlaying(false);
    }
  }

  return {
    isPlaying,
    audioError,
    toggle
  };
}
