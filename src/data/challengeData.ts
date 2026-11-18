export interface CuentaRow {
  id: number;
  titular: string;
  tipo: 'ahorro' | 'credito';
}

export interface ConciliacionRow {
  cuenta_id: number;
  saldo_libro: number;
  saldo_banco: number;
  diferencia: number;
}

export interface MovimientoRow {
  id: number;
  cuenta_id: number;
  fecha: string;
  concepto: string;
  monto: number;
}

export interface ChallengeDatabase {
  cuentas: CuentaRow[];
  conciliacion: ConciliacionRow[];
  movimientos: MovimientoRow[];
  [key: string]: unknown[];
}

export const CHALLENGE_DB: ChallengeDatabase = {
  cuentas: [
    { id: 1, titular: 'Titular 01', tipo: 'ahorro' },
    { id: 2, titular: 'Titular 02', tipo: 'ahorro' },
    { id: 3, titular: 'Titular 03', tipo: 'ahorro' },
    { id: 4, titular: 'Titular 04', tipo: 'credito' },
    { id: 5, titular: 'Titular 05', tipo: 'ahorro' },
    { id: 6, titular: 'Titular 06', tipo: 'credito' },
    { id: 7, titular: 'Titular 07', tipo: 'ahorro' },
    { id: 8, titular: 'Titular 08', tipo: 'ahorro' },
    { id: 9, titular: 'Titular 09', tipo: 'credito' },
    { id: 10, titular: 'Titular 10', tipo: 'credito' },
  ],

  conciliacion: [
    { cuenta_id: 1, saldo_libro: 4500.0, saldo_banco: 4500.0, diferencia: 0.0 },
    { cuenta_id: 2, saldo_libro: 8200.0, saldo_banco: 8200.0, diferencia: 0.0 },
    { cuenta_id: 3, saldo_libro: 5150.0, saldo_banco: 5000.0, diferencia: 150.0 },
    { cuenta_id: 4, saldo_libro: 12000.0, saldo_banco: 12000.0, diferencia: 0.0 },
    { cuenta_id: 5, saldo_libro: 1225.5, saldo_banco: 1200.0, diferencia: 25.5 },
    { cuenta_id: 6, saldo_libro: 9400.0, saldo_banco: 9400.0, diferencia: 0.0 },
    { cuenta_id: 7, saldo_libro: 11250.0, saldo_banco: 10000.0, diferencia: 1250.0 },
    { cuenta_id: 8, saldo_libro: 3600.0, saldo_banco: 3600.0, diferencia: 0.0 },
    { cuenta_id: 9, saldo_libro: 3080.0, saldo_banco: 3000.0, diferencia: 80.0 },
    { cuenta_id: 10, saldo_libro: 6700.0, saldo_banco: 6700.0, diferencia: 0.0 },
  ],

  movimientos: [
    // Cuenta 1 (2 normales)
    { id: 1001, cuenta_id: 1, fecha: '2026-03-01', concepto: 'Apertura', monto: 3000.0 },
    { id: 1002, cuenta_id: 1, fecha: '2026-03-05', concepto: 'Deposito en ventanilla', monto: 1500.0 },

    // Cuenta 2 (2 normales)
    { id: 1005, cuenta_id: 2, fecha: '2026-03-02', concepto: 'Transferencia ACH', monto: 5000.0 },
    { id: 1006, cuenta_id: 2, fecha: '2026-03-10', concepto: 'Abono nomina', monto: 3200.0 },

    // Cuenta 3 (3 normales, descuadre por cheque en transito)
    { id: 1010, cuenta_id: 3, fecha: '2026-03-03', concepto: 'Saldo inicial', monto: 4000.0 },
    { id: 1011, cuenta_id: 3, fecha: '2026-03-07', concepto: 'Remesa familiar', monto: 1000.0 },
    { id: 1012, cuenta_id: 3, fecha: '2026-03-12', concepto: 'Ajuste de comision', monto: 150.0 },

    // Cuenta 4 (2 normales)
    { id: 1015, cuenta_id: 4, fecha: '2026-03-04', concepto: 'Linea autorizada', monto: 10000.0 },
    { id: 1016, cuenta_id: 4, fecha: '2026-03-11', concepto: 'Disposicion cajero', monto: 2000.0 },

    // Cuenta 5 (3 normales)
    { id: 1020, cuenta_id: 5, fecha: '2026-03-02', concepto: 'Deposito inicial', monto: 1000.0 },
    { id: 1021, cuenta_id: 5, fecha: '2026-03-08', concepto: 'Transferencia movil', monto: 200.0 },
    { id: 1022, cuenta_id: 5, fecha: '2026-03-15', concepto: 'Intereses generados', monto: 25.5 },

    // Cuenta 6 (2 normales)
    { id: 1030, cuenta_id: 6, fecha: '2026-03-05', concepto: 'Credito comercial', monto: 7400.0 },
    { id: 1031, cuenta_id: 6, fecha: '2026-03-14', concepto: 'Pago proveedor', monto: 2000.0 },

    // Cuenta 7 (6 movimientos: el causante con 1043 y 1044 idénticos)
    { id: 1040, cuenta_id: 7, fecha: '2026-03-01', concepto: 'Saldo inicial de apertura', monto: 5000.0 },
    { id: 1041, cuenta_id: 7, fecha: '2026-03-05', concepto: 'Transferencia recibida', monto: 2500.0 },
    { id: 1042, cuenta_id: 7, fecha: '2026-03-09', concepto: 'Pago de servicios publicos', monto: 1250.0 },
    { id: 1043, cuenta_id: 7, fecha: '2026-03-14', concepto: 'Deposito', monto: 1250.0 },
    { id: 1044, cuenta_id: 7, fecha: '2026-03-14', concepto: 'Deposito', monto: 1250.0 }, // DUPLICADO EXACTO
    { id: 1045, cuenta_id: 7, fecha: '2026-03-20', concepto: 'Transferencia interbancaria', monto: 1250.0 },

    // Cuenta 8 (2 normales)
    { id: 1050, cuenta_id: 8, fecha: '2026-03-06', concepto: 'Deposito programado', monto: 2600.0 },
    { id: 1051, cuenta_id: 8, fecha: '2026-03-18', concepto: 'Transferencia cuenta propia', monto: 1000.0 },

    // Cuenta 9 (3 normales)
    { id: 1060, cuenta_id: 9, fecha: '2026-03-02', concepto: 'Consumo pos', monto: 1500.0 },
    { id: 1061, cuenta_id: 9, fecha: '2026-03-12', concepto: 'Consumo pos', monto: 1500.0 },
    { id: 1062, cuenta_id: 9, fecha: '2026-03-19', concepto: 'Cargo por mantenimiento', monto: 80.0 },

    // Cuenta 10 (2 normales)
    { id: 1070, cuenta_id: 10, fecha: '2026-03-07', concepto: 'Credito personal', monto: 5000.0 },
    { id: 1071, cuenta_id: 10, fecha: '2026-03-21', concepto: 'Cargo automatico', monto: 1700.0 },
  ],
};

