import { Music2, Pause } from "lucide-react";
import Button from "../ui/Button";
import useAudioPlayer from "../../hooks/useAudioPlayer";

export default function AudioControls() {
  const { isPlaying, audioError, toggle } = useAudioPlayer("/audio/birthday-song.mp3");

  return (
    <div className="audio-control">
      <Button variant="secondary" size="small" onClick={toggle}>
        {isPlaying ? <Pause size={16} /> : <Music2 size={16} />}
        {isPlaying ? "Tắt nhạc" : "Bật nhạc"}
      </Button>

      {audioError && <span>{audioError}</span>}
    </div>
  );
}
