// ─────────────────────────────────────────────────────────────────────────────
// Galeria.tsx
//
// Estructura:
//   <section#galeria>
//     ├── Header (título animado con framer-motion)
//     ├── Tabs restaurante  → "San Marcos" | "La Ronda"
//     ├── Tabs categoría    → "Platos" | "Eventos" | "Local"
//     │     San Marcos: solo Platos + Local (Eventos pendiente de fotógrafo)
//     │     La Ronda:   Platos + Eventos + Local
//     ├── MasonryGrid  → 3 columnas, imágenes desde public/images/
//     └── Lightbox     → modal fullscreen con navegación
//
// Imágenes:
//   public/images/san_marcos/platos/   → C1–C4
//   public/images/san_marcos/local/    → C70,C73,C74,C76,C77,C81,C82,C84,C85,C86,C87,C89
//   public/images/la_ronda/platos/     → C36–C38,C51–C53
//   public/images/la_ronda/Eventos/    → C31,C33,C39–C41,C47,C65
//   public/images/la_ronda/local/      → C26,C28–C30,C43–C45,C48,C57,C59,C66
//
// Animaciones GSAP:
//   1. Reveal inicial  → fade-in + y:50 en cascada al entrar al viewport (once)
//   2. Scroll parallax → columnas con fromTo scrub (solo desktop ≥ 768px)
//   3. Transición de tab/categoría → fade-out del grid → cambio de estado → fade-in
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState, useCallback, useRef } from "react"
import { useRestaurant } from "@/context/RestaurantContext"
import { motion } from "motion/react"
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"
import gsap from "gsap"

// ── Tipos ──────────────────────────────────────────────────────────────────

type RestaurantKey = "san-marcos" | "la-ronda"
type CategoryKey   = "platos" | "eventos" | "local"

interface GalleryItem {
  image:   string // ruta pública, ej. /images/la_ronda/platos/C36.jpg.jpeg
  label:   string
  caption: string
}

// ── Paleta ─────────────────────────────────────────────────────────────────

const colors = {
  crema:     "#F5F0E8",
  cremaDark: "#EDE5D8",
  cafe:      "#1C0A00",
  cafeClaro: "#3D1F1F",
  vino:      "#6B1F1F",
  dorado:    "#E8A557",
  naranja:   "#E85D1A",
  amarillo:  "#F4D799",
}

// ── Labels UI ──────────────────────────────────────────────────────────────

const RESTAURANT_LABELS: Record<RestaurantKey, string> = {
  "san-marcos": "San Marcos",
  "la-ronda":   "La Ronda",
}

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  platos:  "Platos",
  eventos: "Eventos",
  local:   "Local",
}

// Qué categorías tiene cada restaurante
const AVAILABLE_CATEGORIES: Record<RestaurantKey, CategoryKey[]> = {
  "san-marcos": ["local", "platos"],          // Eventos pendiente de fotógrafo
  "la-ronda":   ["local", "platos", "eventos"],
}

// ── Datos de galería ────────────────────────────────────────────────────────

