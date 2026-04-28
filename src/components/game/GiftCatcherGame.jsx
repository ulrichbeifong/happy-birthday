import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Heart,
  RotateCcw,
  Shield,
  Swords,
  Trophy
} from "lucide-react";
import Button from "../ui/Button";

const PLAYER_SIZE = 7;
const MONSTER_SIZE = 7;
const ITEM_SIZE = 5;

const WIN_GIFTS = 10;
const MAX_HP = 5;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createGift(id) {
  return {
    id,
    x: random(8, 87),
    y: random(12, 82),
    type: "gift",
    icon: "🎁"
  };
}

function createPowerup(id) {
  const types = [
    { type: "heart", icon: "❤️" },
    { type: "shield", icon: "🛡️" },
    { type: "speed", icon: "⚡" }
  ];

  const item = types[Math.floor(Math.random() * types.length)];

  return {
    id,
    x: random(8, 87),
    y: random(12, 82),
    ...item
  };
}

function createMonster(id, level = 1) {
  const icons = ["👾", "🐉", "🦇", "🧟", "👹"];
  const edges = [
    { x: random(0, 8), y: random(0, 90) },
    { x: random(90, 95), y: random(0, 90) },
    { x: random(0, 95), y: random(0, 8) },
    { x: random(0, 95), y: random(85, 90) }
  ];

  const start = edges[Math.floor(Math.random() * edges.length)];

  return {
    id,
    x: start.x,
    y: start.y,
    icon: icons[Math.floor(Math.random() * icons.length)],
    speed: random(0.28, 0.42) + level * 0.035,
    damageCooldown: 0
  };
}

