import { useState, useEffect, useRef } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { useRestaurant } from "@/context/RestaurantContext"
import { useCart } from "@/context/CartContext"
import { useReveal } from "@/hooks/useReveal"
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

export default function Menu() {
  const { t } = useLanguage()
  const { selectedRestaurant } = useRestaurant()
  const { addItem } = useCart()
  const { ref: revealRef, inView } = useReveal<HTMLElement>({ threshold: 0.06 })
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
      className={`py-24 bg-[#1F0C09] text-[#F8F0E0] transition-all duration-1000 ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
    >
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-8 px-4">
        

        <h2 className="text-4xl md:text-5xl font-serif italic tracking-tight leading-none mb-4 text-[#D4A13B]">
          Nuestra Carta
        </h2>

       
      </div>

      {categories.length === 0 ? (
        <p className="text-center text-[#F8F0E0]/30 py-20 uppercase tracking-widest text-sm animate-pulse">
          {t("menu.loading")}
        </p>
      ) : (
        <div className="max-w-screen-2xl mx-auto px-0 md:px-12">

          {/* SELECTOR DE LOCAL */}
          <div className="flex justify-center gap-16 mb-8 px-4">
            {RESTAURANTS.map((r) => (
              <button
                key={r.key}
                onClick={() => setActiveRestaurant(r.key)}
                className={`cursor-pointer text-sm md:text-base uppercase tracking-[0.4em] transition-all duration-200 pb-3 border-b-2 font-medium ${
                  activeRestaurant === r.key
                    ? "border-[#E85D1A] text-[#F8F0E0]"
                    : "border-transparent text-[#F8F0E0]/30 hover:text-[#F8F0E0]/60 hover:border-[#D4A13B]/40"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* PANEL PRINCIPAL — fondo warm cafe-light, borde dorado sutil */}
          <div
            className="border-t border-dorado/15 px-10 pt-16 pb-32 md:px-20 md:pt-20 md:pb-40"
            style={{ background: "linear-gradient(180deg, #1a0e0b 0%, #150907 100%)" }}
          >

            {/* TABS DE CATEGORÍAS */}
            <div className="flex items-center mb-24 border-b border-[#F8F0E0]/5 relative group px-4">
              <button
                onClick={() => scrollTabs("left")}
                className="cursor-pointer absolute -left-4 md:-left-12 p-2 text-[#F8F0E0]/30 hover:text-[#E85D1A] transition-colors duration-200 hidden md:block"
              >
                <ChevronLeft size={40} />
              </button>

              <div ref={tabsContainerRef} className="flex overflow-x-auto gap-16 pb-8 no-scrollbar scroll-smooth">
                {categories.map((cat, i) => (
                  <button
                    key={cat.title}
                    onClick={() => setActive(i)}
                    className={`cursor-pointer whitespace-nowrap text-xs md:text-sm uppercase tracking-[0.4em] transition-all duration-200 ${
                      i === activeIndex
                        ? "text-[#E85D1A] font-bold border-b-2 border-[#E85D1A] pb-2"
                        : "text-[#F8F0E0]/40 hover:text-[#F8F0E0]/80"
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>

              <button
                onClick={() => scrollTabs("right")}
                className="cursor-pointer absolute -right-4 md:-right-12 p-2 text-[#F8F0E0]/30 hover:text-[#E85D1A] transition-colors duration-200 hidden md:block"
              >
                <ChevronRight size={40} />
              </button>
            </div>

            {/* GRID DE PRODUCTOS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
              {categories[activeIndex].items.map((item) => {
                const isAdded = addedName === item.name
                return (
                  <div key={item.name} className="flex flex-col sm:flex-row gap-6 group items-start">

                    {/* IMAGEN */}
                    {item.image && (
                      <div className="relative w-full sm:w-48 h-48 md:w-56 md:h-56 flex-shrink-0 overflow-hidden bg-[#2E1814] border border-[#D4A13B]/10 group-hover:border-[#D4A13B]/30 transition-colors duration-300 rounded-none">
                        <img
                          src={`${API_BASE_URL}${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0"
                        />
                        {item.badge && (
                          <span className="absolute top-0 left-0 bg-[#7C0F19] text-[10px] text-[#F8F0E0] px-3 py-1 font-bold uppercase tracking-widest">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CONTENIDO */}
                    <div className="flex flex-col flex-grow w-full">
                      {/* Línea decorativa superior */}
                      <span className="block w-8 h-px bg-dorado/40 mb-5" />

                      <div className="flex justify-between items-baseline mb-5">
                        <h4 className="text-xl md:text-2xl font-serif text-[#F8F0E0] tracking-wide uppercase italic leading-tight group-hover:text-[#E85D1A] transition-colors duration-200 shrink-0">
                          {item.name}
                        </h4>
                        <span className="flex-1 mx-4 border-b-4 border-dotted border-[#F8F0E0]/40 mb-2" />
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-dorado font-mono text-xl md:text-2xl font-bold tabular-nums">
                            {formatPrice(item.price)}
                          </span>
                          <span className="text-[#F8F0E0]/30 text-[10px] uppercase tracking-widest font-light mt-0.5">
                            IVA inc.
                          </span>
                        </div>
                      </div>

                      <p className="text-sm md:text-base text-[#F8F0E0]/50 font-light leading-relaxed mb-8 italic">
                        {item.desc}
                      </p>

                      <div className="mt-auto flex justify-end">
                        <button
                          onClick={() => handleAddToCart(item)}
                          aria-label={`Agregar ${item.name} al carrito`}
                          className={`cursor-pointer flex items-center justify-center w-12 h-12 border transition-all duration-300 rounded-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E85D1A] ${
                            isAdded
                              ? "bg-[#7C0F19] border-[#7C0F19] text-[#F8F0E0] scale-110"
                              : "border-[#F8F0E0]/10 text-[#F8F0E0]/30 hover:border-[#7C0F19] hover:text-[#F8F0E0] hover:bg-[#7C0F19]/20"
                          }`}
                        >
                          {isAdded ? <Check size={22} strokeWidth={2.5} /> : <ClipboardPen size={22} strokeWidth={2} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* NOTA INFERIOR */}
          <div className="mt-20 flex items-center justify-center gap-3 px-4">
            <span className="block w-6 h-px bg-[#D4A13B]/30" />
            <p className="text-center text-xs text-[#F8F0E0]/25 uppercase tracking-[0.6em] font-light">
              {t("menu.note")} · {currentRestaurant.subtitle}
            </p>
            <span className="block w-6 h-px bg-[#D4A13B]/30" />
          </div>
        </div>
      )}
    </section>
  )
}
