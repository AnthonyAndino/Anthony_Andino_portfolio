import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, CloseX } from './Icons';
import { useLanguage } from '../i18n/LanguageContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose }) => {
  const { tx } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const backdropRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Body scroll lock, Escape key listener, and focus restoration
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement | null;
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
        if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
          previousFocusRef.current.focus();
        }
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check — bots fill hidden fields
    if (honeypot) return;

    // Basic validation
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();
    if (!trimmedName || !trimmedEmail || !trimmedMessage) return;

    // Prevent double submit
    if (isSending || submitted) return;
    setIsSending(true);

    // Generate mailto link — this is the delivery mechanism
    const subject = encodeURIComponent(
      `${tx('Consulta Portfolio: Mensaje de', 'Portfolio Inquiry: Message from')} ${trimmedName}`
    );
    const body = encodeURIComponent(
      `${tx('Nombre:', 'Name:')} ${trimmedName}\nEmail: ${trimmedEmail}\n\n${tx('Mensaje:', 'Message:')}\n${trimmedMessage}`
    );
    window.location.href = `mailto:anthonyandino959@gmail.com?subject=${subject}&body=${body}`;

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsSending(false);
      setName('');
      setEmail('');
      setMessage('');
      onClose();
    }, 2000);
  };

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 animate-fade-in select-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
    >
      {/* Wide Data Analyst SQL Transaction Card */}
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto bg-[#111215] text-[#f4f1ea] rounded-3xl border-2 border-white/15 p-6 sm:p-10 shadow-2xl animate-pop-in space-y-6">
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-[#a1a1aa] hidden sm:inline">anthony_db.transaccion_contacto</span>
            <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/40 text-[10px]">
              {tx('ESTADO: LISTO PARA INSERT', 'STATUS: READY TO INSERT')}
            </span>
          </div>

          {/* Close button with rotation on hover */}
          <button
            onClick={onClose}
            className="group p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all duration-300 focus:outline-none"
            title={tx('Cerrar modal (Esc)', 'Close modal (Esc)')}
            aria-label={tx('Cerrar modal', 'Close modal')}
          >
            <CloseX className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90 group-hover:text-[#ff3e00]" />
          </button>
        </div>

        {/* Modal Title & Scope */}
        <div className="space-y-1.5">
          <h2
            id="contact-modal-title"
            className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight uppercase"
          >
            {tx('Nueva Consulta de Contacto', 'New Contact Inquiry')}
          </h2>
          <p className="text-xs sm:text-sm text-[#a1a1aa] font-sans leading-relaxed">
            {tx(
              'Completa los valores del registro para conectar directamente con Anthony Andino sobre auditorías de datos, dashboards o vacantes.',
              'Fill in the record values to connect directly with Anthony Andino about data audits, dashboards or job openings.'
            )}
          </p>
          <p className="text-[10px] font-mono text-white/40">
            {tx('Se abrirá tu aplicación de correo con los datos rellenados.', 'Your email app will open with the data prefilled.')}
          </p>
        </div>

        {/* SQL Form Interface */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Honeypot (anti-spam, hidden from humans) */}
          <div className="absolute -left-[9999px]" aria-hidden="true">
            <label htmlFor="hp-field">{tx('No rellenar', 'Do not fill')}</label>
            <input
              id="hp-field"
              type="text"
              name="website_url"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          {/* SQL Syntax Introduction */}
          <div className="bg-[#090a0c] p-3.5 rounded-xl border border-white/10 font-mono text-[11px] sm:text-xs text-white/70 space-y-1">
            <span className="text-[#ff3e00] font-bold">INSERT INTO</span>
            <span className="text-white"> solicitudes_contacto (remitente_nombre, remitente_email, consulta_detalle)</span>
            <div className="text-[#a1a1aa] font-semibold">VALUES (</div>
          </div>

          {/* Parameter 1: Nombre */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <label htmlFor="param-name" className="text-[#ff3e00] font-bold flex items-center gap-1.5">
                <span>:remitente_nombre</span>
              </label>
              <span className="text-[#71717a]">VARCHAR(100) NOT NULL</span>
            </div>
            <input
              id="param-name"
              type="text"
              required
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={tx("'Tu nombre, empresa u organización...'", "'Your name, company or organization...'")}
              className="w-full bg-[#090a0c] border border-white/15 focus:border-[#ff3e00] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder:text-[#52525b] focus:outline-none transition-colors"
            />
          </div>

          {/* Parameter 2: Email */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <label htmlFor="param-email" className="text-[#ff3e00] font-bold flex items-center gap-1.5">
                <span>:remitente_email</span>
              </label>
              <span className="text-[#71717a]">VARCHAR(120) NOT NULL</span>
            </div>
            <input
              id="param-email"
              type="email"
              required
              maxLength={120}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={tx("'correo@organizacion.com...'", "'email@organization.com...'")}
              className="w-full bg-[#090a0c] border border-white/15 focus:border-[#ff3e00] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder:text-[#52525b] focus:outline-none transition-colors"
            />
          </div>

          {/* Parameter 3: Consulta */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <label htmlFor="param-msg" className="text-[#ff3e00] font-bold flex items-center gap-1.5">
                <span>:consulta_detalle</span>
              </label>
              <span className="text-[#71717a]">TEXT NOT NULL · MAX 2000</span>
            </div>
            <textarea
              id="param-msg"
              required
              rows={4}
              maxLength={2000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={tx(
                "'Detalle sobre la auditoría en base de datos, el proyecto analítico o la posición laboral...'",
                "'Details about the database audit, the analytics project or the job opening...'"
              )}
              className="w-full bg-[#090a0c] border border-white/15 focus:border-[#ff3e00] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white font-mono placeholder:text-[#52525b] focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* SQL Syntax Closing */}
          <div className="font-mono text-xs text-[#a1a1aa] font-semibold pl-2">
            );
          </div>

          {/* Footer of Form: Direct channels & Submit */}
          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="text-[11px] font-mono text-[#a1a1aa] space-y-1">
              <div>
                {tx('Canal directo:', 'Direct channel:')} <a href="mailto:anthonyandino959@gmail.com" className="text-white hover:underline">anthonyandino959@gmail.com</a>
              </div>
              <div className="text-[#71717a]">
                {tx('Tegucigalpa, Honduras · Disponibilidad Inmediata', 'Tegucigalpa, Honduras · Immediate Availability')}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSending || submitted}
              data-cursor-contrast="true"
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3 rounded-xl bg-[#ff3e00] hover:bg-[#e03700] disabled:opacity-60 disabled:cursor-not-allowed text-white font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-lg focus:outline-none"
            >
              <span>
                {submitted
                  ? tx('EJECUTANDO COMMIT...', 'EXECUTING COMMIT...')
                  : isSending
                    ? tx('PROCESANDO...', 'PROCESSING...')
                    : 'COMMIT TRANSACTION'}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
