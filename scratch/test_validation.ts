import { SqlEngine } from '../src/utils/sqlEngine';
import { CHALLENGE_LEVELS } from '../src/data/challengeData';
import { PORTFOLIO_DB } from '../src/data/portfolioData';

console.log('====================================================');
console.log('1. PRIVACY CHECK: SELECT * FROM perfil;');
console.log('====================================================');
const profileResult = SqlEngine.execute('SELECT * FROM perfil;');
console.log('Columns in perfil:', profileResult.columns);
const hasPhone = profileResult.columns?.some(c => c.toLowerCase().includes('telefono') || c.toLowerCase().includes('phone') || c.toLowerCase().includes('celular'));
console.log('Phone column present:', hasPhone ? 'FAIL' : 'PASS (No phone column)');

const sampleRow = profileResult.rows?.[0] || {};
const hasPhoneVal = Object.entries(sampleRow).some(([k, v]) => String(v).includes('+') || /\d{8,}/.test(String(v)));
console.log('Phone value present:', hasPhoneVal ? 'FAIL' : 'PASS (No phone values)');

console.log('\n====================================================');
console.log('2. TESTING CHALLENGE LEVELS (5 LEVELS)');
console.log('====================================================');

interface TestCase {
  name: string;
  query: string;
  expectedSuccess: boolean;
  notes: string;
}

