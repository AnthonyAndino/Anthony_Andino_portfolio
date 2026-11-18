import { PORTFOLIO_DB, TABLE_SCHEMAS } from '../data/portfolioData';
import { CHALLENGE_DB } from '../data/challengeData';
import { QueryResult, TableName } from '../types/portfolio';
import { Locale } from '../i18n/translations';

export interface SqlEngineOptions {
  context?: 'portfolio' | 'challenge' | 'auto';
  locale?: Locale;
}

type SchemaField = { column: string; type: string; description: string };
type ChallengeSchemaMap = Record<string, SchemaField[]>;

const CHALLENGE_SCHEMAS: Record<Locale, ChallengeSchemaMap> = {
  es: {
    cuentas: [
      { column: 'id', type: 'INT PRIMARY KEY', description: 'Identificador único de la cuenta' },
      { column: 'titular', type: 'VARCHAR(100)', description: 'Nombre o titular asignado' },
      { column: 'tipo', type: 'VARCHAR(20)', description: 'Categoría: ahorro | credito' },
    ],
    conciliacion: [
      { column: 'cuenta_id', type: 'INT', description: 'Identificador foráneo de la cuenta' },
      { column: 'saldo_libro', type: 'DECIMAL(12,2)', description: 'Saldo en libros contables internos' },
      { column: 'saldo_banco', type: 'DECIMAL(12,2)', description: 'Saldo extractado de la entidad bancaria' },
      { column: 'diferencia', type: 'DECIMAL(12,2)', description: 'Diferencia absoluta (|libro - banco|)' },
    ],
    movimientos: [
      { column: 'id', type: 'INT PRIMARY KEY', description: 'Identificador del movimiento' },
      { column: 'cuenta_id', type: 'INT', description: 'Cuenta bancaria asociada' },
      { column: 'fecha', type: 'DATE', description: 'Fecha de ejecución (AAAA-MM-DD)' },
      { column: 'concepto', type: 'VARCHAR(150)', description: 'Concepto o glosa de la operación' },
      { column: 'monto', type: 'DECIMAL(12,2)', description: 'Importe monetario del movimiento' },
    ],
  },
  en: {
    cuentas: [
      { column: 'id', type: 'INT PRIMARY KEY', description: 'Unique account identifier' },
      { column: 'titular', type: 'VARCHAR(100)', description: 'Assigned holder or name' },
      { column: 'tipo', type: 'VARCHAR(20)', description: 'Category: ahorro | credito' },
    ],
    conciliacion: [
      { column: 'cuenta_id', type: 'INT', description: 'Foreign identifier of the account' },
      { column: 'saldo_libro', type: 'DECIMAL(12,2)', description: 'Balance in the internal accounting ledger' },
      { column: 'saldo_banco', type: 'DECIMAL(12,2)', description: 'Balance taken from the bank statement' },
      { column: 'diferencia', type: 'DECIMAL(12,2)', description: 'Absolute difference (|ledger - bank|)' },
    ],
    movimientos: [
      { column: 'id', type: 'INT PRIMARY KEY', description: 'Transaction identifier' },
      { column: 'cuenta_id', type: 'INT', description: 'Associated bank account' },
      { column: 'fecha', type: 'DATE', description: 'Execution date (YYYY-MM-DD)' },
      { column: 'concepto', type: 'VARCHAR(150)', description: 'Operation concept or description' },
      { column: 'monto', type: 'DECIMAL(12,2)', description: 'Monetary amount of the transaction' },
    ],
  },
};

