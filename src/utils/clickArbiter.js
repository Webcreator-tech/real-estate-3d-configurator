let lastClickTime = 0;
let pendingSelectionTimer = null;
const DOUBLE_CLICK_MS = 300;

export const clickArbiter = {
  // Called on each canvas pointerdown. Returns true if a double‑click is detected.
  // Cancels any pending selection timer when a double‑click occurs.
  registerPointerDown() {
    const now = Date.now();
    const isDouble = now - lastClickTime <= DOUBLE_CLICK_MS;
    if (isDouble) {
      // Cancel pending single‑click actions.
      if (pendingSelectionTimer) {
        clearTimeout(pendingSelectionTimer);
        pendingSelectionTimer = null;
      }
    }
    lastClickTime = now;
    return isDouble;
  },

  // Schedule a single‑click action (e.g., wall/furniture selection) after the double‑click window.
  scheduleWallSelection(selectCallback) {
    // Clear any previous timer.
    if (pendingSelectionTimer) {
      clearTimeout(pendingSelectionTimer);
    }
    pendingSelectionTimer = setTimeout(() => {
      pendingSelectionTimer = null;
      selectCallback();
    }, DOUBLE_CLICK_MS);
  },

  // Explicitly cancel a pending selection (e.g., when a double‑click was recognized).
  cancelPendingSelection() {
    if (pendingSelectionTimer) {
      clearTimeout(pendingSelectionTimer);
      pendingSelectionTimer = null;
    }
  },
};

