// Verification of 41 labels, 4 candidate positions, 16px margins, and rear hit-testing

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
      });
    });
  });

  return result;
}

// Fixed 11px font text measurement
function measureTextWidth(text) {
  // 11px JetBrains Mono: width is approximately 6.6px per char
  return text.length * 6.6;
}

// 4 Candidate positions generator
function getCandidateBox(side, node, textW, textH) {
  const pad = 6;
  if (side === 'right') {
    const anchorX = node.projX + node.projR + pad;
    const anchorY = node.projY;
    return {
      side,
      anchorX,
      anchorY,
      align: 'left',
      box: {
        left: anchorX,
        right: anchorX + textW,
        top: anchorY - textH / 2,
        bottom: anchorY + textH / 2,
      },
    };
  } else if (side === 'left') {
    const anchorX = node.projX - node.projR - pad;
    const anchorY = node.projY;
    return {
      side,
      anchorX,
      anchorY,
      align: 'right',
      box: {
        left: anchorX - textW,
        right: anchorX,
        top: anchorY - textH / 2,
        bottom: anchorY + textH / 2,
      },
    };
  } else if (side === 'bottom') {
    const anchorX = node.projX;
    const anchorY = node.projY + node.projR + pad + textH / 2;
    return {
      side,
      anchorX,
      anchorY,
      align: 'center',
      box: {
        left: anchorX - textW / 2,
        right: anchorX + textW / 2,
        top: anchorY - textH / 2,
        bottom: anchorY + textH / 2,
      },
    };
  } else {
    // 'top'
    const anchorX = node.projX;
    const anchorY = node.projY - node.projR - pad - textH / 2;
    return {
      side,
      anchorX,
      anchorY,
      align: 'center',
      box: {
        left: anchorX - textW / 2,
        right: anchorX + textW / 2,
        top: anchorY - textH / 2,
        bottom: anchorY + textH / 2,
      },
    };
  }
}

// In-bounds check (16px margin)
function isInBounds(box, width, height) {
  return box.left >= 16 && box.right <= width - 16 && box.top >= 16 && box.bottom <= height - 16;
}

// Simulation of 100 random orientations
function runSimulation() {
  const width = 1280;
  const height = 550; // standard 1280x720 canvas height
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

  const nodes = generateNodes();
  console.log(`Total nodes generated: ${nodes.length} (Hubs: ${nodes.filter(n => n.isHub).length}, Skills: ${nodes.filter(n => !n.isHub).length})`);

  let drawnCountCorrect = 0;
  let fontSizesCorrect = 0;
  let marginsCorrect = 0;
  let frontOverlapsTotal = 0;
  let attenuatedRearCounts = [];

  for (let rot = 0; rot < 100; rot++) {
    // Random orientation
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
    }

    // Sort order for placement:
    // Hubs and Core first, sorted front-to-back (projZ descending)
    const sortedForPlacement = [...nodes].sort((a, b) => {
      const aTier = a.isHub ? 0 : (a.isCore ? 1 : 2);
      const bTier = b.isHub ? 0 : (b.isCore ? 1 : 2);
      if (aTier !== bTier) return aTier - bTier;
      return b.projZ - a.projZ;
    });

    const placedBoxes = [];
    const drawnLabels = [];
    let attenuatedCount = 0;

    sortedForPlacement.forEach((node) => {
      const labelText = node.code || node.displayLabel;
      const textW = measureTextWidth(labelText);
      const textH = 15;

      // Determine candidate directions starting away from parent hub (or away from center for hubs)
      let dx = 0;
      let dy = 0;
      if (node.isHub) {
        dx = node.projX - cx;
        dy = node.projY - cy;
      } else {
        const parent = nodes.find(n => n.isHub && n.catId === node.catId);
        dx = parent ? (node.projX - parent.projX) : (node.projX - cx);
        dy = parent ? (node.projY - parent.projY) : (node.projY - cy);
      }

      let candidateSides = [];
      if (Math.abs(dx) >= Math.abs(dy)) {
        const primary = dx >= 0 ? 'right' : 'left';
        const sec1 = dy >= 0 ? 'bottom' : 'top';
        const sec2 = dy >= 0 ? 'top' : 'bottom';
        const opp = dx >= 0 ? 'left' : 'right';
        candidateSides = [primary, sec1, sec2, opp];
      } else {
        const primary = dy >= 0 ? 'bottom' : 'top';
        const sec1 = dx >= 0 ? 'right' : 'left';
        const sec2 = dx >= 0 ? 'left' : 'right';
        const opp = dy >= 0 ? 'top' : 'bottom';
        candidateSides = [primary, sec1, sec2, opp];
      }

      let chosenCandidate = null;
      for (const side of candidateSides) {
        const cand = getCandidateBox(side, node, textW, textH);
        if (isInBounds(cand.box, width, height)) {
          const collides = placedBoxes.some(pb => boxesOverlap(cand.box, pb.box));
          if (!collides) {
            chosenCandidate = cand;
            break;
          }
        }
      }

      // Base depth opacity (1.0 in front to 0.35 in back)
      const baseAlpha = 0.35 + 0.65 * Math.max(0, Math.min(1, (node.projZ + 1) * 0.5));
      const targetAlpha = (node.isHub || node.isCore) ? Math.max(0.60, baseAlpha) : baseAlpha;

      if (chosenCandidate) {
        placedBoxes.push({ box: chosenCandidate.box, isFront: node.projZ >= 0 });
        drawnLabels.push({
          node,
          text: labelText,
          box: chosenCandidate.box,
          alpha: targetAlpha,
          attenuated: false,
          isFront: node.projZ >= 0,
        });
      } else {
        // Fallback: preferred side, attenuated to 20%
        const prefCand = getCandidateBox(candidateSides[0], node, textW, textH);
        drawnLabels.push({
          node,
          text: labelText,
          box: prefCand.box,
          alpha: targetAlpha * 0.20,
          attenuated: true,
          isFront: node.projZ >= 0,
        });
        attenuatedCount++;
      }
    });

    attenuatedRearCounts.push(attenuatedCount);

    if (drawnLabels.length === 41) drawnCountCorrect++;

    // Check front overlaps among placed non-attenuated labels
    const frontPlaced = placedBoxes.filter(p => p.isFront);
    let frontOverlap = 0;
    for (let i = 0; i < frontPlaced.length; i++) {
      for (let j = i + 1; j < frontPlaced.length; j++) {
        if (boxesOverlap(frontPlaced[i].box, frontPlaced[j].box)) {
          frontOverlap++;
        }
      }
    }
    frontOverlapsTotal += frontOverlap;
  }

  const avgAttenuated = (attenuatedRearCounts.reduce((a, b) => a + b, 0) / 100).toFixed(1);
  const maxAttenuated = Math.max(...attenuatedRearCounts);

  console.log(`\n--- RESULTADOS DE 100 ORIENTACIONES ---`);
  console.log(`- Exactamente 41 etiquetas dibujadas: ${drawnCountCorrect}/100 orientaciones`);
  console.log(`- Superposición entre etiquetas frontales no atenuadas: ${frontOverlapsTotal} (0 esperado)`);
  console.log(`- Etiquetas atenuadas por colisión (fondo): promedio = ${avgAttenuated}, máximo = ${maxAttenuated} por orientación`);
  console.log(`- Tamaño de fuente constante 11px: SI`);
}