const PORTFOLIO_DESCRIPTIONS_EN: Record<string, string> = {
  'Identificador único': 'Unique identifier',
  'Nombre completo': 'Full name',
  'Rol profesional principal': 'Main professional role',
  'Título universitario': 'University degree',
  'Ciudad y país de residencia': 'City and country of residence',
  'Perfil profesional sintético': 'Brief professional profile',
  'Correo electrónico': 'Email address',
  'Modalidad y tiempo de incorporación': 'Work mode and availability to join',
  'Identificador de experiencia': 'Experience identifier',
  'Nombre de la organización': 'Organization name',
  'Puesto desempeñado': 'Job position held',
  'Duración en la institución': 'Tenure at the institution',
  'Logros y tareas técnicas destacadas': 'Key achievements and technical tasks',
  'Stack de herramientas utilizadas': 'Tool stack used',
  'Resultado medible alcanzado': 'Measurable result achieved',
  'ID de categoría': 'Category ID',
  'Área de competencia': 'Area of expertise',
  'Lista de tecnologías/habilidades': 'List of technologies/skills',
  'Top 3 habilidades clave de la categoría': 'Top 3 key skills in the category',
  'Avanzado | Intermedio | Fundacional': 'Advanced | Intermediate | Foundational',
  'Clasificación interna de color y badge': 'Internal color and badge classification',
  'ID del proyecto': 'Project ID',
  'Título del proyecto analítico': 'Analytical project title',
  'Categoría de producto': 'Product category',
  'Categoría corta del proyecto': 'Short project category',
  'Problema resuelto y alcance': 'Problem solved and scope',
  'Indicadores y capacidades': 'Metrics and capabilities',
  'Tecnologías y lenguajes': 'Technologies and languages',
  'Resumen sintético del stack': 'Concise stack summary',
  'ID de certificación': 'Certification ID',
  'Título de la certificación': 'Certification title',
  'Alias del título de la certificación': 'Certification title alias',
  'Entidad emisora internacional': 'International issuing entity',
  'Alias de la entidad emisora': 'Issuing entity alias',
  'Fecha de expedición': 'Issue date',
  'Dominio temático': 'Thematic domain',
  'Ruta de imagen o badge del certificado': 'Certificate image or badge path',
  'Enlace web de verificación oficial': 'Official verification link',
  'ID de registro educativo': 'Education record ID',
  'Programa cursado': 'Program completed',
  'Título universitario obtenido': 'University degree earned',
  Universidad: 'University',
  'Años de estudio': 'Years of study',
  'Condición académica': 'Academic status',
  'ID de medio': 'Channel ID',
  'Canal de contacto': 'Contact channel',
  'Dirección o enlace': 'Address or link',
  'Texto descriptivo de acción': 'Descriptive action text',
};

const HELP_ITEMS = [
  { command: 'SELECT', syntax: 'SELECT * FROM <tabla>;', es: 'Obtiene todos los registros y columnas de una tabla', en: 'Retrieves all records and columns from a table' },
  { command: 'SELECT (cols)', syntax: 'SELECT col1, col2 FROM <tabla>;', es: 'Proyecta columnas específicas', en: 'Projects specific columns' },
  { command: 'WHERE', syntax: 'SELECT * FROM <tabla> WHERE col = "valor";', es: 'Filtra filas por condición de igualdad', en: 'Filters rows by an equality condition' },
  { command: 'WHERE (<, >, !=)', syntax: 'SELECT * FROM <tabla> WHERE col > 0;', es: 'Filtros numéricos y comparativos', en: 'Numeric and comparative filters' },
  { command: 'ORDER BY', syntax: 'SELECT * FROM <tabla> ORDER BY col DESC;', es: 'Ordena resultados de forma ascendente o descendente', en: 'Sorts results ascending or descending' },
  { command: 'LIMIT', syntax: 'SELECT * FROM <tabla> LIMIT 1;', es: 'Limita el número máximo de registros devueltos', en: 'Limits the maximum number of returned records' },
  { command: 'WHERE LIKE', syntax: 'SELECT * FROM <tabla> WHERE col LIKE "%texto%";', es: 'Búsqueda parcial en cadenas de texto', en: 'Partial search in text strings' },
  { command: 'SHOW TABLES', syntax: 'SHOW TABLES;', es: 'Lista las tablas accesibles en el esquema activo', en: 'Lists the tables available in the active schema' },
  { command: 'DESCRIBE', syntax: 'DESCRIBE <tabla>;', es: 'Muestra la estructura y tipos de datos de una tabla', en: 'Shows the structure and data types of a table' },
  { command: 'CLEAR', syntax: 'CLEAR;', es: 'Limpia el terminal y restablece la consola', en: 'Clears the terminal and resets the console' },
];

