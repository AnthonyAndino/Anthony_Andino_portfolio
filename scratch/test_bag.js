class DirectionBag {
  constructor(initialAngle = 0) {
    this.lastAngle = initialAngle;
    this.bag = [];
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  refill() {
    this.bag = this.shuffle([0, 1, 2, 3, 4, 5, 6, 7]);
  }

  nextDirection() {
    if (this.bag.length === 0) {
      this.refill();
    }

    let chosenIdx = -1;
    let chosenAngle = 0;

    for (let i = 0; i < this.bag.length; i++) {
      const sector = this.bag[i];
      const baseAngle = sector * (Math.PI / 4);
      const jitter = (Math.random() - 0.5) * (14 * Math.PI / 180);
      const angle = (baseAngle + jitter + 2 * Math.PI) % (2 * Math.PI);
      const diff = Math.min(
        Math.abs(angle - this.lastAngle),
        2 * Math.PI - Math.abs(angle - this.lastAngle)
      );
      if (diff >= (60 * Math.PI / 180)) {
        chosenIdx = i;
        chosenAngle = angle;
        break;
      }
    }

    if (chosenIdx === -1) {
      // If none match >= 60°, pick the one with max diff
      let maxDiff = -1;
      let bestIdx = 0;
      let bestAngle = 0;
      for (let i = 0; i < this.bag.length; i++) {
        const sector = this.bag[i];
        const angle = (sector * (Math.PI / 4) + 2 * Math.PI) % (2 * Math.PI);
        const diff = Math.min(
          Math.abs(angle - this.lastAngle),
          2 * Math.PI - Math.abs(angle - this.lastAngle)
        );
        if (diff > maxDiff) {
          maxDiff = diff;
          bestIdx = i;
          bestAngle = angle;
        }
      }
      chosenIdx = bestIdx;
      if (maxDiff < (60 * Math.PI / 180)) {
        chosenAngle = (this.lastAngle + Math.PI / 3 + Math.random() * 0.1) % (2 * Math.PI);
      } else {
        chosenAngle = bestAngle;
      }
    }

    this.bag.splice(chosenIdx, 1);
    this.lastAngle = chosenAngle;

    return [Math.sin(chosenAngle), Math.cos(chosenAngle), 0];
  }
}

// Test 50 iterations
const bag = new DirectionBag(0);
let violations = 0;
let prevAngle = 0;
for (let i = 0; i < 50; i++) {
  const [sx, cy] = bag.nextDirection();
  const angle = Math.atan2(sx, cy); // matches sin phi, cos phi
  const normAngle = (angle + 2 * Math.PI) % (2 * Math.PI);
  if (i > 0) {
    const diffDeg = (Math.min(
      Math.abs(normAngle - prevAngle),
      2 * Math.PI - Math.abs(normAngle - prevAngle)
    ) * 180 / Math.PI);
    if (diffDeg < 59.9) {
      console.log(`Violation at step ${i}: diff = ${diffDeg.toFixed(2)} deg`);
      violations++;
    }
  }
  prevAngle = normAngle;
}
console.log(`Test finished with ${violations} violations.`);
