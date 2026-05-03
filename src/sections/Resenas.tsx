import { useLanguage } from "@/context/LanguageContext"
import { useReveal }   from "@/hooks/useReveal"

interface Testimonio {
  text: string
  autor: string
  local: string
}

export default function Resenas() {
  const { t }           = useLanguage()
  const { ref, inView } = useReveal<HTMLElement>({ threshold: 0.08 })

  const TESTIMONIOS: Testimonio[] = [
    { text: t("resenas.item1.text"), autor: t("resenas.item1.author"), local: t("resenas.item1.place") },
    { text: t("resenas.item2.text"), autor: t("resenas.item2.author"), local: t("resenas.item2.place") },
    { text: t("resenas.item3.text"), autor: t("resenas.item3.author"), local: t("resenas.item3.place") },
  ]

  return (
    <section
      ref={ref}
      id="resenas"
      className={`py-28 md:py-36 reveal ${inView ? "reveal--visible" : ""}`}
      style={{ background: "var(--color-cafe)" }}
      aria-label={t("resenas.aria.carousel")}
    >
      <div className="max-w-6xl mx-auto px-6 lg:px-12">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-20">
          <div>
            <div className="flex items-center gap-4 mb-5">
              <span className="block w-8 h-px" style={{ backgroundColor: "rgba(212,161,59,0.5)" }} />
              <span className="text-xs uppercase tracking-[0.6em] font-bold" style={{ color: "var(--color-dorado)" }}>
                {t("resenas.badge")}
              </span>
            </div>
            <h2
              className="text-4xl md:text-6xl font-serif italic tracking-tight leading-tight"
              style={{ color: "var(--color-crema)" }}
            >
              {t("resenas.title")}
            </h2>
          </div>

          {/* Rating summary */}
          <div className="flex items-center gap-5 shrink-0 pb-1">
            <div className="text-right">
              <p className="text-5xl font-serif font-bold leading-none" style={{ color: "var(--color-dorado)" }}>5.0</p>
              <div className="flex gap-0.5 mt-2 justify-end">
                {Array.from({ length: 5 }).map((_, s) => (
                  <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ color: "var(--color-dorado)" }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <p className="text-[11px] mt-1.5 uppercase tracking-widest" style={{ color: "rgba(248,240,224,0.35)" }}>
                Google Reviews
              </p>
            </div>
            <div className="w-px h-16" style={{ backgroundColor: "rgba(212,161,59,0.2)" }} />
            <div>
              <p className="text-4xl font-serif font-bold leading-none" style={{ color: "rgba(248,240,224,0.25)" }}>03</p>
              <p className="text-[11px] mt-1.5 uppercase tracking-widest" style={{ color: "rgba(248,240,224,0.25)" }}>Reseñas</p>
            </div>
          </div>
        </div>

        {/* DIVISOR */}
        <div className="w-full h-px mb-16" style={{ backgroundColor: "rgba(212,161,59,0.12)" }} />

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
          {TESTIMONIOS.map((item, i) => (
            <article
              key={i}
              className="relative flex flex-col justify-between p-8 transition-all duration-500 cursor-default group"
              style={{
                backgroundColor: "#1e0d0a",
                borderTop: "2px solid var(--color-vino)",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderTopColor = "var(--color-dorado)"
                e.currentTarget.style.backgroundColor = "#261008"
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderTopColor = "var(--color-vino)"
                e.currentTarget.style.backgroundColor = "#1e0d0a"
              }}
            >
              {/* Número fondo */}
              <span
                className="absolute top-6 right-7 text-6xl font-serif font-bold leading-none select-none pointer-events-none"
                style={{ color: "rgba(248,240,224,0.04)" }}
              >
                0{i + 1}
              </span>

              {/* Comilla */}
              <span
                className="block text-5xl leading-none mb-6 select-none transition-colors duration-300"
                style={{ color: "var(--color-vino)", fontFamily: "Georgia, serif" }}
                aria-hidden="true"
              >
                &ldquo;
              </span>

              {/* Texto reseña */}
              <p
                className="flex-1 text-[1.1rem] leading-[1.85] mb-10"
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontStyle: "italic",
                  color: "var(--color-crema)",
                  opacity: 0.82,
                }}
              >
                {item.text}
              </p>

              {/* Footer */}
              <div
                className="flex items-center justify-between pt-6"
                style={{ borderTop: "1px solid rgba(212,161,59,0.12)" }}
              >
                <div>
                  <p className="text-sm font-semibold tracking-wide" style={{ color: "var(--color-crema)" }}>
                    {item.autor}
                  </p>
                  <p
                    className="text-[10px] mt-1.5 uppercase tracking-[0.35em]"
                    style={{ color: "var(--color-dorado)", opacity: 0.6 }}
                  >
                    {item.local}
                  </p>
                </div>

                {/* Stars mini */}
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} width="10" height="10" viewBox="0 0 24 24" fill="currentColor"
                      style={{ color: "var(--color-dorado)" }}>
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  )
}
