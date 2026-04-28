import { birthdayConfig } from "../../config/birthdayConfig";

export default function BirthdayCard() {
  return (
    <section className="section-card birthday-card-section">
      <div className="section-heading">
        <div>
          <h2>Thiệp sinh nhật</h2>
          <p>Bấm vào thiệp để cảm nhận hiệu ứng lật mở.</p>
        </div>
      </div>

      <div className="card-3d">
        <div className="card-3d-inner">
          <div className="card-face card-front">
            <span className="big-emoji">🎂</span>
            <h3>{birthdayConfig.cardTitle}</h3>
            <p>Đưa chuột vào thiệp để mở</p>
          </div>

          <div className="card-face card-back">
            <span className="big-emoji">💌</span>
            <h3>Gửi {birthdayConfig.recipientName}</h3>
            <p>{birthdayConfig.cardMessage}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
