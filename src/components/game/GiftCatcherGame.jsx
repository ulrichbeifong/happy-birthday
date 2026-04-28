import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Heart,
  RotateCcw,
  Shield,
  Skull,
  Trophy
} from "lucide-react";
import Button from "../ui/Button";

const WIDTH = 10;
const HEIGHT = 7;

const START = { x: 0, y: 6 };
const GOAL = { x: 9, y: 0 };

const INITIAL_GIFTS = [
  { id: "gift-1", x: 1, y: 5 },
  { id: "gift-2", x: 4, y: 5 },
  { id: "gift-3", x: 8, y: 5 },
  { id: "gift-4", x: 2, y: 2 },
  { id: "gift-5", x: 6, y: 2 },
  { id: "gift-6", x: 8, y: 1 }
];

const INITIAL_HEARTS = [
  { id: "heart-1", x: 5, y: 0 }
];

const INITIAL_SHIELDS = [
  { id: "shield-1", x: 0, y: 2 }
];

const WALLS = [
  { x: 1, y: 1 },
  { x: 2, y: 1 },
  { x: 3, y: 1 },
  { x: 5, y: 1 },
  { x: 7, y: 2 },
  { x: 1, y: 3 },
  { x: 3, y: 3 },
  { x: 4, y: 3 },
  { x: 6, y: 3 },
  { x: 8, y: 3 },
  { x: 2, y: 5 },
  { x: 6, y: 5 }
];

const TRAPS = [
  { x: 4, y: 1 },
  { x: 7, y: 4 },
  { x: 3, y: 6 }
];

const INITIAL_MONSTERS = [
  {
    id: "monster-1",
    x: 5,
    y: 5,
    dx: 1,
    dy: 0,
    icon: "👾",
    name: "Quái tím"
  },
  {
    id: "monster-2",
    x: 9,
    y: 4,
    dx: 0,
    dy: -1,
    icon: "🐉",
    name: "Rồng mini"
  },
  {
    id: "monster-3",
    x: 2,
    y: 4,
    dx: 1,
    dy: 0,
    icon: "🦇",
    name: "Dơi bóng đêm"
  }
];

function samePosition(a, b) {
  return a.x === b.x && a.y === b.y;
}

