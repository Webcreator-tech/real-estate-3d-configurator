// High-performance shared input state for mobile walkthrough controls
export const TAP_THRESHOLD = 10; // pixels: minimum movement to classify as look drag vs tap

export const mobileWalkthroughInput = {
  move: { x: 0, y: 0 }, // x = strafe (-1 to 1), y = forward/back (-1 to 1)
  lookDelta: { x: 0, y: 0 },
};
