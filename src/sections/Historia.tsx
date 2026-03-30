const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
)

export default function Historia() {
  return (
    <section id="historia" className="historia-section">
      {/* Header */}
      <div className="section-header">
        <span className="section-label">Nuestra Historia</span>
        <h2 className="section-title">
          Dos Locales, <em>Una Sola Alma</em>
        </h2>
        <div className="ornament-line">
          <div className="ornament-dot" />
        </div>
      </div>

      {/* Grid de locales */}
      <div className="historia-grid">
        {/* San Marcos */}
        <article className="historia-card">
          <span className="historia-card-badge">Desde el barrio más antiguo</span>
          <h3>
            Leña Quiteña <em>San Marcos</em>
          </h3>
          <p>
            Enclavado en el corazón del Barrio San Marcos, uno de los barrios más
            antiguos y auténticos del Centro Histórico de Quito, este local nació
            del deseo de preservar las recetas tradicionales que las abuelas
            quiteñas guardaban con celo en sus cuadernos amarillentos.
          </p>
          <p>
            Entre sus paredes de adobe y piedra, el humo de la leña se mezcla con
            los aromas de los guisos de siempre. Cada plato es un viaje a la mesa
            de la infancia, a ese domingo de familia donde el tiempo se detenía.
          </p>
          <p>
            Con una calificación de <strong>4.8 ⭐</strong> y la fidelidad de
            cientos de comensales locales y visitantes, San Marcos es hoy un
            referente de la gastronomía tradicional serrana.
          </p>
          <div className="address-block">
            <div className="address-icon">
              <LocationIcon />
            </div>
            <div>
              <p>
                Juan Pío Montúfar N4-14, Barrio San Marcos, Centro Histórico,
                Quito
              </p>
              <p className="horario">
                <strong>Horario</strong>
                Lun – Sáb: 12:00 – 21:00 · Dom: 12:00 – 19:00
              </p>
              <p className="horario">
                <strong>Teléfono</strong>
                +593 98 757 9515
              </p>
            </div>
          </div>
        </article>

        {/* La Ronda */}
        <article className="historia-card">
          <span className="historia-card-badge">
            En la calle más emblemática
          </span>
          <h3>
            Leña Quiteña <em>La Ronda</em>
          </h3>
          <p>
            La Ronda es quizás la calle más querida y fotografiada de Quito. Sus
            balcones floridos, sus adoquines centenarios y el murmullo de sus
            artesanos hacen el escenario perfecto para un segundo capítulo de Leña
            Quiteña.
          </p>
          <p>
            Este local surgió de la necesidad de llevar la tradición del fogón a
            quienes visitan este rincón mágico. Aquí, la cocina a leña dialoga
            con el patrimonio vivo que rodea cada mesa, creando una experiencia
            donde el sabor y la historia se funden en cada bocado.
          </p>
          <p>
            Un espacio que invita a quedarse, a pedir un poco más, a escuchar las
            historias que guardan estas paredes y dejarse llevar por el ritual
            ancestral de cocinar con fuego.
          </p>
          <div className="address-block">
            <div className="address-icon">
              <LocationIcon />
            </div>
            <div>
              <p>
                Calle Guayaquil S1-76, La Ronda, Centro Histórico, Quito 170130
              </p>
              <p className="horario">
                <strong>Horario</strong>
                Lun – Dom: 12:00 – 21:00
              </p>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
