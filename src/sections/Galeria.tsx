import { useEffect, useState, useCallback, useRef } from "react"
import { useRestaurant } from "@/context/RestaurantContext"
import { motion, useScroll, useTransform } from "motion/react"
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"

import C3  from "@/assets/images/C3.jpg.jpeg"
import C7  from "@/assets/images/C7.jpg.jpeg"
import C11 from "@/assets/images/C11.jpg.jpeg"
import C15 from "@/assets/images/C15.jpg.jpeg"
import C18 from "@/assets/images/C18.jpg.jpeg"
import C21 from "@/assets/images/C21.jpg.jpeg"
import C24 from "@/assets/images/C24.jpg.jpeg"
import C2  from "@/assets/images/C2.jpg.jpeg"
import C9  from "@/assets/images/C9.jpg.jpeg"
import C13 from "@/assets/images/C13.jpg.jpeg"

type RestaurantKey = "san-marcos" | "la-ronda"

interface GalleryItem {
  image:   string
  label:   string
  caption: string
}

const FOOD_ITEMS: GalleryItem[] = [
  { image: C3,  label: "Plato estrella",  caption: "Sabor a leña" },
  { image: C7,  label: "Del fogón",       caption: "Tradición viva" },
  { image: C11, label: "Nuestros cortes", caption: "Fuego y sazón" },
  { image: C15, label: "Alma quiteña",    caption: "Receta ancestral" },
  { image: C18, label: "A la brasa",      caption: "Carne perfecta" },
  { image: C21, label: "Detalle",         caption: "Con amor" },
  { image: C24, label: "Bocados",         caption: "Para compartir" },
  { image: C2,  label: "Entrada",         caption: "Bienvenida" },
  { image: C9,  label: "Maridaje",        caption: "El detalle" },
  { image: C13, label: "Especialidad",    caption: "Orgullosamente quiteño" },
]

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

const GALLERY_TITLES: Record<RestaurantKey, string> = {
  "san-marcos": "San Marcos",
  "la-ronda":   "La Ronda",
}

function ParallaxMasonryGrid({ items, onOpen }: { items: GalleryItem[]; onOpen: (i: number) => void }) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] })

  const col1Y = useTransform(scrollYProgress, [0, 1], isMobile ? ["0px", "0px"] : ["-70px", "70px"])
  const col2Y = useTransform(scrollYProgress, [0, 1], isMobile ? ["0px", "0px"] : ["50px", "-50px"])
  const col3Y = useTransform(scrollYProgress, [0, 1], isMobile ? ["0px", "0px"] : ["-90px", "90px"])

  const colYValues = [col1Y, col2Y, col3Y]

  const cols: GalleryItem[][] = [[], [], []]
  items.forEach((item, i) => cols[i % 3].push(item))

  const colIndexOffset = [0, 1, 2]

  return (
    <div ref={sectionRef} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-4 md:px-10 py-8">
      {cols.map((col, colIdx) => (
        <motion.div
          key={colIdx}
          style={{ y: colYValues[colIdx] }}
          className="flex flex-col gap-3"
        >
          {col.map((item, itemIdx) => {
            const globalIdx = colIndexOffset[colIdx] + itemIdx * 3
            const tall = (colIdx === 0 && itemIdx === 0) || (colIdx === 2 && itemIdx === 1)
            return (
              <motion.div
                key={itemIdx}
                className="relative overflow-hidden cursor-pointer group"
                style={{ aspectRatio: tall ? "3/4" : "4/3" }}
                onClick={() => onOpen(globalIdx)}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-5%" }}
                transition={{ duration: 0.7, delay: colIdx * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src={item.image}
                  alt={item.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
                <div
                  className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(to top, ${colors.cafe}CC 0%, transparent 60%)` }}
                >
                  <span className="text-[10px] uppercase tracking-[0.4em] font-bold" style={{ color: colors.dorado }}>
                    {item.label}
                  </span>
                  <span className="text-sm font-playfair" style={{ color: colors.crema }}>
                    {item.caption}
                  </span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Maximize2 size={16} style={{ color: `${colors.crema}CC` }} />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      ))}
    </div>
  )
}

export default function Galeria() {
  const { selectedRestaurant } = useRestaurant()
  const [activeTab, setActiveTab]   = useState<RestaurantKey>("san-marcos")
  const [lightbox, setLightbox]     = useState<number | null>(null)
  const [animating, setAnimating]   = useState(false)

  useEffect(() => {
    if (selectedRestaurant) setActiveTab(selectedRestaurant)
  }, [selectedRestaurant])

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
      const len = FOOD_ITEMS.length
      return dir === "next" ? (prev + 1) % len : (prev - 1 + len) % len
    })
  }, [lightbox, animating])

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

  useEffect(() => { setLightbox(null) }, [activeTab])

  const activeItem = lightbox !== null ? FOOD_ITEMS[lightbox] : null

  return (
    <section id="galeria" className="overflow-hidden pb-8" style={{ backgroundColor: colors.cremaDark }}>

      {/* HEADER */}
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

      {/* TABS */}
      <motion.div
        className="flex justify-center gap-20 mb-4 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {(["san-marcos", "la-ronda"] as RestaurantKey[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="cursor-pointer flex flex-col items-center gap-2.5 transition-all duration-300"
          >
            <span
              className="font-cinzel font-cinzel-medium text-xs md:text-sm uppercase tracking-[0.5em] transition-colors duration-300"
              style={{ color: activeTab === key ? colors.vino : `${colors.cafe}55` }}
            >
              {GALLERY_TITLES[key]}
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

      {/* PARALLAX MASONRY */}
      <ParallaxMasonryGrid items={FOOD_ITEMS} onOpen={openLightbox} />

      {/* LIGHTBOX */}
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
                {String((lightbox ?? 0) + 1).padStart(2, "0")} / {String(FOOD_ITEMS.length).padStart(2, "0")}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}