function localizePortfolioDescription(description: string, locale: Locale): string {
  return locale === 'en' ? (PORTFOLIO_DESCRIPTIONS_EN[description] ?? description) : description;
}

export class SqlEngine {
  private static sanitize(str: string): string {
    return str.trim().replace(/;$/, '').trim();
  }

  public static execute(rawQuery: string, options: SqlEngineOptions = { context: 'auto' }): QueryResult {
    const startTime = performance.now();
    const cleanQuery = this.sanitize(rawQuery);
    const nowIso = new Date().toLocaleTimeString();
    const locale: Locale = options.locale ?? 'es';
    const isEn = locale === 'en';
    const pick = (spanish: string, english: string) => (isEn ? english : spanish);
    const challengeSchemas = CHALLENGE_SCHEMAS[locale];

    if (!cleanQuery) {
      return {
        query: rawQuery,
        timestamp: nowIso,
        executionTimeMs: 0,
        type: 'ERROR',
        errorMessage: pick(
          'Consulta vacía. Escribe una instrucción SQL o haz clic en las sugerencias rápidas.',
          'Empty query. Type an SQL statement or click one of the quick suggestions.'
        ),
      };
    }

    const upper = cleanQuery.toUpperCase();

    // 1. HELP
    if (upper === 'HELP' || upper === '\\H' || upper === '?') {
      const helpColumns = isEn
        ? ['command', 'syntax', 'description']
        : ['comando', 'sintaxis', 'descripcion'];
      const helpRows = HELP_ITEMS.map((item): Record<string, unknown> => {
        if (isEn) {
          return { command: item.command, syntax: item.syntax, description: item.en };
        }
        return { comando: item.command, sintaxis: item.syntax, descripcion: item.es };
      });

      return {
        query: cleanQuery,
        timestamp: nowIso,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        type: 'HELP',
        columns: helpColumns,
        rows: helpRows,
        totalRows: helpRows.length,
      };
    }

    // 2. CLEAR
    if (upper === 'CLEAR' || upper === 'CLS') {
      return {
        query: cleanQuery,
        timestamp: nowIso,
        executionTimeMs: 0,
        type: 'CLEAR',
      };
    }

    // 3. SHOW TABLES
    if (upper === 'SHOW TABLES' || upper === 'SHOW TABLES;' || upper === 'SHOW DATABASES') {
      const isChallengeMode = options.context === 'challenge';
      const recordsHeader = pick('Registros', 'Records');

      if (isChallengeMode) {
        const descriptionHeader = pick('Descripcion', 'Description');
        const challengeDbRecord = CHALLENGE_DB as unknown as Record<string, unknown[]>;
        const rows = Object.keys(CHALLENGE_DB).map((tName, idx) => ({
          '#': idx + 1,
          'Tables_in_audit_lab': tName,
          [recordsHeader]: challengeDbRecord[tName]?.length || 0,
          [descriptionHeader]: pick(
            tName === 'cuentas'
              ? 'Catálogo de cuentas bancarias y tipos de producto'
              : tName === 'conciliacion'
              ? 'Saldos de libros, extractos bancarios y diferencias'
              : 'Detalle de transacciones y movimientos registrados',
            tName === 'cuentas'
              ? 'Catalog of bank accounts and product types'
              : tName === 'conciliacion'
              ? 'Ledger balances, bank statements and differences'
              : 'Detail of recorded transactions and movements'
          ),
        }));

        return {
          query: cleanQuery,
          timestamp: nowIso,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
          type: 'SHOW_TABLES',
          columns: ['#', 'Tables_in_audit_lab', recordsHeader, descriptionHeader],
          rows,
          totalRows: rows.length,
        };
      }

      const domainHeader = pick('Dominio', 'Domain');
      const rows = (Object.keys(PORTFOLIO_DB) as TableName[])
        .filter((t) => t !== 'easter_egg')
        .map((tableName, idx) => ({
          '#': idx + 1,
          'Tables_in_anthony_db': tableName,
          [recordsHeader]: PORTFOLIO_DB[tableName].length,
          [domainHeader]: getTableDescription(tableName, locale),
        }));

      return {
        query: cleanQuery,
        timestamp: nowIso,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        type: 'SHOW_TABLES',
        columns: ['#', 'Tables_in_anthony_db', recordsHeader, domainHeader],
        rows,
        totalRows: rows.length,
      };
    }

    // 4. DESCRIBE / DESC
    const descMatch = cleanQuery.match(/^(?:DESCRIBE|DESC)\s+([a-zA-Z0-9_]+)$/i);
    if (descMatch) {
      const targetTable = descMatch[1].toLowerCase();

      // Check Challenge schemas
      if (challengeSchemas[targetTable]) {
        const schema = challengeSchemas[targetTable];
        return {
          query: cleanQuery,
          timestamp: nowIso,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
          type: 'DESCRIBE',
          columns: ['Field', 'Type', 'Description'],
          rows: schema.map((s) => ({
            Field: s.column,
            Type: s.type,
            Description: s.description,
          })),
          totalRows: schema.length,
        };
      }

      // Check Portfolio schemas
      const schema = TABLE_SCHEMAS[targetTable];
      if (!schema) {
        return {
          query: cleanQuery,
          timestamp: nowIso,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
          type: 'ERROR',
          errorMessage: pick(
            `ERROR 1146 (42S02): La tabla '${descMatch[1]}' no existe en el catálogo activo.`,
            `ERROR 1146 (42S02): Table '${descMatch[1]}' does not exist in the active catalog.`
          ),
        };
      }

      return {
        query: cleanQuery,
        timestamp: nowIso,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        type: 'DESCRIBE',
        tableName: targetTable as TableName,
        columns: ['Field', 'Type', 'Description'],
        rows: schema.map((s) => ({
          Field: s.column,
          Type: s.type,
          Description: localizePortfolioDescription(s.description, locale),
        })),
        totalRows: schema.length,
      };
    }

    // 5. SELECT QUERY
    // Matches: SELECT <cols> FROM <table> [WHERE <where>] [ORDER BY <col> [ASC|DESC]] [LIMIT <num>]
    const selectRegex = /^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+([\s\S]+?))?(?:\s+ORDER\s+BY\s+([a-zA-Z0-9_]+)(?:\s+(ASC|DESC))?)?(?:\s+LIMIT\s+(\d+))?$/i;
    const selectMatch = cleanQuery.match(selectRegex);

