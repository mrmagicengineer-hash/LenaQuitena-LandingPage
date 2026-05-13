import React, { useState, useRef, useEffect } from 'react';
import { Send, X, ChevronDown, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
}

type ReservationStep =
  | 'none'
  | 'ask_locale'
  | 'ask_date'
  | 'ask_time'
  | 'ask_guests'
  | 'ask_name'
  | 'ask_phone'
  | 'confirm';

interface ReservationData {
  locale?: string;
  date?: string;
  time?: string;
  guests?: string;
  name?: string;
  phone?: string;
}

type Translator = (key: string, params?: Record<string, string | number>) => string;

// ── Thin-line SVG icons (premium feel, replaces emojis) ─────────────────────
const iconProps = { width: 15, height: 15, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, xmlns: 'http://www.w3.org/2000/svg' };

const IconCalendar = () => (<svg {...iconProps}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>);
const IconMapPin = () => (<svg {...iconProps}><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>);
const IconClock = () => (<svg {...iconProps}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>);
const IconPhone = () => (<svg {...iconProps}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>);
const IconArrowLeft = () => (<svg {...iconProps}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>);
const IconCheck = () => (<svg {...iconProps}><polyline points="20 6 9 17 4 12"/></svg>);
const IconXCircle = () => (<svg {...iconProps}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>);

// Map option text keys to their icons
const OPTION_ICON_MAP: Record<string, () => React.ReactElement> = {};

function getOptionIcon(optText: string): (() => React.ReactElement) | null {
  return OPTION_ICON_MAP[optText] ?? null;
}

// ── Flame SVG icon (brand-specific) ──────────────────────────────────────────
const FlameIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 8 7 8 11a4 4 0 0 0 8 0c0-1.5-.8-3-2-4.5C13.2 8 13 9 12 9.5 11 9 10 7.5 10 6c0 0 2-2 2-4z"/>
    <path d="M12 14a6 6 0 0 1-6-6c0 4 2 8 6 10 4-2 6-6 6-10a6 6 0 0 1-6 6z" opacity="0.6"/>
  </svg>
);

