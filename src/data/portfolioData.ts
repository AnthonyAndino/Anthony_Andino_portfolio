import { DatabaseTables, ProjectItem, QuickQueryItem, WorkExperienceCase } from '../types/portfolio';

export const ABOUT_DATA = {
  bio: [
    "Hola, soy Anthony Andino. Vivo en Tegucigalpa, Honduras, y soy licenciado en Informática Administrativa por la UNAH.",
    "Me gusta analizar datos, crear páginas web y armar laboratorios de redes. Aprendo construyendo: cuando se me ocurre una idea, la implemento para entenderla. Así nació una extensión que hice por hobby, para que el tema de mi editor de código cambiara solo; funciona en VS Code, Cursor y Antigravity.",
    "Cuando no estoy frente a un proyecto me gusta dibujar personas: si veo una pose que me llama la atención, la dibujo. También juego videojuegos, sobre todo competitivos y de vez en cuando de historia. Y lo nuevo que aprendo últimamente va por el lado del análisis de datos."
  ],
  tags: ["Datos", "Desarrollo web", "Redes", "Dibujo", "Videojuegos"]
};

export interface ContactDataItem {
  label: string;
  url: string;
  icon: 'linkedin' | 'github';
}

export const CONTACT_DATA = {
  availability: 'Disponibilidad inmediata · Remoto o híbrido',
  intro: '¿Tienes un proyecto, una vacante o una pregunta sobre lo que hago? Escríbeme, con gusto conversamos.',
  email: 'anthonyandino959@gmail.com',
  links: [
    {
      label: 'LinkedIn',
      url: 'https://linkedin.com/in/anthony-andino-ad',
      icon: 'linkedin' as const,
    },
    {
      label: 'GitHub',
      url: 'https://github.com/AnthonyAndino',
      icon: 'github' as const,
    },
  ],
  footerName: 'Anthony Jafed Andino Marinero · Licenciado en Informática Administrativa (UNAH)',
  footerLocation: 'Tegucigalpa, Honduras',
};