    if (selectMatch) {
      const rawCols = selectMatch[1].trim();
      const targetTable = selectMatch[2].toLowerCase();
      const whereClause = selectMatch[3] ? selectMatch[3].trim() : null;
      const orderCol = selectMatch[4] ? selectMatch[4].trim() : null;
      const orderDir = selectMatch[5] ? selectMatch[5].toUpperCase() : 'ASC';
      const limitVal = selectMatch[6] ? parseInt(selectMatch[6], 10) : null;

      // Locate table data in Challenge DB or Portfolio DB
      let tableData: Record<string, unknown>[] | null = null;

      const challengeDbRecord = CHALLENGE_DB as unknown as Record<string, Record<string, unknown>[]>;
      if (challengeDbRecord[targetTable]) {
        tableData = challengeDbRecord[targetTable];
      } else if (PORTFOLIO_DB[targetTable as TableName]) {
        tableData = PORTFOLIO_DB[targetTable as TableName] as unknown as Record<string, unknown>[];
      }

      if (!tableData) {
        return {
          query: cleanQuery,
          timestamp: nowIso,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
          type: 'ERROR',
          errorMessage: pick(
            `ERROR 1146 (42S02): La tabla '${selectMatch[2]}' no existe. Ejecuta 'SHOW TABLES;' para ver las entidades disponibles.`,
            `ERROR 1146 (42S02): Table '${selectMatch[2]}' does not exist. Run 'SHOW TABLES;' to see the available entities.`
          ),
        };
      }

      let filteredData: Record<string, unknown>[] = tableData.map((row) => ({ ...row }));

      // Process WHERE
      if (whereClause) {
        filteredData = applyWhere(filteredData, whereClause);
      }

      // Process ORDER BY
      if (orderCol) {
        filteredData.sort((a, b) => {
          const valA = getFieldValue(a, orderCol);
          const valB = getFieldValue(b, orderCol);

          if (valA === undefined && valB === undefined) return 0;
          if (valA === undefined) return 1;
          if (valB === undefined) return -1;

          if (typeof valA === 'number' && typeof valB === 'number') {
            return orderDir === 'DESC' ? valB - valA : valA - valB;
          }

          const strA = String(valA).toLowerCase();
          const strB = String(valB).toLowerCase();
          if (strA < strB) return orderDir === 'DESC' ? 1 : -1;
          if (strA > strB) return orderDir === 'DESC' ? -1 : 1;
          return 0;
        });
      }

      // Process LIMIT
      if (limitVal !== null && limitVal >= 0) {
        filteredData = filteredData.slice(0, limitVal);
      }

      // Process Projection (Columns)
      let finalColumns: string[] = [];
      let finalRows: Record<string, unknown>[] = [];

      if (rawCols === '*') {
        if (filteredData.length > 0) {
          finalColumns = Object.keys(filteredData[0]);
        } else if (challengeSchemas[targetTable]) {
          finalColumns = challengeSchemas[targetTable].map((s) => s.column);
        } else if (TABLE_SCHEMAS[targetTable]) {
          finalColumns = TABLE_SCHEMAS[targetTable].map((s) => s.column);
        } else {
          finalColumns = ['resultado'];
        }
        finalRows = filteredData;
      } else {
        const requestedCols = rawCols.split(',').map((c) => c.trim().toLowerCase());

        // Validate columns against original table sample if available
        if (tableData.length > 0) {
          const availableCols = Object.keys(tableData[0]).map((c) => c.toLowerCase());
          const invalid = requestedCols.filter((rc) => !availableCols.includes(rc));
          if (invalid.length > 0) {
            return {
              query: cleanQuery,
              timestamp: nowIso,
              executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
              type: 'ERROR',
              errorMessage: pick(
                `ERROR 1054 (42S22): Columna(s) desconocida(s) '${invalid.join(', ')}' en field list. Columnas válidas en '${targetTable}': ${availableCols.join(', ')}`,
                `ERROR 1054 (42S22): Unknown column(s) '${invalid.join(', ')}' in field list. Valid columns in '${targetTable}': ${availableCols.join(', ')}`
              ),
            };
          }
        }

        finalColumns = requestedCols;
        finalRows = filteredData.map((row) => {
          const projection: Record<string, unknown> = {};
          requestedCols.forEach((col) => {
            const actualKey = Object.keys(row).find((k) => k.toLowerCase() === col);
            if (actualKey) {
              projection[col] = row[actualKey];
            } else {
              projection[col] = null;
            }
          });
          return projection;
        });
      }

      return {
        query: cleanQuery,
        timestamp: nowIso,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        type: 'SELECT',
        tableName: targetTable as TableName,
        columns: finalColumns,
        rows: finalRows,
        totalRows: finalRows.length,
      };
    }