const GALLERY: Record<RestaurantKey, Partial<Record<CategoryKey, GalleryItem[]>>> = {
  "san-marcos": {
    platos: [
      { image: "/images/san_marcos/platos/C1.jpg.jpeg",  label: "A la leña",     caption: "Sabor auténtico" },
      { image: "/images/san_marcos/platos/C2.jpg.jpeg",  label: "Del fogón",     caption: "Fuego y sazón" },
      { image: "/images/san_marcos/platos/C3.jpg.jpeg",  label: "Plato estrella",caption: "Carne perfecta" },
      { image: "/images/san_marcos/platos/C4.jpg.jpeg",  label: "Especialidad",  caption: "Orgullosamente quiteño" },
    ],
    local: [
      { image: "/images/san_marcos/local/C70.jpg.jpeg",  label: "Ambiente",      caption: "San Marcos" },
      { image: "/images/san_marcos/local/C73.jpg.jpeg",  label: "Espacio",       caption: "Tradición viva" },
      { image: "/images/san_marcos/local/C74.jpg.jpeg",  label: "Detalle",       caption: "Con alma" },
      { image: "/images/san_marcos/local/C76.jpg.jpeg",  label: "Rincón",        caption: "Quiteño de corazón" },
      { image: "/images/san_marcos/local/C77.jpg.jpeg",  label: "Mesa",          caption: "Para compartir" },
      { image: "/images/san_marcos/local/C81.jpg.jpeg",  label: "Salón",         caption: "Bienvenida" },
      { image: "/images/san_marcos/local/C82.jpg.jpeg",  label: "Terraza",       caption: "Aire y sabor" },
      { image: "/images/san_marcos/local/C84.jpg.jpeg",  label: "Entrada",       caption: "Patrimonio" },
      { image: "/images/san_marcos/local/C85.jpg.jpeg",  label: "Interior",      caption: "Calidez" },
      { image: "/images/san_marcos/local/C86.jpg.jpeg",  label: "Fogón",         caption: "El corazón" },
      { image: "/images/san_marcos/local/C87.jpg.jpeg",  label: "Maridaje",      caption: "El detalle" },
      { image: "/images/san_marcos/local/C89.jpg.jpeg",  label: "Noche",         caption: "Luz y leña" },
    ],
  },
  "la-ronda": {
    platos: [
      { image: "/images/la_ronda/platos/C36.jpg.jpeg",   label: "Plato estrella",caption: "Sabor a leña" },
      { image: "/images/la_ronda/platos/C37.jpg.jpeg",   label: "Del fogón",     caption: "Tradición viva" },
      { image: "/images/la_ronda/platos/C38.jpg.jpeg",   label: "Corte",         caption: "Fuego y sazón" },
      { image: "/images/la_ronda/platos/C51.jpg.jpeg",   label: "Alma quiteña",  caption: "Receta ancestral" },
      { image: "/images/la_ronda/platos/C52.jpg.jpeg",   label: "A la brasa",    caption: "Carne perfecta" },
      { image: "/images/la_ronda/platos/C53.jpg.jpeg",   label: "Bocados",       caption: "Para compartir" },
    ],
    eventos: [
      { image: "/images/la_ronda/Eventos/C31.jpg.jpeg",  label: "Evento",        caption: "Momentos únicos" },
      { image: "/images/la_ronda/Eventos/C33.jpg.jpeg",  label: "Celebración",   caption: "Con los tuyos" },
      { image: "/images/la_ronda/Eventos/C39.jpg.jpeg",  label: "Reunión",       caption: "Espacio privado" },
      { image: "/images/la_ronda/Eventos/C40.jpg.jpeg",  label: "Brindis",       caption: "Cada ocasión" },
      { image: "/images/la_ronda/Eventos/C41.jpg.jpeg",  label: "Especial",      caption: "Tu momento" },
      { image: "/images/la_ronda/Eventos/C47.jpg.jpeg",  label: "Grupo",         caption: "Juntos a la mesa" },
      { image: "/images/la_ronda/Eventos/C65.jpg.jpeg",  label: "Noche",         caption: "Luz y leña" },
    ],
    local: [
      { image: "/images/la_ronda/local/C26.jpg.jpeg",    label: "La Ronda",      caption: "Patrimonio vivo" },
      { image: "/images/la_ronda/local/C28.jpg.jpeg",    label: "Ambiente",      caption: "Quito histórico" },
      { image: "/images/la_ronda/local/C29.jpg.jpeg",    label: "Espacio",       caption: "Tradición y sabor" },
      { image: "/images/la_ronda/local/C30.jpg.jpeg",    label: "Interior",      caption: "Calidez" },
      { image: "/images/la_ronda/local/C43.jpg.jpeg",    label: "Rincón",        caption: "Con alma" },
      { image: "/images/la_ronda/local/C44.jpg.jpeg",    label: "Salón",         caption: "Para todos" },
      { image: "/images/la_ronda/local/C45.jpg.jpeg",    label: "Mesa",          caption: "Bienvenida" },
      { image: "/images/la_ronda/local/C48.jpg.jpeg",    label: "Detalle",       caption: "El arte de recibir" },
      { image: "/images/la_ronda/local/C57.jpg.jpeg",    label: "Terraza",       caption: "Aire libre" },
      { image: "/images/la_ronda/local/C59.jpg.jpeg",    label: "Noche",         caption: "Magia nocturna" },
      { image: "/images/la_ronda/local/C66.jpg.jpeg",    label: "Entrada",       caption: "La Ronda te espera" },
    ],
  },
}

