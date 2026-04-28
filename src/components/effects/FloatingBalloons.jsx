const balloons = ["🎈", "🎂", "✨", "🎁", "💖", "⭐", "🎉", "🧁"];

export default function FloatingBalloons() {
  return (
    <div className="floating-balloons" aria-hidden="true">
      {balloons.map((item, index) => (
        <span
          key={`${item}-${index}`}
          style={{
            "--x": `${8 + index * 12}%`,
            "--duration": `${10 + index * 1.2}s`,
            "--delay": `${index * -1.4}s`
          }}
        >
          {item}
        </span>
      ))}
    </div>
  );
}