export interface ChallengeLevelConfig {
  id: number;
  title: string;
  mission: string;
  hints: string[];
  exampleQuery: string;
  solution: string;
  targetTable: 'cuentas' | 'conciliacion' | 'movimientos';
  tableSchema: { name: string; columns: string };
  validate: (rows: Record<string, unknown>[]) => {
    success: boolean;
    feedback: string;
    matchedRowKeys?: (number | string)[];
  };
}

export const CHALLENGE_LEVELS: ChallengeLevelConfig[] = [
  {
    id: 1,
    title: 'Conoce el libro',
    mission: 'Muestra todas las cuentas registradas en el sistema para familiarizarte con la estructura general.',
    hints: [
      'Para consultar todos los registros de una tabla se usa la instrucción SELECT.',
      'El asterisco (*) indica que quieres proyectar todas las columnas disponibles.',
      'Escribe y ejecuta: SELECT * FROM cuentas;',
    ],
    exampleQuery: 'SELECT id, titular FROM cuentas;',
    solution: 'SELECT * FROM cuentas;',
    targetTable: 'cuentas',
    tableSchema: {
      name: 'cuentas',
      columns: 'id (int), titular (varchar), tipo (varchar)',
    },
    validate: (rows) => {
      if (rows.length === 0) {
        return { success: false, feedback: 'La consulta no devolvió filas. Revisa la tabla consultada.' };
      }
      if (rows.length === 10) {
        const hasIds = rows.every((r) => r.id !== undefined || r.ID !== undefined);
        if (hasIds) {
          return { success: true, feedback: '¡Excelente! Has inspeccionado las 10 cuentas registradas.' };
        }
      }
      return {
        success: false,
        feedback: `Tu consulta devolvió ${rows.length} filas; se esperaban las 10 cuentas de la tabla.`,
      };
    },
  },
  {
    id: 2,
    title: 'Solo ahorros',
    mission: "Filtra el listado para inspeccionar únicamente las cuentas de tipo 'ahorro'.",
    hints: [
      'Utiliza la cláusula WHERE para filtrar las filas por una condición específica.',
      "El campo 'tipo' contiene valores de texto como 'ahorro' o 'credito'.",
      "Recuerda encerrar el valor de texto entre comillas simples: WHERE tipo = 'ahorro';",
    ],
    exampleQuery: "SELECT * FROM cuentas WHERE tipo = 'credito';",
    solution: "SELECT * FROM cuentas WHERE tipo = 'ahorro';",
    targetTable: 'cuentas',
    tableSchema: {
      name: 'cuentas',
      columns: 'id (int), titular (varchar), tipo (varchar)',
    },
    validate: (rows) => {
      if (rows.length === 0) {
        return { success: false, feedback: "No se encontraron filas con el filtro aplicado. Verifica que tipo = 'ahorro'." };
      }
      // Expected ids: 1, 2, 3, 5, 7, 8
      const expectedIds = [1, 2, 3, 5, 7, 8];
      const rowIds = rows.map((r) => Number(r.id ?? r.ID ?? 0)).filter((id) => id > 0);
      const isMatch =
        rowIds.length === 6 &&
        expectedIds.every((id) => rowIds.includes(id));

      if (isMatch) {
        return {
          success: true,
          feedback: '¡Correcto! Identificaste exactamente las 6 cuentas de ahorro.',
          matchedRowKeys: expectedIds,
        };
      }

      if (rows.length === 10) {
        return {
          success: false,
          feedback: "Tu consulta devolvió 10 filas; faltó aplicar la cláusula WHERE tipo = 'ahorro'.",
        };
      }

      return {
        success: false,
        feedback: `Tu consulta devolvió ${rows.length} filas; se esperaban solo las 6 cuentas de ahorro.`,
      };
    },
  },
  {
    id: 3,
    title: 'Los descuadres',
    mission: 'Encuentra en la tabla conciliacion las cuentas que presenten una diferencia mayor a cero.',
    hints: [
      "Consulta la tabla 'conciliacion' donde se comparan los saldos de libro contable y banco.",
      "La columna 'diferencia' almacena el desajuste monetario. Usa el operador mayor que (>).",
      'Estructura recomendada: SELECT * FROM conciliacion WHERE diferencia > 0;',
    ],
    exampleQuery: 'SELECT cuenta_id, diferencia FROM conciliacion WHERE saldo_banco > 1000;',
    solution: 'SELECT * FROM conciliacion WHERE diferencia > 0;',
    targetTable: 'conciliacion',
    tableSchema: {
      name: 'conciliacion',
      columns: 'cuenta_id (int), saldo_libro (decimal), saldo_banco (decimal), diferencia (decimal)',
    },
    validate: (rows) => {
      if (rows.length === 0) {
        return { success: false, feedback: 'La consulta no arrojó resultados. Comprueba que la condición sea diferencia > 0.' };
      }
      // Expected cuenta_ids: 3, 5, 7, 9
      const expectedAccounts = [3, 5, 7, 9];
      const returnedAccounts = rows
        .map((r) => Number(r.cuenta_id ?? r.CUENTA_ID ?? r.id ?? 0))
        .filter((id) => id > 0);

      const isMatch =
        returnedAccounts.length === 4 &&
        expectedAccounts.every((id) => returnedAccounts.includes(id));

      if (isMatch) {
        return {
          success: true,
          feedback: '¡Exacto! Localizaste las 4 cuentas con descuadre en la conciliación.',
          matchedRowKeys: expectedAccounts,
        };
      }

      if (rows.length === 10) {
        return {
          success: false,
          feedback: 'Tu consulta devolvió todas las conciliaciones (10 filas), incluidas las que tienen diferencia cero.',
        };
      }

      return {
        success: false,
        feedback: `Tu consulta devolvió ${rows.length} filas; se esperaban únicamente las 4 cuentas con diferencia > 0.`,
      };
    },
  },
  {
    id: 4,
    title: 'El mayor descuadre',
    mission: 'Identifica la cuenta con la mayor diferencia ordenando descendentemente y limitando a un solo registro.',
    hints: [
      'Usa ORDER BY diferencia DESC para posicionar la mayor inconsistencia al inicio.',
      'Agrega LIMIT 1 al final para extraer exclusivamente el primer registro de mayor impacto.',
      'Sintaxis sugerida: SELECT * FROM conciliacion ORDER BY diferencia DESC LIMIT 1;',
    ],
    exampleQuery: 'SELECT * FROM conciliacion ORDER BY saldo_libro ASC LIMIT 3;',
    solution: 'SELECT * FROM conciliacion ORDER BY diferencia DESC LIMIT 1;',
    targetTable: 'conciliacion',
    tableSchema: {
      name: 'conciliacion',
      columns: 'cuenta_id (int), saldo_libro (decimal), saldo_banco (decimal), diferencia (decimal)',
    },
    validate: (rows) => {
      if (rows.length === 0) {
        return { success: false, feedback: 'La consulta no devolvió ninguna fila.' };
      }
      if (rows.length > 1) {
        return {
          success: false,
          feedback: `Tu consulta devolvió ${rows.length} filas; debes limitar el resultado a 1 fila con LIMIT 1.`,
        };
      }
      const topRow = rows[0];
      const accountId = Number(topRow.cuenta_id ?? topRow.CUENTA_ID ?? topRow.id ?? 0);
      const diff = Number(topRow.diferencia ?? 0);

      if (accountId === 7 || diff === 1250) {
        return {
          success: true,
          feedback: '¡Impecable! La cuenta 7 presenta el desbalance crítico con 1,250.00 de diferencia.',
          matchedRowKeys: [7],
        };
      }

      return {
        success: false,
        feedback: 'El registro obtenido no corresponde a la mayor diferencia. Asegúrate de ordenar con ORDER BY diferencia DESC.',
      };
    },
  },
  {
    id: 5,
    title: 'El culpable',
    mission: 'Muestra los movimientos de la cuenta 7 y haz clic en el registro duplicado que causó el descuadre de 1,250.00.',
    hints: [
      "Consulta la tabla 'movimientos' filtrando por cuenta_id = 7.",
      'Examina las fechas y montos: notarás una transacción repetida por el valor exacto del descuadre.',
      'Escribe: SELECT * FROM movimientos WHERE cuenta_id = 7; y luego haz clic en una de las dos filas idénticas.',
    ],
    exampleQuery: 'SELECT * FROM movimientos WHERE cuenta_id = 5;',
    solution: 'SELECT * FROM movimientos WHERE cuenta_id = 7;',
    targetTable: 'movimientos',
    tableSchema: {
      name: 'movimientos',
      columns: 'id (int), cuenta_id (int), fecha (date), concepto (varchar), monto (decimal)',
    },
    validate: (rows) => {
      if (rows.length === 0) {
        return {
          success: false,
          feedback: 'No se encontraron movimientos. Ejecuta: SELECT * FROM movimientos WHERE cuenta_id = 7;',
        };
      }
      // Check if rows belong to cuenta_id 7
      const allAccount7 = rows.every(
        (r) => Number(r.cuenta_id ?? r.CUENTA_ID ?? 0) === 7
      );

      if (!allAccount7) {
        return {
          success: false,
          feedback: 'La consulta incluye movimientos de otras cuentas. Filtra con WHERE cuenta_id = 7.',
        };
      }

      if (rows.length === 6) {
        return {
          success: true,
          feedback: '¡Movimientos desplegados! Ahora haz clic en una de las dos transacciones duplicadas para cerrar el caso.',
          matchedRowKeys: [1043, 1044],
        };
      }

      return {
        success: false,
        feedback: `Se esperaban los 6 movimientos de la cuenta 7, se obtuvieron ${rows.length}.`,
      };
    },
  },
];
