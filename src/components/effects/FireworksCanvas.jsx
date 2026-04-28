import { useEffect, useRef } from "react";
import random from "../../utils/random";

export default function FireworksCanvas({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let particles = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createFirework() {
      const x = random(100, canvas.width - 100);
      const y = random(70, canvas.height * 0.5);
      const count = 70;

      for (let i = 0; i < count; i += 1) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = random(1.5, 5);

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: random(45, 80),
          size: random(1.5, 3)
        });
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles = particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.035,
          life: p.life - 1
        }))
        .filter((p) => p.life > 0);

      particles.forEach((p) => {
        ctx.globalAlpha = Math.max(0, p.life / 80);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
      });

      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(animate);
    }

    resize();
    window.addEventListener("resize", resize);

    const fireworkTimer = window.setInterval(createFirework, 600);
    createFirework();
    animate();

    return () => {
      cancelAnimationFrame(raf);
      clearInterval(fireworkTimer);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />;
}
