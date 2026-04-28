import Button from "./Button";

export default function Modal({ open, title, children, onClose }) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="section-heading">
          <h2>{title}</h2>
          <Button variant="secondary" size="small" onClick={onClose}>
            Đóng
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
