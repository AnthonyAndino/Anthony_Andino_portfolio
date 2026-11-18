import React, { useState } from 'react';
import { ShieldCheck, Database, ArrowRight } from 'lucide-react';

interface AuditCaseStudyProps {
  onRunAuditQuery: (query: string) => void;
}

export const AuditCaseStudy: React.FC<AuditCaseStudyProps> = ({ onRunAuditQuery }) => {
  const [activeTab, setActiveTab] = useState<'reyna' | 'porsalud'>('reyna');

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-8 py-12 select-none">
      <div className="bg-white rounded-3xl border border-editorial-border p-6 sm:p-10 shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-editorial-borderLight">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-editorial-muted block mb-1">
              CASOS DE ESTUDIO & IMPACTO EN PRODUCCIÓN
            </span>
            <h3 className="font-display font-light text-2xl sm:text-3xl text-[#141517] tracking-tight">
              Resolución de Incidencias en Bases de Datos
            </h3>
          </div>

          <div className="flex items-center bg-[#f0ede4] p-1 rounded-full text-xs font-mono">
            <button
              onClick={() => setActiveTab('reyna')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeTab === 'reyna'
                  ? 'bg-white text-[#141517] font-bold shadow-sm'
                  : 'text-editorial-muted hover:text-[#141517]'
              }`}
            >
              Cooperativa La Reyna (Auditoría)
            </button>
            <button
              onClick={() => setActiveTab('porsalud')}
              className={`px-4 py-1.5 rounded-full transition-all ${
                activeTab === 'porsalud'
                  ? 'bg-white text-[#141517] font-bold shadow-sm'
                  : 'text-editorial-muted hover:text-[#141517]'
              }`}
            >
              Porsalud (Stored Procedures)
            </button>
          </div>
        </div>

        {activeTab === 'reyna' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>4 Incidencias Críticas de Descuadre Reconciliadas</span>
              </div>

              <h4 className="font-display font-bold text-xl sm:text-2xl text-[#141517]">
                Localización y Corrección de Descuadres Contables
              </h4>

              <p className="text-sm text-editorial-muted leading-relaxed font-sans">
                Durante mi labor en Cooperativa La Reyna, el sistema presentaba diferencias entre los saldos reportados en la plataforma y los registros en libros. Mediante el cruce y comparación de tablas transaccionales en bases de datos con SQL, localicé los desajustes en cuentas de ahorro y crédito, ejecutando validaciones que restablecieron el balance exacto.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-[#f7f6f2] border border-editorial-border">
                  <span className="text-[10px] text-editorial-muted uppercase block">Metodología</span>
                  <span className="font-semibold text-[#141517]">Cruce de transacciones SQL</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f7f6f2] border border-editorial-border">
                  <span className="text-[10px] text-editorial-muted uppercase block">Resultado</span>
                  <span className="font-semibold text-emerald-700">100% de inconsistencias resueltas</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onRunAuditQuery("SELECT empresa, cargo, impacto FROM experiencia WHERE empresa = 'Cooperativa La Reyna';")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141517] hover:bg-[#2a2c33] text-white text-xs font-mono uppercase tracking-wider transition-all"
                >
                  <span>Ver Consulta en Vivo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-[#141517] text-white p-6 font-mono text-xs space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-editorial-accent">
                <span>SQL VALIDATION LOG</span>
                <span>STATUS: RECONCILED</span>
              </div>
              <div className="space-y-1.5 text-white/80 text-[11px]">
                <p className="text-emerald-400">-- Cruzando débitos vs créditos</p>
                <p>SELECT cuenta_id, SUM(monto) AS total_calculado</p>
                <p>FROM transacciones_hist</p>
                <p>GROUP BY cuenta_id</p>
                <p>HAVING total_calculado &lt;&gt; saldo_actual;</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-emerald-300">
                ✓ 4 discrepancias localizadas y corregidas con integridad referencial.
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-mono">
                <Database className="w-3.5 h-3.5" />
                <span>Base de Datos de Pruebas & Stored Procedures</span>
              </div>

              <h4 className="font-display font-bold text-xl sm:text-2xl text-[#141517]">
                Depuración de Lógica en Procedimientos Almacenados
              </h4>

              <p className="text-sm text-editorial-muted leading-relaxed font-sans">
                En Porsalud resolví incidencias en procedimientos y funciones almacenadas que afectaban la lógica operativa de la clínica. Además, corregí las gráficas de marcaciones de entrada que fallaban en producción y culminé el módulo de gestión de usuarios en C# y JavaScript para múltiples sedes internacionales.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-3.5 rounded-2xl bg-[#f7f6f2] border border-editorial-border">
                  <span className="text-[10px] text-editorial-muted uppercase block">Entorno</span>
                  <span className="font-semibold text-[#141517]">Test DB &gt; Homologación &gt; Prod</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#f7f6f2] border border-editorial-border">
                  <span className="text-[10px] text-editorial-muted uppercase block">Alcance</span>
                  <span className="font-semibold text-blue-700">Sedes locales e internacionales</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => onRunAuditQuery("SELECT empresa, cargo, puntos_clave FROM experiencia WHERE empresa = 'Porsalud';")}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#141517] hover:bg-[#2a2c33] text-white text-xs font-mono uppercase tracking-wider transition-all"
                >
                  <span>Ver Consulta en Vivo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl bg-[#141517] text-white p-6 font-mono text-xs space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-editorial-accent">
                <span>PROCEDURE DEBUGGER</span>
                <span>STATUS: VERIFIED</span>
              </div>
              <div className="space-y-1.5 text-white/80 text-[11px]">
                <p className="text-blue-400">-- Corrección de marcaciones multi-sede</p>
                <p>ALTER PROCEDURE sp_CalcularMarcaciones</p>
                <p>  @ColaboradorId INT,</p>
                <p>  @FechaInicio DATE</p>
                <p>AS BEGIN ... END;</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-blue-300">
                ✓ Lógica validada en ambiente de pruebas antes de despliegue a producción.
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
