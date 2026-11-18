import { DatabaseTables, ProjectItem, QuickQueryItem, WorkExperienceCase } from '../types/portfolio';

export const ABOUT_DATA = {
  bio: [
    "Hi, I'm Anthony Andino. I live in Tegucigalpa, Honduras, and hold a Bachelor's Degree in Administrative Informatics from UNAH.",
    "I enjoy analyzing data, building websites, and putting together networking labs. I learn by building: when an idea comes to mind, I implement it to understand it. That is how a hobby extension of mine came about, automatically changing my code editor's theme; it works in VS Code, Cursor, and Antigravity.",
    "When I am not working on a project, I like drawing people: if a pose catches my eye, I draw it. I also play video games, mostly competitive ones and occasionally story-driven ones. Lately, the new things I am learning are on the data analysis side."
  ],
  tags: ["Data", "Web development", "Networking", "Drawing", "Video games"]
};

export interface ContactDataItem {
  label: string;
  url: string;
  icon: 'linkedin' | 'github';
}

export const CONTACT_DATA = {
  availability: 'Immediately available · Remote or hybrid',
  intro: 'Have a project, an opening, or a question about what I do? Get in touch, I would be glad to talk.',
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
  footerName: 'Anthony Jafed Andino Marinero · Bachelor\'s Degree in Administrative Informatics (UNAH)',
  footerLocation: 'Tegucigalpa, Honduras',
};

