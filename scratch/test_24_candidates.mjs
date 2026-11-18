// Complete placement and verification test

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
  'Soporte Técnico Especializado': 'Soporte Técnico',
  'Comunicación Interdisciplinaria': 'Comunicación',
  'Validación y Limpieza de Datos': 'Validación y Limpieza',
  'Inglés (B1 - Intermedio)': 'Inglés (B1)',
  'Resolución de Incidencias': 'Incidencias',
  'Auditoría de Registros': 'Auditoría',
  'Procedimientos Almacenados (Stored Procedures)': 'Stored Procedures',
};

const GOLDEN_ANGLE = 2.3999632;

function smoothstep(min, max, value) {
  const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
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

function boxesOverlap(b1, b2, pad = 2) {
  return !(
    b1.right + pad < b2.left ||
    b1.left - pad > b2.right ||
    b1.bottom + pad < b2.top ||
    b1.top - pad > b2.bottom
  );
}

function generateNodes() {
  const hubUnitVectors = [
    [0, 0, 1],   // 1 DATA
    [1, 0, 0],   // 2 DB
    [0, 1, 0],   // 3 PROG
    [-1, 0, 0],  // 4 TOOLS
    [0, -1, 0],  // 5 SOFT
    [0, 0, -1],  // 6 LANG
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

// 8 Directions
const BASE_DIRS = [
  { dx: 1, dy: 0 },
  { dx: 0.707, dy: -0.707 },
  { dx: 0, dy: -1 },
  { dx: -0.707, dy: -0.707 },
  { dx: -1, dy: 0 },
  { dx: -0.707, dy: 0.707 },
  { dx: 0, dy: 1 },
  { dx: 0.707, dy: 0.707 },
];

function getCandidatePositions(node, targetAngle, isCore, textW, textH) {
  // Sort 8 directions by angular difference to targetAngle
  const sortedDirs = [...BASE_DIRS].sort((a, b) => {
    const angA = Math.atan2(a.dy, a.dx);
    const angB = Math.atan2(b.dy, b.dx);
    const diffA = Math.abs(Math.atan2(Math.sin(angA - targetAngle), Math.cos(angA - targetAngle)));
    const diffB = Math.abs(Math.atan2(Math.sin(angB - targetAngle), Math.cos(angB - targetAngle)));
    return diffA - diffB;
  });

  const distances = isCore ? [6, 22, 38, 56] : [6, 22, 38];
  const candidates = [];

  for (const dist of distances) {
    for (const dir of sortedDirs) {
      const nodeR = node.projR;
      const lx = node.projX + dir.dx * (nodeR + dist);
      const ly = node.projY + dir.dy * (nodeR + dist);

      let align = 'center';
      let left = lx - textW / 2;
      let right = lx + textW / 2;
      if (dir.dx > 0.35) {
        align = 'left';
        left = lx;
        right = lx + textW;
      } else if (dir.dx < -0.35) {
        align = 'right';
        left = lx - textW;
        right = lx;
      }

      candidates.push({
        dist,
        dir,
        anchorX: lx,
        anchorY: ly,
        align,
        box: {
          left,
          right,
          top: ly - textH / 2,
          bottom: ly + textH / 2,
        },
      });
    }
  }

  return candidates;
}

// Check 100 random orientations in each resolution
const resList = [
  ['1280×720', 1280, 550],
  ['1366×768', 1280, 598],
  ['1440×900', 1280, 730],
  ['1920×1080', 1280, 910],
];

console.log('Testing 100 orientations across 4 desktop resolutions with 24 candidates + obstacles:');

resList.forEach(([resName, width, height]) => {
  const padY = 32;
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
  let correct41Total = 0;
  let overlapsOverHalfTotal = 0;
  let coreOverlapsTotal = 0;
  let hubTextCoveredTotal = 0;
  let outOfBoundsTotal = 0;
  const attenuatedCounts = [];

  for (let rot = 0; rot < 100; rot++) {
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

    // Hub Labels placed first
    const hubLabelBoxes = [];
    nodes.filter(n => n.isHub).forEach(hub => {
      const labelText = hub.code;
      const textW = labelText.length * 6.6;
      const textH = 15;
      const labelY = hub.projY + hub.projR + 12;
      const hubBox = {
        left: hub.projX - textW / 2,
        right: hub.projX + textW / 2,
        top: labelY - textH / 2,
        bottom: labelY + textH / 2,
      };
      hubLabelBoxes.push(hubBox);
    });

    // Node circles as obstacles
    const nodeObstacles = nodes.map(n => ({
      left: n.projX - n.projR - 3,
      right: n.projX + n.projR + 3,
      top: n.projY - n.projR - 3,
      bottom: n.projY + n.projR + 3,
    }));

    // Placement order: Hubs, then Core skills, then rest by depth (projZ descending)
    const skillsToPlace = nodes.filter(n => !n.isHub).sort((a, b) => {
      if (a.isCore && !b.isCore) return -1;
      if (!a.isCore && b.isCore) return 1;
      return b.projZ - a.projZ;
    });

    const placedLabels = [];
    let attCount = 0;

    skillsToPlace.forEach(node => {
      const labelText = node.displayLabel;
      const textW = labelText.length * 6.6;
      const textH = 15;

      const parentHub = nodes.find(n => n.isHub && n.catId === node.catId);
      const targetAngle = parentHub
        ? Math.atan2(node.projY - parentHub.projY, node.projX - parentHub.projX)
        : Math.atan2(node.projY - cy, node.projX - cx);

      const candidates = getCandidatePositions(node, targetAngle, node.isCore, textW, textH);

      // Opacity with smoothstep
      const minA = node.isCore ? 0.30 : 0.10;
      const sStep = smoothstep(-0.05, 0.55, node.projZ);
      let alpha = minA + (1 - minA) * sStep;

      let chosen = null;
      for (const cand of candidates) {
        // In-bounds
        if (
          cand.box.left < 16 ||
          cand.box.right > width - 16 ||
          cand.box.top < 16 ||
          cand.box.bottom > height - 16
        ) {
          continue;
        }

        // Must not cover any hub label
        if (hubLabelBoxes.some(hl => boxesOverlap(cand.box, hl, 3))) {
          continue;
        }

        // Must not cover visible node circles
        if (nodeObstacles.some(no => boxesOverlap(cand.box, no, 2))) {
          continue;
        }

        // Must not overlap any already placed label with opacity >= 0.5
        const collidesActive = placedLabels.some(
          pl => pl.alpha >= 0.5 && boxesOverlap(cand.box, pl.box, 3)
        );
        if (collidesActive) continue;

        // If core, must not overlap ANY other placed core label
        if (node.isCore && placedLabels.some(pl => pl.isCore && boxesOverlap(cand.box, pl.box, 3))) {
          continue;
        }

        chosen = cand;
        break;
      }

      if (chosen) {
        placedLabels.push({
          node,
          isCore: node.isCore,
          box: chosen.box,
          alpha,
        });
      } else {
        // Fallback: preferred candidate (first), attenuated <= 0.20
        const fallback = candidates[0];
        alpha = Math.min(0.20, alpha);
        placedLabels.push({
          node,
          isCore: node.isCore,
          box: fallback.box,
          alpha,
        });
        attCount++;
      }
    });

    attenuatedCounts.push(attCount);
    if (placedLabels.length + hubLabelBoxes.length === 41) correct41Total++;

    // Check guarantees:
    // Guarantee 1: Never overlap two labels with opacity >= 0.5
    const overHalf = placedLabels.filter(pl => pl.alpha >= 0.5);
    for (let i = 0; i < overHalf.length; i++) {
      for (let j = i + 1; j < overHalf.length; j++) {
        if (boxesOverlap(overHalf[i].box, overHalf[j].box, 2)) {
          overlapsOverHalfTotal++;
        }
      }
    }

    // Guarantee 2: Core skill labels never overlap each other nor any hub label
    const cores = placedLabels.filter(pl => pl.isCore);
    for (let i = 0; i < cores.length; i++) {
      for (let j = i + 1; j < cores.length; j++) {
        if (boxesOverlap(cores[i].box, cores[j].box, 2)) coreOverlapsTotal++;
      }
      for (let h = 0; h < hubLabelBoxes.length; h++) {
        if (boxesOverlap(cores[i].box, hubLabelBoxes[h], 2)) coreOverlapsTotal++;
      }
    }

    // Guarantee 3: No label covers a hub text
    for (let i = 0; i < placedLabels.length; i++) {
      for (let h = 0; h < hubLabelBoxes.length; h++) {
        if (boxesOverlap(placedLabels[i].box, hubLabelBoxes[h], 1)) {
          hubTextCoveredTotal++;
        }
      }
    }
  }

  const avgAtt = (attenuatedCounts.reduce((a, b) => a + b, 0) / 100).toFixed(1);
  const maxAtt = Math.max(...attenuatedCounts);

  console.log(`\n[${resName}]`);
  console.log(`- Exactamente 41 etiquetas dibujadas: ${correct41Total}/100`);
  console.log(`- Superposición entre etiquetas con alpha >= 0.5: ${overlapsOverHalfTotal}`);
  console.log(`- Superposición entre etiquetas core / con hubs: ${coreOverlapsTotal}`);
  console.log(`- Etiquetas que cubren texto de un hub: ${hubTextCoveredTotal}`);
  console.log(`- Promedio etiquetas atenuadas (<= 0.2): ${avgAtt} (máx: ${maxAtt})`);
});
