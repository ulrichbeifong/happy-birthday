import { galleryData } from "../../data/galleryData";

export default function MemoryGallery() {
  return (
    <section className="section-card">
      <div className="section-heading">
        <div>
          <h2>Hot girl cháy phố</h2>
          <p>Tuyển tập ảnh xinh gái tinh quái của Thuffuong 🔥</p>
        </div>
      </div>

      <div className="polaroid-grid">
        {galleryData.map((item) => (
          <article className="polaroid" key={item.id}>
            <div className="polaroid-image">
              {item.src ? <img src={item.src} alt={item.caption} /> : <span>📷</span>}
            </div>
            <p>{item.caption}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
