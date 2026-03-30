/*
 * HeroOverlay
 * Capas en orden (z-index ascendente):
 *   1. overlay-base     — oscurece el video (60% negro)
 *   2. overlay-glow     — brillo radial en vino + naranja
 *   3. overlay-vignette — viñeta en los bordes
 *   4. overlay-bottom   — degradado inferior para transición suave a la siguiente sección
 */

const HeroOverlay = () => {
  return (
    <>
      {/* 1 — Base oscura */}
      <div className="hero-overlay-base" aria-hidden="true" />

      {/* 2 — Glows de color */}
      <div className="hero-overlay-glow" aria-hidden="true" />

      {/* 3 — Viñeta perimetral */}
      <div className="hero-overlay-vignette" aria-hidden="true" />

      {/* 4 — Fundido inferior */}
      <div className="hero-overlay-bottom" aria-hidden="true" />
    </>
  )
}

export default HeroOverlay