export const PORTFOLIO_DB: DatabaseTables = {
  perfil: [
    {
      id: 1,
      nombre: "Anthony Jafed Andino Marinero",
      titulo: "Analista de Datos",
      grado: "Licenciado en Informática Administrativa",
      ubicacion: "Tegucigalpa, Honduras",
      resumen: "Licenciado en Informática Administrativa orientado al análisis de datos, con experiencia en consultas SQL, validación de información y reportes visuales. He identificado y corregido descuadres contables comparando registros en bases de datos, resuelto incidencias en procedimientos almacenados y desarrollado dashboards con indicadores y gráficos comparativos. Manejo SQL, Python y Excel intermedio, y cuento con conocimientos básicos de Power BI.",
      email: "anthonyandino959@gmail.com",
      linkedin: "https://linkedin.com/in/anthony-andino-ad",
      portfolio: "https://anthonyandino.vercel.app",
      disponibilidad: "Inmediata / Remoto e Híbrido"
    }
  ],

  experiencia: [
    {
      id: 1,
      empresa: "Porsalud",
      cargo: "Practicante de Desarrollo Web / Sistemas",
      periodo: "Septiembre 2025 – Enero 2026",
      ubicacion: "Tegucigalpa, Honduras",
      tipo: "Práctica Profesional / Sistemas",
      puntos_clave: [
        "Resolví incidencias en procedimientos y funciones almacenadas (Stored Procedures) relacionadas con la lógica del sistema, utilizando la base de datos de pruebas para validar las correcciones.",
        "Corregí los gráficos de marcaciones de entrada que no operaban correctamente y completé el módulo de gestión de usuarios (C# y JavaScript) de una plataforma utilizada por personal de múltiples sedes, incluyendo colaboradores en otros países.",
        "Participé en la revisión técnica de nuevas funcionalidades, verificando la integridad de datos y reportando errores antes de su pase a producción."
      ],
      tecnologias: ["SQL", "Stored Procedures", "C#", "JavaScript", "Testing DB"],
      impacto: "Optimización de consultas en backend y recuperación de trazabilidad en reportes multi-sede."
    },
    {
      id: 2,
      empresa: "Cooperativa La Reyna",
      cargo: "Asistente de Soporte Técnico",
      periodo: "Agosto 2024 – Octubre 2024",
      ubicacion: "Tegucigalpa, Honduras",
      tipo: "Soporte Técnico y Análisis de Datos",
      puntos_clave: [
        "Identifiqué y resolví 4 incidencias críticas de descuadres contables, cruzando y comparando registros dentro de la base de datos para localizar diferencias en transacciones financieras.",
        "Ejecuté consultas SQL avanzadas para la validación y corrección de datos en cuentas de clientes, resolviendo inconsistencias en cuentas de ahorro y crédito.",
        "Brindé soporte integral: migración de SO y datos de equipos críticos asegurando continuidad operativa, y configuración de telefonía IP."
      ],
      tecnologias: ["SQL", "Data Validation", "Auditoría de Cuentas", "Windows", "VoIP"],
      impacto: "Resolución de descuadres financieros y depuración confiable de registros bancarios."
    }
  ],

  educacion: [
    {
      id: 1,
      carrera: "Licenciatura en Informática Administrativa",
      titulo: "Licenciatura en Informática Administrativa",
      institucion: "Universidad Nacional Autónoma de Honduras (UNAH)",
      periodo: "Enero 2020 – Septiembre 2026",
      ubicacion: "Tegucigalpa, Honduras",
      estado: "Graduado / Titulado",
      enfoque: "Intersección entre Gestión Empresarial, Tecnologías de la Información y Análisis de Datos."
    }
  ],

  certificaciones: [
    {
      id: 1,
      nombre: "Python 101 for Data Science",
      titulo: "Python 101 for Data Science",
      emisor: "CognitiveClass.ai (IBM)",
      entidad: "CognitiveClass.ai (IBM)",
      fecha: "Julio 2026",
      categoria: "Data Science",
      icono: "01",
      imagen: "/certifications/datascience.png",
      urlVerificacion: "https://www.credly.com/badges/c71df3f7-af01-4c32-84de-ee0cc1f70886/public_url",
      descripcion: "Acreditación en sintaxis de Python, estructuras de datos, manipulación de archivos y librerías analíticas."
    },
    {
      id: 2,
      nombre: "Introducción a Ciberseguridad",
      titulo: "Introducción a Ciberseguridad",
      emisor: "Cisco Networking Academy",
      entidad: "Cisco Networking Academy",
      fecha: "Septiembre 2026",
      categoria: "Ciberseguridad",
      icono: "02",
      imagen: "/certifications/Introduction_to_Cybersecurity_certificate_Anthony_Andino.png",
      urlVerificacion: "https://www.credly.com/badges/7bb0e1d0-f656-4cbc-ba9d-e5ec00ec975c/public_url",
      descripcion: "Fundamentos de ciberseguridad, defensa de infraestructura crítica, confidencialidad e integridad de datos."
    },
    {
      id: 3,
      nombre: "Introduction to Linux (LFS101)",
      titulo: "Introduction to Linux (LFS101)",
      emisor: "The Linux Foundation",
      entidad: "The Linux Foundation",
      fecha: "Septiembre 2026",
      categoria: "Cloud & Linux",
      icono: "03",
      imagen: "/certifications/introductiontolinux.png",
      urlVerificacion: "https://www.credly.com/badges/fa3030b1-b12e-42fc-9682-d959e73d85b1/public_url",
      descripcion: "Administración básica en entornos Linux, comandos CLI, arquitectura del sistema de archivos y procesos."
    },
    {
      id: 4,
      nombre: "Conceptos Básicos de Redes",
      titulo: "Conceptos Básicos de Redes",
      emisor: "Cisco Networking Academy",
      entidad: "Cisco Networking Academy",
      fecha: "Octubre 2026",
      categoria: "Networking",
      icono: "04",
      imagen: "/certifications/networkingbasics.png",
      urlVerificacion: "https://www.credly.com/badges/5d11ec98-cc28-4a71-bb32-2e14f854cc8e/public_url",
      descripcion: "Modelos OSI y TCP/IP, protocolos de comunicación, direccionamiento IPv4/IPv6 y conmutación básica."
    },
    {
      id: 5,
      nombre: "Dispositivos de Red y Configuración Inicial",
      titulo: "Dispositivos de Red y Configuración Inicial",
      emisor: "Cisco Networking Academy",
      entidad: "Cisco Networking Academy",
      fecha: "Octubre 2026",
      categoria: "Networking",
      icono: "05",
      imagen: "/certifications/networking_devices.png",
      urlVerificacion: "https://www.credly.com/badges/3dcad799-1d4c-44e6-a156-b3cc142ddb58/public_url",
      descripcion: "Configuración inicial y securización de switches y routers Cisco, interfaces y contraseñas de consola."
    },
    {
      id: 6,
      nombre: "Endpoint Security",
      titulo: "Endpoint Security",
      emisor: "Cisco Networking Academy",
      entidad: "Cisco Networking Academy",
      fecha: "Noviembre 2026",
      categoria: "Ciberseguridad",
      icono: "06",
      imagen: "/certifications/endpoint_security.png",
      urlVerificacion: "https://www.credly.com/badges/40e310cb-38f4-4100-adc8-8fb83fdde7f3/public_url",
      descripcion: "Curso de Cisco Networking Academy sobre seguridad de endpoints."
    }
  ],

  habilidades: [
    {
      id: 1,
      categoria: "Análisis y Visualización de Datos",
      habilidades: ["SQL", "Excel Intermedio", "Python para Análisis", "Power BI (Básico)", "Dashboards de KPIs", "Validación y Limpieza de Datos"],
      nivel: "Avanzado",
      tipo: "data",
      core: ["SQL", "Python para Análisis"],
      destacadas: ["SQL", "Python para Análisis", "Excel Intermedio"]
    },
    {
      id: 2,
      categoria: "Bases de Datos & Modelado",
      habilidades: ["MySQL", "PostgreSQL", "Procedimientos Almacenados (Stored Procedures)", "Funciones SQL", "Prisma ORM", "Auditoría de Registros"],
      nivel: "Avanzado",
      tipo: "db",
      core: ["MySQL", "PostgreSQL", "Procedimientos Almacenados (Stored Procedures)"],
      destacadas: ["MySQL", "PostgreSQL", "Stored Procedures"]
    },
    {
      id: 3,
      categoria: "Lenguajes de Programación",
      habilidades: ["Python", "JavaScript", "TypeScript", "C#", "Node.js", "PHP", "Java", "C++", "C", "React"],
      nivel: "Intermedio",
      tipo: "prog",
      core: ["Python", "JavaScript", "C#"],
      destacadas: ["Python", "TypeScript", "C#"]
    },
    {
      id: 4,
      categoria: "Herramientas y Entornos",
      habilidades: ["Git", "GitHub", "Postman", "Linux CLI", "Soporte Técnico Especializado", "Redes LAN/WAN"],
      nivel: "Intermedio",
      tipo: "tools",
      core: ["Git", "GitHub", "Linux CLI"],
      destacadas: ["Git/GitHub", "Linux CLI", "Postman"]
    },
    {
      id: 5,
      categoria: "Competencias Profesionales",
      habilidades: ["Pensamiento Crítico", "Atención al Detalle", "Resolución de Incidencias", "Aprendizaje Continuo", "Comunicación Interdisciplinaria"],
      nivel: "Avanzado",
      tipo: "soft",
      core: ["Atención al Detalle", "Resolución de Incidencias"],
      destacadas: ["Atención al Detalle", "Resolución Incidencias", "Pensamiento Crítico"]
    },
    {
      id: 6,
      categoria: "Idiomas",
      habilidades: ["Español (Nativo)", "Inglés (B1 - Intermedio)"],
      nivel: "Intermedio",
      tipo: "lang",
      core: ["Español (Nativo)", "Inglés (B1)"],
      destacadas: ["Español (Nativo)", "Inglés (B1 Intermedio)", "Lectura Técnica"]
    }
  ],

  proyectos: [
    {
      id: 1,
      nombre: "Olist — E-Commerce SQL Analytics & Power BI",
      tipo: "Análisis de Datos & Dashboard",
      categoria: "Análisis de Datos",
      descripcion: "Análisis de ~100 mil pedidos de un e-commerce brasileño: preguntas de negocio en SQL, vista consolidada y dashboard interactivo validado contra consultas.",
      metricas_o_caracteristicas: [
        "Ingreso total 13.22M y ticket promedio 137",
        "São Paulo ~38% del ingreso (5.07M)",
        "Ingreso mensual estable entre 0.8M y 1.0M en 2018",
        "Validación cruzada entre consultas SQL y modelo DAX"
      ],
      stack: ["SQL Server", "T-SQL", "Power BI", "DAX"],
      stack_resumen: "SQL Server, Power BI, DAX",
      url: "https://github.com/AnthonyAndino/olist-sql-analysis"
    },
    {
      id: 2,
      nombre: "RH Manager — Dashboard, Asistencia y Nóminas",
      tipo: "Aplicación Web Full-Stack",
      categoria: "Desarrollo Web",
      descripcion: "Sistema de recursos humanos con dashboard de KPIs por rol, control de asistencia con detección de retardos y cálculo de nómina mensual.",
      metricas_o_caracteristicas: [
        "Autenticación por token con roles admin y empleado",
        "Detección automática de retardos (después de las 8:05 AM)",
        "Cálculo de nómina con deducciones, bonos e histórico",
        "Exportación a CSV compatible con Excel y modo oscuro"
      ],
      stack: ["React", "Vite", "Django REST", "MySQL"],
      stack_resumen: "React, Django REST, MySQL",
      url: "https://github.com/AnthonyAndino/rh-manager"
    },
    {
      id: 3,
      nombre: "DayMark — Hábitos, Rachas y Gráficos",
      tipo: "Aplicación Web Analítica",
      categoria: "Aplicación Web",
      descripcion: "Rastreador de hábitos y diario personal con rachas, calendario mensual, gráficos de actividad y temas personalizados.",
      metricas_o_caracteristicas: [
        "Registro diario con 1 clic y cálculo automático de rachas",
        "Calendario mensual y visualizaciones con Recharts",
        "Temas personalizados con cálculo de contraste automático",
        "JWT en cookies httpOnly, bcrypt y validación con Zod"
      ],
      stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
      stack_resumen: "Next.js, Prisma, PostgreSQL",
      url: "https://github.com/AnthonyAndino/DayMark"
    },
    {
      id: 4,
      nombre: "Networking Labs — 12 Laboratorios Prácticos",
      tipo: "Redes y Seguridad",
      categoria: "Redes & Seguridad",
      descripcion: "12 laboratorios prácticos de redes: VLANs, enrutamiento entre VLANs, ACLs, DHCP Snooping, Dynamic ARP Inspection, firewall pfSense y análisis de paquetes.",
      metricas_o_caracteristicas: [
        "12 laboratorios de switching, routing, ACLs y seguridad",
        "Mitigación con DHCP Snooping y Dynamic ARP Inspection",
        "Firewall pfSense con zonas WAN/LAN/DMZ",
        "Análisis y filtrado de paquetes con Wireshark"
      ],
      stack: ["Packet Tracer", "GNS3", "pfSense", "Wireshark"],
      stack_resumen: "Packet Tracer, pfSense, Wireshark",
      url: "https://github.com/AnthonyAndino/Networking-Labs"
    },
    {
      id: 5,
      nombre: "Smart Theme Switcher — Extensión de VS Code",
      tipo: "Extensión & Herramienta de Productividad",
      categoria: "Extensión / Herramienta",
      descripcion: "Cambia el tema de VS Code automáticamente según el proyecto, la hora del día, el lenguaje del archivo o una lista de favoritos.",
      metricas_o_caracteristicas: [
        "4 modos combinables: workspace, hora, favoritos, lenguaje",
        "Cálculo astronómico de amanecer y atardecer por IP",
        "Rotación secuencial o aleatoria con vista previa en vivo",
        "Versión 0.0.9 bilingüe (español e inglés)"
      ],
      stack: ["VS Code", "Extensión", "TypeScript", "Node.js"],
      stack_resumen: "VS Code API, TypeScript, Node.js",
      url: "https://github.com/AnthonyAndino/Smart-Theme-Switcher-VS-Code-Extension-"
    }
  ],

  contacto: [
    {
      id: 1,
      medio: "LinkedIn",
      valor: "linkedin.com/in/anthony-andino-ad",
      enlace: "https://linkedin.com/in/anthony-andino-ad",
      icono: "LK",
      accion: "Conectar en LinkedIn"
    },
    {
      id: 2,
      medio: "Correo Electrónico",
      valor: "anthonyandino959@gmail.com",
      enlace: "mailto:anthonyandino959@gmail.com",
      icono: "EM",
      accion: "Enviar Email"
    },
    {
      id: 3,
      medio: "Web Portfolio Oficial",
      valor: "anthonyandino.vercel.app",
      enlace: "https://anthonyandino.vercel.app",
      icono: "WB",
      accion: "Visitar Sitio"
    },
    {
      id: 4,
      medio: "Ubicación",
      valor: "Tegucigalpa, Honduras",
      enlace: "https://maps.google.com/?q=Tegucigalpa,Honduras",
      icono: "UB",
      accion: "Ver Ciudad"
    }
  ],

  easter_egg: [
    {
      id: 777,
      mensaje: "Registro clasificado localizado con éxito",
      codigo_secreto: "DATA_DRIVEN_2026",
      consejo_data: "En analítica de datos, la integridad referencial y la verificación en libros siempre revelan la verdad.",
      easter_egg: "¡Listo para aportar rigurosidad y valor en tu equipo de analítica!"
    }
  ]
};

