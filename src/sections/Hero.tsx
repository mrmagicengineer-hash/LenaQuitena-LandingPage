import { useRef } from "react"
import { useScroll, useTransform, motion } from "motion/react"
import HeroVideo      from "./hero/HeroVideo"
import HeroOverlay    from "./hero/Herooverlay"
import HeroContent    from "./hero/HeroContent"
import HeroScrollDown from "./hero/HeroScrollDown"

const Hero = () => {
  const ref = useRef<HTMLElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Video sube más lento que el scroll → efecto parallax
  const videoY       = useTransform(scrollYProgress, [0, 1], ["0%", "25%"])
  // Contenido se desvanece y sube al salir
  const contentY     = useTransform(scrollYProgress, [0, 0.6], ["0px", "-60px"])
  const contentOpacity = useTransform(scrollYProgress, [0, 0.45], [1, 0])
  // Scroll indicator desaparece antes
  const scrollBtnOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  return (
    <motion.section
      ref={ref}
      id="hero"
      className="hero-section"
    >
      {/* Video — parallax */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        style={{ y: videoY }}
      >
        <HeroVideo />
      </motion.div>

      {/* Overlays */}
      <HeroOverlay />

      {/* Contenido — sube y desvanece al scroll */}
      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative z-10 w-full h-full flex items-center justify-center"
      >
        <HeroContent />
      </motion.div>

      {/* Scroll indicator — desaparece primero */}
      <motion.div style={{ opacity: scrollBtnOpacity }} className="absolute bottom-0 left-0 right-0 z-20 flex justify-center">
        <HeroScrollDown />
      </motion.div>
    </motion.section>
  )
}

export default Hero