export default function GiftCatcherGame() {
  const keysRef = useRef({});
  const loopRef = useRef(null);
  const attackCooldownRef = useRef(0);

  const [status, setStatus] = useState("ready");
  const [player, setPlayer] = useState({ x: 46, y: 78 });
  const [monsters, setMonsters] = useState([]);
  const [items, setItems] = useState([]);
  const [hp, setHp] = useState(MAX_HP);
  const [shield, setShield] = useState(0);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [gifts, setGifts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [message, setMessage] = useState("Sống sót, nhặt đủ quà rồi chạy vào cổng bánh kem.");
  const [isHit, setIsHit] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);

  const gateOpen = gifts >= WIN_GIFTS;

  const gate = useMemo(
    () => ({
      x: 46,
      y: 4
    }),
    []
  );

  function resetGame() {
    keysRef.current = {};
    attackCooldownRef.current = 0;

    setStatus("playing");
    setPlayer({ x: 46, y: 78 });
    setHp(MAX_HP);
    setShield(0);
    setSpeedBoost(false);
    setGifts(0);
    setTimeLeft(60);
    setMessage("Quái sẽ ngày càng nhiều. Nhặt đủ quà rồi chạy vào cổng 🎂.");

    setItems([
      createGift("gift-1"),
      createGift("gift-2"),
      createGift("gift-3"),
      createPowerup("power-1")
    ]);

    setMonsters([
      createMonster("monster-1", 1),
      createMonster("monster-2", 1),
      createMonster("monster-3", 1)
    ]);
  }

  function startGame() {
    resetGame();
  }

  function damagePlayer(reason) {
    if (shield > 0) {
      setShield((value) => Math.max(0, value - 1));
      setMessage(`${reason} Nhưng khiên đã đỡ giúp bạn 🛡️`);
      return;
    }

    setHp((current) => {
      const next = current - 1;

      if (next <= 0) {
        setStatus("lose");
        setMessage("Bạn đã hết máu rồi 😭");
      } else {
        setMessage(`${reason} Bạn mất 1 máu!`);
      }

      return next;
    });

    setIsHit(true);
    window.setTimeout(() => setIsHit(false), 260);
  }

  function attack() {
    if (status !== "playing") return;

    const now = Date.now();
    if (now - attackCooldownRef.current < 550) return;

    attackCooldownRef.current = now;
    setIsAttacking(true);
    window.setTimeout(() => setIsAttacking(false), 180);

    let hit = false;

    setMonsters((current) =>
      current.map((monster) => {
        const d = distance(player, monster);

        if (d < 15) {
          hit = true;

          const dx = monster.x - player.x;
          const dy = monster.y - player.y;
          const len = Math.hypot(dx, dy) || 1;

          return {
            ...monster,
            x: clamp(monster.x + (dx / len) * 12, 0, 93),
            y: clamp(monster.y + (dy / len) * 12, 0, 90)
          };
        }

        return monster;
      })
    );

    setMessage(hit ? "Bạn đã đánh bật quái ra xa ⚔️" : "Đòn đánh hụt rồi!");
  }

  function moveByButton(dx, dy) {
    if (status === "ready") startGame();
    if (status !== "playing") return;

    const speed = speedBoost ? 4.4 : 3.1;

    setPlayer((current) => ({
      x: clamp(current.x + dx * speed, 1, 92),
      y: clamp(current.y + dy * speed, 1, 88)
    }));
  }

  useEffect(() => {
    if (status !== "playing") return;

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        const next = current - 1;

        if (next <= 0) {
          setStatus("lose");
          setMessage("Hết thời gian rồi! Hãy thử lại nhanh hơn.");
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  useEffect(() => {
    if (status !== "playing") return;

    const spawnTimer = window.setInterval(() => {
      setItems((current) => {
        const giftCount = current.filter((item) => item.type === "gift").length;
        const powerCount = current.filter((item) => item.type !== "gift").length;

        const next = [...current];

        if (giftCount < 4) {
          next.push(createGift(`gift-${Date.now()}`));
        }

        if (powerCount < 2 && Math.random() > 0.45) {
          next.push(createPowerup(`power-${Date.now()}`));
        }

        return next;
      });
    }, 1800);

    return () => window.clearInterval(spawnTimer);
  }, [status]);

  useEffect(() => {
    if (status !== "playing") return;

    const monsterTimer = window.setInterval(() => {
      setMonsters((current) => {
        if (current.length >= 9) return current;

        const level = Math.floor((60 - timeLeft) / 12) + 1;
        return [...current, createMonster(`monster-${Date.now()}`, level)];
      });
    }, 7000);

    return () => window.clearInterval(monsterTimer);
  }, [status, timeLeft]);

  useEffect(() => {
    if (status !== "playing") return;

    loopRef.current = window.setInterval(() => {
      setPlayer((current) => {
        let dx = 0;
        let dy = 0;

        if (keysRef.current.ArrowLeft || keysRef.current.a) dx -= 1;
        if (keysRef.current.ArrowRight || keysRef.current.d) dx += 1;
        if (keysRef.current.ArrowUp || keysRef.current.w) dy -= 1;
        if (keysRef.current.ArrowDown || keysRef.current.s) dy += 1;

        if (dx === 0 && dy === 0) return current;

        const len = Math.hypot(dx, dy) || 1;
        const speed = speedBoost ? 1.6 : 1.05;

        return {
          x: clamp(current.x + (dx / len) * speed, 1, 92),
          y: clamp(current.y + (dy / len) * speed, 1, 88)
        };
      });

      setMonsters((current) =>
        current.map((monster) => {
          const dx = player.x - monster.x;
          const dy = player.y - monster.y;
          const len = Math.hypot(dx, dy) || 1;

          const chaseSpeed = monster.speed * (distance(player, monster) < 38 ? 1.6 : 1);

          const nextMonster = {
            ...monster,
            x: clamp(monster.x + (dx / len) * chaseSpeed, 0, 93),
            y: clamp(monster.y + (dy / len) * chaseSpeed, 0, 90)
          };

          const now = Date.now();

          if (distance(player, nextMonster) < 7.5 && now - monster.damageCooldown > 850) {
            damagePlayer(`${monster.icon} đã tấn công bạn!`);

            return {
              ...nextMonster,
              damageCooldown: now
            };
          }

          return nextMonster;
        })
      );

      setItems((current) =>
        current.filter((item) => {
          const touched = distance(player, item) < 7.5;

          if (!touched) return true;

          if (item.type === "gift") {
            setGifts((value) => value + 1);
            setMessage("Nhặt được quà rồi 🎁");
          }

          if (item.type === "heart") {
            setHp((value) => Math.min(MAX_HP, value + 1));
            setMessage("Hồi 1 máu ❤️");
          }

          if (item.type === "shield") {
            setShield((value) => value + 1);
            setMessage("Nhặt được khiên 🛡️");
          }

          if (item.type === "speed") {
            setSpeedBoost(true);
            setMessage("Tăng tốc 5 giây ⚡");

            window.setTimeout(() => {
              setSpeedBoost(false);
            }, 5000);
          }

          return false;
        })
      );

      if (gateOpen && distance(player, gate) < 8) {
        setStatus("win");
        setMessage("Bạn đã mở cổng bánh sinh nhật thành công 🎂");
      }
    }, 45);

    return () => window.clearInterval(loopRef.current);
  }, [status, player, speedBoost, gateOpen, gate]);

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
        event.preventDefault();
      }

      keysRef.current[key] = true;
      keysRef.current[key.toLowerCase()] = true;

      if (key === " ") attack();
    }

    function handleKeyUp(event) {
      keysRef.current[event.key] = false;
      keysRef.current[event.key.toLowerCase()] = false;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  });

  return (
    <section className="section-card survival-section">
      <div className="section-heading">
        <div>
          <h2>Game sinh tồn nhặt quà</h2>
          <p>Sống sót trong khu vườn sinh nhật, né quái, nhặt đủ quà rồi mở cổng bánh kem.</p>
        </div>
      </div>

      <div className="survival-layout">
        <div className="adventure-info glass-card">
          <h3>Nhiệm vụ</h3>
          <p>
            Nhặt đủ <strong>{WIN_GIFTS}</strong> món quà 🎁, né quái vật,
            dùng Space để đánh bật quái, rồi chạy vào cổng 🎂.
          </p>

          <div className="adventure-stats">
            <span>🎁 Quà: {gifts}/{WIN_GIFTS}</span>
            <span>❤️ Máu: {hp}/{MAX_HP}</span>
            <span>🛡️ Khiên: {shield}</span>
            <span>⏱️ Thời gian: {timeLeft}s</span>
            <span>👾 Quái: {monsters.length}</span>
          </div>

          <div className="adventure-message">
            {status === "ready" && <strong>Sẵn sàng chưa?</strong>}
            {status === "playing" && <strong>{gateOpen ? "Cổng đã mở!" : "Cẩn thận quái vật!"}</strong>}
            {status === "win" && <strong>Chiến thắng! 🎉</strong>}
            {status === "lose" && <strong>Thua mất rồi 😭</strong>}
            <p>{message}</p>
          </div>

          <div className="adventure-help">
            <span>Di chuyển: W/A/S/D hoặc phím mũi tên</span>
            <span>Đánh bật quái: Space hoặc nút Đánh</span>
            <span>Quái sẽ xuất hiện nhiều hơn theo thời gian</span>
          </div>
        </div>

        <div className="survival-map-wrap">
          <div className="survival-map">
            <div
              className={`survival-gate ${gateOpen ? "open" : ""}`}
              style={{ left: `${gate.x}%`, top: `${gate.y}%` }}
            >
              {gateOpen ? "🎂" : "🔒"}
            </div>

            {items.map((item) => (
              <div
                key={item.id}
                className={`survival-item ${item.type}`}
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
              >
                {item.icon}
              </div>
            ))}

            {monsters.map((monster) => (
              <div
                key={monster.id}
                className="survival-monster"
                style={{ left: `${monster.x}%`, top: `${monster.y}%` }}
              >
                {monster.icon}
              </div>
            ))}

            <div
              className={`survival-player ${isHit ? "hit" : ""} ${isAttacking ? "attacking" : ""}`}
              style={{ left: `${player.x}%`, top: `${player.y}%` }}
            >
              🧸
              {isAttacking && <span className="attack-ring" />}
            </div>

            {status === "ready" && (
              <div className="survival-overlay">
                <Swords size={48} />
                <h3>Khu vườn sinh tồn</h3>
                <p>Quái sẽ xuất hiện liên tục. Nhặt đủ quà rồi chạy vào cổng bánh kem.</p>
                <Button onClick={startGame}>Bắt đầu</Button>
              </div>
            )}

            {status === "win" && (
              <div className="survival-overlay">
                <Trophy size={48} />
                <h3>Thắng rồi!</h3>
                <p>Bạn đã gom đủ quà sinh nhật cho Thuffuong 🎂</p>
                <Button onClick={resetGame}>
                  <RotateCcw size={18} />
                  Chơi lại
                </Button>
              </div>
            )}

            {status === "lose" && (
              <div className="survival-overlay">
                <Heart size={48} />
                <h3>Thua mất rồi!</h3>
                <p>Thử nhặt khiên, tim và dùng Space để đẩy quái ra xa nhé.</p>
                <Button onClick={resetGame}>
                  <RotateCcw size={18} />
                  Chơi lại
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="survival-controls">
        <div />
        <Button variant="secondary" onClick={() => moveByButton(0, -1)}>
          <ArrowUp size={18} />
          Lên
        </Button>
        <div />

        <Button variant="secondary" onClick={() => moveByButton(-1, 0)}>
          <ArrowLeft size={18} />
          Trái
        </Button>

        <Button onClick={status === "ready" ? startGame : attack}>
          {status === "ready" ? (
            "Bắt đầu"
          ) : (
            <>
              <Swords size={18} />
              Đánh
            </>
          )}
        </Button>

        <Button variant="secondary" onClick={() => moveByButton(1, 0)}>
          Phải
          <ArrowRight size={18} />
        </Button>

        <div />
        <Button variant="secondary" onClick={() => moveByButton(0, 1)}>
          <ArrowDown size={18} />
          Xuống
        </Button>
        <div />

        <Button variant="secondary" onClick={resetGame}>
          <RotateCcw size={18} />
          Chơi lại
        </Button>
      </div>
    </section>
  );
}