export const WORK_EXPERIENCE_DATA: WorkExperienceCase[] = [
  {
    id: 1,
    year: '2024',
    company: 'Cooperativa La Reyna',
    role: 'Asistente de Soporte Técnico',
    period: 'Agosto 2024 – Octubre 2024',
    location: 'Tegucigalpa, Honduras',
    resumen: {
      metaLine: 'Cooperativa La Reyna · Asistente de Soporte Técnico · Ago–Oct 2024',
      company: 'Cooperativa La Reyna',
      role: 'Asistente de Soporte Técnico',
      dates: 'Ago–Oct 2024',
      result: '4 descuadres contables, reconciliados al 100%.',
      summary: 'Cruce de registros con SQL (GROUP BY y HAVING) para localizar diferencias en cuentas de ahorro y crédito.',
      tags: ['SQL', 'Data Validation', 'Auditoría de Cuentas'],
      miniVisualType: 'audit-ledger',
    },
    detalle: {
      challengeTitle: 'DESAFÍO PRINCIPAL & RESULTADOS:',
      keyPoints: [
        'Identifiqué y resolví 4 incidencias críticas de descuadres contables, cruzando y comparando registros dentro de la base de datos para localizar diferencias en transacciones financieras.',
        'Ejecuté consultas SQL avanzadas para la validación y corrección de datos en cuentas de clientes, resolviendo inconsistencias en cuentas de ahorro y crédito.',
        'Brindé soporte integral: migración de SO y datos de equipos críticos asegurando continuidad operativa, y configuración de telefonía IP.',
      ],
      techStack: ['SQL', 'Data Validation', 'Auditoría de Cuentas', 'Windows', 'VoIP'],
      sqlQuery: "SELECT empresa, cargo, impacto FROM experiencia WHERE empresa = 'Cooperativa La Reyna';",
      sqlTable: 'cooperativa_reyna',
    },
  },
  {
    id: 2,
    year: '2025',
    company: 'Porsalud',
    role: 'Practicante de Desarrollo Web / Sistemas',
    period: 'Septiembre 2025 – Enero 2026',
    location: 'Tegucigalpa, Honduras',
    resumen: {
      metaLine: 'Porsalud · Practicante de Desarrollo Web / Sistemas · Sep 2025–Ene 2026',
      company: 'Porsalud',
      role: 'Practicante de Desarrollo Web / Sistemas',
      dates: 'Sep 2025–Ene 2026',
      result: 'Stored procedures y módulo de usuarios para personal multi-sede.',
      summary: 'Corregí la lógica de marcaciones, validé en base de pruebas y reporté errores antes del paso a producción.',
      tags: ['SQL', 'Stored Procedures', 'C#', 'JavaScript'],
      miniVisualType: 'procedure-debugger',
    },
    detalle: {
      challengeTitle: 'LOGROS EN SISTEMAS & BASES DE DATOS:',
      keyPoints: [
        'Resolví incidencias en procedimientos y funciones almacenadas (Stored Procedures) relacionadas con la lógica del sistema, utilizando la base de datos de pruebas para validar las correcciones.',
        'Corregí los gráficos de marcaciones de entrada que no operaban correctamente y completé el módulo de gestión de usuarios (C# y JavaScript) de una plataforma utilizada por personal de múltiples sedes, incluyendo colaboradores en otros países.',
        'Participé en la revisión técnica de nuevas funcionalidades, verificando la integridad de datos y reportando errores antes de su pase a producción.',
      ],
      techStack: ['SQL', 'Stored Procedures', 'C#', 'JavaScript', 'Testing DB'],
      sqlQuery: "SELECT empresa, cargo, puntos_clave FROM experiencia WHERE empresa = 'Porsalud';",
      sqlTable: 'porsalud',
    },
  },
  {
    id: 3,
    year: '2026 →',
    company: 'En curso',
    role: 'Proyectos personales y formación continua',
    period: 'Presente',
    location: 'Tegucigalpa, Honduras',
    resumen: {
      metaLine: 'En curso · Proyectos personales y formación continua · 2026',
      company: 'En curso',
      role: 'Proyectos personales y formación continua',
      dates: '2026',
      result: 'Aprendiendo y construyendo.',
      summary: 'Olist, RH Manager y DayMark, certificaciones y práctica continua de SQL y Python.',
      tags: ['SQL', 'Python', 'Dashboards'],
      miniVisualType: 'trend-line',
    },
  },
];

