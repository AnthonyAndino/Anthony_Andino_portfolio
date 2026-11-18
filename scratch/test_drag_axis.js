// Test rotation axis calculation from drag delta and 8-sector shuffled bag
function getAxisFromDrag(dx, dy) {
  // Screen displacement: dx is horizontal (right > 0), dy is vertical (down > 0 in canvas)
  // When dragging right (dx > 0, dy = 0), front of sphere moves right:
  // Rotation around vertical axis Y.
  // In our coordinate system:
  // screenX = cx + rx * radius * scale
  // screenY = cy - ry * radius * scale (canvas Y is inverted relative to ry)
  // Let's verify rotation:
  // A positive rotation around axis A rotates vector V by dq:
  // If axis is [0, 1, 0] (up in 3D, which is -Y in canvas):
  // (0, 0, 1) rotates towards (1, 0, 0), so screenX increases (moves right).
  // Therefore:
  // dx > 0 -> axisY > 0
  // dy > 0 (dragging down) -> front moves down in canvas -> ry decreases -> (0, 0, 1) rotates towards (0, -1, 0)
  // Rotation around X axis:
  // If axis is [-1, 0, 0]: rotates (0, 0, 1) towards (0, -1, 0) in 3D, so screenY increases (moves down).
  const len = Math.hypot(dx, dy);
  if (len < 0.0001) return [0, 1, 0];
  // Axis perpendicular to (dx, -dy) in 3D coordinates:
  // displacement in 3D is [dx, -dy, 0]
  // axis in 3D = [-dy, -dx, 0] ? Let's check cross([0, 0, 1], [dx, -dy, 0]) = [dy, dx, 0]
  // Let's test with cross product:
  // To move from (0,0,1) in direction (dx, -dy, 0), rotation axis is:
  // (0, 0, 1) x (dx, -dy, 0) = [dy, dx, 0]
  return [dy / len, dx / len, 0];
}

console.log("Drag Right (10, 0):", getAxisFromDrag(10, 0));
console.log("Drag Left (-10, 0):", getAxisFromDrag(-10, 0));
console.log("Drag Down (0, 10):", getAxisFromDrag(0, 10));
console.log("Drag Up (0, -10):", getAxisFromDrag(0, -10));
console.log("Drag Diagonal Up-Right (10, -10):", getAxisFromDrag(10, -10));
