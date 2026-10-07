import confetti from "canvas-confetti";

/** The bigger burst for «هدية مدونتي» — centre first, then both sides a quarter-second later. */
export function celebrateModontyGift() {
  const colors = ["#00d8d8", "#3030ff", "#ffcc66", "#ffffff"];

  confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors });
  window.setTimeout(() => {
    void confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors });
    void confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors });
  }, 250);
}