export const PORTFOLIO_DB: DatabaseTables = {
  perfil: [
    {
      id: 1,
      nombre: "Anthony Jafed Andino Marinero",
      titulo: "Data Analyst",
      grado: "Bachelor's Degree in Administrative Informatics",
      ubicacion: "Tegucigalpa, Honduras",
      resumen: "Bachelor's Degree in Administrative Informatics focused on data analysis, with experience in SQL queries, data validation, and visual reporting. I have identified and corrected accounting discrepancies by comparing database records, resolved issues in stored procedures, and developed dashboards with KPIs and comparative charts. I work with SQL, Python, and intermediate Excel, and have basic knowledge of Power BI.",
      email: "anthonyandino959@gmail.com",
      linkedin: "https://linkedin.com/in/anthony-andino-ad",
      portfolio: "https://anthonyandino.vercel.app",
      disponibilidad: "Immediate / Remote and Hybrid"
    }
  ],

  experiencia: [
    {
      id: 1,
      empresa: "Porsalud",
      cargo: "Web Development / Systems Intern",
      periodo: "September 2025 – January 2026",
      ubicacion: "Tegucigalpa, Honduras",
      tipo: "Professional Internship / Systems",
      puntos_clave: [
        "Resolved issues in stored procedures and functions related to system logic, using the test database to validate the fixes.",
        "Fixed the broken time-clock entry charts and completed the user management module (C# and JavaScript) of a platform used by staff across multiple sites, including colleagues in other countries.",
        "Took part in the technical review of new features, verifying data integrity and reporting bugs before release to production."
      ],
      tecnologias: ["SQL", "Stored Procedures", "C#", "JavaScript", "Testing DB"],
      impacto: "Optimized backend queries and restored traceability in multi-site reports."
    },
    {
      id: 2,
      empresa: "Cooperativa La Reyna",
      cargo: "Technical Support Assistant",
      periodo: "August 2024 – October 2024",
      ubicacion: "Tegucigalpa, Honduras",
      tipo: "Technical Support and Data Analysis",
      puntos_clave: [
        "Identified and resolved 4 critical accounting discrepancy issues by cross-checking and comparing records in the database to locate differences in financial transactions.",
        "Ran advanced SQL queries to validate and correct data in customer accounts, resolving inconsistencies in savings and credit accounts.",
        "Provided end-to-end support: migrated the operating system and data of critical machines to ensure operational continuity, and configured IP telephony."
      ],
      tecnologias: ["SQL", "Data Validation", "Account Auditing", "Windows", "VoIP"],
      impacto: "Resolved financial discrepancies and reliably cleaned up banking records."
    }
  ],

  educacion: [
    {
      id: 1,
      carrera: "Bachelor's Degree in Administrative Informatics",
      titulo: "Bachelor's Degree in Administrative Informatics",
      institucion: "Universidad Nacional Autónoma de Honduras (UNAH)",
      periodo: "January 2020 – September 2026",
      ubicacion: "Tegucigalpa, Honduras",
      estado: "Graduated / Degree Awarded",
      enfoque: "The intersection of Business Management, Information Technology, and Data Analysis."
    }
  ],

  certificaciones: [
    {
      id: 1,
      nombre: "Python 101 for Data Science",
      titulo: "Python 101 for Data Science",
      emisor: "CognitiveClass.ai (IBM)",
      entidad: "CognitiveClass.ai (IBM)",
      fecha: "July 2026",
      categoria: "Data Science",
      icono: "01",
      imagen: "/certifications/datascience.png",
      urlVerificacion: "https://www.credly.com/badges/c71df3f7-af01-4c32-84de-ee0cc1f70886/public_url",
      descripcion: "Certification in Python syntax, data structures, file handling, and analytical libraries."
    },
    {
      id: 2,
      nombre: "Introduction to Cybersecurity",
      titulo: "Introduction to Cybersecurity",
      emisor: "Cisco Networking Academy",
      entidad: "Cisco Networking Academy",
      fecha: "September 2026",
      categoria: "Ciberseguridad",
      icono: "02",
      imagen: "/certifications/Introduction_to_Cybersecurity_certificate_Anthony_Andino.png",
      urlVerificacion: "https://www.credly.com/badges/7bb0e1d0-f656-4cbc-ba9d-e5ec00ec975c/public_url",
      descripcion: "Fundamentals of cybersecurity, critical infrastructure defense, and data confidentiality and integrity."
    },
    {
      id: 3,
      nombre: "Introduction to Linux (LFS101)",
      titulo: "Introduction to Linux (LFS101)",
      emisor: "The Linux Foundation",
      entidad: "The Linux Foundation",
      fecha: "September 2026",
      categoria: "Cloud & Linux",
      icono: "03",
      imagen: "/certifications/introductiontolinux.png",
      urlVerificacion: "https://www.credly.com/badges/fa3030b1-b12e-42fc-9682-d959e73d85b1/public_url",
      descripcion: "Basic administration in Linux environments, CLI commands, filesystem architecture, and processes."
    },
    {
      id: 4,
      nombre: "Networking Basics",
      titulo: "Networking Basics",
      emisor: "Cisco Networking Academy",
      entidad: "Cisco Networking Academy",
      fecha: "October 2026",
      categoria: "Networking",
      icono: "04",
      imagen: "/certifications/networkingbasics.png",
      urlVerificacion: "https://www.credly.com/badges/5d11ec98-cc28-4a71-bb32-2e14f854cc8e/public_url",
      descripcion: "OSI and TCP/IP models, communication protocols, IPv4/IPv6 addressing, and basic switching."
    },
    {
      id: 5,
      nombre: "Network Devices and Initial Configuration",
      titulo: "Network Devices and Initial Configuration",
      emisor: "Cisco Networking Academy",
      entidad: "Cisco Networking Academy",
      fecha: "October 2026",
      categoria: "Networking",
      icono: "05",
      imagen: "/certifications/networking_devices.png",
      urlVerificacion: "https://www.credly.com/badges/3dcad799-1d4c-44e6-a156-b3cc142ddb58/public_url",
      descripcion: "Initial setup and hardening of Cisco switches and routers, interfaces, and console passwords."
    },
    {
      id: 6,
      nombre: "Endpoint Security",
      titulo: "Endpoint Security",
      emisor: "Cisco Networking Academy",
      entidad: "Cisco Networking Academy",
      fecha: "November 2026",
      categoria: "Ciberseguridad",
      icono: "06",
      imagen: "/certifications/endpoint_security.png",
      urlVerificacion: "https://www.credly.com/badges/40e310cb-38f4-4100-adc8-8fb83fdde7f3/public_url",
      descripcion: "Cisco Networking Academy course on endpoint security."
    }
  ],

  habilidades: [
    {
      id: 1,
      categoria: "Data Analysis and Visualization",
      habilidades: ["SQL", "Intermediate Excel", "Python for Analysis", "Power BI (Basic)", "KPI Dashboards", "Data Validation and Cleaning"],
      nivel: "Avanzado",
      tipo: "data",
      core: ["SQL", "Python for Analysis"],
      destacadas: ["SQL", "Python for Analysis", "Intermediate Excel"]
    },
    {
      id: 2,
      categoria: "Databases & Modeling",
      habilidades: ["MySQL", "PostgreSQL", "Stored Procedures", "SQL Functions", "Prisma ORM", "Record Auditing"],
      nivel: "Avanzado",
      tipo: "db",
      core: ["MySQL", "PostgreSQL", "Stored Procedures"],
      destacadas: ["MySQL", "PostgreSQL", "Stored Procedures"]
    },
    {
      id: 3,
      categoria: "Programming Languages",
      habilidades: ["Python", "JavaScript", "TypeScript", "C#", "Node.js", "PHP", "Java", "C++", "C", "React"],
      nivel: "Intermedio",
      tipo: "prog",
      core: ["Python", "JavaScript", "C#"],
      destacadas: ["Python", "TypeScript", "C#"]
    },
    {
      id: 4,
      categoria: "Tools and Environments",
      habilidades: ["Git", "GitHub", "Postman", "Linux CLI", "Specialized Technical Support", "LAN/WAN Networking"],
      nivel: "Intermedio",
      tipo: "tools",
      core: ["Git", "GitHub", "Linux CLI"],
      destacadas: ["Git/GitHub", "Linux CLI", "Postman"]
    },
    {
      id: 5,
      categoria: "Professional Competencies",
      habilidades: ["Critical Thinking", "Attention to Detail", "Incident Resolution", "Continuous Learning", "Cross-functional Communication"],
      nivel: "Avanzado",
      tipo: "soft",
      core: ["Attention to Detail", "Incident Resolution"],
      destacadas: ["Attention to Detail", "Incident Resolution", "Critical Thinking"]
    },
    {
      id: 6,
      categoria: "Languages",
      habilidades: ["Spanish (Native)", "English (B1 - Intermediate)"],
      nivel: "Intermedio",
      tipo: "lang",
      core: ["Spanish (Native)", "English (B1)"],
      destacadas: ["Spanish (Native)", "English (B1 Intermediate)", "Technical Reading"]
    }
  ],

  proyectos: [
    {
      id: 1,
      nombre: "Olist — E-Commerce SQL Analytics & Power BI",
      tipo: "Data Analysis & Dashboard",
      categoria: "Data Analysis",
      descripcion: "Analysis of ~100 thousand orders from a Brazilian e-commerce store: business questions in SQL, a consolidated view, and an interactive dashboard validated against queries.",
      metricas_o_caracteristicas: [
        "Total revenue 13.22M and average order value 137",
        "São Paulo ~38% of revenue (5.07M)",
        "Monthly revenue stable between 0.8M and 1.0M in 2018",
        "Cross-validation between SQL queries and the DAX model"
      ],
      stack: ["SQL Server", "T-SQL", "Power BI", "DAX"],
      stack_resumen: "SQL Server, Power BI, DAX",
      url: "https://github.com/AnthonyAndino/olist-sql-analysis"
    },
    {
      id: 2,
      nombre: "RH Manager — Dashboard, Attendance and Payroll",
      tipo: "Full-Stack Web Application",
      categoria: "Web Development",
      descripcion: "HR management system with a role-based KPI dashboard, attendance tracking with late-arrival detection, and monthly payroll calculation.",
      metricas_o_caracteristicas: [
        "Token authentication with admin and employee roles",
        "Automatic late-arrival detection (after 8:05 AM)",
        "Payroll calculation with deductions, bonuses, and history",
        "Excel-compatible CSV export and dark mode"
      ],
      stack: ["React", "Vite", "Django REST", "MySQL"],
      stack_resumen: "React, Django REST, MySQL",
      url: "https://github.com/AnthonyAndino/rh-manager"
    },
    {
      id: 3,
      nombre: "DayMark — Habits, Streaks and Charts",
      tipo: "Analytics Web Application",
      categoria: "Web Application",
      descripcion: "Habit tracker and personal journal with streaks, a monthly calendar, activity charts, and custom themes.",
      metricas_o_caracteristicas: [
        "One-click daily logging with automatic streak calculation",
        "Monthly calendar and visualizations with Recharts",
        "Custom themes with automatic contrast calculation",
        "JWT in httpOnly cookies, bcrypt, and Zod validation"
      ],
      stack: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
      stack_resumen: "Next.js, Prisma, PostgreSQL",
      url: "https://github.com/AnthonyAndino/DayMark"
    },
    {
      id: 4,
      nombre: "Networking Labs — 12 Hands-on Labs",
      tipo: "Networking and Security",
      categoria: "Networking & Security",
      descripcion: "12 hands-on networking labs: VLANs, inter-VLAN routing, ACLs, DHCP Snooping, Dynamic ARP Inspection, pfSense firewall, and packet analysis.",
      metricas_o_caracteristicas: [
        "12 labs on switching, routing, ACLs, and security",
        "Mitigation with DHCP Snooping and Dynamic ARP Inspection",
        "pfSense firewall with WAN/LAN/DMZ zones",
        "Packet capture and filtering with Wireshark"
      ],
      stack: ["Packet Tracer", "GNS3", "pfSense", "Wireshark"],
      stack_resumen: "Packet Tracer, pfSense, Wireshark",
      url: "https://github.com/AnthonyAndino/Networking-Labs"
    },
    {
      id: 5,
      nombre: "Smart Theme Switcher — VS Code Extension",
      tipo: "Extension & Productivity Tool",
      categoria: "Extension / Tool",
      descripcion: "Automatically changes the VS Code theme based on the project, time of day, file language, or a favorites list.",
      metricas_o_caracteristicas: [
        "4 combinable modes: workspace, time, favorites, language",
        "Astronomical sunrise and sunset calculation by IP",
        "Sequential or random rotation with live preview",
        "Bilingual version 0.0.9 (Spanish and English)"
      ],
      stack: ["VS Code", "Extension", "TypeScript", "Node.js"],
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
      accion: "Connect on LinkedIn"
    },
    {
      id: 2,
      medio: "Email",
      valor: "anthonyandino959@gmail.com",
      enlace: "mailto:anthonyandino959@gmail.com",
      icono: "EM",
      accion: "Send Email"
    },
    {
      id: 3,
      medio: "Official Portfolio Website",
      valor: "anthonyandino.vercel.app",
      enlace: "https://anthonyandino.vercel.app",
      icono: "WB",
      accion: "Visit Website"
    },
    {
      id: 4,
      medio: "Location",
      valor: "Tegucigalpa, Honduras",
      enlace: "https://maps.google.com/?q=Tegucigalpa,Honduras",
      icono: "UB",
      accion: "View City"
    }
  ],

  easter_egg: [
    {
      id: 777,
      mensaje: "Classified record located successfully",
      codigo_secreto: "DATA_DRIVEN_2026",
      consejo_data: "In data analytics, referential integrity and ledger verification always reveal the truth.",
      easter_egg: "Ready to bring rigor and value to your analytics team!"
    }
  ]
};

