import { useEffect, useState } from "react";
import { wishesData } from "../../data/wishesData";
import Button from "../ui/Button";

const STORAGE_KEY = "birthday-wishes-thuffuong";

function getInitialWishes() {
  try {
    const savedWishes = localStorage.getItem(STORAGE_KEY);

    if (savedWishes) {
      return JSON.parse(savedWishes);
    }

    return wishesData;
  } catch (error) {
    console.error("Cannot load wishes from localStorage:", error);
    return wishesData;
  }
}

export default function WishWall() {
  const [wishes, setWishes] = useState(getInitialWishes);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishes));
    } catch (error) {
      console.error("Cannot save wishes to localStorage:", error);
    }
  }, [wishes]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !message.trim()) return;

    const newWish = {
      id: crypto.randomUUID(),
      name: name.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString()
    };

    setWishes((current) => [newWish, ...current]);

    setName("");
    setMessage("");
  }

  function handleClearWishes() {
    const confirmClear = window.confirm("Bạn có chắc muốn xóa toàn bộ lời chúc không?");

    if (!confirmClear) return;

    setWishes([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  return (
    <section className="section-card">
      <div className="section-heading">
        <div>
          <h2>Bức tường lời chúc</h2>
          <p>Hãy để lại lời chúc đầu tiên cho Thuffuong nhé.</p>
        </div>

        {wishes.length > 0 && (
          <Button variant="secondary" size="small" onClick={handleClearWishes}>
            Xóa lời chúc
          </Button>
        )}
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
