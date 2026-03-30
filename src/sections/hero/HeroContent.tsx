import Button          from "../../components/Button"

/* ── Ornamento de llama entre título y tagline ── */
const FlameDivider = () => (
  <div className="hero-flame-divider">
    <span className="hero-flame-line hero-flame-line--left"  aria-hidden="true" />
    <span className="hero-flame-icon" aria-hidden="true">🔥</span>
    <span className="hero-flame-line hero-flame-line--right" aria-hidden="true" />
  </div>
)

/* ── Links rápidos a los dos locales ── */
const LocaleLinks = () => {
  const locales = [
    { label: "San Marcos", href: "#locales" },
    { label: "La Ronda",   href: "#locales" },
  ]

  return (
    <div className="hero-locale-links">
      {locales.map(({ label, href }) => (
        <a key={label} href={href} className="hero-locale-link">
          <span className="hero-locale-bullet" aria-hidden="true" />
          {label}
        </a>
      ))}
    </div>
  )
}

/* ── Contenido principal ── */
const HeroContent = () => {
  return (
    <div className="hero-content padding-x">
      <div className="hero-content-inner">

        {/* Logo */}
        {/* Pre-label */}
        <span
          className="hero-prelabel"
          style={{ animationDelay: "0.3s" }}
        >
          Restaurante · Centro Histórico · Quito
        </span>

        {/* Título principal */}
        <h1
          className="hero-title"
          style={{ animationDelay: "0.45s" }}
        >
          <span className="hero-title-leña">Leña</span>
          <span className="hero-title-quiteña">Quiteña</span>
        </h1>

        {/* Divider llama */}
        <div style={{ animationDelay: "0.6s" }} className="hero-fade-up">
          <FlameDivider />
        </div>

        {/* Tagline */}
        <p
          className="hero-tagline hero-fade-up"
          style={{ animationDelay: "0.75s" }}
        >
          El Sabor de la Memoria
        </p>

        {/* Sub-copy */}
        <p
          className="hero-subcopy hero-fade-up"
          style={{ animationDelay: "0.9s" }}
        >
          Dos locales en el corazón del Centro Histórico,<br />
          una sola llama que no se apaga.
        </p>

        {/* CTAs */}
        <div
          className="hero-cta-group hero-fade-up"
          style={{ animationDelay: "1.05s" }}
        >
          <Button href="#menu" variant="primary">
            Ver Menú
          </Button>
          <Button href="#reservaciones" variant="outline">
            Hacer Reserva
          </Button>
        </div>

        {/* Locales quick-links */}
        <div
          className="hero-fade-up"
          style={{ animationDelay: "1.2s" }}
        >
          <LocaleLinks />
        </div>

      </div>
    </div>
  )
}

export default HeroContent