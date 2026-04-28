import { useEffect, useState } from "react";
import Button from "../ui/Button";
import { supabase } from "../../lib/supabaseClient";

export default function WishWall() {
  const [wishes, setWishes] = useState([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  async function loadWishes() {
    setLoading(true);

    const { data, error } = await supabase
      .from("wishes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load wishes error:", error);
      alert("Không tải được lời chúc. Kiểm tra Supabase URL/KEY/RLS/table nhé.");
    } else {
      setWishes(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadWishes();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim() || !message.trim()) return;

    setSending(true);

    const { data, error } = await supabase
      .from("wishes")
      .insert({
        name: name.trim(),
        message: message.trim()
      })
      .select()
      .single();

    setSending(false);

    if (error) {
      console.error("Insert wish error:", error);
      alert("Gửi lời chúc thất bại. Kiểm tra Supabase policy insert.");
      return;
    }

    setWishes((current) => [data, ...current]);
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

        <Button type="submit" disabled={sending}>
          {sending ? "Đang gửi..." : "Gửi lời chúc"}
        </Button>
      </form>

      {loading ? (
        <div className="empty-wishes">
          <span>⏳</span>
          <h3>Đang tải lời chúc...</h3>
        </div>
      ) : wishes.length === 0 ? (
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