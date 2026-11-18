import { PORTFOLIO_DB, TABLE_SCHEMAS } from '../data/portfolioData';
import { CHALLENGE_DB } from '../data/challengeData';
import { QueryResult, TableName } from '../types/portfolio';

export interface SqlEngineOptions {
  context?: 'portfolio' | 'challenge' | 'auto';
}

const CHALLENGE_SCHEMAS: Record<string, { column: string; type: string; description: string }[]> = {
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
};

export class SqlEngine {
  private static sanitize(str: string): string {
    return str.trim().replace(/;$/, '').trim();
  }

  public static execute(rawQuery: string, options: SqlEngineOptions = { context: 'auto' }): QueryResult {
    const startTime = performance.now();
    const cleanQuery = this.sanitize(rawQuery);
    const nowIso = new Date().toLocaleTimeString();

    if (!cleanQuery) {
      return {
        query: rawQuery,
        timestamp: nowIso,
        executionTimeMs: 0,
        type: 'ERROR',
        errorMessage: 'Consulta vacía. Escribe una instrucción SQL o haz clic en las sugerencias rápidas.',
      };
    }

    const upper = cleanQuery.toUpperCase();

    // 1. HELP
    if (upper === 'HELP' || upper === '\\H' || upper === '?') {
      return {
        query: cleanQuery,
        timestamp: nowIso,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        type: 'HELP',
        columns: ['comando', 'sintaxis', 'descripcion'],
        rows: [
          { comando: 'SELECT', sintaxis: 'SELECT * FROM <tabla>;', descripcion: 'Obtiene todos los registros y columnas de una tabla' },
          { comando: 'SELECT (cols)', sintaxis: 'SELECT col1, col2 FROM <tabla>;', descripcion: 'Proyecta columnas específicas' },
          { comando: 'WHERE', sintaxis: 'SELECT * FROM <tabla> WHERE col = "valor";', descripcion: 'Filtra filas por condición de igualdad' },
          { comando: 'WHERE (<, >, !=)', sintaxis: 'SELECT * FROM <tabla> WHERE col > 0;', descripcion: 'Filtros numéricos y comparativos' },
          { comando: 'ORDER BY', sintaxis: 'SELECT * FROM <tabla> ORDER BY col DESC;', descripcion: 'Ordena resultados de forma ascendente o descendente' },
          { comando: 'LIMIT', sintaxis: 'SELECT * FROM <tabla> LIMIT 1;', descripcion: 'Limita el número máximo de registros devueltos' },
          { comando: 'WHERE LIKE', sintaxis: 'SELECT * FROM <tabla> WHERE col LIKE "%texto%";', descripcion: 'Búsqueda parcial en cadenas de texto' },
          { comando: 'SHOW TABLES', sintaxis: 'SHOW TABLES;', descripcion: 'Lista las tablas accesibles en el esquema activo' },
          { comando: 'DESCRIBE', sintaxis: 'DESCRIBE <tabla>;', descripcion: 'Muestra la estructura y tipos de datos de una tabla' },
          { comando: 'CLEAR', sintaxis: 'CLEAR;', descripcion: 'Limpia el terminal y restablece la consola' },
        ],
        totalRows: 10,
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
      
      if (isChallengeMode) {
        const challengeDbRecord = CHALLENGE_DB as unknown as Record<string, unknown[]>;
        const rows = Object.keys(CHALLENGE_DB).map((tName, idx) => ({
          '#': idx + 1,
          'Tables_in_audit_lab': tName,
          'Registros': challengeDbRecord[tName]?.length || 0,
          'Descripcion':
            tName === 'cuentas'
              ? 'Catálogo de cuentas bancarias y tipos de producto'
              : tName === 'conciliacion'
              ? 'Saldos de libros, extractos bancarios y diferencias'
              : 'Detalle de transacciones y movimientos registrados',
        }));

        return {
          query: cleanQuery,
          timestamp: nowIso,
          executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
          type: 'SHOW_TABLES',
          columns: ['#', 'Tables_in_audit_lab', 'Registros', 'Descripcion'],
          rows,
          totalRows: rows.length,
        };
      }

      const rows = (Object.keys(PORTFOLIO_DB) as TableName[])
        .filter((t) => t !== 'easter_egg')
        .map((tableName, idx) => ({
          '#': idx + 1,
          'Tables_in_anthony_db': tableName,
          'Registros': PORTFOLIO_DB[tableName].length,
          'Dominio': getTableDescription(tableName),
        }));

      return {
        query: cleanQuery,
        timestamp: nowIso,
        executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
        type: 'SHOW_TABLES',
        columns: ['#', 'Tables_in_anthony_db', 'Registros', 'Dominio'],
        rows,
        totalRows: rows.length,
      };
    }

    // 4. DESCRIBE / DESC
    const descMatch = cleanQuery.match(/^(?:DESCRIBE|DESC)\s+([a-zA-Z0-9_]+)$/i);
    if (descMatch) {
      const targetTable = descMatch[1].toLowerCase();

      // Check Challenge schemas
      if (CHALLENGE_SCHEMAS[targetTable]) {
        const schema = CHALLENGE_SCHEMAS[targetTable];
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
          errorMessage: `ERROR 1146 (42S02): La tabla '${descMatch[1]}' no existe en el catálogo activo.`,
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
          Description: s.description,
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
          errorMessage: `ERROR 1146 (42S02): La tabla '${selectMatch[2]}' no existe. Ejecuta 'SHOW TABLES;' para ver las entidades disponibles.`,
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
        } else if (CHALLENGE_SCHEMAS[targetTable]) {
          finalColumns = CHALLENGE_SCHEMAS[targetTable].map((s) => s.column);
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
              errorMessage: `ERROR 1054 (42S22): Columna(s) desconocida(s) '${invalid.join(', ')}' en field list. Columnas válidas en '${targetTable}': ${availableCols.join(', ')}`,
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
      errorMessage: `ERROR 1064 (42000): Error de sintaxis cerca de '${cleanQuery.substring(0, 35)}...'. Revisa la sintaxis o consulta 'HELP;'.`,
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

function getTableDescription(table: TableName): string {
  const map: Record<TableName, string> = {
    perfil: 'Información profesional, contacto y resumen ejecutivo',
    experiencia: 'Trayectoria laboral, proyectos en Porsalud y Cooperativa',
    habilidades: 'Skills en SQL, Python, Excel, Power BI, Desarrollo y BD',
    proyectos: 'Sistemas desarrollados: Olist E-commerce, RH Manager, DayMark y Redes',
    certificaciones: 'Acreditaciones oficiales (IBM, Cisco, Linux Foundation)',
    educacion: 'Grado académico universitario en Informática Administrativa',
    contacto: 'Canales directos: LinkedIn, Correo y Plataformas Profesionales',
    easter_egg: 'Sector clasificado',
  };
  return map[table] || 'Entidad relacional';
}