export const PROJECTS_DATA: ProjectItem[] = [
  {
    id: 1,
    number: "01",
    title: "Olist",
    category: "Análisis de datos · SQL Server + Power BI",
    tags: ["SQL Server", "T-SQL", "Power BI", "DAX"],
    summary: "Análisis de ~100 mil pedidos de un e-commerce brasileño: preguntas de negocio en SQL, una vista consolidada y un dashboard interactivo validado contra consultas.",
    detailBullets: [
      "Flujo en 4 pasos: exploración y preguntas de negocio en SQL Server; vista v_ventas que une pedidos, productos, clientes y categorías; dashboard interactivo en Power BI con medidas DAX; y validaciones comparando el dashboard con consultas SQL.",
      "Decisiones de análisis: consideración exclusiva de pedidos entregados, exclusión de septiembre y octubre de 2018 por datos incompletos en origen, cálculo de ingresos como suma de price sin flete, y traducción de categorías con la tabla oficial.",
      "Nota: el dataset es de Kaggle (Olist) y los archivos CSV no están en el repositorio para mantener un control de versiones óptimo."
    ],
    findings: [
      { label: "Ingreso total", value: "13.22M" },
      { label: "Ticket promedio", value: "137" },
      { label: "São Paulo", value: "~38% del ingreso (5.07M)" },
      { label: "Ingreso mensual 2018", value: "Estable entre 0.8M y 1.0M" },
      { label: "Categorías líderes", value: "health_beauty, watches_gifts, bed_bath_table" },
    ],
    links: [
      { label: "Repositorio", url: "https://github.com/AnthonyAndino/olist-sql-analysis" }
    ],
    accent: "#ff3e00",
    featured: true,
  },
  {
    id: 2,
    number: "02",
    title: "RH Manager",
    category: "Aplicación web · Dashboard, asistencia y nóminas",
    tags: ["React", "Vite", "Django REST", "MySQL"],
    summary: "Sistema de recursos humanos con dashboard de KPIs por rol, control de asistencia con detección de retardos y cálculo de nómina mensual.",
    detailBullets: [
      "Autenticación por token con roles admin y empleado, y CRUD de empleados con foto de perfil.",
      "Control de asistencia con detección automática de retardos (después de las 8:05 AM).",
      "Cálculo de nómina mensual con desglose de deducciones, bonos e histórico de pagos.",
      "Tablas ordenables, filtros por empleado y fecha, paginación y exportación CSV compatible con Excel.",
      "Modo oscuro integrado y datos de demostración configurados (10 empleados, 30 días de asistencias, 3 meses de nóminas)."
    ],
    links: [
      { label: "Repositorio", url: "https://github.com/AnthonyAndino/rh-manager" }
    ],
    accent: "#1f6f5c",
    featured: false,
    images: [
      {
        src: "/projects/rhmanager.png",
        alt: "Panel de control de RH Manager con métricas de empleados, asistencias y nóminas",
        caption: "Dashboard general de RH Manager"
      }
    ],
  },
  {
    id: 3,
    number: "03",
    title: "DayMark",
    category: "Aplicación web · Hábitos, rachas y gráficos",
    tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
    summary: "Rastreador de hábitos y diario personal con rachas, calendario mensual, gráficos de actividad y temas personalizados.",
    detailBullets: [
      "Registro diario de hábitos con un clic y cálculo automático de rachas consecutivas.",
      "Notas personales por día y calendario mensual con estado de cumplimiento visual.",
      "Gráficos de actividad interactivos desarrollados con Recharts.",
      "4 temas base más personalización con colores hexadecimales y contraste automático.",
      "Interfaz y documentación completamente disponibles en español e inglés.",
      "Autenticación con JWT en cookies httpOnly, contraseñas con bcrypt y validación estricta con Zod.",
      "Arquitectura: Next.js 16, React 19, TypeScript, Tailwind v4, Prisma 7 y PostgreSQL."
    ],
    links: [
      { label: "Repositorio", url: "https://github.com/AnthonyAndino/DayMark" },
      { label: "Demo en vivo", url: "https://daymark-ochre.vercel.app" }
    ],
    accent: "#1f6f5c",
    featured: false,
    images: [
      {
        src: "/projects/daymark.gif",
        alt: "Demostración interactiva de DayMark con seguimiento de hábitos diarios y rachas",
        caption: "Vista de DayMark"
      }
    ],
  },
  {
    id: 4,
    number: "04",
    title: "Networking Labs",
    category: "Redes y seguridad · Packet Tracer y GNS3",
    tags: ["Packet Tracer", "GNS3", "pfSense", "Wireshark"],
    summary: "12 laboratorios prácticos de redes: VLANs, enrutamiento entre VLANs, ACLs, DHCP Snooping, Dynamic ARP Inspection, firewall pfSense y análisis de paquetes.",
    detailBullets: [
      "Lista completa de laboratorios prácticos (00 a 11): Setup; Primera red (switching, ARP, ICMP, modelo OSI, subredes); Router (enrutamiento y gateway); VLANs; Inter-VLAN con router-on-a-stick; ACLs; DHCP, DNS y HTTP; Port Security; DHCP Snooping; Dynamic ARP Inspection; Firewall pfSense con zonas WAN/LAN/DMZ; y análisis con Wireshark (captura y filtros).",
      "Cada laboratorio incluye documentación README detallada, topología, diagrama de red y configuraciones de equipos."
    ],
    links: [
      { label: "Repositorio", url: "https://github.com/AnthonyAndino/Networking-Labs" }
    ],
    accent: "#3f3cbb",
    featured: false,
    images: [
      {
        src: "/projects/Networking Labs.png",
        alt: "Topología de red y diagramas de laboratorios prácticos de conmutación y enrutamiento",
        caption: "Topología y diagrama de red de los laboratorios"
      }
    ],
  },
  {
    id: 5,
    number: "05",
    title: "Smart Theme Switcher",
    category: "Extensión de VS Code · Automatización del editor",
    tags: ["VS Code", "Extensión"],
    summary: "Cambia el tema de VS Code automáticamente según el proyecto, la hora del día, el lenguaje del archivo o una lista de favoritos.",
    detailBullets: [
      "Cuatro modos combinables: workspace, hora programada, favoritos y lenguaje del archivo.",
      "Cambio por amanecer y atardecer astronómicos reales según la ubicación con detección por IP.",
      "Rotación de favoritos en modo manual o automático, de forma secuencial o aleatoria.",
      "Vista previa en vivo al elegir temas dentro del editor.",
      "Versión 0.0.9 con soporte e interfaz en español e inglés."
    ],
    links: [
      { label: "Repositorio", url: "https://github.com/AnthonyAndino/Smart-Theme-Switcher-VS-Code-Extension-" }
    ],
    accent: "#3f3cbb",
    featured: false,
    images: [
      {
        src: "/projects/smart_theme_switch.gif",
        alt: "Demostración animada de la extensión Smart Theme Switcher cambiando temas en VS Code",
        caption: "Vista de cambio de temas en VS Code"
      }
    ],
  }
];

