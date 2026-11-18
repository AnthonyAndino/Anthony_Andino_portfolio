// Test depth opacity curve
function getDepthAlpha(rz, isBold) {
  const t = Math.max(0, Math.min(1, (rz + 1) * 0.5));
  const curve = Math.pow(t, 1.35);
  const baseAlpha = 0.12 + 0.88 * curve;
  return isBold ? Math.min(1.0, Math.max(0.20, baseAlpha * 1.15)) : baseAlpha;
}

const zValues = [1.0, 0.8, 0.5, 0.2, 0.0, -0.2, -0.5, -0.8, -1.0];
console.log('Z-Depth | Skill Alpha | Hub Alpha');
console.log('---------------------------------');
zValues.forEach(z => {
  const skillA = getDepthAlpha(z, false).toFixed(2);
  const hubA = getDepthAlpha(z, true).toFixed(2);
  console.log(`${z.toFixed(1).padStart(7)} | ${skillA.padStart(11)} | ${hubA.padStart(9)}`);
});
