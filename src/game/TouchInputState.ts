// Shared bridge between the React touch UI (TouchControls) and the Phaser
// Player entity. React writes to this on touch events, Player.update() reads
// it every frame alongside keyboard/mouse - on desktop it just stays neutral
// and never affects anything.
export const touchInput = {
  moveX: 0,
  moveY: 0,
  firing: false,
  dashRequested: false,
};
