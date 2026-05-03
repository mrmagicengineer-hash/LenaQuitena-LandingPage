import { useState, useEffect } from "react";
import { CardConfirmation } from "./CardConfirmation";
import type { ReservationData } from "./CardConfirmation";
import { logoRestaurante } from "../assets/logo";

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ModalView = 'form' | 'loading' | 'confirm';

const EVENT_TYPES = [
  {
    id: 'cumpleaños', label: 'Cumpleaños',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8"/><path d="M4 16s.5-1 2-1 2.5 2 4 2 2.5-2 4-2 2.5 2 4 2 2-1 2-1"/><path d="M2 21h20"/><path d="M7 8v3"/><path d="M12 8v3"/><path d="M17 8v3"/><path d="M7 4h.01"/><path d="M12 4h.01"/><path d="M17 4h.01"/></svg>,
    notesHint: "Ej: Es para una mujer, le gustan las flores rosadas. Requiere torta personalizada, decoración temática...",
  },
  {
    id: 'aniversario', label: 'Aniversario',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>,
    notesHint: "Ej: 10° aniversario, decoración romántica con rosas, requieren mesa privada...",
  },
  {
    id: 'pedida-de-mano', label: 'Pedida de mano',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>,
    notesHint: "Ej: Requieren champagne, pétalos en la mesa, música especial. ¿Hay alianza que entregar?",
  },
  {
    id: 'boda', label: 'Boda',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22V12M12 12C12 9 9.5 7 7 7s-5 2-5 5c0 4 5 10 10 10s10-6 10-10c0-3-2.5-5-5-5s-5 2-5 5Z"/></svg>,
    notesHint: "Ej: Número de invitados, arreglos florales, paleta de colores, requerimientos especiales...",
  },
  {
    id: 'cena-romantica', label: 'Cena romántica',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/></svg>,
    notesHint: "Ej: Mesa privada con velas, música suave, algún detalle especial para la pareja...",
  },
  {
    id: 'bautizo', label: 'Bautizo',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v6"/><path d="M5 10a7 7 0 0 0 14 0"/><path d="M8 22h8"/><path d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1"/></svg>,
    notesHint: "Ej: Nombre del bebé, colores temáticos (azul/rosado), número de mesas, menú infantil...",
  },
  {
    id: 'desayuno', label: 'Desayuno',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></svg>,
    notesHint: "Ej: Alguna intolerancia alimentaria, preferencias especiales, decoración para foto...",
  },
  {
    id: 'almuerzo', label: 'Almuerzo',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>,
    notesHint: "Ej: Reunión familiar, número de niños, alguna restricción alimentaria...",
  },
  {
    id: 'cena-ejecutiva', label: 'Cena ejecutiva',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>,
    notesHint: "Ej: Empresa, número de ejecutivos, requieren proyector o pantalla, menú corporativo...",
  },
  {
    id: 'after-office', label: 'After Office',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2h8"/><path d="M9 2v2.789a4 4 0 0 1-.672 2.219l-.656.984A4 4 0 0 0 7 10.212V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9.789a4 4 0 0 0-.672-2.219l-.656-.984A4 4 0 0 1 15 4.788V2"/><path d="M7 15a6.47 6.47 0 0 1 5 0 6.47 6.47 0 0 0 5 0"/></svg>,
    notesHint: "Ej: Grupo de trabajo, preferencias de bebidas, ambiente que prefieren (música, privacidad)...",
  },
  {
    id: 'familiar', label: 'Reunión familiar',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    notesHint: "Ej: Cantidad de niños, sillas de bebé, alergias o restricciones alimentarias...",
  },
  {
    id: 'otro', label: 'Otro',
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>,
    notesHint: "Cuéntanos más sobre tu evento y qué necesitas para que sea especial...",
  },
]