// ── Knife & Fork SVG icon ────────────────────────────────────────────────────
const UtensilsIcon = ({ className = '' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 2v7c0 1.1.9 2 2 2 1.1 0 2-.9 2-2V2"/>
    <path d="M7 2v20"/>
    <path d="M21 15V2l-3 6"/>
    <path d="M18 2v6l3 6"/>
    <path d="M21 15v7"/>
  </svg>
);

const OPT_PROMOS  = 'Promociones';
const OPT_HORARIOS = 'Horarios';
const OPT_CONTACTO = 'Contacto';
const OPT_UBICACION = 'Ubicación';
const OPT_RESERVAS = 'Reservas';
const MAIN_OPTIONS = [OPT_PROMOS, OPT_HORARIOS, OPT_CONTACTO, OPT_UBICACION, OPT_RESERVAS];

function getBotResponse(userMessage: string, t: Translator): { text: string; options?: string[]; action?: string } {
  const msg = userMessage.toLowerCase();

  // Greetings
  if (msg.match(/^(hola|hey|buenas|buenos|buen\s*d[ií]a|saludos|buenas\s*tardes|buenas\s*noches|hi|hello|greetings)/)) {
    return { text: t('chat.bot.greeting'), options: MAIN_OPTIONS };
  }

  // Promociones
  if (msg.match(/promo|promoci[oó]n|descuento|oferta|especial|deal/)) {
    return {
      text: '🔥 *Promociones Leña Quiteña:*\n\n• Lunes a jueves: 10% de descuento en grupos de 4+\n• Happy Hour: 17h00–19h00, bebidas 2x1\n• Menú ejecutivo: $12.90 (lunes a viernes al almuerzo)\n• Cumpleaños: postre de cortesía presentando tu cédula',
      options: MAIN_OPTIONS,
    };
  }

  // Horarios
  if (msg.match(/horario|hora|abierto|abren|cierran|cuando|cu[aá]ndo|hours|time|open/)) {
    return {
      text: t('chat.bot.hours'),
      options: MAIN_OPTIONS,
    };
  }

  // Contacto
  if (msg.match(/contacto|tel[eé]fono|whatsapp|email|correo|instagram|redes|llamar|contact|phone|call/)) {
    return {
      text: t('chat.bot.contact'),
      options: MAIN_OPTIONS,
    };
  }

  // Ubicación
  if (msg.match(/ubicaci[oó]n|direcci[oó]n|donde|d[oó]nde|c[oó]mo\s*llegar|mapa|maps|parqueadero|location|address|where/)) {
    return {
      text: t('chat.bot.location'),
      options: MAIN_OPTIONS,
    };
  }

  // Reseña
  if (msg.match(/rese[nñ]a|review|opini[oó]n|calificar|valorar|google/)) {
    return {
      text: '⭐ *¡Gracias por querer compartir tu experiencia!*\n\nTu opinión nos ayuda a crecer. Puedes dejarnos tu reseña directamente en Google Maps haciendo clic en el botón de abajo.',
      options: MAIN_OPTIONS,
      action: 'open_review',
    };
  }

  // Volver / inicio
  if (msg.match(/inicio|volver|regresar|men[uú]\s*principal|home|main\s*menu|back/)) {
    return { text: t('chat.bot.fallback'), options: MAIN_OPTIONS };
  }

  // Despedida
  if (msg.match(/adi[oó]s|chao|chau|bye|hasta\s*luego|nos\s*vemos|goodbye/)) {
    return { text: t('chat.bot.bye') };
  }

  // Gracias
  if (msg.match(/gracias|muchas\s*gracias|excelente|perfecto|genial|thanks|thank\s*you/)) {
    return { text: t('chat.bot.thanks'), options: MAIN_OPTIONS };
  }

  return { text: t('chat.bot.fallback'), options: MAIN_OPTIONS };
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ onClose, message }: { onClose: () => void; message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="relative max-w-55 rounded-2xl border border-[#c4922a]/20 bg-[#faf6ee] px-4 py-2.5 shadow-[0_4px_20px_rgba(0,0,0,0.12)]"
      style={{ fontFamily: "'Nunito Variable', sans-serif" }}
    >
      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute -top-2 -right-2 size-5 bg-[#8b121b] rounded-full flex items-center justify-center text-[#f5e6c8] hover:bg-[#6b0e14] transition-colors"
      >
        <X className="size-3" />
      </button>

      <p className="text-[#250F0D] text-sm font-semibold leading-snug text-center">{message}</p>

      {/* Bottom tail */}
      <div className="absolute -bottom-1.75 right-6 h-0 w-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#faf6ee]" />
      <div className="absolute -bottom-2.25 right-6 h-0 w-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[7px] border-t-[#c4922a]/20" style={{ zIndex: -1 }} />
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ChatBot() {
  const { t, lang } = useLanguage();
  const API_BASE_URL =
    (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || 'http://localhost:3001';
  const QUICK_OPTIONS = MAIN_OPTIONS;

  // Build icon map
  OPTION_ICON_MAP[OPT_PROMOS]   = () => (<svg {...iconProps}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>);
  OPTION_ICON_MAP[OPT_HORARIOS] = IconClock;
  OPTION_ICON_MAP[OPT_CONTACTO] = IconPhone;
  OPTION_ICON_MAP[OPT_UBICACION] = IconMapPin;
  OPTION_ICON_MAP[OPT_RESERVAS] = IconCalendar;
  OPTION_ICON_MAP[t('chat.option.back')] = IconArrowLeft;
  OPTION_ICON_MAP[t('chat.reservation.locale.san_marcos')] = IconMapPin;
  OPTION_ICON_MAP[t('chat.reservation.locale.la_ronda')]   = IconMapPin;
  OPTION_ICON_MAP[t('chat.reservation.cancel')]            = IconXCircle;
  OPTION_ICON_MAP[t('chat.reservation.today')]             = IconCalendar;
  OPTION_ICON_MAP[t('chat.reservation.tomorrow')]          = IconCalendar;
  OPTION_ICON_MAP[t('chat.reservation.confirm_yes')]       = IconCheck;

  const PROMO_MESSAGES = [
    t('chat.promo.1'),
    t('chat.promo.2'),
    t('chat.promo.3'),
    t('chat.promo.4'),
    t('chat.promo.5'),
    t('chat.promo.6'),
  ];

  const getInitialMessage = (): Message => ({
    id: '1',
    text: t('chat.bot.greeting'),
    sender: 'bot',
    timestamp: new Date(),
    options: QUICK_OPTIONS,
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showWaMenu, setShowWaMenu] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [promoIndex, setPromoIndex] = useState(0);
  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [resStep, setResStep] = useState<ReservationStep>('none');
  const [resData, setResData] = useState<ReservationData>({});
  const [isMobileViewport, setIsMobileViewport] = useState(() => window.innerWidth < 768);
  const resStepRef = useRef<ReservationStep>('none');
  const resDataRef = useRef<ReservationData>({});
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatBodyRef = useRef<HTMLDivElement>(null);

  const RESERVATION_LOCALE_OPTIONS = [
    t('chat.reservation.locale.san_marcos'),
    t('chat.reservation.locale.la_ronda'),
    t('chat.reservation.cancel'),
  ];

  const RESERVATION_DATE_OPTIONS = [
    t('chat.reservation.today'),
    t('chat.reservation.tomorrow'),
    t('chat.reservation.cancel'),
  ];

  const CONFIRM_OPTIONS = [
    t('chat.reservation.confirm_yes'),
    t('chat.reservation.cancel'),
  ];

  useEffect(() => {
    resStepRef.current = resStep;
  }, [resStep]);

  useEffect(() => {
    resDataRef.current = resData;
  }, [resData]);

  useEffect(() => {
    const onResize = () => setIsMobileViewport(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Prevent background page scroll when chat is open on mobile
  useEffect(() => {
    if (!isOpen || !isMobileViewport) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, isMobileViewport]);

  // Auto-dismiss tooltip after 5s, then show next promo every 60s
  useEffect(() => {
    if (isOpen) return;
    const dismiss = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(dismiss);
  }, [isOpen, promoIndex]);

  useEffect(() => {
    if (isOpen) return;
    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % PROMO_MESSAGES.length);
      setShowTooltip(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Keep initial chat content aligned with the selected language.
  useEffect(() => {
    setMessages([getInitialMessage()]);
    setInput('');
    setIsTyping(false);
    setResStep('none');
    setResData({});
  }, [lang]);

  // Scroll interno del contenedor de mensajes
  useEffect(() => {
    if (chatBodyRef.current) {
      const scrollContainer = chatBodyRef.current;
      scrollContainer.scrollTo({
        top: scrollContainer.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isTyping]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const reply = (text: string, options?: string[]) => {
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
        text,
        sender: 'bot',
        timestamp: new Date(),
        options,
      },
    ]);
    setIsTyping(false);
  };

  const launchReservationFlow = () => {
    setResData({});
    setResStep('ask_locale');
    setMessages((prev) => [
      ...prev,
      {
        id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
        text: t('chat.reservation.ask_locale'),
        sender: 'bot',
        timestamp: new Date(),
        options: RESERVATION_LOCALE_OPTIONS,
      },
    ]);
  };

  useEffect(() => {
    const openReservationFromCta = () => {
      setIsOpen(true);
      setShowTooltip(false);
      launchReservationFlow();
    };

    window.addEventListener('chatbot:open-reservation', openReservationFromCta as EventListener);
    return () => {
      window.removeEventListener('chatbot:open-reservation', openReservationFromCta as EventListener);
    };
  }, [t]);

  // Listen for reservation sent from modal → confirm in chat
  useEffect(() => {
    const handleReservationSent = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail) return;
      setIsOpen(true);
      setShowTooltip(false);
      const summary = [
        `Reserva enviada por WhatsApp:`,
        `*${detail.name}* — ${detail.phone}`,
        `Local: ${detail.location}`,
        `Fecha: ${detail.date} · Hora: ${detail.time}`,
        `Personas: ${detail.guests}`,
        detail.eventType ? `Evento: ${detail.eventType}` : '',
        detail.message ? `Nota: ${detail.message}` : '',
        ``,
        `El restaurante confirmará tu reserva pronto.`,
      ].filter(Boolean).join('\n');
      reply(summary, QUICK_OPTIONS);
    };
    window.addEventListener('reservation:sent', handleReservationSent as EventListener);
    return () => window.removeEventListener('reservation:sent', handleReservationSent as EventListener);
  }, []);

  useEffect(() => {
    const openOrderFromCta = () => {
      setIsOpen(true);
      setShowTooltip(false);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + Math.floor(Math.random() * 1000)).toString(),
          text: t('chat.bot.order'),
          sender: 'bot',
          timestamp: new Date(),
          options: MAIN_OPTIONS,
        },
      ]);
    };

    window.addEventListener('chatbot:open-order', openOrderFromCta as EventListener);
    return () => {
      window.removeEventListener('chatbot:open-order', openOrderFromCta as EventListener);
    };
  }, [t]);

  const isReservationIntent = (value: string) =>
    /reserva|reservar|mesa|booking|book|table|apartar/.test(value.toLowerCase());

  const isCancelIntent = (value: string) =>
    /cancelar|cancel|anular|detener|stop/.test(value.toLowerCase());

  const isConfirmIntent = (value: string) =>
    /si|sí|confirmar|confirm|yes|ok|okay|correcto/.test(value.toLowerCase());

  const handleReservationFlow = async (text: string) => {
    const currentStep = resStepRef.current;
    const currentData = resDataRef.current;
    const normalized = text.trim();

    if (isCancelIntent(normalized)) {
      setResStep('none');
      setResData({});
      reply(t('chat.reservation.cancelled'), QUICK_OPTIONS);
      return;
    }

    if (currentStep === 'ask_locale') {
      const lowered = normalized.toLowerCase();
      let locale = '';

      if (lowered.includes('san')) locale = t('chat.reservation.locale.san_marcos');
      if (lowered.includes('ronda')) locale = t('chat.reservation.locale.la_ronda');

      if (!locale) {
        reply(t('chat.reservation.locale.invalid'), RESERVATION_LOCALE_OPTIONS);
        return;
      }

      const nextData = { ...currentData, locale };
      setResData(nextData);
      setResStep('ask_date');
      reply(t('chat.reservation.ask_date', { locale }), RESERVATION_DATE_OPTIONS);
      return;
    }

    if (currentStep === 'ask_date') {
      const nextData = { ...currentData, date: normalized };
      setResData(nextData);
      setResStep('ask_time');
      reply(t('chat.reservation.ask_time'));
      return;
    }

    if (currentStep === 'ask_time') {
      const nextData = { ...currentData, time: normalized };
      setResData(nextData);
      setResStep('ask_guests');
      reply(t('chat.reservation.ask_guests'));
      return;
    }

    if (currentStep === 'ask_guests') {
      const guests = Number.parseInt(normalized, 10);
      if (!Number.isFinite(guests) || guests <= 0) {
        reply(t('chat.reservation.guests.invalid'));
        return;
      }

      const nextData = { ...currentData, guests: String(guests) };
      setResData(nextData);
      setResStep('ask_name');
      reply(t('chat.reservation.ask_name'));
      return;
    }

    if (currentStep === 'ask_name') {
      const nextData = { ...currentData, name: normalized };
      setResData(nextData);
      setResStep('ask_phone');
      reply(t('chat.reservation.ask_phone'));
      return;
    }

    if (currentStep === 'ask_phone') {
      const nextData = { ...currentData, phone: normalized };
      setResData(nextData);
      setResStep('confirm');
      reply(
        t('chat.reservation.summary', {
          locale: nextData.locale ?? '-',
          date: nextData.date ?? '-',
          time: nextData.time ?? '-',
          guests: nextData.guests ?? '-',
          name: nextData.name ?? '-',
          phone: nextData.phone ?? '-',
        }),
        CONFIRM_OPTIONS
      );
      return;
    }

    if (currentStep === 'confirm') {
      if (!isConfirmIntent(normalized)) {
        setResStep('none');
        setResData({});
        reply(t('chat.reservation.cancelled'), QUICK_OPTIONS);
        return;
      }

      reply(t('chat.reservation.processing'));

      try {
        const response = await fetch(`${API_BASE_URL}/api/reservations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            locale: currentData.locale,
            date: currentData.date,
            time: currentData.time,
            guests: currentData.guests,
            name: currentData.name,
            phone: currentData.phone,
            source: 'chatbot',
          }),
        });

        if (!response.ok) {
          throw new Error('No se pudo guardar la reserva');
        }

        reply(t('chat.reservation.success'), QUICK_OPTIONS);
      } catch (error) {
        console.error(error);
        reply(t('chat.reservation.error'), QUICK_OPTIONS);
      } finally {
        setResStep('none');
        setResData({});
      }
    }
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(async () => {
      if (resStepRef.current !== 'none') {
        await handleReservationFlow(text);
        return;
      }

      if (isReservationIntent(text)) {
        launchReservationFlow();
        return;
      }

      const response = getBotResponse(text, t);
      reply(response.text, response.options);
      if (response.action === 'open_review') {
        setTimeout(() => {
          window.open('https://g.page/r/leña-quiteña/review', '_blank');
        }, 1200);
      }
    }, 800 + Math.random() * 700);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // Bold markdown renderer (simple *text* → <strong>)
  const renderText = (text: string) =>
    text.split(/(\*[^*]+\*)/).map((part, i) =>
      part.startsWith('*') && part.endsWith('*')
        ? <strong key={i} className="font-semibold">{part.slice(1, -1)}</strong>
        : <span key={i}>{part}</span>
    );

  return (
    <>
      {/* ── Chat floating button + tooltip ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2.5 md:bottom-6 md:right-6"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Tooltip */}
            <AnimatePresence mode="wait">
              {showTooltip && (
                <Tooltip
                  key={promoIndex}
                  onClose={() => setShowTooltip(false)}
                  message={PROMO_MESSAGES[promoIndex]}
                />
              )}
            </AnimatePresence>

            {/* Chat Button */}
            <div className="relative flex items-center justify-center">
              <span className="absolute size-14 rounded-full border-2 border-[#8b121b]/60 animate-[ping_2s_ease-out_infinite] md:size-16" />
              <span className="absolute size-14 rounded-full border-2 border-[#c4922a]/40 animate-[ping_2s_ease-out_0.7s_infinite] md:size-16" />
              <button
                onClick={() => { setIsOpen(true); setShowTooltip(false); }}
                className="relative size-14 rounded-full flex items-center justify-center overflow-hidden shadow-[0_4px_24px_rgba(139,18,27,0.6)] transition-all duration-300 hover:shadow-[0_4px_36px_rgba(139,18,27,0.8)] hover:scale-105 md:size-16"
                style={{ background: 'radial-gradient(circle at 40% 35%, #c4922a 0%, #8b121b 55%, #3d0c0c 100%)' }}
                aria-label="Abrir chat"
              >
                <MessageCircle className="size-6 text-[#f5e6c8] md:size-8" fill="#f5e6c8" />
                <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-white/20 to-transparent" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WhatsApp floating button + picker ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-24 right-4 z-50 md:bottom-28 md:right-6 flex flex-col items-end gap-2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.05 }}
          >
            {/* Restaurant picker */}
            <AnimatePresence>
              {showWaMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.18 }}
                  className="flex flex-col gap-2 items-end"
                >
                  {[
                    { name: 'San Marcos', number: '593999033084' },
                    { name: 'La Ronda',   number: '593987579515' },
                  ].map((r) => (
                    <a
                      key={r.name}
                      href={`https://wa.me/${r.number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowWaMenu(false)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white shadow-lg whitespace-nowrap"
                      style={{ background: 'linear-gradient(135deg, #25d366, #128c4e)' }}
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      {r.name}
                    </a>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* WhatsApp button */}
            <button
              onClick={() => setShowWaMenu((v) => !v)}
              aria-label="Contactar por WhatsApp"
              className="relative size-14 rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.45)] transition-all duration-300 hover:scale-105 hover:shadow-[0_4px_30px_rgba(37,211,102,0.65)] md:size-16 cursor-pointer"
              style={{ background: 'radial-gradient(circle at 40% 35%, #4ade80 0%, #25d366 50%, #128c4e 100%)' }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-7 text-white md:size-8" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="pointer-events-none absolute inset-0 rounded-full bg-linear-to-br from-white/20 to-transparent" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Chat window ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={chatRef}
            initial={{ opacity: 0, y: 60, scale: 0.88 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.88 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="fixed bottom-2 left-2 right-2 z-50 flex h-[88dvh] max-h-[88dvh] flex-col overflow-hidden rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] md:bottom-6 md:left-auto md:right-6 md:h-150 md:w-97.5 md:max-h-none md:rounded-3xl"
            style={{ fontFamily: "'Nunito Variable', sans-serif", background: '#1a0a08' }}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center py-1.5 md:hidden">
              <span className="h-1 w-12 rounded-full bg-[#f5e6c8]/40" />
            </div>

            {/* ── Header ── */}
            <div
              className="flex shrink-0 items-center justify-between px-4 py-3 md:px-5 md:py-4"
              style={{ background: 'linear-gradient(135deg, #1a0a08 0%, #2d0f0c 50%, #3d1a0d 100%)', borderBottom: '1px solid rgba(196,146,42,0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full md:size-11"
                  style={{ background: 'radial-gradient(circle at 40% 35%, #c4922a, #8b121b)' }}>
                  <FlameIcon className="size-5 text-[#f5e6c8] md:size-6" />
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-400 rounded-full border-2 border-[#1a0a08]" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold tracking-wide text-[#f5e6c8] md:text-base"
                    style={{ fontFamily: "'Nunito Variable', sans-serif", letterSpacing: '0.02em' }}>
                    Leña Quiteña
                  </h2>
                  <p className="flex items-center gap-1.5 text-[11px] text-[#c4922a] md:text-xs" style={{ fontFamily: "'Nunito Variable', sans-serif" }}>
                    <UtensilsIcon className="size-3" />
                    Parrilla Auténtica · En línea
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full flex items-center justify-center text-[#f5e6c8]/60 hover:text-[#f5e6c8] hover:bg-white/10 transition-all"
              >
                <ChevronDown className="size-5" />
              </button>
            </div>

            {/* ── Messages ── */}
            <div
              ref={chatBodyRef}
              className="chatbot-messages flex-1 space-y-3 overflow-y-auto px-3 py-3 scroll-smooth md:space-y-4 md:px-4 md:py-4"
              style={{ background: '#ffffff' }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    {/* Avatar */}
                    {msg.sender === 'bot' && (
                      <div className="mb-0.5 flex size-7 shrink-0 items-center justify-center rounded-full"
                        style={{ background: 'radial-gradient(circle at 40% 35%, #c4922a, #8b121b)' }}>
                        <FlameIcon className="size-4 text-[#f5e6c8]" />
                      </div>
                    )}

                    <div className={`flex max-w-[88%] flex-col gap-2 md:max-w-[82%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2.5 leading-relaxed whitespace-pre-wrap ${
                          msg.sender === 'user'
                            ? 'rounded-br-sm text-white'
                            : 'rounded-bl-sm text-[#250F0D]'
                        }`}
                        style={
                          msg.sender === 'user'
                            ? { background: 'linear-gradient(135deg, #8b121b, #6b0e14)', boxShadow: '0 2px 12px rgba(139,18,27,0.25)' }
                            : { background: '#f5f5f5', border: '1px solid #e5e5e5' }
                        }
                      >
                        <p style={{ fontFamily: "'Nunito Variable', sans-serif", fontSize: '0.9rem' }} className="md:text-[0.94rem]">{renderText(msg.text)}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/50' : 'text-gray-400'}`} style={{ fontFamily: "'Nunito Variable', sans-serif" }}>
                          {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="sr-only">
                          {lang === 'es' ? 'Hora del mensaje' : 'Message timestamp'}
                        </p>
                      </div>

                      {/* Quick reply chips */}
                      {msg.options && (
                        <div className="mt-1 grid w-full grid-cols-1 gap-1.5 sm:grid-cols-2">
                          {msg.options.map((opt) => {
                            const OptIcon = getOptionIcon(opt);
                            return (
                              <button
                                key={opt}
                                onClick={() => {
                                  if (opt === OPT_RESERVAS) {
                                    window.dispatchEvent(new CustomEvent('open-reservation-modal'));
                                    return;
                                  }
                                  sendMessage(opt);
                                }}
                                className="rounded-lg px-2.5 py-2 text-left text-[13px] transition-all duration-200 hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                                style={{
                                  fontFamily: "'Nunito Variable', sans-serif",
                                  background: 'rgba(139,18,27,0.04)',
                                  border: '1px solid rgba(139,18,27,0.12)',
                                  color: '#5a0e14',
                                }}
                              >
                                {OptIcon && <span className="shrink-0 text-[#8b121b] opacity-70"><OptIcon /></span>}
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-end gap-2"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full"
                    style={{ background: 'radial-gradient(circle at 40% 35%, #c4922a, #8b121b)' }}>
                    <FlameIcon className="size-4 text-[#f5e6c8]" />
                  </div>
                  <div className="rounded-2xl rounded-bl-sm px-4 py-3"
                    style={{ background: '#f5f5f5', border: '1px solid #e5e5e5' }}>
                    <div className="flex gap-1.5 items-center">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.div
                          key={i}
                          className="size-2 rounded-full"
                          style={{ backgroundColor: '#8b121b' }}
                          animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

            </div>

            {/* ── Input area ── */}
            <div
              className="flex shrink-0 items-center gap-2 px-3 py-2.5 md:px-4 md:py-3"
              style={{ borderTop: '1px solid #e5e5e5', background: '#ffffff' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('chat.input.placeholder')}
                className="flex-1 rounded-full px-3.5 py-2.5 outline-none transition-all md:px-4"
                style={{
                  fontFamily: "'Nunito Variable', sans-serif",
                  fontSize: '0.94rem',
                  background: '#f5f5f5',
                  border: '1px solid #e0e0e0',
                  color: '#250F0D',
                  caretColor: '#8b121b',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#bbb'; e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.04)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#e0e0e0'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="size-10 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                style={{ background: 'linear-gradient(135deg, #c4922a, #8b121b)', boxShadow: input.trim() ? '0 2px 12px rgba(196,146,42,0.35)' : 'none' }}
                aria-label={t('chat.input.send')}
              >
                <Send className="size-4 text-white" />
              </button>
            </div>

            {/* Powered by */}
            <div className="text-center py-1.5 text-[10px]"
              style={{ fontFamily: "'Nunito Variable', sans-serif", color: 'rgba(139,18,27,0.35)', background: '#ffffff', borderTop: '1px solid #f0f0f0' }}>
              <FlameIcon className="inline-block size-3 text-[rgba(139,18,27,0.4)] mr-1" />
              {t('brand.name')} — {t('brand.tagline')}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}