export const RELATED_SKILLS: [string, string][] = [
  ['SQL', 'PostgreSQL'],
  ['SQL', 'MySQL'],
  ['SQL', 'Procedimientos Almacenados (Stored Procedures)'],
  ['SQL', 'Funciones SQL'],
  ['SQL', 'Power BI (Básico)'],
  ['SQL', 'Validación y Limpieza de Datos'],
  ['SQL', 'Auditoría de Registros'],
  ['Python para Análisis', 'Python'],
  ['Python para Análisis', 'Validación y Limpieza de Datos'],
  ['Prisma ORM', 'PostgreSQL'],
  ['Dashboards de KPIs', 'Power BI (Básico)'],
  ['JavaScript', 'TypeScript'],
  ['TypeScript', 'React'],
  ['JavaScript', 'Node.js'],
  ['Git', 'GitHub'],
];

export const CORE_SKILLS = new Set<string>([
  'SQL',
  'Procedimientos Almacenados (Stored Procedures)',
  'PostgreSQL',
  'MySQL',
  'Python para Análisis',
]);

export const QUICK_QUERIES: QuickQueryItem[] = [
  {
    id: "perfil",
    label: "Perfil y Resumen",
    query: "SELECT * FROM perfil;",
    description: "Formación, enfoque y propuesta de valor",
    iconName: "User",
    category: "core"
  },
  {
    id: "experiencia",
    label: "Experiencia Profesional",
    query: "SELECT empresa, cargo, periodo, impacto FROM experiencia;",
    description: "Casos de éxito: Porsalud y Cooperativa La Reyna",
    iconName: "Briefcase",
    category: "core"
  },
  {
    id: "habilidades-sql",
    label: "Habilidades Técnicas",
    query: "SELECT categoria, habilidades, nivel FROM habilidades;",
    description: "SQL, Python, Excel, Power BI, Bases de datos y programación",
    iconName: "Cpu",
    category: "analysis"
  },
  {
    id: "proyectos",
    label: "Proyectos Analíticos",
    query: "SELECT nombre, tipo, stack FROM proyectos;",
    description: "Dashboards de RRHH y finanzas interactivas",
    iconName: "BarChart3",
    category: "core"
  },
  {
    id: "certificaciones",
    label: "Certificaciones",
    query: "SELECT nombre, emisor, fecha, categoria FROM certificaciones;",
    description: "IBM Data Science, Cisco, Linux Foundation",
    iconName: "Award",
    category: "analysis"
  },
  {
    id: "educacion",
    label: "Formación Académica",
    query: "SELECT carrera, institucion, periodo FROM educacion;",
    description: "Licenciatura en Informática Administrativa (UNAH)",
    iconName: "GraduationCap",
    category: "core"
  },
  {
    id: "contacto",
    label: "Vías de Contacto",
    query: "SELECT medio, valor, accion FROM contacto;",
    description: "LinkedIn, correo electrónico y web directa",
    iconName: "Send",
    category: "core"
  },
  {
    id: "show-tables",
    label: "Estructura Relacional",
    query: "SHOW TABLES;",
    description: "Ver todas las tablas disponibles en el esquema",
    iconName: "Database",
    category: "meta"
  }
];

