import Candle from "./Candle";

export default function BirthdayCake({ candleCount = 8, isBlown = false, layers = 3 }) {
  const candles = Array.from({ length: candleCount }, (_, index) => index);

  return (
    <div className="cake-wrap">
      <div className="sparkle-ring" />

      <div className="candles-row" style={{ "--count": candleCount }}>
        {candles.map((item) => (
          <Candle key={item} index={item} isBlown={isBlown} />
        ))}
      </div>

      <div className="cake">
        {Array.from({ length: layers }, (_, index) => (
          <div
            key={index}
            className={`cake-layer layer-${index + 1}`}
            style={{
              "--layer-index": index
            }}
          >
            <div className="icing" />
            <div className="sprinkles">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        ))}

        <div className="cake-plate" />
      </div>
    </div>
  );
}
