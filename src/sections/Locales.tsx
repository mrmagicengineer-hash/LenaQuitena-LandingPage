const FacebookIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const InstagramIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
)

const MAP_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d998.9!2d-78.511!3d-0.223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!4m13!3e0!4m5!1s0x91d59dc49456b77d%3A0xe9dbf213a98bb17a!2sJuan+P%C3%ADo+Mont%C3%BAfar+N4-14%2C+Quito!3m2!1d-0.2228033!2d-78.5103235!4m5!1s0x91d59986a8e7aea3%3A0x88279c96b79c9841!2sCalle+Guayaquil+S1-76%2C+Quito!3m2!1d-0.2241599!2d-78.5125249!5e0!3m2!1ses!2sec!4v1"

export default function Locales() {
  return (
    <section id="locales" className="locales-section">
      <div className="section-header">
        <span className="section-label locales-label">Encuéntranos</span>
        <h2 className="section-title locales-title">
          Nuestros <em>Locales</em>
        </h2>
        <div className="ornament-line">
          <div className="ornament-dot ornament-dot--naranja" />
        </div>
      </div>

      <div className="locales-container">
        <div className="locales-info">
          {/* San Marcos */}
          <div className="local-card">
            <h4>🏛️ San Marcos</h4>
            <p>
              Juan Pío Montúfar N4-14, Barrio San Marcos
              <br />
              Centro Histórico, Quito
            </p>
            <div className="horarios-detail">
              <strong>Horarios</strong>
              <span>
                Lunes – Sábado: 12:00 – 21:00
                <br />
                Domingo: 12:00 – 19:00
              </span>
            </div>
            <span className="phone">📞 +593 98 757 9515</span>
            <div className="local-redes">
              <a
                href="https://www.facebook.com/p/Le%C3%B1a-Quite%C3%B1a-San-Marcos-61561033751397/"
                target="_blank"
                rel="noopener noreferrer"
                className="red-btn"
              >
                <FacebookIcon /> Facebook
              </a>
              <a
                href="https://www.instagram.com/lenaquitena_sanmarcos/"
                target="_blank"
                rel="noopener noreferrer"
                className="red-btn"
              >
                <InstagramIcon /> Instagram
              </a>
            </div>
          </div>

          {/* La Ronda */}
          <div className="local-card">
            <h4>🌹 La Ronda</h4>
            <p>
              Calle Guayaquil S1-76, La Ronda
              <br />
              Centro Histórico, Quito 170130
            </p>
            <div className="horarios-detail">
              <strong>Horarios</strong>
              <span>Lunes – Domingo: 12:00 – 21:00</span>
            </div>
            <div className="local-redes">
              <a
                href="https://www.facebook.com/lenaquitenalaronda/"
                target="_blank"
                rel="noopener noreferrer"
                className="red-btn"
              >
                <FacebookIcon /> Facebook
              </a>
              <a
                href="https://www.instagram.com/lena_quitena/"
                target="_blank"
                rel="noopener noreferrer"
                className="red-btn"
              >
                <InstagramIcon /> Instagram
              </a>
            </div>
          </div>
        </div>

        {/* Mapa */}
        <div className="mapa-wrapper">
          <iframe
            src={MAP_SRC}
            allowFullScreen
            loading="lazy"
            title="Ubicación Leña Quiteña"
          />
        </div>
      </div>
    </section>
  )
}
