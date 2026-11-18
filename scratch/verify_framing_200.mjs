// Framing & Behavior Verification Script

const PORTFOLIO_DB = {
  habilidades: [
    {
      id: 1,
      categoria: "Análisis y Visualización de Datos",
      habilidades: ["SQL", "Excel Intermedio", "Python para Análisis", "Power BI (Básico)", "Dashboards de KPIs", "Validación y Limpieza de Datos"],
      nivel: "Avanzado",
      tipo: "data",
    },
    {
      id: 2,
      categoria: "Bases de Datos & Modelado",
      habilidades: ["MySQL", "PostgreSQL", "Procedimientos Almacenados (Stored Procedures)", "Funciones SQL", "Prisma ORM", "Auditoría de Registros"],
      nivel: "Avanzado",
      tipo: "db",
    },
    {
      id: 3,
      categoria: "Lenguajes de Programación",
      habilidades: ["Python", "JavaScript", "TypeScript", "C#", "Node.js", "PHP", "Java", "C++", "C", "React"],
      nivel: "Intermedio",
      tipo: "prog",
    },
    {
      id: 4,
      categoria: "Herramientas y Entornos",
      habilidades: ["Git", "GitHub", "Postman", "Linux CLI", "Soporte Técnico Especializado", "Redes LAN/WAN"],
      nivel: "Intermedio",
      tipo: "tools",
    },
    {
      id: 5,
      categoria: "Competencias Profesionales",
      habilidades: ["Pensamiento Crítico", "Atención al Detalle", "Resolución de Incidencias", "Aprendizaje Continuo", "Comunicación Interdisciplinaria"],
      nivel: "Avanzado",
      tipo: "soft",
    },
    {
      id: 6,
      categoria: "Idiomas",
      habilidades: ["Español (Nativo)", "Inglés (B1 - Intermedio)"],
      nivel: "Intermedio",
      tipo: "lang",
    }
  ]
};

const CORE_SKILLS = new Set([
  'SQL',
  'Stored Procedures',
  'Procedimientos Almacenados (Stored Procedures)',
  'PostgreSQL',
  'MySQL',
  'Python para Análisis',
]);

const SKILL_DISPLAY_LABELS = {
  'Procedimientos Almacenados (Stored Procedures)': 'Stored Procedures',
  'Validación y Limpieza de Datos': 'Validación y Limpieza',
};

const GOLDEN_ANGLE = 2.3999632;

function quatNormalize(q) {
  const len = Math.hypot(q[0], q[1], q[2], q[3]);
  if (len < 0.00001) return [0, 0, 0, 1];
  return [q[0] / len, q[1] / len, q[2] / len, q[3] / len];
}

function normalizeVec(v) {
  const len = Math.hypot(v[0], v[1], v[2]);
  if (len < 0.00001) return [0, 0, 1];
  return [v[0] / len, v[1] / len, v[2] / len];
}

