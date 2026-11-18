export type {
  CuentaRow,
  ConciliacionRow,
  MovimientoRow,
  ChallengeDatabase,
  ChallengeLevelConfig,
} from './challengeData';

import type { ChallengeDatabase, ChallengeLevelConfig } from './challengeData';

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

export const CHALLENGE_LEVELS: ChallengeLevelConfig[] = [
  {
    id: 1,
    title: 'Meet the ledger',
    mission: 'Display all accounts registered in the system to familiarize yourself with the overall structure.',
    hints: [
      'Use the SELECT statement to query all records in a table.',
      'The asterisk (*) indicates that you want to project every available column.',
      'Type and run: SELECT * FROM cuentas;',
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
        return { success: false, feedback: 'The query returned no rows. Check the table you queried.' };
      }
      if (rows.length === 10) {
        const hasIds = rows.every((r) => r.id !== undefined || r.ID !== undefined);
        if (hasIds) {
          return { success: true, feedback: 'Excellent! You inspected all 10 registered accounts.' };
        }
      }
      return {
        success: false,
        feedback: `Your query returned ${rows.length} rows; all 10 accounts from the table were expected.`,
      };
    },
  },
  {
    id: 2,
    title: 'Savings only',
    mission: "Filter the list to inspect only accounts of type 'ahorro'.",
    hints: [
      'Use the WHERE clause to filter rows by a specific condition.',
      "The 'tipo' field contains text values such as 'ahorro' or 'credito'.",
      "Remember to wrap the text value in single quotes: WHERE tipo = 'ahorro';",
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
        return { success: false, feedback: "No rows matched the filter. Verify that tipo = 'ahorro'." };
      }
      const expectedIds = [1, 2, 3, 5, 7, 8];
      const rowIds = rows.map((r) => Number(r.id ?? r.ID ?? 0)).filter((id) => id > 0);
      const isMatch =
        rowIds.length === 6 &&
        expectedIds.every((id) => rowIds.includes(id));

      if (isMatch) {
        return {
          success: true,
          feedback: 'Correct! You identified exactly the 6 savings accounts.',
          matchedRowKeys: expectedIds,
        };
      }

      if (rows.length === 10) {
        return {
          success: false,
          feedback: "Your query returned 10 rows; the WHERE tipo = 'ahorro' clause was missing.",
        };
      }

      return {
        success: false,
        feedback: `Your query returned ${rows.length} rows; only the 6 savings accounts were expected.`,
      };
    },
  },
  {
    id: 3,
    title: 'The mismatches',
    mission: 'Find, in the conciliacion table, the accounts with a difference greater than zero.',
    hints: [
      "Query the 'conciliacion' table, where ledger and bank balances are compared.",
      "The 'diferencia' column stores the monetary mismatch. Use the greater-than operator (>).",
      'Suggested structure: SELECT * FROM conciliacion WHERE diferencia > 0;',
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
        return { success: false, feedback: 'The query returned no results. Check that the condition is diferencia > 0.' };
      }
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
          feedback: 'Exactly! You located the 4 accounts with reconciliation mismatches.',
          matchedRowKeys: expectedAccounts,
        };
      }

      if (rows.length === 10) {
        return {
          success: false,
          feedback: 'Your query returned all reconciliations (10 rows), including those with a zero difference.',
        };
      }

      return {
        success: false,
        feedback: `Your query returned ${rows.length} rows; only the 4 accounts with diferencia > 0 were expected.`,
      };
    },
  },
  {
    id: 4,
    title: 'The largest mismatch',
    mission: 'Identify the account with the largest difference by sorting descending and limiting the result to a single record.',
    hints: [
      'Use ORDER BY diferencia DESC to place the largest inconsistency first.',
      'Add LIMIT 1 at the end to retrieve only the first, most impactful record.',
      'Suggested syntax: SELECT * FROM conciliacion ORDER BY diferencia DESC LIMIT 1;',
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
        return { success: false, feedback: 'The query returned no rows.' };
      }
      if (rows.length > 1) {
        return {
          success: false,
          feedback: `Your query returned ${rows.length} rows; you must limit the result to 1 row with LIMIT 1.`,
        };
      }
      const topRow = rows[0];
      const accountId = Number(topRow.cuenta_id ?? topRow.CUENTA_ID ?? topRow.id ?? 0);
      const diff = Number(topRow.diferencia ?? 0);

      if (accountId === 7 || diff === 1250) {
        return {
          success: true,
          feedback: 'Flawless! Account 7 has the critical imbalance with a difference of 1,250.00.',
          matchedRowKeys: [7],
        };
      }

      return {
        success: false,
        feedback: 'The returned record is not the largest difference. Make sure to sort with ORDER BY diferencia DESC.',
      };
    },
  },
  {
    id: 5,
    title: 'The culprit',
    mission: 'Display the movements for account 7 and click the duplicate record that caused the 1,250.00 mismatch.',
    hints: [
      "Query the 'movimientos' table filtering by cuenta_id = 7.",
      'Examine the dates and amounts: you will notice a repeated transaction for the exact amount of the mismatch.',
      'Type: SELECT * FROM movimientos WHERE cuenta_id = 7; and then click one of the two identical rows.',
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
          feedback: 'No movements were found. Run: SELECT * FROM movimientos WHERE cuenta_id = 7;',
        };
      }
      const allAccount7 = rows.every(
        (r) => Number(r.cuenta_id ?? r.CUENTA_ID ?? 0) === 7
      );

      if (!allAccount7) {
        return {
          success: false,
          feedback: 'The query includes movements from other accounts. Filter with WHERE cuenta_id = 7.',
        };
      }

      if (rows.length === 6) {
        return {
          success: true,
          feedback: 'Movements displayed! Now click one of the two duplicate transactions to close the case.',
          matchedRowKeys: [1043, 1044],
        };
      }

      return {
        success: false,
        feedback: `Expected the 6 movements for account 7, got ${rows.length}.`,
      };
    },
  },
];