const testMatrix: Record<number, TestCase[]> = {
  1: [
    { name: 'Solución directa', query: 'SELECT * FROM cuentas;', expectedSuccess: true, notes: 'Devuelve 10 filas completas' },
    { name: 'Solución equivalente', query: 'SELECT id, titular, tipo FROM cuentas;', expectedSuccess: true, notes: 'Proyección específica de columnas' },
    { name: 'Incorrecta 1', query: "SELECT * FROM cuentas WHERE tipo = 'ahorro';", expectedSuccess: false, notes: 'Solo 6 filas' },
    { name: 'Incorrecta 2', query: 'SELECT * FROM cuentas LIMIT 5;', expectedSuccess: false, notes: 'Solo 5 filas' },
    { name: 'Incorrecta 3', query: "SELECT * FROM cuentas WHERE id = 1;", expectedSuccess: false, notes: 'Solo 1 fila' },
    { name: 'Error sintaxis 1', query: 'SELECT * FROMM cuentas;', expectedSuccess: false, notes: 'Error de sintaxis FROMM' },
    { name: 'Error sintaxis 2', query: 'SELECT col_inexistente FROM cuentas;', expectedSuccess: false, notes: 'Error 1054 columna desconocida' },
  ],
  2: [
    { name: 'Solución directa', query: "SELECT * FROM cuentas WHERE tipo = 'ahorro';", expectedSuccess: true, notes: 'Exactamente 6 filas de ahorro' },
    { name: 'Solución equivalente', query: "SELECT id, tipo FROM cuentas WHERE tipo = 'ahorro';", expectedSuccess: true, notes: 'Proyección columnas requeridas' },
    { name: 'Incorrecta 1', query: 'SELECT * FROM cuentas;', expectedSuccess: false, notes: '10 filas sin filtro' },
    { name: 'Incorrecta 2', query: "SELECT * FROM cuentas WHERE tipo = 'credito';", expectedSuccess: false, notes: '4 filas de crédito' },
    { name: 'Incorrecta 3', query: "SELECT * FROM cuentas WHERE id > 8;", expectedSuccess: false, notes: 'Filtro por id incorrecto' },
    { name: 'Error sintaxis 1', query: "SELECT * FROM cuentas WHERE tipo == 'ahorro';", expectedSuccess: false, notes: 'Operador == no estándar' },
    { name: 'Error sintaxis 2', query: "SELECT * FORM cuentas WHERE tipo = 'ahorro';", expectedSuccess: false, notes: 'Error typo FORM' },
  ],
  3: [
    { name: 'Solución directa', query: 'SELECT * FROM conciliacion WHERE diferencia > 0;', expectedSuccess: true, notes: '4 cuentas con diferencia > 0' },
    { name: 'Solución equivalente', query: 'SELECT cuenta_id, diferencia FROM conciliacion WHERE diferencia != 0;', expectedSuccess: true, notes: 'Usando != 0' },
    { name: 'Incorrecta 1', query: 'SELECT * FROM conciliacion;', expectedSuccess: false, notes: '10 filas sin filtro' },
    { name: 'Incorrecta 2', query: 'SELECT * FROM conciliacion WHERE diferencia = 0;', expectedSuccess: false, notes: '6 filas sin descuadre' },
    { name: 'Incorrecta 3', query: 'SELECT * FROM conciliacion WHERE diferencia > 500;', expectedSuccess: false, notes: 'Solo 1 fila' },
    { name: 'Error sintaxis 1', query: 'SELECT * FROM conciliacion WHER diferencia > 0;', expectedSuccess: false, notes: 'Typo WHER' },
    { name: 'Error sintaxis 2', query: 'SELECT saldo_inexistente FROM conciliacion;', expectedSuccess: false, notes: 'Error 1054 columna inexistente' },
  ],
  4: [
    { name: 'Solución directa', query: 'SELECT * FROM conciliacion ORDER BY diferencia DESC LIMIT 1;', expectedSuccess: true, notes: 'Top 1 cuenta 7 con 1250' },
    { name: 'Solución equivalente', query: 'SELECT cuenta_id, diferencia FROM conciliacion ORDER BY diferencia DESC LIMIT 1;', expectedSuccess: true, notes: 'Proyección específica top 1' },
    { name: 'Incorrecta 1', query: 'SELECT * FROM conciliacion ORDER BY diferencia ASC LIMIT 1;', expectedSuccess: false, notes: 'Orden inverso da diferencia 0' },
    { name: 'Incorrecta 2', query: 'SELECT * FROM conciliacion WHERE diferencia > 0;', expectedSuccess: false, notes: '4 filas sin LIMIT 1' },
    { name: 'Incorrecta 3', query: 'SELECT * FROM conciliacion LIMIT 1;', expectedSuccess: false, notes: 'Sin ORDER BY devuelve cuenta 1' },
    { name: 'Error sintaxis 1', query: 'SELECT * FROM conciliacion ORDER BY diferencia DESCENDING LIMIT 1;', expectedSuccess: false, notes: 'Palabra DESCENDING errónea' },
    { name: 'Error sintaxis 2', query: 'SELECT * FROM conciliacion ORDER diferencia DESC LIMIT 1;', expectedSuccess: false, notes: 'Falta BY en ORDER' },
  ],
  5: [
    { name: 'Solución directa', query: 'SELECT * FROM movimientos WHERE cuenta_id = 7;', expectedSuccess: true, notes: 'Devuelve 6 movimientos de cuenta 7' },
    { name: 'Solución equivalente', query: 'SELECT id, cuenta_id, fecha, monto FROM movimientos WHERE cuenta_id = 7;', expectedSuccess: true, notes: 'Proyección columnas clave' },
    { name: 'Incorrecta 1', query: 'SELECT * FROM movimientos WHERE cuenta_id = 5;', expectedSuccess: false, notes: 'Movimientos de otra cuenta' },
    { name: 'Incorrecta 2', query: 'SELECT * FROM movimientos;', expectedSuccess: false, notes: 'Todos los movimientos sin filtrar' },
    { name: 'Incorrecta 3', query: 'SELECT * FROM movimientos WHERE monto = 1250;', expectedSuccess: false, notes: 'Falta filtrar cuenta_id = 7' },
    { name: 'Error sintaxis 1', query: 'SELECT * FROM movimientoss WHERE cuenta_id = 7;', expectedSuccess: false, notes: 'Tabla movimientoss no existe' },
    { name: 'Error sintaxis 2', query: 'SELECT id, concepto FROM movimientos WHEREE cuenta_id = 7;', expectedSuccess: false, notes: 'Typo WHEREE' },
  ],
};

