import { useRef }      from "react"
import { useLanguage } from "@/context/LanguageContext"
import { useReveal }   from "@/hooks/useReveal"
import { motion, useScroll, useTransform } from "motion/react"

interface Testimonio {
  text:   string
  autor:  string
  local:  string
  source: string
}



const StarIcon = ({ filled = true }: { filled?: boolean }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export default function Resenas() {
  const { t }           = useLanguage()
  const { ref, inView } = useReveal<HTMLElement>({ threshold: 0.08 })
  const innerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: innerRef, offset: ["start end", "end start"] })
  const headerY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"])
  const cardsY  = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"])

  const TESTIMONIOS: Testimonio[] = [
    { text: t("resenas.item1.text"), autor: t("resenas.item1.author"), local: t("resenas.item1.place"), source: "Google" },
    { text: t("resenas.item2.text"), autor: t("resenas.item2.author"), local: t("resenas.item2.place"), source: "Google" },
    { text: t("resenas.item3.text"), autor: t("resenas.item3.author"), local: t("resenas.item3.place"), source: "Google" },
  ]

  return (
    <section
      ref={ref}
      id="resenas"
      className={`min-h-screen pt-16 pb-24 reveal ${inView ? "reveal--visible" : ""}`}
      style={{ background: "transparent" }}
      aria-label={t("resenas.aria.carousel")}
    >
      <div ref={innerRef} className="w-full px-6 lg:px-16 xl:px-24">

        {/* HEADER */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20"
          style={{ y: headerY }}
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <div className="flex items-center gap-4 mb-5">
              <span className="block w-8 h-px" style={{ backgroundColor: "rgba(186,117,23,0.5)" }} />
              <span className="text-xs uppercase tracking-[0.6em] font-bold" style={{ color: "#BA7517" }}>
                {t("resenas.badge")}
              </span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-playfair font-bold tracking-tight leading-tight"
              style={{ color: "#3D1F1F" }}
            >
              {t("resenas.title")}
            </h2>
          </div>

          {/* Rating widget — estilo moodboard */}
          <motion.div
            className="flex items-stretch gap-0 shrink-0 shadow-lg"
            style={{ border: "1px solid rgba(186,117,23,0.4)", boxShadow: "0 4px 20px rgba(0,0,0,0.10)" }}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex flex-col items-center justify-center px-8 py-5" style={{ backgroundColor: "rgba(61,31,31,0.05)" }}>
              <p className="text-5xl font-cinzel font-cinzel-bold leading-none" style={{ color: "#BA7517" }}>4.8</p>
              <span className="text-xs mt-1" style={{ color: "rgba(61,31,31,0.5)", fontSize: "11px" }}>/5</span>
            </div>
            <div className="w-px" style={{ backgroundColor: "rgba(186,117,23,0.25)" }} />
            <div className="flex flex-col justify-center px-8 py-5" style={{ backgroundColor: "rgba(61,31,31,0.05)" }}>
              <p className="font-semibold text-sm tracking-wide" style={{ color: "#3D1F1F" }}>Excelente</p>
              <div className="flex gap-0.5 mt-1.5">
                {Array.from({ length: 5 }).map((_, s) => <StarIcon key={s} />)}
              </div>
              <p className="text-[11px] mt-1.5 uppercase tracking-widest" style={{ color: "rgba(61,31,31,0.5)" }}>
                Basado en 200+ reseñas
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* DIVISOR */}
        <div className="w-full h-px mb-16" style={{ backgroundColor: "rgba(61,31,31,0.15)" }} />

        {/* CARDS */}
        <motion.div style={{ y: cardsY }} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIOS.map((item, i) => (
            <motion.article
              key={i}
              className="relative flex flex-col justify-between p-12 cursor-default group min-h-105"
              style={{
                backgroundColor: "rgba(61,31,31,0.04)",
                border: "1px solid rgba(186,117,23,0.3)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
              }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, boxShadow: "0 12px 40px rgba(0,0,0,0.12)", backgroundColor: "rgba(61,31,31,0.08)" }}
            >
              {/* Source badge — top right, estilo moodboard */}
              <div className="absolute top-6 right-6 flex items-center gap-1.5">
                
                <span className="text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(61,31,31,0.45)" }}>
                  {item.source}
                </span>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-6">
                {Array.from({ length: 5 }).map((_, s) => <StarIcon key={s} />)}
              </div>

              {/* Texto reseña */}
              <p
                className="flex-1 text-2xl md:text-3xl leading-relaxed mb-10"
                style={{
                  color: "#5C3A2E",
                  opacity: 0.88,
                }}
              >
                {item.text}
              </p>

              {/* Footer */}
              <div
                className="flex items-center justify-between pt-6"
                style={{ borderTop: "1px solid rgba(61,31,31,0.12)" }}
              >
                <div>
                  <p className="text-lg font-semibold tracking-wide" style={{ color: "#3D1F1F" }}>
                    {item.autor}
                  </p>
                  <p
                    className="text-sm mt-1.5 uppercase tracking-[0.35em]"
                    style={{ color: "#BA7517" }}
                  >
                    {item.local}
                  </p>
                </div>

                {/* Número decorativo */}
                <span
                  className="text-5xl font-sans font-bold leading-none select-none"
                  style={{ color: "rgba(61,31,31,0.06)" }}
                >
                  0{i + 1}
                </span>
              </div>
            </motion.article>
          ))}
        </motion.div>

      </div>
    </section>
  )
}
