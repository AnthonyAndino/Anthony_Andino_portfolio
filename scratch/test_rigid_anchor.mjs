// Test rigid anchoring approaches

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

const nodes = generateNodes();
console.log('Total nodes:', nodes.length);
