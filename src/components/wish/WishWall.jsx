import { useState } from "react";
import { wishesData } from "../../data/wishesData";
import Button from "../ui/Button";

export default function WishWall() {
  const [wishes, setWishes] = useState(wishesData);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !message.trim()) return;

    setWishes((current) => [
      {
        id: crypto.randomUUID(),
        name: name.trim(),
        message: message.trim()
      },
      ...current
    ]);

    setName("");
    setMessage("");
  }

  return (
    <section className="section-card">
      <div className="section-heading">
        <div>
          <h2>Bức tường lời chúc</h2>
          <p>Hãy để lại lời chúc đầu tiên cho Thuffuong nhé.</p>
        </div>
      </div>

      <form className="wish-form" onSubmit={handleSubmit}>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Tên của bạn"
        />
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Viết lời chúc..."
          rows={3}
        />
        <Button type="submit">Gửi lời chúc</Button>
      </form>

      {wishes.length === 0 ? (
        <div className="empty-wishes">
          <span>💌</span>
          <h3>Chưa có lời chúc nào</h3>
          <p>Hãy là người đầu tiên gửi một lời chúc thật dễ thương.</p>
        </div>
      ) : (
        <div className="wish-grid">
          {wishes.map((wish, index) => (
            <article
              className="wish-note"
              key={wish.id}
              style={{ "--rotate": `${index % 2 === 0 ? -2 : 2}deg` }}
            >
              <strong>{wish.name}</strong>
              <p>{wish.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
