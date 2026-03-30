import { useState } from "react"

export default function Reservaciones() {
  const [enviado, setEnviado] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <section id="reservaciones" className="reservaciones-section">
      <div className="section-header">
        <span className="section-label">Reservaciones</span>
        <h2 className="section-title">
          Asegura tu <em>Mesa</em>
        </h2>
        <div className="ornament-line">
          <div className="ornament-dot" />
        </div>
      </div>

      <div className="reserva-container">
        <p className="reserva-intro">
          Reserva con anticipación y garantiza tu experiencia en el sabor de la
          memoria
        </p>

        {enviado ? (
          <div className="reserva-confirmacion">
            <span className="reserva-confirmacion-icon">✓</span>
            <p>
              ¡Gracias! Tu solicitud ha sido recibida. Nos comunicaremos contigo
              pronto para confirmar tu reserva.
            </p>
          </div>
        ) : (
          <form className="reserva-grid" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre completo</label>
              <input type="text" placeholder="Tu nombre" required />
            </div>
            <div className="form-group">
              <label>Teléfono / WhatsApp</label>
              <input type="tel" placeholder="+593 ..." required />
            </div>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input type="email" placeholder="correo@ejemplo.com" required />
            </div>
            <div className="form-group">
              <label>Local</label>
              <select required defaultValue="">
                <option value="" disabled>
                  Selecciona un local
                </option>
                <option>Leña Quiteña San Marcos</option>
                <option>Leña Quiteña La Ronda</option>
              </select>
            </div>
            <div className="form-group">
              <label>Fecha</label>
              <input type="date" required />
            </div>
            <div className="form-group">
              <label>Número de personas</label>
              <select required defaultValue="">
                <option value="" disabled>
                  Selecciona
                </option>
                <option>1 – 2 personas</option>
                <option>3 – 4 personas</option>
                <option>5 – 6 personas</option>
                <option>7 o más (grupo)</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Mensaje o solicitud especial</label>
              <textarea
                placeholder="Cumpleaños, alergias, peticiones especiales..."
                rows={4}
              />
            </div>
            <div className="reserva-submit">
              <button type="submit" className="btn-primary">
                Solicitar Reserva
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  )
}
