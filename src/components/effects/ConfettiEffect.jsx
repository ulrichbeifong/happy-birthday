import { useEffect } from "react";
import confetti from "canvas-confetti";

export default function ConfettiEffect({ fire }) {
  useEffect(() => {
    if (!fire) return;

    const duration = 2400;
    const end = Date.now() + duration;

    const timer = window.setInterval(() => {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { x: Math.random() * 0.35 + 0.1, y: Math.random() * 0.2 + 0.15 }
      });

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { x: Math.random() * 0.35 + 0.55, y: Math.random() * 0.2 + 0.15 }
      });

      if (Date.now() > end) {
        window.clearInterval(timer);
      }
    }, 260);

    return () => window.clearInterval(timer);
  }, [fire]);

  return null;
}
