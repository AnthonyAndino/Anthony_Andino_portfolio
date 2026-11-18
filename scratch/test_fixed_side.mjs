// Test 100 orientations with permanent local side assignment

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

const GOLDEN_ANGLE = 2.3999632;

PORTFOLIO_DB.habilidades.forEach(cat => {
  console.log(`\n--- ${cat.categoria} ---`);
  cat.habilidades.forEach((skill, idx) => {
    const phi = idx * GOLDEN_ANGLE;
    const cosPhi = Math.cos(phi);
    const side = cosPhi >= 0 ? 'right' : 'left';
    console.log(`  ${skill.padEnd(35)} -> Side: ${side}`);
  });
});
