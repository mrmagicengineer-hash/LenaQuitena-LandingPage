// src/components/CardConfirmation.tsx

export interface ReservationData {
  location: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  people: string;
  eventType: string;
  notes?: string;
}

interface CardConfirmationProps {
  data: ReservationData;
  logoSrc?: string;
  requiresDeposit?: boolean;
}

export const CardConfirmation = ({ data, logoSrc }: CardConfirmationProps) => {
  const eventLabel = data.eventType
    ? data.eventType.charAt(0).toUpperCase() + data.eventType.slice(1).replace(/-/g, ' ')
    : '---';

  return (
    <div className="flex-1 flex flex-col items-center animate-in slide-in-from-bottom-4 duration-500 w-full mt-2">

      {/* Encabezado */}
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900">¡Casi listo!</h3>
        <p className="text-gray-500 mt-1 text-sm">Verifica los datos antes de enviar tu reserva.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm w-full max-w-130 overflow-hidden">

        {/* ── FILA SUPERIOR DEL Z: logo izq ←→ fecha/hora/local der ── */}
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-5 border-b border-gray-100">
          {/* Izquierda: logo */}
          <div className="w-32 shrink-0">
            {logoSrc
              ? <img src={logoSrc} alt="Leña Quiteña" className="w-full h-auto object-contain" />
              : <div className="w-full aspect-square bg-gray-100 rounded-lg" />}
          </div>
          {/* Derecha: local + fecha + hora */}
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="text-base font-bold text-gray-900">Leña Quiteña — {data.location || 'Local'}</span>
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium">
              <span>{data.date || '—'}</span>
              <span className="text-gray-300">·</span>
              <span>{data.time || '—'}</span>
              <span className="text-gray-300">·</span>
              <span>{data.people} personas</span>
            </div>
          </div>
        </div>

        {/* ── DIAGONAL DEL Z: datos personales + evento ── */}
        <div className="px-6 py-5 grid grid-cols-2 gap-x-6 gap-y-4 border-b border-gray-100">
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Nombre</span>
            <span className="text-sm font-semibold text-gray-700 truncate">{data.name || '---'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Teléfono</span>
            <span className="text-sm font-semibold text-gray-700">{data.phone || '---'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Correo</span>
            <span className="text-sm font-semibold text-gray-700 truncate">{data.email || '---'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Evento</span>
            <span className="text-sm font-semibold text-gray-700 capitalize">{eventLabel}</span>
          </div>
          {data.notes?.trim() && (
            <div className="col-span-2 flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Notas</span>
              <span className="text-sm text-gray-600 leading-relaxed">{data.notes}</span>
            </div>
          )}
        </div>

        {/* ── FILA INFERIOR DEL Z: política izq ←→ pago der ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-100">

          {/* Izquierda: política */}
          <div className="px-5 py-4 flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Política de reserva</p>
            <p className="text-[12px] leading-relaxed text-gray-500">
              Tolerancia máx. <strong className="text-gray-700">15 min</strong>. Sin confirmación antes de las 12:00 PM, la reserva se cancela automáticamente.
            </p>
          </div>

          {/* Derecha: pago — ancla visual del Z */}
          <div className="px-5 py-4 bg-[#FFFBF0] flex flex-col gap-3">
            <div className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dorado shrink-0"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#92660A]">50% de anticipo</p>
            </div>
            {/* Banco Pichincha */}
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Banco Pichincha</p>
              <p className="text-[12px] font-semibold text-gray-800">Diana Patricia Rodríguez L.</p>
              <p className="text-[11px] text-gray-500">Cta. Aho: <span className="font-mono font-semibold">2209030058</span></p>
              <p className="text-[10px] text-gray-400">CI: 1719960377</p>
            </div>
            {/* Banco Guayaquil */}
            <div className="space-y-0.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Banco de Guayaquil</p>
              <p className="text-[12px] font-semibold text-gray-800">Patricia del Rosario Lozada C.</p>
              <p className="text-[11px] text-gray-500">Cta. Aho: <span className="font-mono font-semibold">34412396</span></p>
              <p className="text-[10px] text-gray-400">CI: 1707476030</p>
            </div>
            <p className="text-[11px] text-[#92660A] font-medium flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.38 2 2 0 0 1 3.6 1.19h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Envía el comprobante por WhatsApp
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};
