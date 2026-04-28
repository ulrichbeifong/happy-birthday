export default function MainLayout({ children, theme = "dark" }) {
  return <div className={`app-shell ${theme}`}>{children}</div>;
}