export const ReservationModal = ({ isOpen, onClose }: ReservationModalProps) => {
  const [view, setView] = useState<ModalView>('form');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [data, setData] = useState<ReservationData>({
    location: '', name: '', phone: '', email: '',
    date: '', time: '', people: '2', eventType: '', notes: ''
  });

  useEffect(() => {
    if (isOpen) {
      setView('form');
      setTermsAccepted(false);
      setData({ location: '', name: '', phone: '', email: '', date: '', time: '', people: '2', eventType: '', notes: '' });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleReviewReservation = () => {
    setView('loading');
    setTimeout(() => setView('confirm'), 1500);
  };

  const requiresDeposit = true; // siempre se requiere 50% de anticipo

  const handleSendWhatsApp = () => {
    const eventoFormateado = EVENT_TYPES.find(e => e.id === data.eventType)?.label ?? data.eventType;
    let plantilla = `Hola, me gustaría realizar una reserva en Leña Quiteña. Estos son mis datos:\n\n*Local:* ${data.location}\n*Nombre:* ${data.name}\n*Teléfono:* ${data.phone}\n*Correo:* ${data.email}\n*Fecha:* ${data.date}\n*Hora:* ${data.time}\n*Personas:* ${data.people}\n*Evento:* ${eventoFormateado}`;
    if (data.notes?.trim()) {
      plantilla += `\n*Notas:* ${data.notes}`;
    }
    plantilla += `\n\n*Entiendo que se requiere el 50% de anticipo para confirmar la reserva.*`;
    window.open(`https://wa.me/593987579515?text=${encodeURIComponent(plantilla)}`);
    onClose();
  };

  const handleClear = () => {
    setData({ location: '', name: '', phone: '', email: '', date: '', time: '', people: '2', eventType: '', notes: '' });
  };

  const isFormValid = data.location && data.name && data.phone && data.email && data.date && data.time && data.eventType;
  const selectedEvent = EVENT_TYPES.find(e => e.id === data.eventType);

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-full md:max-h-[90vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#D4A13B]">
              <path d="M12 3q1 4 4 6.5t3 5.5a1 1 0 0 1-14 0 5 5 0 0 1 1-3 1 1 0 0 0 5 0c0-2-1.5-3-1.5-5q0-2 2.5-4"/>
            </svg>
            <span className="text-lg">Reservas — Leña Quiteña</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col">

          {/* ── FORMULARIO ── */}
          {view === 'form' && (
            <div className="space-y-8 animate-in fade-in duration-300">

              {/* Local */}
              <section>
                <h3 className="text-[1.05rem] font-semibold text-gray-900 mb-4 tracking-tight">¿En qué local nos visitas?</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'San Marcos', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg> },
                    { value: 'La Ronda',  icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg> },
                  ].map(loc => (
                    <button key={loc.value} type="button" onClick={() => setData(d => ({ ...d, location: loc.value }))}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${data.location === loc.value ? "border-black border-2 bg-gray-50 shadow-sm" : "border-gray-200 bg-white hover:border-gray-800"}`}>
                      <div className={data.location === loc.value ? "text-black" : "text-gray-400"}>{loc.icon}</div>
                      <span className={`text-sm font-medium ${data.location === loc.value ? "text-black" : "text-gray-700"}`}>{loc.value}</span>
                    </button>
                  ))}
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Datos personales */}
              <section>
                <h3 className="text-[1.05rem] font-semibold text-gray-900 mb-4 tracking-tight">Datos personales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Nombre completo</label>
                    <input type="text" placeholder="Ej. Juan Pérez" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F0C09]" value={data.name} onChange={e => setData(d => ({ ...d, name: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Teléfono (WhatsApp)</label>
                    <input type="tel" placeholder="099 123 4567" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F0C09]" value={data.phone} onChange={e => setData(d => ({ ...d, phone: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Correo electrónico</label>
                    <input type="email" placeholder="tu@correo.com" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F0C09]" value={data.email} onChange={e => setData(d => ({ ...d, email: e.target.value }))} />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Detalles reserva */}
              <section>
                <h3 className="text-[1.05rem] font-semibold text-gray-900 mb-4 tracking-tight">Detalles de la reserva</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Fecha</label>
                    <input type="date" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F0C09] cursor-pointer" value={data.date} onChange={e => setData(d => ({ ...d, date: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Hora</label>
                    <input type="time" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F0C09] cursor-pointer" value={data.time} onChange={e => setData(d => ({ ...d, time: e.target.value }))} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-gray-700">Personas</label>
                    <input type="number" min="1" className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F0C09]" value={data.people} onChange={e => setData(d => ({ ...d, people: e.target.value }))} />
                  </div>
                </div>
              </section>

              <hr className="border-gray-100" />

              {/* Tipo de evento */}
              <section>
                <h3 className="text-[1.05rem] font-semibold text-gray-900 mb-4 tracking-tight">Tipo de evento</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {EVENT_TYPES.map((evento) => (
                    <button key={evento.id} type="button" onClick={() => setData(d => ({ ...d, eventType: evento.id }))}
                      className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 ${data.eventType === evento.id ? "border-[#7C0F19] border-2 bg-[#7C0F19]/5 shadow-sm" : "border-gray-200 bg-white hover:border-gray-400"}`}>
                      <div className={`mb-2 ${data.eventType === evento.id ? "text-[#7C0F19]" : "text-gray-500"}`}>
                        {evento.icon}
                      </div>
                      <span className={`text-xs font-medium leading-tight ${data.eventType === evento.id ? "text-[#7C0F19]" : "text-gray-700"}`}>
                        {evento.label}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Notas adicionales — placeholder dinámico según evento */}
              <section>
                <h3 className="text-[1.05rem] font-semibold text-gray-900 mb-1 tracking-tight">Notas adicionales</h3>
                <p className="text-xs text-gray-400 mb-3">
                  {selectedEvent ? selectedEvent.notesHint : "Cuéntanos cualquier detalle especial que debamos conocer para tu reserva."}
                </p>
                <textarea
                  rows={3}
                  placeholder={selectedEvent?.notesHint ?? "Escribe aquí tus notas..."}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#1F0C09] resize-none"
                  value={data.notes ?? ''}
                  onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
                />
              </section>


            </div>
          )}

          {/* ── CARGANDO ── */}
          {view === 'loading' && (
            <div className="flex-1 flex flex-col items-center justify-center py-12 animate-in fade-in duration-300">
              <svg className="animate-spin h-12 w-12 text-[#7C0F19] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900">Preparando tu reserva...</h3>
              <p className="text-gray-500 mt-2 text-sm">Validando disponibilidad en {data.location}</p>
            </div>
          )}

          {/* ── CONFIRMACIÓN ── */}
          {view === 'confirm' && (
            <CardConfirmation data={data} logoSrc={logoRestaurante} requiresDeposit={requiresDeposit} />
          )}
        </div>

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
          {view === 'form' && (
            <>
              <button onClick={handleClear} className="text-sm font-semibold underline text-gray-900 hover:text-gray-600 transition-colors">
                Limpiar
              </button>
              <button onClick={handleReviewReservation} disabled={!isFormValid}
                className="rounded-lg bg-[#7C0F19] px-6 py-3 text-white font-semibold hover:bg-[#5a0b12] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                Revisar Reserva
              </button>
            </>
          )}

          {view === 'loading' && <div className="h-[48px] w-full" />}

          {view === 'confirm' && (
            <div className="flex flex-col gap-4 w-full">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#7C0F19] shrink-0" />
                <span className="text-[13px] leading-snug text-[#93989E]">
                  Entiendo que se requiere el 50% de anticipo y que mi mesa tiene un tiempo de tolerancia máximo de 15 minutos. Pasado este tiempo, la mesa será liberada.
                </span>
              </label>
              <div className="flex items-center justify-between">
                <button onClick={() => setView('form')} className="text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  Editar
                </button>
                <button onClick={handleSendWhatsApp} disabled={!termsAccepted}
                  className="rounded-lg bg-[#25D366] px-6 py-3 text-white font-semibold hover:bg-[#1fa951] transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.19h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Confirmar por WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
