import React, { useEffect } from 'react';

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast.visible) return;
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [toast.visible, onClose]);

  if (!toast.visible) return null;

  return (
    <div className="toast-container">
      <div className={`toast ${toast.type} toast-enter`}>
        <span className="toast-message">{toast.message}</span>
        <button className="toast-close" onClick={onClose} aria-label="Dismiss">×</button>
      </div>
    </div>
  );
};

export default Toast;