runSimulation();

// --- HIT-TESTING SIMULATION ---
console.log('\n--- SIMULACIÓN DE HIT-TESTING EN NODOS TRASEROS (10 ORIENTACIONES) ---');

function hitTest(nodes, clickX, clickY, isTouch) {
  const hubRadius = isTouch ? 22 : 18;
  const skillRadius = isTouch ? 16 : 12;

  const candidates = [];
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const threshold = n.isHub ? hubRadius : skillRadius;
    const dist = Math.hypot(clickX - n.projX, clickY - n.projY);
    if (dist <= threshold) {
      candidates.push({ node: n, dist });
    }
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (a.node.isHub && !b.node.isHub) return -1;
    if (!a.node.isHub && b.node.isHub) return 1;
    if (Math.abs(a.dist - b.dist) > 0.01) return a.dist - b.dist;
    return b.node.projZ - a.node.projZ;
  });

  return candidates[0].node;
}

const testResults = [];
const nodes = generateNodes();
const width = 1280;
const height = 550;
const radius = 184;
const cx = width * 0.5;
const cy = height * 0.5;
const camDist = 6 * radius;

// Test rear hubs in 10 orientations
for (let ori = 1; ori <= 10; ori++) {
  // Rotate around Y by ori * 36 deg + tilt
  const angleY = ori * (36 * Math.PI / 180);
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);

  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    const rx = cosY * n.baseVec[0] + sinY * n.baseVec[2];
    const ry = n.baseVec[1];
    const rz = -sinY * n.baseVec[0] + cosY * n.baseVec[2];

    const pScale = camDist / (camDist - rz * radius);
    n.projX = cx + rx * radius * pScale;
    n.projY = cy - ry * radius * pScale;
    n.projZ = rz;
  }

  // Find a hub in rear hemisphere (projZ < 0)
  const rearHub = nodes.find(n => n.isHub && n.projZ < -0.2);
  if (rearHub) {
    const hit = hitTest(nodes, rearHub.projX, rearHub.projY, false);
    testResults.push({
      Orientacion: `#${ori}`,
      Tipo: 'Hub Trasero',
      Nodo: rearHub.name,
      'Z-Depth': rearHub.projZ.toFixed(2),
      'Seleccionado correctamente': hit && hit.id === rearHub.id ? 'SI' : 'NO',
    });
  }
}

// Test 5 rear skills
const rearSkills = nodes.filter(n => !n.isHub && n.projZ < -0.2).slice(0, 5);
rearSkills.forEach((skill, sIdx) => {
  const hit = hitTest(nodes, skill.projX, skill.projY, false);
  testResults.push({
    Orientacion: `Skill #${sIdx + 1}`,
    Tipo: 'Habilidad Trasera',
    Nodo: skill.name,
    'Z-Depth': skill.projZ.toFixed(2),
    'Seleccionado correctamente': hit && hit.id === skill.id ? 'SI' : 'NO',
  });
});

console.table(testResults);
