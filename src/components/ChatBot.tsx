import { useState, useRef, useEffect } from 'react';
import { Send, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  options?: string[];
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

const MENU_INFO = `
🥩 *PARRILLAS*
• Churrasco Leña Quiteña — $18
• Costilla BBQ Ahumada — $22
• Lomo Fino a la Brasa — $24
• Pollo a la Leña — $14

🍟 *ACOMPAÑAMIENTOS*
• Papas fritas / al vapor / gratinadas — $4
• Ensalada criolla / verde — $3.50
• Yuca frita — $3.50
• Choclo con queso — $3

🍺 *BEBIDAS*
• Pilsener / Club — $3
• Limonada / Naranjada natural — $3.50
• Agua / Gaseosa — $2
• Jugo del día — $3

🍮 *POSTRES*
• Tres Leches casero — $5
• Helado de paila — $4
• Flan de coco — $4.50
`;

const HOURS_INFO = `
🕐 *Horarios de atención*
• Lunes a Jueves: 12h00 – 22h00
• Viernes y Sábado: 12h00 – 23h30
• Domingo: 12h00 – 21h00

🎉 Para eventos privados y grupos grandes, contacta directamente.
`;

const LOCATION_INFO = `
📍 *Encuéntranos en Quito*
Leña Quiteña — Av. 12 de Octubre N24-562
Sector La Mariscal, Quito – Ecuador

🗺️ Referencias: A media cuadra del parque El Ejido, frente al Hotel Dann Carlton.

🚗 Tenemos parqueadero privado disponible.
Google Maps: maps.app.goo.gl/lena-quitena
`;

const CONTACT_INFO = `
📞 *Contáctanos*
• WhatsApp / Teléfono: +593 98 765 4321
• Email: reservas@lenaquitena.com
• Instagram: @lena.quitena
• Facebook: /LenaQuiteña

💬 Respondemos WhatsApp de Lun–Dom 10h00–22h00
`;

function getBotResponse(userMessage: string): { text: string; options?: string[] } {
  const msg = userMessage.toLowerCase();

  // Greetings
  if (msg.match(/^(hola|hey|buenas|buenos|buen día|hi|saludos|buenas tardes|buenas noches)/)) {
    return {
      text: '¡Bienvenido a *Leña Quiteña* 🔥! El sabor auténtico de la parrilla quiteña. ¿En qué puedo ayudarte hoy?',
      options: ['📋 Ver el menú', '📅 Hacer una reserva', '🛵 Hacer un pedido', '📍 Ubicación', '🕐 Horarios', '📞 Contacto'],
    };
  }

  // Menu
  if (msg.match(/menú|menu|carta|platos|comida|qué tienen|que tienen|comer|opciones/)) {
    return {
      text: MENU_INFO + '\n¿Deseas realizar un pedido o necesitas más información?',
      options: ['🛵 Hacer un pedido', '📅 Hacer una reserva', '🔙 Volver al inicio'],
    };
  }

  // Reservation
  if (msg.match(/reserva|reservar|mesa|booking|apartar|personas|evento|celebración|celebracion|cumpleaños|cumpleanos/)) {
    return {
      text: '¡Con gusto te ayudamos con tu reserva! 🎉\n\nPor favor indícanos:\n1️⃣ Fecha deseada\n2️⃣ Hora preferida\n3️⃣ Número de personas\n4️⃣ Tu nombre y teléfono\n\nO escríbenos directamente por WhatsApp: *+593 98 765 4321*',
      options: ['📞 Contacto directo', '🕐 Ver horarios', '🔙 Volver al inicio'],
    };
  }

  // Order
  if (msg.match(/pedido|pedir|entregar|delivery|domicilio|llevar|para llevar|ordenar/)) {
    return {
      text: '🛵 *Realizamos entregas en Quito Norte y Centro*\n\nPara hacer tu pedido:\n• WhatsApp: *+593 98 765 4321*\n• Tiempo estimado: 35–50 min\n• Pedido mínimo: $15\n• Envío: $2.50\n\n¿Te gustaría ver el menú primero?',
      options: ['📋 Ver el menú', '📞 Llamar ahora', '🔙 Volver al inicio'],
    };
  }

  // Location
  if (msg.match(/ubicación|ubicacion|dirección|direccion|donde|dónde|cómo llegar|como llegar|mapa|maps|parqueadero/)) {
    return {
      text: LOCATION_INFO,
      options: ['🕐 Ver horarios', '📅 Hacer una reserva', '🔙 Volver al inicio'],
    };
  }

  // Hours
  if (msg.match(/horario|horarios|hora|horas|abierto|abren|cierran|cuando|cuándo/)) {
    return {
      text: HOURS_INFO,
      options: ['📅 Hacer una reserva', '📍 Ubicación', '🔙 Volver al inicio'],
    };
  }

  // Contact
  if (msg.match(/contacto|teléfono|telefono|whatsapp|email|correo|instagram|redes|llamar/)) {
    return {
      text: CONTACT_INFO,
      options: ['📅 Hacer una reserva', '🛵 Hacer un pedido', '🔙 Volver al inicio'],
    };
  }

  // Prices
  if (msg.match(/precio|precios|costo|cuánto|cuanto|vale|cuestan/)) {
    return {
      text: 'Nuestros precios van desde *$3 hasta $24* dependiendo del plato. ¿Te muestro el menú completo con todos los precios?',
      options: ['📋 Ver el menú completo', '🛵 Hacer un pedido', '🔙 Volver al inicio'],
    };
  }

  // Thanks
  if (msg.match(/gracias|muchas gracias|excelente|perfecto|genial/)) {
    return {
      text: '¡Con mucho gusto! 🔥 Es un placer atenderte. Recuerda que en *Leña Quiteña* cada visita es especial. ¡Hasta pronto!',
      options: ['📋 Ver el menú', '📅 Hacer una reserva', '🔙 Volver al inicio'],
    };
  }

  // Back / main menu
  if (msg.match(/inicio|volver|menú principal|menu principal|regresar/)) {
    return {
      text: '¿En qué más puedo ayudarte? 🔥',
      options: ['📋 Ver el menú', '📅 Hacer una reserva', '🛵 Hacer un pedido', '📍 Ubicación', '🕐 Horarios', '📞 Contacto'],
    };
  }

  // Bye
  if (msg.match(/adiós|adios|chao|chau|bye|hasta luego|nos vemos/)) {
    return {
      text: '¡Hasta pronto! 🔥 Fue un placer. Te esperamos en *Leña Quiteña* para deleitarte con la mejor parrilla quiteña. ¡Buen provecho!',
    };
  }

  return {
    text: 'Entendido. ¿En qué puedo ayudarte con Leña Quiteña? Puedo darte información sobre nuestro menú, reservas, pedidos, horarios y más.',
    options: ['📋 Ver el menú', '📅 Hacer una reserva', '🛵 Hacer un pedido', '📍 Ubicación', '🕐 Horarios', '📞 Contacto'],
  };
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
function Tooltip({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.9 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
      className="relative bg-[#1a0a08] border border-[#c4922a]/40 rounded-2xl rounded-br-sm px-4 py-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] max-w-[210px]"
      style={{ fontFamily: "'Roboto', sans-serif" }}
    >
      {/* Close */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute -top-2 -right-2 size-5 bg-[#8b121b] rounded-full flex items-center justify-center text-[#f5e6c8] hover:bg-[#6b0e14] transition-colors"
      >
        <X className="size-3" />
      </button>

      {/* Flame decoration */}
      <div className="flex items-start gap-2">
        <FlameIcon className="size-5 text-[#c4922a] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-[#f5e6c8] text-sm font-semibold leading-snug">¡Hola! 👋</p>
          <p className="text-[#c4922a]/90 text-xs mt-0.5 leading-snug">
            ¿Reservas, pedidos o el menú?<br />¡Estoy aquí para ayudarte!
          </p>
        </div>
      </div>

      {/* Tail */}
      <div className="absolute -right-2 bottom-4 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-[#1a0a08]" />
      <div className="absolute -right-3 bottom-4 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-[#c4922a]/40" />
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '¡Bienvenido a *Leña Quiteña* 🔥! Soy tu asistente. ¿En qué puedo ayudarte hoy?',
      sender: 'bot',
      timestamp: new Date(),
      options: ['📋 Ver el menú', '📅 Hacer una reserva', '🛵 Hacer un pedido', '📍 Ubicación', '🕐 Horarios', '📞 Contacto'],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Dismiss tooltip after 6s
  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 6000);
    return () => clearTimeout(t);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: response.text,
          sender: 'bot',
          timestamp: new Date(),
          options: response.options,
        },
      ]);
      setIsTyping(false);
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
      {/* ── Floating button + tooltip ── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 flex items-end gap-3"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            {/* Tooltip */}
            <AnimatePresence>
              {showTooltip && <Tooltip onClose={() => setShowTooltip(false)} />}
            </AnimatePresence>

            {/* Button */}
            <div className="relative flex items-center justify-center">
              <span className="absolute size-16 rounded-full border-2 border-[#8b121b]/60 animate-[ping_2s_ease-out_infinite]" />
              <span className="absolute size-16 rounded-full border-2 border-[#c4922a]/40 animate-[ping_2s_ease-out_0.7s_infinite]" />
              <button
                onClick={() => { setIsOpen(true); setShowTooltip(false); }}
                className="relative size-16 rounded-full flex items-center justify-center shadow-[0_4px_24px_rgba(139,18,27,0.6)] transition-all duration-300 hover:shadow-[0_4px_36px_rgba(139,18,27,0.8)] hover:scale-105 overflow-hidden"
                style={{ background: 'radial-gradient(circle at 40% 35%, #c4922a 0%, #8b121b 55%, #3d0c0c 100%)' }}
                aria-label="Abrir chat"
              >
                <FlameIcon className="size-7 text-[#f5e6c8]" />
                {/* Shine */}
                <span className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
              </button>
            </div>
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
            className="fixed bottom-6 right-6 w-[390px] h-[600px] rounded-3xl flex flex-col overflow-hidden z-50 shadow-[0_20px_60px_rgba(0,0,0,0.55)]"
            style={{ fontFamily: "'Roboto', sans-serif" }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-5 py-4 flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1a0a08 0%, #2d0f0c 50%, #3d1a0d 100%)', borderBottom: '1px solid rgba(196,146,42,0.3)' }}
            >
              <div className="flex items-center gap-3">
                <div className="relative size-11 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'radial-gradient(circle at 40% 35%, #c4922a, #8b121b)' }}>
                  <FlameIcon className="size-6 text-[#f5e6c8]" />
                  <span className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-400 rounded-full border-2 border-[#1a0a08]" />
                </div>
                <div>
                  <h2 className="text-[#f5e6c8] font-bold text-base tracking-widest uppercase"
                    style={{ fontFamily: "'Cinzel', 'Trajan Pro', serif", letterSpacing: '0.12em' }}>
                    Leña Quiteña
                  </h2>
                  <p className="text-[#c4922a] text-xs flex items-center gap-1.5" style={{ fontFamily: "'Roboto', sans-serif" }}>
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
              className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth bg-white"
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
                      <div className="flex-shrink-0 size-7 rounded-full flex items-center justify-center mb-0.5"
                        style={{ background: 'radial-gradient(circle at 40% 35%, #c4922a, #8b121b)' }}>
                        <FlameIcon className="size-4 text-[#f5e6c8]" />
                      </div>
                    )}

                    <div className={`flex flex-col gap-2 max-w-[82%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                      {/* Bubble */}
                      <div
                        className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
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
                        <p style={{ fontFamily: "'Roboto', sans-serif", fontSize: '0.83rem' }}>{renderText(msg.text)}</p>
                        <p className={`text-xs mt-1 ${msg.sender === 'user' ? 'text-white/60' : 'text-gray-400'}`} style={{ fontFamily: "'Roboto', sans-serif" }}>
                          {msg.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      {/* Quick reply chips */}
                      {msg.options && (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {msg.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => sendMessage(opt)}
                              className="text-xs px-3 py-1.5 rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
                              style={{
                                fontFamily: "'Roboto', sans-serif",
                                background: 'rgba(139,18,27,0.08)',
                                border: '1px solid rgba(139,18,27,0.25)',
                                color: '#8b121b',
                              }}
                            >
                              {opt}
                            </button>
                          ))}
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
                  <div className="size-7 rounded-full flex items-center justify-center flex-shrink-0"
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

              <div ref={messagesEndRef} />
            </div>

            {/* ── Input area ── */}
            <div
              className="flex-shrink-0 px-4 py-3 flex items-center gap-2 bg-white"
              style={{ borderTop: '1px solid #e5e5e5' }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe tu mensaje..."
                className="flex-1 text-sm px-4 py-2.5 rounded-full outline-none transition-all placeholder-shown:text-[#f5e6c8]/30"
                style={{
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: '0.83rem',
                  background: '#f5f5f5',
                  border: '1px solid #ddd',
                  color: '#250F0D',
                  caretColor: '#8b121b',
                }}
                onFocus={(e) => { e.target.style.borderColor = '#8b121b'; e.target.style.boxShadow = '0 0 0 3px rgba(139,18,27,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = '#ddd'; e.target.style.boxShadow = 'none'; }}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim()}
                className="size-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: input.trim() ? 'linear-gradient(135deg, #c4922a, #8b121b)' : 'rgba(255,255,255,0.08)', boxShadow: input.trim() ? '0 2px 12px rgba(196,146,42,0.4)' : 'none' }}
              >
                <Send className="size-4 text-[#f5e6c8]" />
              </button>
            </div>

            {/* Powered by */}
            <div className="text-center py-1.5 text-[10px]"
              style={{ fontFamily: "'Roboto', sans-serif", color: 'rgba(139,18,27,0.4)', background: 'white' }}>
              🔥 Leña Quiteña — El sabor de la Memoria
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}