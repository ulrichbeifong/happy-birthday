import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  RotateCcw,
  Shield,
  Swords,
  Trophy
} from "lucide-react";
import Button from "../ui/Button";

const MAP_W = 760;
const MAP_H = 460;
const PLAYER_SIZE = 42;
const MONSTER_SIZE = 42;
const GIFT_SIZE = 34;

const START_PLAYER = { x: 28, y: 380 };

const GOAL = {
  x: 690,
  y: 28,
  w: 52,
  h: 52
};

const INITIAL_GIFTS = [
  { id: "gift-1", x: 115, y: 330 },
  { id: "gift-2", x: 330, y: 370 },
  { id: "gift-3", x: 620, y: 345 },
  { id: "gift-4", x: 160, y: 95 },
  { id: "gift-5", x: 460, y: 125 },
  { id: "gift-6", x: 610, y: 155 }
];

const INITIAL_POWERUPS = [
  { id: "heart-1", type: "heart", x: 360, y: 55, icon: "❤️" },
  { id: "shield-1", type: "shield", x: 35, y: 135, icon: "🛡️" },
  { id: "speed-1", type: "speed", x: 545, y: 245, icon: "⚡" }
];

const INITIAL_MONSTERS = [
  {
    id: "monster-1",
    x: 460,
    y: 330,
    icon: "👾",
    speed: 1.45,
    patrol: [
      { x: 430, y: 330 },
      { x: 610, y: 330 }
    ],
    patrolIndex: 0
  },
  {
    id: "monster-2",
    x: 610,
    y: 90,
    icon: "🐉",
    speed: 1.25,
    patrol: [
      { x: 610, y: 90 },
      { x: 610, y: 250 }
    ],
    patrolIndex: 0
  },
  {
    id: "monster-3",
    x: 250,
    y: 210,
    icon: "🦇",
    speed: 1.65,
    patrol: [
      { x: 180, y: 210 },
      { x: 350, y: 210 }
    ],
    patrolIndex: 0
  }
];

