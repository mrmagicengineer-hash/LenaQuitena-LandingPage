import { useState, useEffect, useRef, useCallback } from "react"
import { useLanguage }  from "@/context/LanguageContext"
import { useRestaurant } from "@/context/RestaurantContext"
import { useReveal }    from "@/hooks/useReveal"

const LocationIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
)

const DURATION = 5000

// slide index per restaurant key (order matches `slides` array below)
const RESTAURANT_SLIDE_INDEX: Record<string, number> = {
  "san-marcos": 0,
  "la-ronda":   1,
}

export default function Historia() {
  const { t } = useLanguage()
  const { selectedRestaurant }  = useRestaurant()
  const { ref: revealRef, inView: observerInView } = useReveal<HTMLElement>({ threshold: 0.08 })

  // Si el usuario seleccionó un restaurante desde el Hero, la sección ya debe
  // estar visible cuando el scroll llega — no esperamos al IntersectionObserver
  const inView = observerInView || selectedRestaurant !== null
  const [current, setCurrent]   = useState(0)
  const timerRef                = useRef<ReturnType<typeof setInterval> | null>(null)

  const slides = [
    {
      badge: t("historia.slide1.badge"),
      title: t("historia.slide1.title"),
      titleEm: t("historia.slide1.title_em"),
      image: "/images/lena-quitena-sanmarcos.jpg",
      paragraphs: [
        t("historia.slide1.p1"),
        t("historia.slide1.p2"),
      ],
      rating: t("historia.slide1.rating"),
      address: t("historia.slide1.address"),
      horario: t("historia.slide1.schedule"),
      telefono: t("historia.slide1.phone"),
    },
    {
      badge: t("historia.slide2.badge"),
      title: t("historia.slide2.title"),
      titleEm: t("historia.slide2.title_em"),
      image: "/images/leña-quitena-laronda.webp",
      paragraphs: [
        t("historia.slide2.p1"),
        t("historia.slide2.p2"),
      ],
      address: t("historia.slide2.address"),
      horario: t("historia.slide2.schedule"),
    },
  ]

  const goTo = useCallback((idx: number) => {
    setCurrent(idx)
  }, [])

  const move = useCallback((dir: number) => {
    setCurrent((c) => (c + dir + slides.length) % slides.length)
  }, [])

  /* ── Sincronizar con restaurante seleccionado desde el Hero ── */
  useEffect(() => {
    if (selectedRestaurant !== null) {
      const idx = RESTAURANT_SLIDE_INDEX[selectedRestaurant]
      if (idx !== undefined) setCurrent(idx)
    }
  }, [selectedRestaurant])

  /* ── Autoplay: se detiene si el usuario seleccionó un restaurante ── */
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    // Si hay restaurante seleccionado, no rotar automáticamente
    if (selectedRestaurant !== null) return
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % slides.length)
    }, DURATION)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [current, selectedRestaurant])

  const slide = slides[current]

  return (
    <section
      ref={revealRef}
      id="historia"
      className={`historia-section reveal ${inView ? "reveal--visible" : ""}`}
    >

      {/* Card split */}
      <div className="historia-card-split">

        {/* Panel imagen — todas las imágenes apiladas con cross-fade */}
        <div className="historia-img-panel">
          {slides.map((s, i) => (
            <div
              key={i}
              className={`historia-img-bg${i === current ? " historia-img-bg--active" : ""}`}
              style={{ backgroundImage: `url(${s.image})` }}
            />
          ))}
          <div className="historia-img-overlay" />
          <div className="historia-img-content">
            <span className="historia-img-label">{slide.titleEm}</span>
            <div className="historia-img-dots">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`historia-img-dot${i === current ? " historia-img-dot--active" : ""}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Panel contenido — todos los slides apilados, cross-fade */}
        <article className="historia-content-panel">
          <div className="historia-slides-wrapper">
            {slides.map((s, i) => (
              <div
                key={i}
                className={`historia-slide${i === current ? " historia-slide--active" : ""}`}
              >
                <span className="historia-card-badge">{s.badge}</span>
                <h3>
                  {s.title} <em>{s.titleEm}</em>
                </h3>
                {s.paragraphs.map((p, j) => <p key={j}>{p}</p>)}

                {s.rating && (
                  <p>
                    {t("historia.rating.copy", { rating: s.rating, local: s.titleEm })}
                  </p>
                )}

                <div className="address-block">
                  <div className="address-icon"><LocationIcon /></div>
                  <div>
                    <p>{s.address}</p>
                    <p className="horario"><strong>{t("historia.label.schedule")}</strong>{s.horario}</p>
                    {s.telefono && (
                      <p className="horario"><strong>{t("historia.label.phone")}</strong>{s.telefono}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots con progreso + flechas */}
          <div className="historia-bottom-row">
            <div className="historia-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  className={`historia-dot-bar${i === current ? " historia-dot-bar--active" : ""}`}
                  onClick={() => goTo(i)}
                  aria-label={`Ir a ${slides[i].titleEm}`}
                />
              ))}
            </div>

            <div className="historia-arrows">
              <button className="historia-arrow" onClick={() => move(-1)} aria-label={t("historia.aria.prev")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button className="historia-arrow" onClick={() => move(1)} aria-label={t("historia.aria.next")}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}