const resultsSummaryTable: Array<{
  Nivel: number;
  Caso: string;
  Consulta: string;
  'Resultado Esperado': string;
  'Resultado Obtenido': string;
  Status: string;
}> = [];

for (const levelConfig of CHALLENGE_LEVELS) {
  const tests = testMatrix[levelConfig.id];
  console.log(`\n--- Evaluando Nivel ${levelConfig.id}: "${levelConfig.title}" ---`);

  for (const t of tests) {
    const res = SqlEngine.execute(t.query, { context: 'challenge' });
    let passedValidation = false;
    let feedback = '';

    if (res.type === 'ERROR') {
      passedValidation = false;
      feedback = res.errorMessage || 'Error sintaxis';
    } else {
      const val = levelConfig.validate(res.rows || []);
      passedValidation = val.success;
      feedback = val.feedback;
    }

    const testPassed = passedValidation === t.expectedSuccess;
    resultsSummaryTable.push({
      Nivel: levelConfig.id,
      Caso: t.name,
      Consulta: t.query,
      'Resultado Esperado': t.expectedSuccess ? 'Éxito' : 'Rechazo/Error',
      'Resultado Obtenido': passedValidation ? 'Éxito' : 'Rechazo/Error',
      Status: testPassed ? 'PASS' : 'FAIL',
    });

    console.log(`  [${testPassed ? 'PASS' : 'FAIL'}] ${t.name} -> ${passedValidation ? 'Éxito' : 'Rechazo'} (${feedback})`);
  }
}

console.log('\n====================================================');
console.log('3. TESTING 6 FREE CONSOLE PRESETS');
console.log('====================================================');
const presets = [
  { name: 'Perfil y Contacto', query: 'SELECT nombre, titulo, ubicacion, disponibilidad FROM perfil;' },
  { name: 'Experiencia Laboral', query: 'SELECT empresa, cargo, periodo FROM experiencia;' },
  { name: 'Proyectos Principales', query: 'SELECT nombre, categoria, stack_resumen FROM proyectos;' },
  { name: 'Habilidades Técnicas', query: 'SELECT categoria, nivel, destacadas FROM habilidades;' },
  { name: 'Certificaciones', query: 'SELECT titulo, entidad, fecha FROM certificaciones;' },
  { name: 'Educación Universitaria', query: 'SELECT titulo, institucion, periodo, estado FROM educacion;' },
];

for (const p of presets) {
  const res = SqlEngine.execute(p.query, { context: 'portfolio' });
  const isOk = res.type === 'SELECT' && res.rows && res.rows.length > 0;
  console.log(`  [${isOk ? 'PASS' : 'FAIL'}] ${p.name}: ${res.rows?.length} filas, columnas: [${res.columns?.join(', ')}]`);
}

console.log('\n====================================================');
console.log('4. DUPLICATE ROW CLICK TEST (NIVEL 5)');
console.log('====================================================');
const movResult = SqlEngine.execute('SELECT * FROM movimientos WHERE cuenta_id = 7;', { context: 'challenge' });
const dup1043 = movResult.rows?.find(r => r.id === 1043);
const dup1044 = movResult.rows?.find(r => r.id === 1044);
console.log('Row 1043:', dup1043);
console.log('Row 1044:', dup1044);
const isIdentical = dup1043 && dup1044 &&
  dup1043.fecha === dup1044.fecha &&
  dup1043.concepto === dup1044.concepto &&
  dup1043.monto === dup1044.monto &&
  dup1043.monto === 1250;
console.log('Duplicate check passed:', isIdentical ? 'PASS (1043 y 1044 son gemelos exactos de 1250.00)' : 'FAIL');
