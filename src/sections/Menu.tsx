import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { useRestaurant } from "@/context/RestaurantContext"
import { useCart } from "@/context/CartContext"
import { useReveal } from "@/hooks/useReveal"
import { motion, useScroll, useTransform } from "motion/react"
import { ChevronLeft, ChevronRight, ClipboardPen, Check } from "lucide-react"

type RestaurantKey = "san-marcos" | "la-ronda"

interface MenuItem {
  name: string
  desc: string
  price: string
  badge?: string
  image?: string
}

interface MenuCategory {
  title: string
  items: MenuItem[]
}

const RESTAURANTS: { key: RestaurantKey; label: string; subtitle: string }[] = [
  { key: "san-marcos", label: "San Marcos", subtitle: "Juan Pío Montúfar N4-14 · Barrio San Marcos" },
  { key: "la-ronda", label: "La Ronda", subtitle: "Calle Guayaquil S1-76 · La Ronda" },
]

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "http://localhost:3001"

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
)

export default function Menu() {
  const { t } = useLanguage()
  const { selectedRestaurant } = useRestaurant()
  const { addItem } = useCart()
  const { ref: revealRef, inView } = useReveal<HTMLElement>({ threshold: 0.06 })
  const menuInnerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: menuInnerRef, offset: ["start end", "end start"] })
  const blobY  = useTransform(scrollYProgress, [0, 1], ["-25%", "25%"])
  const headerY = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"])

  const [activeRestaurant, setActiveRestaurant] = useState<RestaurantKey>("san-marcos")
  const [active, setActive] = useState(0)
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [addedName, setAddedName] = useState<string | null>(null)
  const tabsContainerRef = useRef<HTMLDivElement>(null)

  const handleAddToCart = (item: MenuItem) => {
    addItem({ name: item.name, price: item.price, image: item.image })
    setAddedName(item.name)
    setTimeout(() => setAddedName(null), 800)
  }

  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsContainerRef.current) return
    tabsContainerRef.current.scrollBy({ left: direction === "left" ? -300 : 300, behavior: "smooth" })
  }

  const formatPrice = (value: string) => {
    const trimmed = value.trim()
    return trimmed.startsWith("$") ? trimmed : `$${trimmed}`
  }

  const loadMenu = async (restaurant: RestaurantKey) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/menu?restaurant=${restaurant}`)
      const data = await res.json()
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) { console.error(error) }
  }

  useEffect(() => { loadMenu(activeRestaurant) }, [activeRestaurant])
  useEffect(() => { if (selectedRestaurant !== null) setActiveRestaurant(selectedRestaurant) }, [selectedRestaurant])
  useEffect(() => { setActive(0) }, [activeRestaurant])

  const activeIndex = categories.length > 0 ? Math.min(active, categories.length - 1) : 0
  const currentRestaurant = RESTAURANTS.find((r) => r.key === activeRestaurant)!

  return (
    <section
      ref={revealRef}
      id="menu"
      className={`py-24 transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      style={{ background: "linear-gradient(180deg, #F5F0E8 0%, #EDE5D8 100%)" }}
    >
      <div ref={menuInnerRef} className="relative overflow-hidden">
        {/* Blob parallax decorativo */}
        <motion.div
          className="absolute pointer-events-none"
          style={{
            y: blobY,
            top: "10%", right: "-5%",
            width: "40vw", height: "40vw",
            background: "radial-gradient(circle, rgba(232,165,87,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />

      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-12 px-4">
        <motion.div
          style={{ y: headerY }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center justify-center gap-4 mb-5">
            <span className="block w-10 h-px" style={{ backgroundColor: "rgba(212,161,59,0.5)" }} />
            <span className="text-xs uppercase tracking-[0.6em] font-bold" style={{ color: "#E85D1A" }}>
              {t("menu.section.label")}
            </span>
            <span className="block w-10 h-px" style={{ backgroundColor: "rgba(212,161,59,0.5)" }} />
          </div>

          <h2 className="text-3xl md:text-5xl font-cinzel font-cinzel-semibold tracking-[0.12em] uppercase leading-none mb-4" style={{ color: "#6B1F1F" }}>
            Nuestra Carta
          </h2>

          <div className="flex items-center justify-center gap-2 mt-6">
            <span className="block w-16 h-0.5" style={{ backgroundColor: "#7C0F19" }} />
            <span className="block w-2 h-2 rotate-45" style={{ backgroundColor: "#D4A13B" }} />
            <span className="block w-16 h-0.5" style={{ backgroundColor: "#7C0F19" }} />
          </div>
        </motion.div>
      </div>

      {categories.length === 0 ? (
        <p className="text-center py-20 uppercase tracking-widest text-sm animate-pulse" style={{ color: "rgba(31,12,9,0.3)" }}>
          {t("menu.loading")}
        </p>
      ) : (
        <div className="max-w-screen-2xl mx-auto px-0 md:px-12">

          {/* SELECTOR DE LOCAL */}
          <motion.div
            className="flex justify-center gap-16 mb-8 px-4"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {RESTAURANTS.map((r) => (
              <button
                key={r.key}
                onClick={() => setActiveRestaurant(r.key)}
                className={`cursor-pointer text-sm md:text-base uppercase tracking-[0.4em] transition-all duration-200 pb-3 border-b-2 font-cinzel font-cinzel-medium ${
                  activeRestaurant === r.key
                    ? "border-vino text-chocolate"
                    : "border-transparent text-chocolate/40 hover:text-chocolate/70 hover:border-dorado/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </motion.div>

          {/* PANEL PRINCIPAL */}
          <div
            className="border-t px-10 pt-16 pb-32 md:px-20 md:pt-20 md:pb-40"
            style={{
              borderColor: "rgba(232,165,87,0.3)",
              background: "linear-gradient(180deg, #F5F0E8 0%, #EDE5D8 100%)",
            }}
          >

            {/* TABS DE CATEGORÍAS */}
            <motion.div
              className="flex items-center mb-24 border-b relative group px-4"
              style={{ borderColor: "rgba(31,12,9,0.08)" }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button
                onClick={() => scrollTabs("left")}
                className="cursor-pointer absolute -left-4 md:-left-12 p-2 transition-colors duration-200 hidden md:block"
                style={{ color: "rgba(31,12,9,0.25)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#6B1F1F")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(107,31,31,0.25)")}
              >
                <ChevronLeft size={40} />
              </button>

              <div ref={tabsContainerRef} className="flex overflow-x-auto gap-16 pb-8 no-scrollbar scroll-smooth">
                {categories.map((cat, i) => (
                  <button
                    key={cat.title}
                    onClick={() => setActive(i)}
                    className={`cursor-pointer whitespace-nowrap text-xs md:text-sm uppercase tracking-[0.4em] transition-all duration-200 font-cinzel ${
                      i === activeIndex
                        ? "font-cinzel-bold border-b-2 border-vino pb-2 text-vino"
                        : "text-chocolate/45 hover:opacity-80"
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>

              <button
                onClick={() => scrollTabs("right")}
                className="cursor-pointer absolute -right-4 md:-right-12 p-2 transition-colors duration-200 hidden md:block"
                style={{ color: "rgba(31,12,9,0.25)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#6B1F1F")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(107,31,31,0.25)")}
              >
                <ChevronRight size={40} />
              </button>
            </motion.div>

            {/* GRID DE PRODUCTOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
              {categories[activeIndex].items.map((item, idx) => {
                const isAdded = addedName === item.name
                return (
                  <motion.div
                    key={item.name}
                    className="flex flex-col sm:flex-row gap-6 group items-start"
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-5%" }}
                    transition={{ duration: 0.6, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {/* IMAGEN */}
                    {item.image && (
                      <div
                        className="relative w-full sm:w-48 h-48 md:w-56 md:h-56 shrink-0 overflow-hidden transition-colors duration-300"
                        style={{
                          backgroundColor: "#EDE5D8",
                          border: "1px solid rgba(232,165,87,0.3)",
                          borderRadius: "8px",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.borderColor = "#E8A557")}
                        onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(232,165,87,0.3)")}
                      >
                        <img
                          src={`${API_BASE_URL}${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          style={{ borderRadius: "8px" }}
                        />
                        {item.badge && (
                          <span className="absolute top-0 left-0 text-[10px] text-crema px-3 py-1 font-bold uppercase tracking-widest" style={{ backgroundColor: "#6B1F1F" }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CONTENIDO */}
                    <div className="flex flex-col flex-grow w-full">
                      <span className="block w-8 h-px mb-5" style={{ backgroundColor: "rgba(232,165,87,0.5)" }} />

                      <div className="flex justify-between items-baseline mb-5">
                        <h4
                          className="text-2xl md:text-3xl font-playfair font-semibold leading-tight shrink-0 transition-colors duration-200"
                          style={{ color: "#3D1F1F" }}
                          onMouseEnter={e => (e.currentTarget.style.color = "#6B1F1F")}
                          onMouseLeave={e => (e.currentTarget.style.color = "#3D1F1F")}
                        >
                          {item.name}
                        </h4>
                        <span className="flex-1 mx-4 border-b-2 border-dotted mb-1" style={{ borderColor: "rgba(107,31,31,0.15)" }} />
                        <div className="flex flex-col items-end shrink-0">
                          <span className="font-cinzel font-cinzel-bold text-2xl md:text-3xl tabular-nums" style={{ color: "#E8A557" }}>
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[10px] uppercase tracking-widest font-light mt-0.5" style={{ color: "#8B7968" }}>
                            IVA inc.
                          </span>
                        </div>
                      </div>

                      <p className="text-lg leading-relaxed mb-8" style={{ color: "#5C3A2E" }}>
                        {item.desc}
                      </p>

                      <div className="mt-auto flex justify-between items-center">
                        {/* Mini stars */}
                        <div className="flex gap-0.5" style={{ color: "#E8A557" }}>
                          {Array.from({ length: 5 }).map((_, s) => <StarIcon key={s} />)}
                        </div>

                        <button
                          onClick={() => handleAddToCart(item)}
                          aria-label={`Agregar ${item.name} al carrito`}
                          className={`cursor-pointer flex items-center justify-center w-11 h-11 border transition-all duration-300 focus:outline-none focus-visible:ring-2`}
                          style={isAdded
                            ? { backgroundColor: "#6B1F1F", borderColor: "#6B1F1F", color: "#F5F0E8", transform: "scale(1.1)", borderRadius: "4px" }
                            : { borderColor: "rgba(107,31,31,0.25)", color: "#8B7968", backgroundColor: "transparent", borderRadius: "4px" }
                          }
                          onMouseEnter={e => { if (!isAdded) { e.currentTarget.style.borderColor = "#6B1F1F"; e.currentTarget.style.color = "#F5F0E8"; e.currentTarget.style.backgroundColor = "#6B1F1F" } }}
                          onMouseLeave={e => { if (!isAdded) { e.currentTarget.style.borderColor = "rgba(107,31,31,0.25)"; e.currentTarget.style.color = "#8B7968"; e.currentTarget.style.backgroundColor = "transparent" } }}
                        >
                          {isAdded ? <Check size={20} strokeWidth={2.5} /> : <ClipboardPen size={20} strokeWidth={1.8} />}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* NOTA INFERIOR */}
          <div className="mt-12 flex items-center justify-center gap-3 px-4">
            <span className="block w-6 h-px" style={{ backgroundColor: "rgba(232,165,87,0.4)" }} />
            <p className="text-center text-xs uppercase tracking-[0.6em] font-light" style={{ color: "#8B7968" }}>
              {t("menu.note")} · {currentRestaurant.subtitle}
            </p>
            <span className="block w-6 h-px" style={{ backgroundColor: "rgba(232,165,87,0.4)" }} />
          </div>
        </div>
      )}
      </div>
    </section>
  )
}