export const TABLE_SCHEMAS: Record<string, { column: string; type: string; description: string }[]> = {
  perfil: [
    { column: "id", type: "INT PRIMARY KEY", description: "Identificador único" },
    { column: "nombre", type: "VARCHAR(100)", description: "Nombre completo" },
    { column: "titulo", type: "VARCHAR(80)", description: "Rol profesional principal" },
    { column: "grado", type: "VARCHAR(120)", description: "Título universitario" },
    { column: "ubicacion", type: "VARCHAR(80)", description: "Ciudad y país de residencia" },
    { column: "resumen", type: "TEXT", description: "Perfil profesional sintético" },
    { column: "email", type: "VARCHAR(100)", description: "Correo electrónico" },
    { column: "disponibilidad", type: "VARCHAR(50)", description: "Modalidad y tiempo de incorporación" }
  ],
  experiencia: [
    { column: "id", type: "INT PRIMARY KEY", description: "Identificador de experiencia" },
    { column: "empresa", type: "VARCHAR(100)", description: "Nombre de la organización" },
    { column: "cargo", type: "VARCHAR(100)", description: "Puesto desempeñado" },
    { column: "periodo", type: "VARCHAR(60)", description: "Duración en la institución" },
    { column: "puntos_clave", type: "JSON_ARRAY", description: "Logros y tareas técnicas destacadas" },
    { column: "tecnologias", type: "JSON_ARRAY", description: "Stack de herramientas utilizadas" },
    { column: "impacto", type: "TEXT", description: "Resultado medible alcanzado" }
  ],
  habilidades: [
    { column: "id", type: "INT PRIMARY KEY", description: "ID de categoría" },
    { column: "categoria", type: "VARCHAR(80)", description: "Área de competencia" },
    { column: "habilidades", type: "JSON_ARRAY", description: "Lista de tecnologías/habilidades" },
    { column: "destacadas", type: "JSON_ARRAY", description: "Top 3 habilidades clave de la categoría" },
    { column: "nivel", type: "ENUM", description: "Avanzado | Intermedio | Fundacional" },
    { column: "tipo", type: "VARCHAR(20)", description: "Clasificación interna de color y badge" }
  ],
  proyectos: [
    { column: "id", type: "INT PRIMARY KEY", description: "ID del proyecto" },
    { column: "nombre", type: "VARCHAR(100)", description: "Título del proyecto analítico" },
    { column: "tipo", type: "VARCHAR(80)", description: "Categoría de producto" },
    { column: "categoria", type: "VARCHAR(80)", description: "Categoría corta del proyecto" },
    { column: "descripcion", type: "TEXT", description: "Problema resuelto y alcance" },
    { column: "metricas_o_caracteristicas", type: "JSON_ARRAY", description: "Indicadores y capacidades" },
    { column: "stack", type: "JSON_ARRAY", description: "Tecnologías y lenguajes" },
    { column: "stack_resumen", type: "VARCHAR(120)", description: "Resumen sintético del stack" }
  ],
  certificaciones: [
    { column: "id", type: "INT PRIMARY KEY", description: "ID de certificación" },
    { column: "nombre", type: "VARCHAR(120)", description: "Título de la certificación" },
    { column: "titulo", type: "VARCHAR(120)", description: "Alias del título de la certificación" },
    { column: "emisor", type: "VARCHAR(100)", description: "Entidad emisora internacional" },
    { column: "entidad", type: "VARCHAR(100)", description: "Alias de la entidad emisora" },
    { column: "fecha", type: "VARCHAR(40)", description: "Fecha de expedición" },
    { column: "categoria", type: "VARCHAR(50)", description: "Dominio temático" },
    { column: "imagen", type: "VARCHAR(255) NULL", description: "Ruta de imagen o badge del certificado" },
    { column: "urlVerificacion", type: "VARCHAR(255) NULL", description: "Enlace web de verificación oficial" }
  ],
  educacion: [
    { column: "id", type: "INT PRIMARY KEY", description: "ID de registro educativo" },
    { column: "carrera", type: "VARCHAR(120)", description: "Programa cursado" },
    { column: "titulo", type: "VARCHAR(120)", description: "Título universitario obtenido" },
    { column: "institucion", type: "VARCHAR(120)", description: "Universidad" },
    { column: "periodo", type: "VARCHAR(50)", description: "Años de estudio" },
    { column: "estado", type: "VARCHAR(40)", description: "Condición académica" }
  ],
  contacto: [
    { column: "id", type: "INT PRIMARY KEY", description: "ID de medio" },
    { column: "medio", type: "VARCHAR(50)", description: "Canal de contacto" },
    { column: "valor", type: "VARCHAR(120)", description: "Dirección o enlace" },
    { column: "accion", type: "VARCHAR(60)", description: "Texto descriptivo de acción" }
  ]
};

