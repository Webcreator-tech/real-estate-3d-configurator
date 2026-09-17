import React from "react";
import { useCustomization } from "../../state/customization";

export default function ResetCustomization() {
  const { resetModalOpen, setResetModalOpen, resetCustomization } = useCustomization();

  if (!resetModalOpen) return null;

  return (
    <div className="modal-backdrop" onClick={() => setResetModalOpen(false)}>
      <div
        className="modal-dialog-box"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
      >
        <div className="modal-icon-badge">⚠️</div>

        <h3 id="reset-modal-title" className="modal-title">
          Are you sure you want to reset all your customizations?
        </h3>

        <p className="modal-description">
          All custom wall paint colors and placed furniture items will be reverted to the default
          architectural state.
        </p>

        <div className="modal-btn-row">
          <button
            className="modal-btn cancel"
            onClick={() => setResetModalOpen(false)}
          >
            Cancel
          </button>
          <button
            className="modal-btn confirm-danger"
            onClick={() => resetCustomization()}
          >
            Yes, Reset
          </button>
        </div>
      </div>
    </div>
  );
}
