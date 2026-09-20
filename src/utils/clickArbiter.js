let lastClickTime = 0;
let pendingSelectionTimer = null;
let suppressNextSelection = false;
const DOUBLE_CLICK_MS = 300;

export const clickArbiter = {
  // Called on each canvas pointerdown. Returns true if a double‑click is detected.
  // When a double‑click occurs, it cancels any pending single-click selection and
  // flags that the incoming selection event from this second click must be suppressed.
  registerPointerDown() {
    const now = Date.now();
    const isDouble = now - lastClickTime <= DOUBLE_CLICK_MS;
    if (isDouble) {
      // Cancel pending single‑click action from the first click
      if (pendingSelectionTimer) {
        clearTimeout(pendingSelectionTimer);
        pendingSelectionTimer = null;
      }
      // Flag to suppress the selection triggered by this second click
      suppressNextSelection = true;
    } else {
      // New distinct click sequence - ensure suppress flag is reset
      suppressNextSelection = false;
    }
    lastClickTime = now;
    return isDouble;
  },

  // Schedule a single‑click action (e.g., wall/furniture selection) after the double‑click window.
  // If the current click was part of a double-click, it is suppressed.
  scheduleWallSelection(selectCallback) {
    if (suppressNextSelection) {
      suppressNextSelection = false;
      return;
    }

    // Clear any previous timer
    if (pendingSelectionTimer) {
      clearTimeout(pendingSelectionTimer);
    }

    pendingSelectionTimer = setTimeout(() => {
      pendingSelectionTimer = null;
      selectCallback();
    }, DOUBLE_CLICK_MS);
  },

  // Explicitly cancel a pending selection (e.g., when a double‑click was recognized or unmounted).
  cancelPendingSelection() {
    if (pendingSelectionTimer) {
      clearTimeout(pendingSelectionTimer);
      pendingSelectionTimer = null;
    }
  },

  // Reset all state (mode changes, unmount, etc.)
  reset() {
    if (pendingSelectionTimer) {
      clearTimeout(pendingSelectionTimer);
      pendingSelectionTimer = null;
    }
    lastClickTime = 0;
    suppressNextSelection = false;
  },
};