export const WORK_EXPERIENCE_DATA: WorkExperienceCase[] = [
  {
    id: 1,
    year: '2024',
    company: 'Cooperativa La Reyna',
    role: 'Technical Support Assistant',
    period: 'August 2024 – October 2024',
    location: 'Tegucigalpa, Honduras',
    resumen: {
      metaLine: 'Cooperativa La Reyna · Technical Support Assistant · Aug–Oct 2024',
      company: 'Cooperativa La Reyna',
      role: 'Technical Support Assistant',
      dates: 'Aug–Oct 2024',
      result: '4 accounting discrepancies, 100% reconciled.',
      summary: 'Cross-checking records with SQL (GROUP BY and HAVING) to locate differences in savings and credit accounts.',
      tags: ['SQL', 'Data Validation', 'Account Auditing'],
      miniVisualType: 'audit-ledger',
    },
    detalle: {
      challengeTitle: 'MAIN CHALLENGE & RESULTS:',
      keyPoints: [
        'Identified and resolved 4 critical accounting discrepancy issues by cross-checking and comparing records in the database to locate differences in financial transactions.',
        'Ran advanced SQL queries to validate and correct data in customer accounts, resolving inconsistencies in savings and credit accounts.',
        'Provided end-to-end support: migrated the operating system and data of critical machines to ensure operational continuity, and configured IP telephony.',
      ],
      techStack: ['SQL', 'Data Validation', 'Account Auditing', 'Windows', 'VoIP'],
      sqlQuery: "SELECT empresa, cargo, impacto FROM experiencia WHERE empresa = 'Cooperativa La Reyna';",
      sqlTable: 'cooperativa_reyna',
    },
  },
  {
    id: 2,
    year: '2025',
    company: 'Porsalud',
    role: 'Web Development / Systems Intern',
    period: 'September 2025 – January 2026',
    location: 'Tegucigalpa, Honduras',
    resumen: {
      metaLine: 'Porsalud · Web Development / Systems Intern · Sep 2025–Jan 2026',
      company: 'Porsalud',
      role: 'Web Development / Systems Intern',
      dates: 'Sep 2025–Jan 2026',
      result: 'Stored procedures and a user module for multi-site staff.',
      summary: 'Fixed the time-clock logic, validated it in the test database, and reported bugs before production release.',
      tags: ['SQL', 'Stored Procedures', 'C#', 'JavaScript'],
      miniVisualType: 'procedure-debugger',
    },
    detalle: {
      challengeTitle: 'SYSTEMS & DATABASE ACHIEVEMENTS:',
      keyPoints: [
        'Resolved issues in stored procedures and functions related to system logic, using the test database to validate the fixes.',
        'Fixed the broken time-clock entry charts and completed the user management module (C# and JavaScript) of a platform used by staff across multiple sites, including colleagues in other countries.',
        'Took part in the technical review of new features, verifying data integrity and reporting bugs before release to production.',
      ],
      techStack: ['SQL', 'Stored Procedures', 'C#', 'JavaScript', 'Testing DB'],
      sqlQuery: "SELECT empresa, cargo, puntos_clave FROM experiencia WHERE empresa = 'Porsalud';",
      sqlTable: 'porsalud',
    },
  },
  {
    id: 3,
    year: '2026 →',
    company: 'In Progress',
    role: 'Personal projects and continuous learning',
    period: 'Present',
    location: 'Tegucigalpa, Honduras',
    resumen: {
      metaLine: 'In Progress · Personal projects and continuous learning · 2026',
      company: 'In Progress',
      role: 'Personal projects and continuous learning',
      dates: '2026',
      result: 'Learning and building.',
      summary: 'Olist, RH Manager, and DayMark, certifications, and ongoing SQL and Python practice.',
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
    category: "Data analysis · SQL Server + Power BI",
    tags: ["SQL Server", "T-SQL", "Power BI", "DAX"],
    summary: "Analysis of ~100 thousand orders from a Brazilian e-commerce store: business questions in SQL, a consolidated view, and an interactive dashboard validated against queries.",
    detailBullets: [
      "4-step workflow: exploration and business questions in SQL Server; v_ventas view joining orders, products, customers, and categories; interactive dashboard in Power BI with DAX measures; and validations comparing the dashboard with SQL queries.",
      "Analysis decisions: only delivered orders were considered, September and October 2018 were excluded due to incomplete source data, revenue was calculated as the sum of price without freight, and categories were translated using the official table.",
      "Note: the dataset is from Kaggle (Olist) and the CSV files are not included in the repository to keep version control lean."
    ],
    findings: [
      { label: "Total revenue", value: "13.22M" },
      { label: "Average order value", value: "137" },
      { label: "São Paulo", value: "~38% of revenue (5.07M)" },
      { label: "Monthly revenue 2018", value: "Stable between 0.8M and 1.0M" },
      { label: "Top categories", value: "health_beauty, watches_gifts, bed_bath_table" },
    ],
    links: [
      { label: "Repository", url: "https://github.com/AnthonyAndino/olist-sql-analysis" }
    ],
    accent: "#ff3e00",
    featured: true,
  },
  {
    id: 2,
    number: "02",
    title: "RH Manager",
    category: "Web application · Dashboard, attendance and payroll",
    tags: ["React", "Vite", "Django REST", "MySQL"],
    summary: "HR management system with a role-based KPI dashboard, attendance tracking with late-arrival detection, and monthly payroll calculation.",
    detailBullets: [
      "Token authentication with admin and employee roles, plus employee CRUD with profile photos.",
      "Attendance tracking with automatic late-arrival detection (after 8:05 AM).",
      "Monthly payroll calculation with a breakdown of deductions, bonuses, and payment history.",
      "Sortable tables, filters by employee and date, pagination, and Excel-compatible CSV export.",
      "Built-in dark mode and configured demo data (10 employees, 30 days of attendance, 3 months of payroll)."
    ],
    links: [
      { label: "Repository", url: "https://github.com/AnthonyAndino/rh-manager" }
    ],
    accent: "#1f6f5c",
    featured: false,
    images: [
      {
        src: "/projects/rhmanager.png",
        alt: "RH Manager dashboard with employee, attendance, and payroll metrics",
        caption: "RH Manager overview dashboard"
      }
    ],
  },
  {
    id: 3,
    number: "03",
    title: "DayMark",
    category: "Web application · Habits, streaks and charts",
    tags: ["Next.js", "TypeScript", "Prisma", "PostgreSQL"],
    summary: "Habit tracker and personal journal with streaks, a monthly calendar, activity charts, and custom themes.",
    detailBullets: [
      "One-click daily habit logging with automatic consecutive-streak calculation.",
      "Personal notes per day and a monthly calendar with visual completion status.",
      "Interactive activity charts built with Recharts.",
      "4 base themes plus customization with hex colors and automatic contrast.",
      "Interface and documentation fully available in Spanish and English.",
      "Authentication with JWT in httpOnly cookies, bcrypt password hashing, and strict validation with Zod.",
      "Architecture: Next.js 16, React 19, TypeScript, Tailwind v4, Prisma 7, and PostgreSQL."
    ],
    links: [
      { label: "Repository", url: "https://github.com/AnthonyAndino/DayMark" },
      { label: "Live Demo", url: "https://daymark-ochre.vercel.app" }
    ],
    accent: "#1f6f5c",
    featured: false,
    images: [
      {
        src: "/projects/daymark.gif",
        alt: "Interactive demo of DayMark with daily habit tracking and streaks",
        caption: "DayMark view"
      }
    ],
  },
  {
    id: 4,
    number: "04",
    title: "Networking Labs",
    category: "Networking and security · Packet Tracer and GNS3",
    tags: ["Packet Tracer", "GNS3", "pfSense", "Wireshark"],
    summary: "12 hands-on networking labs: VLANs, inter-VLAN routing, ACLs, DHCP Snooping, Dynamic ARP Inspection, pfSense firewall, and packet analysis.",
    detailBullets: [
      "Full list of hands-on labs (00 to 11): Setup; First Network (switching, ARP, ICMP, OSI model, subnetting); Router (routing and gateway); VLANs; Inter-VLAN with router-on-a-stick; ACLs; DHCP, DNS, and HTTP; Port Security; DHCP Snooping; Dynamic ARP Inspection; pfSense Firewall with WAN/LAN/DMZ zones; and analysis with Wireshark (capture and filters).",
      "Each lab includes detailed README documentation, topology, network diagram, and device configurations."
    ],
    links: [
      { label: "Repository", url: "https://github.com/AnthonyAndino/Networking-Labs" }
    ],
    accent: "#3f3cbb",
    featured: false,
    images: [
      {
        src: "/projects/Networking Labs.png",
        alt: "Network topology and diagrams from the hands-on switching and routing labs",
        caption: "Topology and network diagram of the labs"
      }
    ],
  },
  {
    id: 5,
    number: "05",
    title: "Smart Theme Switcher",
    category: "VS Code extension · Editor automation",
    tags: ["VS Code", "Extension"],
    summary: "Automatically changes the VS Code theme based on the project, time of day, file language, or a favorites list.",
    detailBullets: [
      "Four combinable modes: workspace, scheduled time, favorites, and file language.",
      "Changes based on real astronomical sunrise and sunset by location with IP-based detection.",
      "Favorites rotation in manual or automatic mode, sequential or random.",
      "Live preview when choosing themes inside the editor.",
      "Version 0.0.9 with Spanish and English support and interface."
    ],
    links: [
      { label: "Repository", url: "https://github.com/AnthonyAndino/Smart-Theme-Switcher-VS-Code-Extension-" }
    ],
    accent: "#3f3cbb",
    featured: false,
    images: [
      {
        src: "/projects/smart_theme_switch.gif",
        alt: "Animated demo of the Smart Theme Switcher extension changing themes in VS Code",
        caption: "Theme switching view in VS Code"
      }
    ],
  }
];

export const RELATED_SKILLS: [string, string][] = [
  ['SQL', 'PostgreSQL'],
  ['SQL', 'MySQL'],
  ['SQL', 'Stored Procedures'],
  ['SQL', 'SQL Functions'],
  ['SQL', 'Power BI (Basic)'],
  ['SQL', 'Data Validation and Cleaning'],
  ['SQL', 'Record Auditing'],
  ['Python for Analysis', 'Python'],
  ['Python for Analysis', 'Data Validation and Cleaning'],
  ['Prisma ORM', 'PostgreSQL'],
  ['KPI Dashboards', 'Power BI (Basic)'],
  ['JavaScript', 'TypeScript'],
  ['TypeScript', 'React'],
  ['JavaScript', 'Node.js'],
  ['Git', 'GitHub'],
];

export const CORE_SKILLS = new Set<string>([
  'SQL',
  'Stored Procedures',
  'PostgreSQL',
  'MySQL',
  'Python for Analysis',
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
  line2: string; // Serif italic with data-cleaning
  line3: string; // Sans with a vermilion period
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
 * STRICT CHARACTER-LENGTH RULES FOR THE HOME HEADLINE:
 * To avoid line breaks and horizontal overflow:
 * - Row 1 (no indent): max 7 characters.
 * - Row 2 (pl-32 indent): max 12 characters.
 * - Row 3 (pl-64 indent): max 11 characters (including the vermilion period).
 */
export const HERO_PHRASE_LIMITS = {
  line1Max: 7,
  line2Max: 12,
  line3MaxWithDot: 11, // line3 + 1 (period)
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
      tag: "01 / PROFILE",
      label: "Profile",
      value: "Bachelor's Degree in Administrative Informatics (UNAH).",
    },
    {
      id: "projects",
      tag: "02 / Projects",
      label: "Projects",
      value: "5 projects: data, web apps, networking, and an extension.",
    },
    {
      id: "availability",
      tag: "03 / AVAILABILITY",
      label: "Availability",
      value: "Immediate · Remote or hybrid · Tegucigalpa, Honduras.",
    },
  ],
  scrollCta: {
    label: "Explore my work",
    targetSection: "work",
  },
  parallax: {
    greeting: 2.5,         // subtle 2.5px aligned with the headline
    headlineRow1: 8,       // smooth 8px in the cursor direction
    headlineRow2: 10,      // 10px intermediate
    headlineRow3: 13,      // 13px bottom row
    backgroundChart: -22,  // -22px in the opposite direction (distant depth feel)
    verticalLabel: 3,      // subtle 3px
    bottomColumns: 2.5,    // very stable 2.5px
    lerpEase: 0.075,       // fluid, remarkably smooth inertia
  },
};

// Development validation to guarantee strict character limits
if (import.meta.env?.DEV) {
  HOME_HERO_DATA.phrases.forEach((phrase, idx) => {
    if (phrase.line1.length > HERO_PHRASE_LIMITS.line1Max) {
      console.warn(
        `[HOME_HERO_DATA] Phrase ${idx + 1} row 1 "${phrase.line1}" (${phrase.line1.length} chars) exceeds the maximum of ${HERO_PHRASE_LIMITS.line1Max}.`
      );
    }
    if (phrase.line2.length > HERO_PHRASE_LIMITS.line2Max) {
      console.warn(
        `[HOME_HERO_DATA] Phrase ${idx + 1} row 2 "${phrase.line2}" (${phrase.line2.length} chars) exceeds the maximum of ${HERO_PHRASE_LIMITS.line2Max}.`
      );
    }
    const line3WithDotLen = phrase.line3.length + 1;
    if (line3WithDotLen > HERO_PHRASE_LIMITS.line3MaxWithDot) {
      console.warn(
        `[HOME_HERO_DATA] Phrase ${idx + 1} row 3 "${phrase.line3}." (${line3WithDotLen} chars) exceeds the maximum of ${HERO_PHRASE_LIMITS.line3MaxWithDot}.`
      );
    }
  });
}