function distance(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function insideBoard(position) {
  return (
    position.x >= 0 &&
    position.x < WIDTH &&
    position.y >= 0 &&
    position.y < HEIGHT
  );
}

function isWall(position) {
  return WALLS.some((wall) => samePosition(wall, position));
}

function isTrap(position) {
  return TRAPS.some((trap) => samePosition(trap, position));
}

function canMonsterMoveTo(position) {
  return insideBoard(position) && !isWall(position) && !samePosition(position, GOAL);
}

export default function GiftCatcherGame() {
  const [player, setPlayer] = useState(START);
  const [gifts, setGifts] = useState(INITIAL_GIFTS);
  const [hearts, setHearts] = useState(INITIAL_HEARTS);
  const [shields, setShields] = useState(INITIAL_SHIELDS);
  const [monsters, setMonsters] = useState(INITIAL_MONSTERS);
  const [lives, setLives] = useState(3);
  const [shield, setShield] = useState(0);
  const [steps, setSteps] = useState(0);
  const [status, setStatus] = useState("ready");
  const [hitCell, setHitCell] = useState(null);
  const [message, setMessage] = useState(
    "Nhặt đủ quà, tránh quái vật, rồi mở cổng bánh sinh nhật."
  );

  const collected = INITIAL_GIFTS.length - gifts.length;

  const boardCells = useMemo(() => {
    const cells = [];

    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        cells.push({ x, y });
      }
    }

    return cells;
  }, []);

  function resetGame() {
    setPlayer(START);
    setGifts(INITIAL_GIFTS);
    setHearts(INITIAL_HEARTS);
    setShields(INITIAL_SHIELDS);
    setMonsters(INITIAL_MONSTERS);
    setLives(3);
    setShield(0);
    setSteps(0);
    setStatus("playing");
    setHitCell(null);
    setMessage("Quái vật đang tuần tra. Hãy né chúng và gom đủ quà!");
  }

  function startGame() {
    setStatus("playing");
    setMessage("Dùng nút điều hướng hoặc phím W/A/S/D, mũi tên để di chuyển.");
  }

  function takeDamage(reason, position = player) {
    setHitCell(position);
    window.setTimeout(() => setHitCell(null), 280);

    if (shield > 0) {
      setShield((value) => Math.max(0, value - 1));
      setMessage(`${reason} Nhưng khiên đã đỡ giúp bạn một đòn!`);
      return;
    }

    setLives((current) => {
      const nextLives = current - 1;

      if (nextLives <= 0) {
        setStatus("lose");
        setMessage(`${reason} Hết tim rồi, thử lại nhé!`);
      } else {
        setMessage(`${reason} Bạn mất 1 tim và quay lại điểm xuất phát.`);
      }

      return nextLives;
    });

    setPlayer(START);
  }

  function move(dx, dy) {
    if (status === "ready") {
      setStatus("playing");
    }

    if (status === "win" || status === "lose") return;

    setPlayer((current) => {
      const next = {
        x: current.x + dx,
        y: current.y + dy
      };

      if (!insideBoard(next)) {
        setMessage("Không đi ra ngoài bản đồ được đâu nha!");
        return current;
      }

      if (isWall(next)) {
        setMessage("Có bụi cây chặn đường rồi. Hãy tìm lối khác!");
        return current;
      }

      setSteps((value) => value + 1);

      const monsterOnCell = monsters.find((monster) => samePosition(monster, next));
      if (monsterOnCell) {
        takeDamage(`${monsterOnCell.name} đã lao vào bạn!`, next);
        return START;
      }

      if (isTrap(next)) {
        takeDamage("Bạn dẫm phải bẫy pháo giấy phát nổ 💥", next);
        return START;
      }

      const touchedGift = gifts.find((gift) => samePosition(gift, next));
      const remainingAfterMove = touchedGift ? gifts.length - 1 : gifts.length;

      if (touchedGift) {
        setGifts((currentGifts) =>
          currentGifts.filter((gift) => gift.id !== touchedGift.id)
        );
        setMessage("Nhặt được một món quà rồi! Tiếp tục gom quà nào 🎁");
      }

      const touchedHeart = hearts.find((heartItem) => samePosition(heartItem, next));
      if (touchedHeart) {
        setHearts((currentHearts) =>
          currentHearts.filter((heartItem) => heartItem.id !== touchedHeart.id)
        );
        setLives((value) => Math.min(5, value + 1));
        setMessage("Bạn nhặt được tim hồi máu ❤️");
      }

      const touchedShield = shields.find((shieldItem) => samePosition(shieldItem, next));
      if (touchedShield) {
        setShields((currentShields) =>
          currentShields.filter((shieldItem) => shieldItem.id !== touchedShield.id)
        );
        setShield((value) => value + 1);
        setMessage("Bạn nhặt được khiên. Khiên đỡ được 1 đòn tấn công 🛡️");
      }

      if (samePosition(next, GOAL)) {
        if (remainingAfterMove === 0) {
          setStatus("win");
          setMessage("Bạn đã gom đủ quà và mở cổng bánh sinh nhật!");
        } else {
          setMessage("Cổng bánh còn khóa. Hãy nhặt đủ quà trước đã!");
          return current;
        }
      }

      return next;
    });
  }

  useEffect(() => {
    if (status !== "playing") return;

    const monsterTimer = window.setInterval(() => {
      setMonsters((currentMonsters) => {
        const movedMonsters = currentMonsters.map((monster) => {
          let next = {
            ...monster,
            x: monster.x + monster.dx,
            y: monster.y + monster.dy
          };

          if (!canMonsterMoveTo(next)) {
            next = {
              ...monster,
              dx: -monster.dx,
              dy: -monster.dy,
              x: monster.x - monster.dx,
              y: monster.y - monster.dy
            };
          }

          if (!canMonsterMoveTo(next)) {
            return {
              ...monster,
              dx: -monster.dx,
              dy: -monster.dy
            };
          }

          return next;
        });

        const attacker = movedMonsters.find((monster) => distance(monster, player) <= 1);

        if (attacker) {
          takeDamage(`${attacker.name} tấn công khi bạn đứng quá gần!`, attacker);
        }

        return movedMonsters;
      });
    }, 760);

    return () => window.clearInterval(monsterTimer);
  }, [player, shield, status]);

  useEffect(() => {
    function handleKeyDown(event) {
      const key = event.key.toLowerCase();

      if (["arrowup", "w"].includes(key)) {
        event.preventDefault();
        move(0, -1);
      }

      if (["arrowdown", "s"].includes(key)) {
        event.preventDefault();
        move(0, 1);
      }

      if (["arrowleft", "a"].includes(key)) {
        event.preventDefault();
        move(-1, 0);
      }

      if (["arrowright", "d"].includes(key)) {
        event.preventDefault();
        move(1, 0);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function getCellContent(cell) {
    const monster = monsters.find((item) => samePosition(item, cell));

    if (samePosition(player, cell)) return "🧸";
    if (monster) return monster.icon;
    if (samePosition(GOAL, cell)) return gifts.length === 0 ? "🎂" : "🔒";
    if (gifts.some((gift) => samePosition(gift, cell))) return "🎁";
    if (hearts.some((heartItem) => samePosition(heartItem, cell))) return "❤️";
    if (shields.some((shieldItem) => samePosition(shieldItem, cell))) return "🛡️";
    if (WALLS.some((wall) => samePosition(wall, cell))) return "🌳";
    if (TRAPS.some((trap) => samePosition(trap, cell))) return "💥";
    return "";
  }

  function getCellClass(cell) {
    const monster = monsters.find((item) => samePosition(item, cell));

    if (hitCell && samePosition(hitCell, cell)) return "hit-cell";
    if (samePosition(player, cell)) return "player-cell";
    if (monster) return "monster-cell";
    if (samePosition(GOAL, cell)) return gifts.length === 0 ? "goal-cell open" : "goal-cell";
    if (gifts.some((gift) => samePosition(gift, cell))) return "gift-cell";
    if (hearts.some((heartItem) => samePosition(heartItem, cell))) return "heart-cell";
    if (shields.some((shieldItem) => samePosition(shieldItem, cell))) return "shield-cell";
    if (WALLS.some((wall) => samePosition(wall, cell))) return "block-cell";
    if (TRAPS.some((trap) => samePosition(trap, cell))) return "trap-cell";
    return "path-cell";
  }

  return (
    <section className="section-card adventure-section">
      <div className="section-heading">
        <div>
          <h2>Vui chơi có thưởng</h2>
          <p>
            Hãy nhặt quà thật khéo nhé! Thắng thì có quà, thua cũng có quà, inbox nhatzittt nhé 🎁
          </p>
        </div>
      </div>

      <div className="adventure-layout">
        <div className="adventure-info glass-card">
          <h3>Nhiệm vụ</h3>
          <p>
            Điều khiển nhân vật 🧸, nhặt đủ <strong>{INITIAL_GIFTS.length}</strong> món
            quà 🎁, né quái 👾🐉🦇, né bẫy 💥, rồi đi tới cổng bánh 🎂.
          </p>

          <div className="adventure-stats">
            <span>🎁 Quà: {collected}/{INITIAL_GIFTS.length}</span>
            <span>❤️ Tim: {lives}</span>
            <span>🛡️ Khiên: {shield}</span>
            <span>👣 Bước: {steps}</span>
          </div>

          <div className="adventure-message">
            {status === "win" && <strong>Chiến thắng! 🎉</strong>}
            {status === "lose" && <strong>Thua mất rồi 😭</strong>}
            {status === "playing" && <strong>Cẩn thận quái vật!</strong>}
            <p>{message}</p>
          </div>

          <div className="adventure-help">
            <span>Quái vật sẽ tự di chuyển sau mỗi vài giây.</span>
            <span>Đứng gần quái cũng có thể bị tấn công.</span>
            <span>Nhặt 🛡️ để đỡ 1 đòn, nhặt ❤️ để hồi máu.</span>
          </div>
        </div>

        <div className="adventure-board-wrap">
          <div className="adventure-board adventure-board-bigger" style={{ "--width": WIDTH }}>
            {boardCells.map((cell) => (
              <div
                key={`${cell.x}-${cell.y}`}
                className={`adventure-cell ${getCellClass(cell)}`}
              >
                {getCellContent(cell)}
              </div>
            ))}
          </div>

          {status === "ready" && (
            <div className="adventure-overlay">
              <Skull size={48} />
              <h3>Khu vườn quái vật</h3>
              <p>
                Gom đủ quà sinh nhật cho Thuffuong rồi mở cổng bánh kem. Cẩn thận,
                quái vật sẽ di chuyển và tấn công bạn!
              </p>
              <Button onClick={startGame}>Bắt đầu phiêu lưu</Button>
            </div>
          )}

          {status === "win" && (
            <div className="adventure-overlay">
              <Trophy size={48} />
              <h3>Hoàn thành!</h3>
              <p>Bạn đã đánh bại khu vườn quái vật và gom đủ quà sinh nhật 🎂</p>
              <Button onClick={resetGame}>
                <RotateCcw size={18} />
                Chơi lại
              </Button>
            </div>
          )}

          {status === "lose" && (
            <div className="adventure-overlay">
              <Skull size={48} />
              <h3>Bị quái vật hạ gục!</h3>
              <p>Thử đi đường khác, nhặt khiên trước hoặc tránh đứng quá gần quái nhé.</p>
              <Button onClick={resetGame}>
                <RotateCcw size={18} />
                Chơi lại
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="adventure-controls">
        <div />
        <Button variant="secondary" onClick={() => move(0, -1)}>
          <ArrowUp size={18} />
          Lên
        </Button>
        <div />

        <Button variant="secondary" onClick={() => move(-1, 0)}>
          <ArrowLeft size={18} />
          Trái
        </Button>

        <Button onClick={status === "ready" ? startGame : resetGame}>
          {status === "ready" ? "Bắt đầu" : "Chơi lại"}
        </Button>

        <Button variant="secondary" onClick={() => move(1, 0)}>
          Phải
          <ArrowRight size={18} />
        </Button>

        <div />
        <Button variant="secondary" onClick={() => move(0, 1)}>
          <ArrowDown size={18} />
          Xuống
        </Button>
        <div />
      </div>
    </section>
  );
}
