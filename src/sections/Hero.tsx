import HeroVideo      from "./hero/HeroVideo"
import HeroOverlay    from "./hero/Herooverlay"
import HeroContent    from "./hero/HeroContent"
import HeroScrollDown from "./hero/HeroScrollDown"

const Hero = () => {
  return (
    <section
      id="hero"
      className="hero-section"
    >
      {/* 1 — Video de fondo */}
      
        <HeroVideo></HeroVideo>
      {/* 2 — Overlay oscuro + efectos */}
      
     <HeroOverlay></HeroOverlay>
      {/* 3 — Contenido principal */}
      <HeroContent />

      {/* 4 — Indicador de scroll */}
      <HeroScrollDown />
    </section>
  )
}

export default Hero