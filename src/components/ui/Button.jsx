export default function Button({
  children,
  onClick,
  type = "button",
  disabled = false,
  variant = "primary",
  size = "normal",
  className = ""
}) {
  return (
    <button
      className={`btn ${variant === "secondary" ? "secondary" : ""} ${size === "small" ? "small" : ""} ${className}`}
      type={type}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