const OBSTACLES = [
  { id: "tree-1", type: "tree", x: 90, y: 175, w: 82, h: 82, icon: "🌳" },
  { id: "rock-1", type: "rock", x: 230, y: 110, w: 92, h: 58, icon: "🪨" },
  { id: "tree-2", type: "tree", x: 410, y: 205, w: 86, h: 86, icon: "🌲" },
  { id: "rock-2", type: "rock", x: 555, y: 55, w: 78, h: 58, icon: "🪨" },
  { id: "tree-3", type: "tree", x: 560, y: 285, w: 84, h: 84, icon: "🌳" },
  { id: "rock-3", type: "rock", x: 270, y: 275, w: 100, h: 58, icon: "🪨" }
];

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function rectsCollide(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function distance(a, b) {
  const ax = a.x + a.w / 2;
  const ay = a.y + a.h / 2;
  const bx = b.x + b.w / 2;
  const by = b.y + b.h / 2;

  return Math.hypot(ax - bx, ay - by);
}

function normalize(dx, dy) {
  const length = Math.hypot(dx, dy) || 1;
  return {
    x: dx / length,
    y: dy / length
  };
}

function canMoveTo(rect) {
  if (rect.x < 0 || rect.y < 0 || rect.x + rect.w > MAP_W || rect.y + rect.h > MAP_H) {
    return false;
  }

  return !OBSTACLES.some((obstacle) => rectsCollide(rect, obstacle));
}

export default function GiftCatcherGame() {
  const keysRef = useRef({});
  const attackCooldownRef = useRef(0);
  const monsterAttackCooldownRef = useRef({});

  const [player, setPlayer] = useState(START_PLAYER);
  const [monsters, setMonsters] = useState(INITIAL_MONSTERS);
  const [gifts, setGifts] = useState(INITIAL_GIFTS);
  const [powerups, setPowerups] = useState(INITIAL_POWERUPS);

  const [hp, setHp] = useState(5);
  const [shield, setShield] = useState(0);
  const [speedBoost, setSpeedBoost] = useState(false);
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState("ready");
  const [message, setMessage] = useState("Nhặt đủ quà, né quái vật, rồi chạy tới cổng bánh sinh nhật.");
  const [isHit, setIsHit] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);

  const playerRect = useMemo(
    () => ({
      x: player.x,
      y: player.y,
      w: PLAYER_SIZE,
      h: PLAYER_SIZE
    }),
    [player]
  );

  const allGiftsCollected = gifts.length === 0;

  function resetGame() {
    keysRef.current = {};
    attackCooldownRef.current = 0;
    monsterAttackCooldownRef.current = {};
    setPlayer(START_PLAYER);
    setMonsters(INITIAL_MONSTERS);
    setGifts(INITIAL_GIFTS);
    setPowerups(INITIAL_POWERUPS);
    setHp(5);
    setShield(0);
    setSpeedBoost(false);
    setScore(0);
    setStatus("playing");
    setMessage("Quái vật đang tuần tra. Hãy gom đủ quà và tránh bị đánh!");
    setIsHit(false);
    setIsAttacking(false);
  }

  function startGame() {
    setStatus("playing");
    setMessage("Dùng W/A/S/D hoặc nút điều hướng. Nhấn Space để đánh đẩy quái.");
  }

  function damagePlayer(reason, monsterRect) {
    const now = Date.now();

    if (now - (monsterAttackCooldownRef.current.player || 0) < 850) {
      return;
    }

    monsterAttackCooldownRef.current.player = now;

    if (shield > 0) {
      setShield((value) => Math.max(0, value - 1));
      setMessage(`${reason} Khiên đã đỡ giúp bạn 1 đòn 🛡️`);
      return;
    }

    setHp((current) => {
      const nextHp = current - 1;

      if (nextHp <= 0) {
        setStatus("lose");
        setMessage("Bạn đã hết máu rồi! Thử lại nhé.");
      } else {
        setMessage(`${reason} Bạn mất 1 máu!`);
      }

      return nextHp;
    });

    setIsHit(true);
    window.setTimeout(() => setIsHit(false), 260);

    if (monsterRect) {
      const dx = playerRect.x - monsterRect.x;
      const dy = playerRect.y - monsterRect.y;
      const dir = normalize(dx, dy);

      setPlayer((current) => {
        const next = {
          x: clamp(current.x + dir.x * 34, 0, MAP_W - PLAYER_SIZE),
          y: clamp(current.y + dir.y * 34, 0, MAP_H - PLAYER_SIZE)
        };

        const nextRect = { x: next.x, y: next.y, w: PLAYER_SIZE, h: PLAYER_SIZE };

        if (canMoveTo(nextRect)) {
          return next;
        }

        return current;
      });
    }
  }

  function movePlayer(dx, dy) {
    if (status === "ready") {
      startGame();
    }

    if (status !== "playing") return;

    const speed = speedBoost ? 22 : 14;

    setPlayer((current) => {
      const next = {
        x: clamp(current.x + dx * speed, 0, MAP_W - PLAYER_SIZE),
        y: clamp(current.y + dy * speed, 0, MAP_H - PLAYER_SIZE)
      };

      const nextRect = {
        x: next.x,
        y: next.y,
        w: PLAYER_SIZE,
        h: PLAYER_SIZE
      };

      if (!canMoveTo(nextRect)) {
        setMessage("Có vật cản phía trước rồi, thử đi đường khác nhé.");
        return current;
      }

      return next;
    });
  }

  function attack() {
    if (status !== "playing") return;

    const now = Date.now();

    if (now - attackCooldownRef.current < 600) {
      return;
    }

    attackCooldownRef.current = now;
    setIsAttacking(true);
    window.setTimeout(() => setIsAttacking(false), 180);

    let hitAny = false;

    setMonsters((currentMonsters) =>
      currentMonsters.map((monster) => {
        const monsterRect = {
          x: monster.x,
          y: monster.y,
          w: MONSTER_SIZE,
          h: MONSTER_SIZE
        };

        const d = distance(playerRect, monsterRect);

        if (d <= 82) {
          hitAny = true;

          const dx = monster.x - player.x;
          const dy = monster.y - player.y;
          const dir = normalize(dx, dy);

          const next = {
            ...monster,
            x: clamp(monster.x + dir.x * 58, 0, MAP_W - MONSTER_SIZE),
            y: clamp(monster.y + dir.y * 58, 0, MAP_H - MONSTER_SIZE)
          };

          const nextRect = {
            x: next.x,
            y: next.y,
            w: MONSTER_SIZE,
            h: MONSTER_SIZE
          };

          if (canMoveTo(nextRect)) {
            return next;
          }
        }

        return monster;
      })
    );

    setMessage(hitAny ? "Bạn đã đánh bật quái vật ra xa ⚔️" : "Đòn đánh hụt rồi!");
  }

  useEffect(() => {
    if (status !== "playing") return;

    const timer = window.setInterval(() => {
      let moveX = 0;
      let moveY = 0;

      if (keysRef.current.ArrowLeft || keysRef.current.a) moveX -= 1;
      if (keysRef.current.ArrowRight || keysRef.current.d) moveX += 1;
      if (keysRef.current.ArrowUp || keysRef.current.w) moveY -= 1;
      if (keysRef.current.ArrowDown || keysRef.current.s) moveY += 1;

      if (moveX !== 0 || moveY !== 0) {
        const dir = normalize(moveX, moveY);
        movePlayer(dir.x, dir.y);
      }
    }, 45);

    return () => window.clearInterval(timer);
  }, [status, speedBoost]);

  useEffect(() => {
    if (status !== "playing") return;

    const timer = window.setInterval(() => {
      setMonsters((currentMonsters) =>
        currentMonsters.map((monster) => {
          const monsterRect = {
            x: monster.x,
            y: monster.y,
            w: MONSTER_SIZE,
            h: MONSTER_SIZE
          };

          const playerDistance = distance(playerRect, monsterRect);

          let targetX = monster.x;
          let targetY = monster.y;
          let nextPatrolIndex = monster.patrolIndex;

          if (playerDistance < 170) {
            const dx = player.x - monster.x;
            const dy = player.y - monster.y;
            const dir = normalize(dx, dy);

            targetX = monster.x + dir.x * monster.speed * 8;
            targetY = monster.y + dir.y * monster.speed * 8;
          } else {
            const target = monster.patrol[monster.patrolIndex];
            const dx = target.x - monster.x;
            const dy = target.y - monster.y;
            const dir = normalize(dx, dy);

            targetX = monster.x + dir.x * monster.speed * 5;
            targetY = monster.y + dir.y * monster.speed * 5;

            if (Math.hypot(dx, dy) < 12) {
              nextPatrolIndex = (monster.patrolIndex + 1) % monster.patrol.length;
            }
          }

          const next = {
            ...monster,
            x: clamp(targetX, 0, MAP_W - MONSTER_SIZE),
            y: clamp(targetY, 0, MAP_H - MONSTER_SIZE),
            patrolIndex: nextPatrolIndex
          };

          const nextRect = {
            x: next.x,
            y: next.y,
            w: MONSTER_SIZE,
            h: MONSTER_SIZE
          };

          if (!canMoveTo(nextRect)) {
            return {
              ...monster,
              patrolIndex: (monster.patrolIndex + 1) % monster.patrol.length
            };
          }

          if (rectsCollide(nextRect, playerRect) || distance(nextRect, playerRect) < 48) {
            damagePlayer("Quái vật đã tấn công bạn!", nextRect);
          }

          return next;
        })
      );
    }, 280);

    return () => window.clearInterval(timer);
  }, [player, playerRect, shield, status]);

  useEffect(() => {
    if (status !== "playing") return;

    setGifts((currentGifts) => {
      const remaining = currentGifts.filter((gift) => {
        const giftRect = {
          x: gift.x,
          y: gift.y,
          w: GIFT_SIZE,
          h: GIFT_SIZE
        };

        const collected = rectsCollide(playerRect, giftRect);

        if (collected) {
          setScore((value) => value + 1);
          setMessage("Nhặt được một món quà rồi 🎁");
        }

        return !collected;
      });

      return remaining;
    });

    setPowerups((currentPowerups) => {
      const remaining = currentPowerups.filter((item) => {
        const itemRect = {
          x: item.x,
          y: item.y,
          w: GIFT_SIZE,
          h: GIFT_SIZE
        };

        const touched = rectsCollide(playerRect, itemRect);

        if (touched) {
          if (item.type === "heart") {
            setHp((value) => Math.min(5, value + 1));
            setMessage("Bạn nhặt được tim hồi máu ❤️");
          }

          if (item.type === "shield") {
            setShield((value) => value + 1);
            setMessage("Bạn nhặt được khiên đỡ đòn 🛡️");
          }

          if (item.type === "speed") {
            setSpeedBoost(true);
            setMessage("Tăng tốc trong 6 giây ⚡");

            window.setTimeout(() => {
              setSpeedBoost(false);
            }, 6000);
          }
        }

        return !touched;
      });

      return remaining;
    });

    if (allGiftsCollected && rectsCollide(playerRect, GOAL)) {
      setStatus("win");
      setMessage("Bạn đã gom đủ quà và mở cổng bánh sinh nhật!");
    }

    if (!allGiftsCollected && rectsCollide(playerRect, GOAL)) {
      setMessage("Cổng còn khóa. Hãy nhặt đủ quà trước đã!");
    }
  }, [player, playerRect, allGiftsCollected, status]);

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key;

      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(key)) {
        event.preventDefault();
      }

      keysRef.current[key] = true;
      keysRef.current[key.toLowerCase()] = true;

      if (key === " ") {
        attack();
      }
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
    <section className="section-card adventure-section">
      <div className="section-heading">
        <div>
          <h2>Game phiêu lưu nhặt quà</h2>
          <p>Map tự do có cây, đá, quái vật đuổi đánh và vật phẩm hỗ trợ.</p>
        </div>
      </div>

      <div className="free-adventure-layout">
        <div className="adventure-info glass-card">
          <h3>Nhiệm vụ</h3>
          <p>
            Điều khiển 🧸 nhặt đủ <strong>{INITIAL_GIFTS.length}</strong> món quà,
            né quái, dùng Space để đánh bật quái, rồi chạy tới cổng 🎂.
          </p>

          <div className="adventure-stats">
            <span>🎁 Quà: {score}/{INITIAL_GIFTS.length}</span>
            <span>❤️ Máu: {hp}/5</span>
            <span>🛡️ Khiên: {shield}</span>
            <span>⚡ Tốc độ: {speedBoost ? "Đang tăng" : "Bình thường"}</span>
          </div>

          <div className="adventure-message">
            {status === "ready" && <strong>Sẵn sàng chưa?</strong>}
            {status === "playing" && <strong>Cẩn thận quái vật!</strong>}
            {status === "win" && <strong>Chiến thắng! 🎉</strong>}
            {status === "lose" && <strong>Thua mất rồi 😭</strong>}
            <p>{message}</p>
          </div>

          <div className="adventure-help">
            <span>Di chuyển: W/A/S/D hoặc phím mũi tên</span>
            <span>Đánh quái: Space</span>
            <span>Quái sẽ đuổi khi bạn lại gần</span>
          </div>
        </div>

        <div className="free-map-wrap">
          <div className="free-map">
            <div
              className={`goal-gate ${allGiftsCollected ? "open" : ""}`}
              style={{
                left: GOAL.x,
                top: GOAL.y,
                width: GOAL.w,
                height: GOAL.h
              }}
            >
              {allGiftsCollected ? "🎂" : "🔒"}
            </div>

            {OBSTACLES.map((obstacle) => (
              <div
                key={obstacle.id}
                className={`map-obstacle ${obstacle.type}`}
                style={{
                  left: obstacle.x,
                  top: obstacle.y,
                  width: obstacle.w,
                  height: obstacle.h
                }}
              >
                {obstacle.icon}
              </div>
            ))}

            {gifts.map((gift) => (
              <div
                key={gift.id}
                className="map-gift"
                style={{
                  left: gift.x,
                  top: gift.y,
                  width: GIFT_SIZE,
                  height: GIFT_SIZE
                }}
              >
                🎁
              </div>
            ))}

            {powerups.map((item) => (
              <div
                key={item.id}
                className={`map-powerup ${item.type}`}
                style={{
                  left: item.x,
                  top: item.y,
                  width: GIFT_SIZE,
                  height: GIFT_SIZE
                }}
              >
                {item.icon}
              </div>
            ))}

            {monsters.map((monster) => (
              <div
                key={monster.id}
                className="map-monster"
                style={{
                  left: monster.x,
                  top: monster.y,
                  width: MONSTER_SIZE,
                  height: MONSTER_SIZE
                }}
              >
                {monster.icon}
              </div>
            ))}

            <div
              className={`map-player ${isHit ? "hit" : ""} ${isAttacking ? "attacking" : ""}`}
              style={{
                left: player.x,
                top: player.y,
                width: PLAYER_SIZE,
                height: PLAYER_SIZE
              }}
            >
              🧸
              {isAttacking && <span className="attack-ring" />}
            </div>

            {status === "ready" && (
              <div className="free-map-overlay">
                <Swords size={48} />
                <h3>Khu vườn sinh nhật</h3>
                <p>Nhặt quà, né quái, dùng Space để đánh bật chúng ra xa.</p>
                <Button onClick={startGame}>Bắt đầu phiêu lưu</Button>
              </div>
            )}

            {status === "win" && (
              <div className="free-map-overlay">
                <Trophy size={48} />
                <h3>Hoàn thành!</h3>
                <p>Bạn đã gom đủ quà sinh nhật cho Thuffuong 🎂</p>
                <Button onClick={resetGame}>
                  <RotateCcw size={18} />
                  Chơi lại
                </Button>
              </div>
            )}

            {status === "lose" && (
              <div className="free-map-overlay">
                <h3>Bị quái vật hạ gục!</h3>
                <p>Thử nhặt khiên trước, giữ khoảng cách và dùng Space để đẩy quái.</p>
                <Button onClick={resetGame}>
                  <RotateCcw size={18} />
                  Chơi lại
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="adventure-controls">
        <div />
        <Button variant="secondary" onClick={() => movePlayer(0, -1)}>
          <ArrowUp size={18} />
          Lên
        </Button>
        <div />

        <Button variant="secondary" onClick={() => movePlayer(-1, 0)}>
          <ArrowLeft size={18} />
          Trái
        </Button>

        <Button onClick={status === "ready" ? startGame : attack}>
          {status === "ready" ? "Bắt đầu" : (
            <>
              <Swords size={18} />
              Đánh
            </>
          )}
        </Button>

        <Button variant="secondary" onClick={() => movePlayer(1, 0)}>
          Phải
          <ArrowRight size={18} />
        </Button>

        <div />
        <Button variant="secondary" onClick={() => movePlayer(0, 1)}>
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