export interface HomeHeroColumn {
  id: string;
  tag: string;
  label: string;
  value: string;
}

export interface HomeHeroGreeting {
  line1: string;
  line2: string;
}

export interface HeroPhrase {
  line1: string;
  line2: string; // Serif cursiva con data-cleaning
  line3: string; // Sans con punto final vermellón
}

export interface HomeHeroParallaxConfig {
  greeting: number;
  headlineRow1: number;
  headlineRow2: number;
  headlineRow3: number;
  backgroundChart: number;
  verticalLabel: number;
  bottomColumns: number;
  lerpEase: number;
}

export interface HomeHeroData {
  tags: string[];
  greeting: HomeHeroGreeting;
  phraseIntervalMs: number;
  phrases: HeroPhrase[];
  columns: HomeHeroColumn[];
  scrollCta: {
    label: string;
    targetSection: string;
  };
  parallax: HomeHeroParallaxConfig;
}

export const PHRASE_INTERVAL_MS = 4000;

/**
 * REGLAS ESTRICTAS DE LONGITUD DE CARACTERES PARA EL TITULAR DEL HOME:
 * Para evitar saltos de línea y desbordamiento horizontal:
 * - Fila 1 (sin sangría): máximo 7 caracteres.
 * - Fila 2 (sangría pl-32): máximo 12 caracteres.
 * - Fila 3 (sangría pl-64): máximo 11 caracteres (incluyendo el punto final bermellón).
 */