    // Unrecognized syntax
    return {
      query: cleanQuery,
      timestamp: nowIso,
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
      type: 'ERROR',
      errorMessage: pick(
        `ERROR 1064 (42000): Error de sintaxis cerca de '${cleanQuery.substring(0, 35)}...'. Revisa la sintaxis o consulta 'HELP;'.`,
        `ERROR 1064 (42000): Syntax error near '${cleanQuery.substring(0, 35)}...'. Check the syntax or run 'HELP;'.`
      ),
    };
  }
}

function getFieldValue(row: Record<string, unknown>, colName: string): unknown {
  const direct = row[colName];
  if (direct !== undefined) return direct;
  const matchKey = Object.keys(row).find((k) => k.toLowerCase() === colName.toLowerCase());
  return matchKey ? row[matchKey] : undefined;
}

function applyWhere(data: Record<string, unknown>[], whereClause: string): Record<string, unknown>[] {
  const andClauses = whereClause.split(/\s+AND\s+/i);

  return data.filter((row) => {
    return andClauses.every((clause) => evaluateCondition(row, clause.trim()));
  });
}

function evaluateCondition(row: Record<string, unknown>, condition: string): boolean {
  // 1. LIKE '%text%'
  const likeMatch = condition.match(/^([a-zA-Z0-9_]+)\s+LIKE\s+['"%]([^'"%]+)['"%]$/i);
  if (likeMatch) {
    const col = likeMatch[1];
    const term = likeMatch[2].toLowerCase();
    const val = getFieldValue(row, col);
    if (val === undefined || val === null) return false;
    if (Array.isArray(val)) {
      return val.some((v) => String(v).toLowerCase().includes(term));
    }
    return String(val).toLowerCase().includes(term);
  }

  // 2. Comparison operators: >=, <=, !=, <>, >, <, =
  const compMatch = condition.match(/^([a-zA-Z0-9_]+)\s*(>=|<=|!=|<>|>|<|=)\s*['"]?([^'"]+?)['"]?$/i);
  if (compMatch) {
    const col = compMatch[1];
    const op = compMatch[2];
    const rawTarget = compMatch[3].trim();
    const val = getFieldValue(row, col);

    if (val === undefined || val === null) return false;

    const numVal = Number(val);
    const numTarget = Number(rawTarget);
    const isBothNumeric = !isNaN(numVal) && !isNaN(numTarget) && typeof val === 'number';

    if (isBothNumeric) {
      switch (op) {
        case '=':
          return numVal === numTarget;
        case '!=':
        case '<>':
          return numVal !== numTarget;
        case '>':
          return numVal > numTarget;
        case '<':
          return numVal < numTarget;
        case '>=':
          return numVal >= numTarget;
        case '<=':
          return numVal <= numTarget;
        default:
          return false;
      }
    }

    // String / boolean comparison
    const strVal = String(val).toLowerCase();
    const strTarget = rawTarget.toLowerCase();

    switch (op) {
      case '=':
        return strVal === strTarget;
      case '!=':
      case '<>':
        return strVal !== strTarget;
      case '>':
        return strVal > strTarget;
      case '<':
        return strVal < strTarget;
      case '>=':
        return strVal >= strTarget;
      case '<=':
        return strVal <= strTarget;
      default:
        return false;
    }
  }

  return true;
}