function crossVec(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function boxesOverlap(b1, b2, pad = 3) {
  return !(
    b1.right + pad < b2.left ||
    b1.left - pad > b2.right ||
    b1.bottom + pad < b2.top ||
    b1.top - pad > b2.bottom
  );
}

function generateNodes() {
  const hubUnitVectors = [
    [0, 0, 1],   // 1 DATA (+Z, facing user)
    [1, 0, 0],   // 2 DB (+X, right)
    [0, 1, 0],   // 3 PROG (+Y, top)
    [-1, 0, 0],  // 4 TOOLS (-X, left)
    [0, -1, 0],  // 5 SOFT (-Y, bottom)
    [0, 0, -1],  // 6 LANG (-Z, back)
  ];

  const result = [];

  PORTFOLIO_DB.habilidades.forEach((cat, idx) => {
    const hubVec = hubUnitVectors[idx];
    let up = [0, 1, 0];
    if (Math.abs(hubVec[1]) > 0.85) up = [1, 0, 0];
    const u = normalizeVec(crossVec(hubVec, up));
    const v = crossVec(hubVec, u);

    result.push({
      id: `hub-${cat.id}`,
      isHub: true,
      isCore: false,
      catId: cat.id,
      name: cat.categoria,
      displayLabel: cat.categoria,
      code: `0${cat.id} · ${cat.tipo.toUpperCase()}`,
      nivel: cat.nivel,
      baseVec: hubVec,
      projX: 0,
      projY: 0,
      projZ: 0,
      projScale: 1,
      projR: 14,
      opacity: 1,
    });

    const count = cat.habilidades.length;
    const maxAngleRad = 26 * (Math.PI / 180);
    const cosMax = Math.cos(maxAngleRad);

    cat.habilidades.forEach((skill, sIdx) => {
      const t = (sIdx + 0.5) / count;
      const cosTheta = 1 - t * (1 - cosMax);
      const sinTheta = Math.sqrt(Math.max(0, 1 - cosTheta * cosTheta));
      const phi = sIdx * GOLDEN_ANGLE;

      const sVec = [
        cosTheta * hubVec[0] + sinTheta * (Math.cos(phi) * u[0] + Math.sin(phi) * v[0]),
        cosTheta * hubVec[1] + sinTheta * (Math.cos(phi) * u[1] + Math.sin(phi) * v[1]),
        cosTheta * hubVec[2] + sinTheta * (Math.cos(phi) * u[2] + Math.sin(phi) * v[2]),
      ];

      result.push({
        id: `skill-${cat.id}-${sIdx}`,
        isHub: false,
        isCore: CORE_SKILLS.has(skill),
        catId: cat.id,
        name: skill,
        displayLabel: SKILL_DISPLAY_LABELS[skill] || skill,
        nivel: cat.nivel,
        baseVec: normalizeVec(sVec),
        projX: 0,
        projY: 0,
        projZ: 0,
        projScale: 1,
        projR: 4,
        opacity: 0,
      });
    });
  });

  return result;
}

function measureTextWidth(text, fontSize) {
  return text.length * fontSize * 0.62;
}

function testResolution(resName, screenW, screenH) {
  const width = Math.min(screenW, 1280);
  const height = Math.max(460, screenH - 170);

  const padY = 28;
  const padX = 24;
  const hubBuffer = 26;
  const maxK = 1.20;

  const maxR_H = Math.max(80, (height * 0.5 - (hubBuffer + padY)) / maxK);
  const maxR_W = Math.max(80, (width * 0.5 - (hubBuffer + padX + 80)) / maxK);
  const radius = Math.min(maxR_H, maxR_W);

  const cx = width * 0.5;
  const cy = height * 0.5;
  const camDist = 6 * radius;

  let minLeft = Infinity;
  let minRight = Infinity;
  let minTop = Infinity;
  let minBottom = Infinity;

  const nodes = generateNodes();

  for (let rotIdx = 0; rotIdx < 200; rotIdx++) {
    const u1 = Math.random();
    const u2 = Math.random();
    const u3 = Math.random();
    const q = [
      Math.sqrt(1 - u1) * Math.sin(2 * Math.PI * u2),
      Math.sqrt(1 - u1) * Math.cos(2 * Math.PI * u2),
      Math.sqrt(u1) * Math.sin(2 * Math.PI * u3),
      Math.sqrt(u1) * Math.cos(2 * Math.PI * u3),
    ];

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

    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const rx = r00 * n.baseVec[0] + r01 * n.baseVec[1] + r02 * n.baseVec[2];
      const ry = r10 * n.baseVec[0] + r11 * n.baseVec[1] + r12 * n.baseVec[2];
      const rz = r20 * n.baseVec[0] + r21 * n.baseVec[1] + r22 * n.baseVec[2];

      const pScale = camDist / (camDist - rz * radius);
      n.projX = cx + rx * radius * pScale;
      n.projY = cy - ry * radius * pScale;
      n.projZ = rz;
      n.projScale = pScale;
      n.projR = n.isHub ? Math.max(7, 13 * pScale) : (n.isCore ? 5.2 : 3.8) * pScale;

      const nodeBox = {
        left: n.projX - n.projR - (n.isHub ? 5 : 0),
        right: n.projX + n.projR + (n.isHub ? 5 : 0),
        top: n.projY - n.projR - (n.isHub ? 5 : 0),
        bottom: n.projY + n.projR + (n.isHub ? 5 : 0),
      };

      minLeft = Math.min(minLeft, nodeBox.left);
      minRight = Math.min(minRight, width - nodeBox.right);
      minTop = Math.min(minTop, nodeBox.top);
      minBottom = Math.min(minBottom, height - nodeBox.bottom);
    }

    const fixedObstacles = [];
    nodes.filter((n) => n.isHub).forEach((hub) => {
      fixedObstacles.push({
        left: hub.projX - hub.projR - 5,
        right: hub.projX + hub.projR + 5,
        top: hub.projY - hub.projR - 5,
        bottom: hub.projY + hub.projR + 5,
      });

      const labelText = hub.code || hub.name;
      const fontSize = Math.max(11, Math.round(11 * Math.min(1.2, hub.projScale)));
      const textW = measureTextWidth(labelText, fontSize);
      const textH = fontSize + 4;
      const labelY = hub.projY < cy ? hub.projY + hub.projR + 10 : hub.projY - hub.projR - 10;
      const labelX = hub.projX;

      const hubLabelBox = {
        left: labelX - textW / 2 - 3,
        right: labelX + textW / 2 + 3,
        top: labelY - textH / 2,
        bottom: labelY + textH / 2,
      };

      fixedObstacles.push(hubLabelBox);

      minLeft = Math.min(minLeft, hubLabelBox.left);
      minRight = Math.min(minRight, width - hubLabelBox.right);
      minTop = Math.min(minTop, hubLabelBox.top);
      minBottom = Math.min(minBottom, height - hubLabelBox.bottom);
    });

    const nodeObstacles = nodes.map((n) => ({
      left: n.projX - n.projR - 3,
      right: n.projX + n.projR + 3,
      top: n.projY - n.projR - 3,
      bottom: n.projY + n.projR + 3,
    }));

    const sortedNodes = [...nodes].sort((a, b) => a.projZ - b.projZ);
    const candidates = sortedNodes.filter((n) => !n.isHub && n.projZ > -0.15);
    const acceptedSkillBoxes = [];

    candidates.forEach((node) => {
      const labelText = node.displayLabel;
      const fontSize = Math.max(11, Math.round(11 * Math.min(1.2, node.projScale)));
      const textWidth = measureTextWidth(labelText, fontSize);
      const textHeight = fontSize + 4;

      const parentHub = nodes.find((n) => n.isHub && n.catId === node.catId);
      const hubX = parentHub ? parentHub.projX : cx;
      const preferredSide = node.projX >= hubX ? 'right' : 'left';

      const createBBox = (side) => {
        const labelX = side === 'right' ? node.projX + node.projR + 6 : node.projX - node.projR - 6;
        const left = side === 'right' ? labelX - 2 : labelX - textWidth - 2;
        const right = side === 'right' ? labelX + textWidth + 2 : labelX + 2;
        return {
          box: {
            left,
            right,
            top: node.projY - textHeight / 2,
            bottom: node.projY + textHeight / 2,
          },
        };
      };

      let candidate = createBBox(preferredSide);
      let inBounds =
        candidate.box.left >= 16 &&
        candidate.box.right <= width - 16 &&
        candidate.box.top >= 16 &&
        candidate.box.bottom <= height - 16;

      const collides = (box) => {
        for (let i = 0; i < fixedObstacles.length; i++) {
          if (boxesOverlap(box, fixedObstacles[i])) return true;
        }
        for (let i = 0; i < nodeObstacles.length; i++) {
          if (Math.abs(nodeObstacles[i].left - (node.projX - node.projR - 3)) < 1) continue;
          if (boxesOverlap(box, nodeObstacles[i])) return true;
        }
        for (let i = 0; i < acceptedSkillBoxes.length; i++) {
          if (boxesOverlap(box, acceptedSkillBoxes[i])) return true;
        }
        return false;
      };

      let hasCollision = !inBounds || collides(candidate.box);
      if (hasCollision) {
        const oppSide = preferredSide === 'right' ? 'left' : 'right';
        const oppCandidate = createBBox(oppSide);
        const oppInBounds =
          oppCandidate.box.left >= 16 &&
          oppCandidate.box.right <= width - 16 &&
          oppCandidate.box.top >= 16 &&
          oppCandidate.box.bottom <= height - 16;
        if (oppInBounds && !collides(oppCandidate.box)) {
          candidate = oppCandidate;
          hasCollision = false;
        }
      }

      if (!hasCollision) {
        acceptedSkillBoxes.push(candidate.box);
        minLeft = Math.min(minLeft, candidate.box.left);
        minRight = Math.min(minRight, width - candidate.box.right);
        minTop = Math.min(minTop, candidate.box.top);
        minBottom = Math.min(minBottom, height - candidate.box.bottom);
      }
    });
  }

  return {
    Resolucion: resName,
    'Ancho (px)': width,
    'Alto (px)': height,
    'Radio (px)': Math.round(radius),
    'Holgura Sup (px)': Math.round(minTop),
    'Holgura Inf (px)': Math.round(minBottom),
    'Holgura Izq (px)': Math.round(minLeft),
    'Holgura Der (px)': Math.round(minRight),
    'Todo >= 16px': minLeft >= 16 && minRight >= 16 && minTop >= 16 && minBottom >= 16 ? 'SI (PASADO)' : 'NO',
  };
}