// ── MasonryGrid ─────────────────────────────────────────────────────────────

function MasonryGrid({
  items,
  onOpen,
  gridRef,
}: {
  items:   GalleryItem[]
  onOpen:  (i: number) => void
  gridRef: React.RefObject<HTMLDivElement | null>
}) {
  // Reveal inicial: fade-in + y:50 en cascada al entrar al viewport
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".gallery-card", {
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
          once: true,
        },
      })

      // Parallax de columnas vinculado al scroll (solo desktop)
      if (window.innerWidth >= 768) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top bottom",
            end:   "bottom top",
            scrub: true,
          },
        })
        tl.fromTo(".gallery-col-0", { y: 60 },  { y: -60 },  0)
          .fromTo(".gallery-col-1", { y: -40 }, { y: 40 },   0)
          .fromTo(".gallery-col-2", { y: 60 },  { y: -80 },  0)
      }
    }, gridRef)

    return () => ctx.revert()
  }, [items, gridRef])

  // Distribuir items en 3 columnas por módulo 3
  const cols: GalleryItem[][] = [[], [], []]
  items.forEach((item, i) => cols[i % 3].push(item))

  return (
    <div
      ref={gridRef}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 px-4 md:px-10 py-8"
    >
      {cols.map((col, colIdx) => (
        <div key={colIdx} className={`gallery-col-${colIdx} flex flex-col`}>
          {col.map((item, itemIdx) => {
            const globalIdx = colIdx + itemIdx * 3
            return (
              <div
                key={itemIdx}
                className="gallery-card group relative overflow-hidden rounded-sm cursor-pointer"
                style={{
                  backgroundColor: colors.crema,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                }}
                onClick={() => onOpen(globalIdx)}
              >
                <div className="relative aspect-3/4 md:aspect-auto overflow-hidden bg-black/5">
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                    style={{ maxHeight: "750px" }}
                    loading="lazy"
                  />
                </div>

                {/* Overlay hover con deslizamiento suave */}
                <div
                  className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                  style={{ background: `linear-gradient(to top, ${colors.cafe}E6 0%, transparent 70%)` }}
                >
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: colors.dorado }}>
                    {item.label}
                  </span>
                  <span className="text-sm font-playfair" style={{ color: colors.crema }}>
                    {item.caption}
                  </span>
                </div>

                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Maximize2 size={16} className="text-white/70" />
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// ── Galeria (componente principal) ──────────────────────────────────────────

export default function Galeria() {
  const { selectedRestaurant } = useRestaurant()

  const [activeTab,      setActiveTab]      = useState<RestaurantKey>("san-marcos")
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("platos")
  const [lightbox,       setLightbox]       = useState<number | null>(null)
  const [animating,      setAnimating]      = useState(false)

  const gridWrapperRef    = useRef<HTMLDivElement>(null)
  const gridRef           = useRef<HTMLDivElement>(null)
  const activeCategoryRef = useRef(activeCategory)
  const activeTabRef      = useRef(activeTab)

  // Mantener refs sincronizados para el intervalo
  useEffect(() => { activeCategoryRef.current = activeCategory }, [activeCategory])
  useEffect(() => { activeTabRef.current = activeTab }, [activeTab])

  // Auto-rotate de categoría cada 15 segundos
  useEffect(() => {
    const id = setInterval(() => {
      const available = AVAILABLE_CATEGORIES[activeTabRef.current]
      const currentIdx = available.indexOf(activeCategoryRef.current)
      const nextCat = available[(currentIdx + 1) % available.length]

      if (!gridWrapperRef.current) return
      gsap.to(gridWrapperRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.25,
        ease: "power2.in",
        onComplete: () => {
          setActiveCategory(nextCat)
          setLightbox(null)
          gsap.fromTo(
            gridWrapperRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
          )
        },
      })
    }, 15000)

    return () => clearInterval(id)
  }, [])

  // Sincroniza tab con el restaurante seleccionado globalmente
  useEffect(() => {
    if (selectedRestaurant) setActiveTab(selectedRestaurant as RestaurantKey)
  }, [selectedRestaurant])

  // Al cambiar de restaurante, reinicia categoría si no está disponible
  useEffect(() => {
    const available = AVAILABLE_CATEGORIES[activeTab]
    if (!available.includes(activeCategory)) setActiveCategory(available[0])
    animateTransition()
  }, [activeTab])

  // Anima la transición del grid al cambiar tab o categoría
  const animateTransition = () => {
    if (!gridWrapperRef.current) return
    gsap.fromTo(
      gridWrapperRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    )
  }

  const handleCategoryChange = (cat: CategoryKey) => {
    if (cat === activeCategory) return
    if (!gridWrapperRef.current) return

    // Fade-out → cambio de estado → fade-in
    gsap.to(gridWrapperRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setActiveCategory(cat)
        setLightbox(null)
        gsap.fromTo(
          gridWrapperRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
        )
      },
    })
  }

  const handleTabChange = (tab: RestaurantKey) => {
    if (tab === activeTab) return
    if (!gridWrapperRef.current) return

    gsap.to(gridWrapperRef.current, {
      opacity: 0,
      y: -20,
      duration: 0.25,
      ease: "power2.in",
      onComplete: () => {
        setActiveTab(tab)
        setLightbox(null)
      },
    })
  }

  // Items actuales según restaurante + categoría
  const currentItems: GalleryItem[] =
    GALLERY[activeTab]?.[activeCategory] ?? []

  // ── Lightbox ──────────────────────────────────────────────────────────────

  const openLightbox = (idx: number) => {
    setLightbox(idx)
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = useCallback(() => {
    setLightbox(null)
    document.body.style.overflow = ""
  }, [])

  const navigate = useCallback((dir: "prev" | "next") => {
    if (lightbox === null || animating) return
    setAnimating(true)
    setTimeout(() => setAnimating(false), 400)
    setLightbox((prev) => {
      if (prev === null) return prev
      const len = currentItems.length
      return dir === "next" ? (prev + 1) % len : (prev - 1 + len) % len
    })
  }, [lightbox, animating, currentItems.length])

  useEffect(() => {
    if (lightbox === null) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")     closeLightbox()
      if (e.key === "ArrowRight") navigate("next")
      if (e.key === "ArrowLeft")  navigate("prev")
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lightbox, navigate, closeLightbox])

  const activeItem = lightbox !== null ? currentItems[lightbox] : null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <section id="galeria" className="overflow-hidden pb-8" style={{ backgroundColor: colors.cremaDark }}>

      {/* ── HEADER ── */}
      <motion.div
        className="max-w-3xl mx-auto text-center pt-16 pb-8 px-4"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex items-center justify-center gap-5 mb-6">
          <span className="block w-12 h-px" style={{ backgroundColor: `${colors.dorado}50` }} />
          <span className="font-cinzel font-cinzel-medium uppercase tracking-[0.55em] text-[11px]" style={{ color: colors.dorado }}>
            Galería
          </span>
          <span className="block w-12 h-px" style={{ backgroundColor: `${colors.dorado}50` }} />
        </div>
        <h2
          className="font-playfair font-bold leading-tight mb-5"
          style={{ color: colors.cafeClaro, fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}
        >
          Un Viaje en cada{" "}
          <span style={{ color: colors.vino }}>Bocado</span>
        </h2>
        <div className="flex items-center justify-center gap-3">
          <span className="block h-px w-20" style={{ backgroundColor: `${colors.dorado}40` }} />
          <span className="block w-1.5 h-1.5 rotate-45" style={{ backgroundColor: colors.dorado }} />
          <span className="block h-px w-20" style={{ backgroundColor: `${colors.dorado}40` }} />
        </div>
      </motion.div>

      {/* ── TABS RESTAURANTE ── */}
      <motion.div
        className="flex justify-center gap-20 mb-6 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {(["san-marcos", "la-ronda"] as RestaurantKey[]).map((key) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className="cursor-pointer flex flex-col items-center gap-2.5 transition-all duration-300"
          >
            <span
              className="font-cinzel font-cinzel-medium text-xs md:text-sm uppercase tracking-[0.5em] transition-colors duration-300"
              style={{ color: activeTab === key ? colors.vino : `${colors.cafe}55` }}
            >
              {RESTAURANT_LABELS[key]}
            </span>
            <motion.div
              className="h-0.5"
              style={{ backgroundColor: colors.vino }}
              animate={{ width: activeTab === key ? "100%" : "0%" }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </button>
        ))}
      </motion.div>

      {/* ── CATEGORÍA ACTIVA ── */}
      <motion.div
        key={activeCategory}
        className="text-center mb-4 px-4"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <span
          className="font-playfair italic"
          style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", color: colors.cafeClaro, opacity: 0.75 }}
        >
          {CATEGORY_LABELS[activeCategory]}
        </span>
        <div className="flex items-center justify-center gap-4 mt-4">
          <span className="block h-0.5 flex-1 max-w-[45%]" style={{ background: "linear-gradient(to right, transparent, rgba(0,0,0,0.2))" }} />
          <span className="block w-2.5 h-2.5 rotate-45 shrink-0" style={{ backgroundColor: "rgba(0,0,0,0.2)" }} />
          <span className="block h-0.5 flex-1 max-w-[45%]" style={{ background: "linear-gradient(to left, transparent, rgba(0,0,0,0.2))" }} />
        </div>
      </motion.div>

      {/* ── GRID ── */}
      <div ref={gridWrapperRef}>
        {currentItems.length > 0 ? (
          <MasonryGrid
            items={currentItems}
            onOpen={openLightbox}
            gridRef={gridRef}
          />
        ) : (
          // Placeholder mientras no hay fotos (ej. Eventos San Marcos)
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="block w-10 h-px" style={{ backgroundColor: `${colors.dorado}50` }} />
            <p className="font-cinzel text-xs uppercase tracking-[0.4em]" style={{ color: `${colors.cafe}55` }}>
              Próximamente
            </p>
            <span className="block w-10 h-px" style={{ backgroundColor: `${colors.dorado}50` }} />
          </div>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox !== null && activeItem && (
        <motion.div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-12"
          style={{ backgroundColor: `${colors.cafe}F2`, backdropFilter: "blur(12px)" }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <button
            className="cursor-pointer absolute top-8 right-8 z-110 transition-colors"
            style={{ color: `${colors.cremaDark}80` }}
            onClick={closeLightbox}
            aria-label="Cerrar"
            onMouseEnter={e => { e.currentTarget.style.color = colors.naranja }}
            onMouseLeave={e => { e.currentTarget.style.color = `${colors.cremaDark}80` }}
          >
            <X size={48} strokeWidth={1.5} />
          </button>

          <button
            className="cursor-pointer absolute left-4 md:left-8 hidden sm:block transition-colors"
            style={{ color: `${colors.cremaDark}80` }}
            onClick={(e) => { e.stopPropagation(); navigate("prev") }}
            aria-label="Anterior"
            onMouseEnter={e => { e.currentTarget.style.color = colors.naranja }}
            onMouseLeave={e => { e.currentTarget.style.color = `${colors.cremaDark}80` }}
          >
            <ChevronLeft size={70} strokeWidth={1} />
          </button>

          <button
            className="cursor-pointer absolute right-4 md:right-8 hidden sm:block transition-colors"
            style={{ color: `${colors.cremaDark}80` }}
            onClick={(e) => { e.stopPropagation(); navigate("next") }}
            aria-label="Siguiente"
            onMouseEnter={e => { e.currentTarget.style.color = colors.naranja }}
            onMouseLeave={e => { e.currentTarget.style.color = `${colors.cremaDark}80` }}
          >
            <ChevronRight size={70} strokeWidth={1} />
          </button>

          <motion.div
            className={`relative max-w-5xl w-full flex flex-col items-center transition-all duration-500 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <img
              src={activeItem.image}
              alt={activeItem.label}
              className="max-h-[75vh] w-auto shadow-2xl"
            />
            <div className="mt-6 text-center">
              <span className="text-xs uppercase tracking-[0.6em] block mb-1 font-bold" style={{ color: colors.amarillo }}>
                {activeItem.label}
              </span>
              <h3 className="font-playfair font-bold text-2xl md:text-4xl" style={{ color: colors.crema }}>
                {activeItem.caption}
              </h3>
              <div className="mt-4 font-mono text-xs tracking-[0.3em]" style={{ color: `${colors.cremaDark}80` }}>
                {String((lightbox ?? 0) + 1).padStart(2, "0")} / {String(currentItems.length).padStart(2, "0")}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