export const HERO_PHRASE_LIMITS = {
  line1Max: 7,
  line2Max: 12,
  line3MaxWithDot: 11, // line3 + 1 (punto final)
} as const;

export const HOME_HERO_DATA: HomeHeroData = {
  tags: ["DATA INTEGRITY", "SQL AUDIT", "STORED PROCEDURES", "BI"],
  greeting: {
    line1: "Hi,",
    line2: "I'm Anthony Andino.",
  },
  phraseIntervalMs: PHRASE_INTERVAL_MS,
  phrases: [
    {
      line1: "Turn",
      line2: "raw data",
      line3: "into truth",
    },
    {
      line1: "Audit",
      line2: "every record",
      line3: "to zero",
    },
    {
      line1: "Build",
      line2: "dashboards",
      line3: "that count",
    },
    {
      line1: "Catch",
      line2: "the mismatch",
      line3: "early",
    },
  ],
  columns: [
    {
      id: "profile",
      tag: "01 / PERFIL",
      label: "Perfil",
      value: "Licenciado en Informática Administrativa (UNAH).",
    },
    {
      id: "projects",
      tag: "02 / Proyectos",
      label: "Proyectos",
      value: "5 proyectos: datos, aplicaciones web, redes y una extensión.",
    },
    {
      id: "availability",
      tag: "03 / DISPONIBILIDAD",
      label: "Disponibilidad",
      value: "Inmediata · Remoto o híbrido · Tegucigalpa, Honduras.",
    },
  ],
  scrollCta: {
    label: "Explore my work",
    targetSection: "work",
  },
  parallax: {
    greeting: 2.5,         // 2.5px sutil alineado al titular
    headlineRow1: 8,       // 8px suave en dirección del cursor
    headlineRow2: 10,      // 10px intermedio
    headlineRow3: 13,      // 13px fila inferior
    backgroundChart: -22,  // -22px en dirección opuesta (sensación de profundidad lejana)
    verticalLabel: 3,      // 3px sutil
    bottomColumns: 2.5,    // 2.5px muy estable
    lerpEase: 0.075,       // Inercia fluida y asombrosamente suave
  },
};

// Validación en desarrollo para garantizar límites estrictos de caracteres
if (import.meta.env?.DEV) {
  HOME_HERO_DATA.phrases.forEach((phrase, idx) => {
    if (phrase.line1.length > HERO_PHRASE_LIMITS.line1Max) {
      console.warn(
        `[HOME_HERO_DATA] Frase ${idx + 1} fila 1 "${phrase.line1}" (${phrase.line1.length} chars) excede el máximo de ${HERO_PHRASE_LIMITS.line1Max}.`
      );
    }
    if (phrase.line2.length > HERO_PHRASE_LIMITS.line2Max) {
      console.warn(
        `[HOME_HERO_DATA] Frase ${idx + 1} fila 2 "${phrase.line2}" (${phrase.line2.length} chars) excede el máximo de ${HERO_PHRASE_LIMITS.line2Max}.`
      );
    }
    const line3WithDotLen = phrase.line3.length + 1;
    if (line3WithDotLen > HERO_PHRASE_LIMITS.line3MaxWithDot) {
      console.warn(
        `[HOME_HERO_DATA] Frase ${idx + 1} fila 3 "${phrase.line3}." (${line3WithDotLen} chars) excede el máximo de ${HERO_PHRASE_LIMITS.line3MaxWithDot}.`
      );
    }
  });
}

