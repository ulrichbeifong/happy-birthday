import Flame from "./Flame";
import SmokeEffect from "../effects/SmokeEffect";

export default function Candle({ index, isBlown }) {
  return (
    <div
      className={`candle ${isBlown ? "off" : ""}`}
      style={{
        "--delay": `${index * 0.12}s`,
        "--tilt": `${index % 2 === 0 ? -2 : 2}deg`
      }}
    >
      {!isBlown ? <Flame /> : <SmokeEffect />}
      <div className="wick" />
      <div className="candle-body">
        <span />
        <span />
      </div>
    </div>
  );
}
