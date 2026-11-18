export interface Profile {
  id: number;
  nombre: string;
  titulo: string;
  grado: string;
  ubicacion: string;
  resumen: string;
  email: string;
  linkedin: string;
  github?: string;
  portfolio: string;
  disponibilidad: string;
}

export interface Experience {
  id: number;
  empresa: string;
  cargo: string;
  periodo: string;
  ubicacion: string;
  tipo: string;
  puntos_clave: string[];
  tecnologias: string[];
  impacto: string;
}

export interface Education {
  id: number;
  carrera: string;
  titulo?: string;
  institucion: string;
  periodo: string;
  ubicacion: string;
  estado: string;
  enfoque: string;
}

export interface Certification {
  id: number;
  nombre: string;
  titulo?: string;
  emisor: string;
  entidad?: string;
  fecha: string;
  credencial_id?: string;
  categoria: 'Data Science' | 'Cloud & Linux' | 'Networking' | 'Ciberseguridad';
  icono: string;
  imagen?: string;
  urlVerificacion?: string;
  descripcion?: string;
  rotate?: number;
}

export interface WorkCaseSummary {
  metaLine: string;
  company?: string;
  role?: string;
  dates?: string;
  result: string;
  summary: string;
  tags: string[];
  miniVisualType: 'audit-ledger' | 'procedure-debugger' | 'trend-line';
}

export interface WorkCaseDetail {
  challengeTitle: string;
  keyPoints: string[];
  techStack: string[];
  sqlQuery: string;
  sqlTable: string;
}

export interface WorkExperienceCase {
  id: 1 | 2 | 3;
  year: '2024' | '2025' | '2026 →';
  company: string;
  role: string;
  period: string;
  location: string;
  resumen: WorkCaseSummary;
  detalle?: WorkCaseDetail;
}

export interface SkillCategory {
  id: number;
  categoria: string;
  habilidades: string[];
  nivel: 'Avanzado' | 'Intermedio' | 'Fundacional';
  tipo: 'data' | 'db' | 'prog' | 'tools' | 'soft' | 'lang';
  core?: string[];
  destacadas?: string[];
}

export interface ProjectLink {
  label: string; // e.g. "Repositorio" or "Demo en vivo"
  url: string;
}

export interface ProjectImage {
  src: string;
  alt: string;
  caption?: string;
}

export interface ProjectFinding {
  label: string;
  value: string;
}

export interface ProjectItem {
  id: number;
  number: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  detailBullets: string[];
  findings?: ProjectFinding[];
  flowSteps?: string[];
  decisions?: string[];
  note?: string;
  links: ProjectLink[];
  accent: string;
  images?: ProjectImage[];
  featured?: boolean;
}

export interface Project {
  id: number;
  nombre: string;
  tipo: string;
  categoria?: string;
  descripcion: string;
  metricas_o_caracteristicas: string[];
  stack: string[];
  stack_resumen?: string;
  url?: string;
}

export interface ContactInfo {
  id: number;
  medio: string;
  valor: string;
  enlace: string;
  icono: string;
  accion: string;
}

export interface EasterEgg {
  id: number;
  mensaje: string;
  codigo_secreto: string;
  consejo_data: string;
  easter_egg: string;
}

export interface DatabaseTables {
  perfil: Profile[];
  experiencia: Experience[];
  educacion: Education[];
  certificaciones: Certification[];
  habilidades: SkillCategory[];
  proyectos: Project[];
  contacto: ContactInfo[];
  easter_egg: EasterEgg[];
}

export type TableName = keyof DatabaseTables;

export interface QueryResult {
  query: string;
  timestamp: string;
  executionTimeMs: number;
  type: 'SELECT' | 'SHOW_TABLES' | 'DESCRIBE' | 'HELP' | 'CLEAR' | 'ERROR';
  tableName?: TableName;
  columns?: string[];
  rows?: Record<string, unknown>[];
  totalRows?: number;
  errorMessage?: string;
}

export interface QuickQueryItem {
  id: string;
  label: string;
  query: string;
  description: string;
  iconName: string;
  category: 'core' | 'analysis' | 'meta';
}
