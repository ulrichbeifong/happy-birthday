import { CakeSlice, Moon, Sun } from "lucide-react";
import Button from "../ui/Button";

export default function Header({ theme, onToggleTheme }) {
  return (
    <header className="site-header">
      <div className="logo" aria-label="Birthday Web">
        <span className="logo-badge">
          <CakeSlice size={24} />
        </span>
        <span>Birthday Wish</span>
      </div>

      <div className="header-actions">
        <Button variant="secondary" size="small" onClick={onToggleTheme}>
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          {theme === "dark" ? "Light" : "Dark"}
        </Button>
      </div>
    </header>
  );
}
