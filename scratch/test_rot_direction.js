function quatFromAxisAngle(axis, angle) {
  const half = angle * 0.5;
  const s = Math.sin(half);
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(half)];
}

function rotateVec(q, v) {
  const [qx, qy, qz, qw] = q;
  const r00 = 1 - 2 * (qy * qy + qz * qz);
  const r01 = 2 * (qx * qy - qz * qw);
  const r02 = 2 * (qx * qz + qy * qw);
  const r10 = 2 * (qx * qy + qz * qw);
  const r11 = 1 - 2 * (qx * qx + qz * qz);
  const r12 = 2 * (qy * qz - qx * qw);
  const r20 = 2 * (qx * qz - qy * qw);
  const r21 = 2 * (qy * qz + qx * qw);
  const r22 = 1 - 2 * (qx * qx + qy * qy);

  return [
    r00 * v[0] + r01 * v[1] + r02 * v[2],
    r10 * v[0] + r11 * v[1] + r12 * v[2],
    r20 * v[0] + r21 * v[1] + r22 * v[2],
  ];
}

const vFront = [0, 0, 1];

// Test Drag Right (dx > 0, dy = 0) -> axis [0, 1, 0]
const qRight = quatFromAxisAngle([0, 1, 0], 0.1);
const vRotRight = rotateVec(qRight, vFront);
console.log("Drag Right -> Rotated front point:", vRotRight);
// Notice: vRotRight[0] is positive (+X in 3D is right on screen!). Exactly matches drag!

// Test Drag Up (dx = 0, dy = -10) -> axis [-1, 0, 0]
const qUp = quatFromAxisAngle([-1, 0, 0], 0.1);
const vRotUp = rotateVec(qUp, vFront);
console.log("Drag Up -> Rotated front point:", vRotUp);
// In 3D: screenY = cy - ry * radius.
// If vRotUp[1] is positive (+Y in 3D), screenY = cy - positive = goes UP on screen!
// And vRotUp[1] is 0.0998 > 0! Exactly matches drag up!

// Test Drag Down (dx = 0, dy = 10) -> axis [1, 0, 0]
const qDown = quatFromAxisAngle([1, 0, 0], 0.1);
const vRotDown = rotateVec(qDown, vFront);
console.log("Drag Down -> Rotated front point:", vRotDown);
// vRotDown[1] is -0.0998 < 0 -> screenY goes DOWN on screen! Exactly matches drag down!

// Test Drag Diagonal Up-Right (dx = 10, dy = -10) -> axis [-0.707, 0.707, 0]
const qDiag = quatFromAxisAngle([-0.7071, 0.7071, 0], 0.1);
const vRotDiag = rotateVec(qDiag, vFront);
console.log("Drag Up-Right -> Rotated front point:", vRotDiag);
// vRotDiag[0] > 0 (right) and vRotDiag[1] > 0 (up)! Exactly matches drag up-right!