console.log('--- 1. PRUEBA DE ENCUADRE EN 200 ORIENTACIONES 3D ALEATORIAS ---');
const resList = [
  ['1280×720', 1280, 720],
  ['1366×768', 1366, 768],
  ['1440×900', 1440, 900],
  ['1920×1080', 1920, 1080],
];
const results = resList.map(([name, w, h]) => testResolution(name, w, h));
console.table(results);

// --- 2. DRAG SIMULATIONS IN 8 DIRECTIONS ---
console.log('\n--- 2. SIMULACIÓN DE ARRASTRE EN 8 DIRECCIONES ---');
const dragTests = [
  { name: 'Derecha (0°)', dx: 100, dy: 0 },
  { name: 'Diagonal Abajo-Der (45°)', dx: 70.7, dy: 70.7 },
  { name: 'Abajo (90°)', dx: 0, dy: 100 },
  { name: 'Diagonal Abajo-Izq (135°)', dx: -70.7, dy: 70.7 },
  { name: 'Izquierda (180°)', dx: -100, dy: 0 },
  { name: 'Diagonal Arriba-Izq (225°)', dx: -70.7, dy: -70.7 },
  { name: 'Arriba (270°)', dx: 0, dy: -100 },
  { name: 'Diagonal Arriba-Der (315°)', dx: 70.7, dy: -70.7 },
];