function getTableDescription(table: TableName, locale: Locale): string {
  const map: Record<Locale, Record<TableName, string>> = {
    es: {
      perfil: 'Información profesional, contacto y resumen ejecutivo',
      experiencia: 'Trayectoria laboral, proyectos en Porsalud y Cooperativa',
      habilidades: 'Skills en SQL, Python, Excel, Power BI, Desarrollo y BD',
      proyectos: 'Sistemas desarrollados: Olist E-commerce, RH Manager, DayMark y Redes',
      certificaciones: 'Acreditaciones oficiales (IBM, Cisco, Linux Foundation)',
      educacion: 'Grado académico universitario en Informática Administrativa',
      contacto: 'Canales directos: LinkedIn, Correo y Plataformas Profesionales',
      easter_egg: 'Sector clasificado',
    },
    en: {
      perfil: 'Professional information, contact and executive summary',
      experiencia: 'Work history, projects at Porsalud and Cooperativa',
      habilidades: 'Skills in SQL, Python, Excel, Power BI, Development and DBs',
      proyectos: 'Systems built: Olist E-commerce, RH Manager, DayMark and Networks',
      certificaciones: 'Official certifications (IBM, Cisco, Linux Foundation)',
      educacion: "Bachelor's Degree in Administrative Informatics",
      contacto: 'Direct channels: LinkedIn, Email and Professional Platforms',
      easter_egg: 'Classified sector',
    },
  };
  return map[locale][table] || (locale === 'en' ? 'Relational entity' : 'Entidad relacional');
}
