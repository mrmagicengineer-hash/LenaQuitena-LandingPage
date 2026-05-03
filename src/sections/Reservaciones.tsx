import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { useRestaurant } from "@/context/RestaurantContext"
import { X, Calendar, Users, Clock, User, Phone, MessageSquare, PartyPopper } from "lucide-react"

const WHATSAPP_NUMBER = "593987579515"

const EVENT_TYPES = [
  { value: "cumpleanos", label: "Cumpleaños" },
  { value: "corporativo", label: "Evento corporativo" },
  { value: "aniversario", label: "Aniversario" },
  { value: "graduacion", label: "Graduación" },
  { value: "reunion_familiar", label: "Reunión familiar" },
  { value: "otro", label: "Otro" },
]

interface ReservationForm {
  name: string
  phone: string
  location: string
  date: string
  time: string
  guests: string
  eventType: string
  message: string
}

const INITIAL_FORM: ReservationForm = {
  name: "",
  phone: "",
  location: "",
  date: "",
  time: "",
  guests: "",
  eventType: "",
  message: "",
}

function buildWhatsAppUrl(data: ReservationForm): string {
  const eventLabel = EVENT_TYPES.find((e) => e.value === data.eventType)?.label ?? data.eventType
  const lines = [
    `Hola, quiero hacer una reserva en *Leña Quiteña*`,
    ``,
    `Nombre: ${data.name}`,
    `Teléfono: ${data.phone}`,
    `Local: ${data.location}`,
    `Fecha: ${data.date}`,
    `Hora: ${data.time}`,
    `Personas: ${data.guests}`,
    data.eventType ? `Tipo de evento: ${eventLabel}` : "",
    data.message ? `Nota: ${data.message}` : "",
    ``,
    `Quedo atento a la confirmación.`,
  ]
    .filter(Boolean)
    .join("\n")

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines)}`
}

export default function Reservaciones() {
  const { t } = useLanguage()
  const { selectedRestaurant } = useRestaurant()
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState<ReservationForm>(INITIAL_FORM)
  const [sent, setSent] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Sync restaurant from global context
  useEffect(() => {
    if (selectedRestaurant) {
      const label =
        selectedRestaurant === "san-marcos"
          ? "Leña Quiteña San Marcos"
          : "Leña Quiteña La Ronda"
      setForm((prev) => ({ ...prev, location: label }))
    }
  }, [selectedRestaurant])

  // Listen for custom event from Navbar/Footer CTA
  useEffect(() => {
    const openModal = () => {
      setIsOpen(true)
      setSent(false)
    }
    window.addEventListener("reservaciones:open", openModal as EventListener)
    return () => window.removeEventListener("reservaciones:open", openModal as EventListener)
  }, [])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [isOpen])

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      setIsOpen(false)
    }
  }

  const update = (field: keyof ReservationForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Open WhatsApp with pre-filled message
    window.open(buildWhatsAppUrl(form), "_blank")
    setSent(true)
    // Dispatch event so ChatBot can confirm
    window.dispatchEvent(
      new CustomEvent("reservation:sent", { detail: { ...form } })
    )
  }

  const openModal = () => {
    setSent(false)
    setIsOpen(true)
  }

  const today = new Date().toISOString().split("T")[0]

  return (
    <>
      {/* Section CTA */}
      <section id="reservaciones" className="reservaciones-section">
        <div className="section-header">
          <span className="section-label">{t("reservas.section.label")}</span>
          <h2 className="section-title">{t("reservas.section.title")}</h2>
          <div className="ornament-line">
            <div className="ornament-dot" />
          </div>
        </div>

        <div className="reserva-container" style={{ textAlign: "center" }}>
          <p className="reserva-intro">{t("reservas.intro")}</p>
          <button type="button" className="btn-primary" onClick={openModal}>
            {t("reservas.submit")}
          </button>
        </div>
      </section>

      {/* Modal overlay */}
      {isOpen && (
        <div className="reserva-modal-overlay" onClick={handleBackdrop}>
          <div ref={modalRef} className="reserva-modal">
            {/* Header */}
            <div className="reserva-modal-header">
              <h3>{t("reservas.section.title")}</h3>
              <button
                type="button"
                className="reserva-modal-close"
                onClick={() => setIsOpen(false)}
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {sent ? (
              <div className="reserva-modal-body" style={{ textAlign: "center", padding: "3rem 2rem" }}>
                <div className="reserva-confirmacion-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <p style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.15rem", color: "var(--color-cafe)", lineHeight: 1.6, marginTop: "1rem" }}>
                  {t("reservas.success.title")} {t("reservas.success.body")}
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ marginTop: "1.5rem" }}
                  onClick={() => setIsOpen(false)}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <form className="reserva-modal-body" onSubmit={handleSubmit}>
                <div className="reserva-modal-grid">
                  {/* Name */}
                  <div className="form-group">
                    <label>
                      <User size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.35rem" }} />
                      {t("reservas.field.full_name")}
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder={t("reservas.placeholder.name")}
                      required
                    />
                  </div>

                  {/* Phone */}
                  <div className="form-group">
                    <label>
                      <Phone size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.35rem" }} />
                      {t("reservas.field.phone")}
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder={t("reservas.placeholder.phone")}
                      required
                    />
                  </div>

                  {/* Location */}
                  <div className="form-group">
                    <label>
                      <Calendar size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.35rem" }} />
                      {t("reservas.field.location")}
                    </label>
                    <select
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                      required
                    >
                      <option value="" disabled>{t("reservas.placeholder.location")}</option>
                      <option value="Leña Quiteña San Marcos">{t("reservas.option.location.san_marcos")}</option>
                      <option value="Leña Quiteña La Ronda">{t("reservas.option.location.la_ronda")}</option>
                    </select>
                  </div>

                  {/* Event type */}
                  <div className="form-group">
                    <label>
                      <PartyPopper size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.35rem" }} />
                      Tipo de evento
                    </label>
                    <select
                      value={form.eventType}
                      onChange={(e) => update("eventType", e.target.value)}
                    >
                      <option value="">Sin evento especial</option>
                      {EVENT_TYPES.map((ev) => (
                        <option key={ev.value} value={ev.value}>{ev.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div className="form-group">
                    <label>
                      <Calendar size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.35rem" }} />
                      {t("reservas.field.date")}
                    </label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => update("date", e.target.value)}
                      min={today}
                      required
                    />
                  </div>

                  {/* Time */}
                  <div className="form-group">
                    <label>
                      <Clock size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.35rem" }} />
                      Hora
                    </label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => update("time", e.target.value)}
                      required
                    />
                  </div>

                  {/* Guests */}
                  <div className="form-group">
                    <label>
                      <Users size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.35rem" }} />
                      {t("reservas.field.guests")}
                    </label>
                    <select
                      value={form.guests}
                      onChange={(e) => update("guests", e.target.value)}
                      required
                    >
                      <option value="" disabled>{t("reservas.placeholder.guests")}</option>
                      <option value="1-2">{t("reservas.option.guests.1_2")}</option>
                      <option value="3-4">{t("reservas.option.guests.3_4")}</option>
                      <option value="5-6">{t("reservas.option.guests.5_6")}</option>
                      <option value="7+">{t("reservas.option.guests.7_plus")}</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="form-group full">
                    <label>
                      <MessageSquare size={12} style={{ display: "inline", verticalAlign: "-1px", marginRight: "0.35rem" }} />
                      {t("reservas.field.message")}
                    </label>
                    <textarea
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder={t("reservas.placeholder.message")}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="reserva-modal-actions">
                  <button type="button" className="btn-outline" onClick={() => setIsOpen(false)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-primary">
                    Enviar por WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