dragTests.forEach((t) => {
  const speed = Math.hypot(t.dx, t.dy);
  const axis = [t.dy / speed, t.dx / speed, 0];
  console.log(`${t.name.padEnd(30)} -> Eje rotación: [${axis[0].toFixed(3)}, ${axis[1].toFixed(3)}, ${axis[2].toFixed(3)}]`);
});

// --- 3. SHORT DRAG CHECK ---
console.log('\n--- 3. VERIFICACIÓN DE ARRASTRE CORTO (< 20px o < 0.08 px/ms) ---');
const currentAxis = [0, 0.989, 0.148];
function processDragRelease(totalDist, dt, dx, dy, existingAxis) {
  const v = Math.hypot(dx, dy) / Math.max(1, dt);
  if (totalDist < 20 || v < 0.08) {
    return { changed: false, axis: existingAxis, v };
  }
  const speed = Math.hypot(dx, dy);
  return { changed: true, axis: [dy / speed, dx / speed, 0], v };
}

const testShort = processDragRelease(15, 100, 15, 0, currentAxis);
console.log(`Arrastre 15px (< 20px): changed = ${testShort.changed} (conserva eje actual: ${testShort.axis})`);

const testSlow = processDragRelease(30, 500, 30, 0, currentAxis);
console.log(`Arrastre 30px en 500ms (v = ${testSlow.v.toFixed(3)} px/ms < 0.08): changed = ${testSlow.changed} (conserva eje actual)`);

const testValid = processDragRelease(50, 100, 50, 0, currentAxis);
console.log(`Arrastre 50px en 100ms (v = ${testValid.v.toFixed(3)} px/ms >= 0.08): changed = ${testValid.changed} -> nuevo eje: [${testValid.axis.map(n => n.toFixed(3)).join(', ')}]`);

// --- 4. CLICK VS DRAG DISTINCTION (< 5px) ---
console.log('\n--- 4. DISTINCIÓN CLIC VS ARRASTRE (< 5px) ---');
console.log(`Movimiento de 3px -> ${3 < 5 ? 'CLIC / TAP (selecciona o deselecciona categoría)' : 'ARRASTRE'}`);
console.log(`Movimiento de 7px -> ${7 < 5 ? 'CLIC / TAP' : 'ARRASTRE (gira la esfera)'}`);
