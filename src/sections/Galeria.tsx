import { useEffect, useState, useCallback } from "react"
import { useRestaurant } from "@/context/RestaurantContext"
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react"

type RestaurantKey = "san-marcos" | "la-ronda"

interface GalleryItem {
  image: string
  label: string
  caption: string
  story: string
  featured?: boolean
}

interface GalleryGroup {
  restaurant: RestaurantKey
  title: string
  items: GalleryItem[]
}

const GALLERY: GalleryGroup[] = [
  {
    restaurant: "san-marcos",
    title: "San Marcos",
    items: [
      {
        image: "/images/lena-quitena-sanmarcos.jpg",
        label: "El Local",
        caption: "Desde 2019",
        story: "Nuestra casona en San Marcos no es solo un restaurante, es un viaje en el tiempo. Cada rincón está diseñado para abrazarte con la calidez de la arquitectura colonial mientras el aroma a leña te da la bienvenida.",
        featured: true,
      },
      {
        image: "/images/image1.png",
        label: "Tradición",
        caption: "Cocina a leña",
        story: "Rescatamos los saberes de nuestros abuelos. Aquí, el fuego no es solo una herramienta, es el ingrediente principal que transforma los productos de nuestra tierra en memorias imborrables.",
      },
      {
        image: "/images/image2.png",
        label: "Sabor a Leña",
        caption: "Favorito",
        story: "El crujir de las brasas y el ahumado perfecto. Cada corte y cada plato llevan impregnada la esencia rústica que solo la cocción lenta al carbón y la leña pueden lograr.",
      },
      {
        image: "/images/image3.png",
        label: "Momentos",
        caption: "Nuestra gente",
        story: "Más que clientes, recibimos familias y amigos. Cada mesa es el escenario donde se comparten risas, se celebran hitos y se construyen historias alrededor de la buena comida.",
        featured: true,
      },
      {
        image: "/images/image4.png",
        label: "Ambiente",
        caption: "Noche íntima",
        story: "La bohemia y el arte del barrio se cuelan por nuestras ventanas. Disfruta de una velada íntima donde la música suave y la luz tenue son el complemento perfecto.",
      },
      {
        image: "/images/lena-quitena-sanmarcos.jpg",
        label: "Parrilla",
        caption: "Fuego vivo",
        story: "El corazón de Leña Quiteña palpita en nuestra parrilla. Observa cómo nuestros maestros asadores dominan las llamas para llevar la perfección a tu plato.",
      },
    ],
  },
  {
    restaurant: "la-ronda",
    title: "La Ronda",
    items: [
      {
        image: "/images/leña-quitena-laronda.webp",
        label: "La Ronda",
        caption: "Patrimonio",
        story: "Ubicados en la calle más emblemática de Quito. Cenar aquí es ser parte de la leyenda viva de la ciudad, entre adoquines y faroles que guardan siglos de historia.",
        featured: true,
      },
      {
        image: "/images/image3.png",
        label: "Ambiente",
        caption: "Noches de Quito",
        story: "Cuando cae el sol, La Ronda cobra vida. Sumérgete en una atmósfera vibrante donde la bohemia quiteña se mezcla con el calor de nuestros fogones.",
      },
      {
        image: "/images/image4.png",
        label: "Momentos",
        caption: "Vivencias",
        story: "Desde serenatas improvisadas hasta brindis interminables. Cada noche en nuestro balcón es una oportunidad para vivir el romance y la alegría de la carita de Dios.",
      },
      {
        image: "/images/image1.png",
        label: "Cocina",
        caption: "Sabor auténtico",
        story: "Nuestra carta rinde homenaje a la geografía ecuatoriana. Ingredientes frescos y recetas ancestrales que cobran una nueva dimensión al contacto con nuestras brasas.",
        featured: true,
      },
      {
        image: "/images/image2.png",
        label: "Platos",
        caption: "Tradición",
        story: "Presentaciones que enamoran a la vista y sabores que conquistan el alma. Porciones generosas pensadas para compartir la abundancia de nuestra gastronomía.",
      },
      {
        image: "/images/leña-quitena-laronda.webp",
        label: "Historia viva",
        caption: "Centro Histórico",
        story: "Un refugio de sabor en el corazón del patrimonio cultural de la humanidad. Ven y sé parte del legado culinario que mantenemos vivo en cada servicio.",
      },
    ],
  },
]

export default function Galeria() {
  const { selectedRestaurant } = useRestaurant()
  const [activeTab, setActiveTab] = useState<RestaurantKey>("san-marcos")
  const [lightbox, setLightbox]   = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  const colors = {
    crema:     "#F8F0E0",
    cremaDark: "#EDE4D0",
    cafe:      "#1F0C09",
    cafeClaro: "#2E1814",
    vino:      "#7C0F19",
    naranja:   "#E85D1A",
    amarillo:  "#F9B23C",
    dorado:    "#D4A13B",
  }

  useEffect(() => {
    if (selectedRestaurant) setActiveTab(selectedRestaurant)
  }, [selectedRestaurant])

  const group = GALLERY.find((g) => g.restaurant === activeTab)!

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
      const len = group.items.length
      return dir === "next" ? (prev + 1) % len : (prev - 1 + len) % len
    })
  }, [lightbox, group.items.length, animating])

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

  const activeItem = lightbox !== null ? group.items[lightbox] : null

  return (
    <section id="galeria" className="py-24 overflow-hidden" style={{ backgroundColor: colors.crema }}>

      {/* ── HEADER ── */}
      <div className="max-w-4xl mx-auto text-center mb-20 px-4">
        <div className="flex items-center justify-center gap-4 mb-6">
          <span className="block w-10 h-px" style={{ backgroundColor: `${colors.dorado}80` }} />
          <span className="uppercase tracking-[0.6em] text-xs font-bold" style={{ color: colors.naranja }}>
            Nuestra Historia
          </span>
          <span className="block w-10 h-px" style={{ backgroundColor: `${colors.dorado}80` }} />
        </div>

        <h2 className="text-5xl md:text-7xl font-serif italic mb-8 tracking-tight" style={{ color: colors.cafe }}>
          Un Viaje en cada <span style={{ color: colors.naranja }}>Bocado</span>
        </h2>

        <p className="max-w-2xl mx-auto text-lg leading-relaxed font-light mb-10" style={{ color: colors.cafeClaro }}>
          Recorre nuestros espacios y descubre la pasión, el fuego y las tradiciones que dan vida a nuestra cocina.
        </p>

        <div className="flex items-center justify-center gap-2">
          <span className="block w-16 h-0.5" style={{ backgroundColor: colors.vino }} />
          <span className="block w-2 h-2 rotate-45" style={{ backgroundColor: colors.dorado }} />
          <span className="block w-16 h-0.5" style={{ backgroundColor: colors.vino }} />
        </div>
      </div>

      {/* ── RESTAURANT TABS ── */}
      <div className="flex justify-center gap-16 mb-20 px-4">
        {GALLERY.map((g) => (
          <button
            key={g.restaurant}
            onClick={() => setActiveTab(g.restaurant)}
            className="cursor-pointer group flex flex-col items-center transition-all duration-300"
            style={{ opacity: activeTab === g.restaurant ? 1 : 0.55 }}
          >
            <span
              className="text-lg md:text-2xl uppercase tracking-[0.3em] mb-3 font-semibold"
              style={{ color: activeTab === g.restaurant ? colors.naranja : colors.cafe }}
            >
              {g.title}
            </span>
            <div
              className="h-0.5 transition-all duration-500"
              style={{ backgroundColor: colors.naranja, width: activeTab === g.restaurant ? "100%" : "0" }}
            />
          </button>
        ))}
      </div>

      {/* ── STORYTELLING ── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex flex-col gap-32 md:gap-40">
          {group.items.map((item, i) => {
            const isEven = i % 2 === 0

            /* ── FEATURED: full-width hero ── */
            if (item.featured) {
              return (
                <div key={`${activeTab}-${i}`} className="group">
                  <span className="text-xs uppercase tracking-[0.5em] font-bold mb-6 block" style={{ color: colors.naranja }}>
                    0{i + 1} — {item.label}
                  </span>

                  <div
                    className="relative w-full overflow-hidden cursor-pointer shadow-2xl"
                    style={{ height: "clamp(340px, 55vw, 680px)" }}
                    onClick={() => openLightbox(i)}
                  >
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      className="absolute inset-0"
                      style={{ background: `linear-gradient(to top, ${colors.cafe}CC 0%, ${colors.cafe}20 50%, transparent 100%)` }}
                    />

                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14 flex items-end justify-between">
                      <div>
                        <h3 className="text-4xl md:text-6xl font-serif italic leading-tight mb-3" style={{ color: colors.crema }}>
                          {item.caption}
                        </h3>
                        <p className="text-base md:text-lg font-light leading-relaxed max-w-2xl hidden md:block" style={{ color: `${colors.crema}90` }}>
                          {item.story}
                        </p>
                      </div>
                      <div className="hidden md:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 ml-8">
                        <span className="text-xs uppercase tracking-widest" style={{ color: `${colors.crema}80` }}>Ver imagen</span>
                        <Maximize2 size={18} style={{ color: colors.dorado }} />
                      </div>
                    </div>
                  </div>

                  <p className="mt-6 text-base leading-relaxed font-light md:hidden" style={{ color: colors.cafeClaro }}>
                    {item.story}
                  </p>

                  <div className="mt-6">
                    <button
                      onClick={() => openLightbox(i)}
                      className="cursor-pointer text-sm uppercase tracking-widest border-b-2 pb-1 transition-colors"
                      style={{ color: colors.vino, borderColor: `${colors.vino}40` }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = colors.naranja; e.currentTarget.style.borderColor = colors.naranja }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = colors.vino;   e.currentTarget.style.borderColor = `${colors.vino}40` }}
                    >
                      Ver imagen completa
                    </button>
                  </div>
                </div>
              )
            }

            /* ── NORMAL: zig-zag storytelling ── */
            return (
              <div
                key={`${activeTab}-${i}`}
                className={`flex flex-col ${isEven ? "lg:flex-row" : "lg:flex-row-reverse"} items-center gap-12 lg:gap-24 group`}
              >
                <div className="w-full lg:w-1/2 relative">
                  <div
                    className="relative aspect-4/3 md:aspect-square lg:aspect-4/5 overflow-hidden cursor-pointer w-full shadow-2xl"
                    style={{ backgroundColor: colors.cafe }}
                    onClick={() => openLightbox(i)}
                  >
                    <img
                      src={item.image}
                      alt={item.label}
                      className="w-full h-full object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
                      loading="lazy"
                    />
                    <div
                      className="absolute bottom-6 right-6 backdrop-blur-md p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-lg"
                      style={{ backgroundColor: `${colors.cafe}B3` }}
                    >
                      <Maximize2 size={20} style={{ color: colors.crema }} />
                    </div>
                  </div>

                  <div
                    className={`absolute -bottom-6 ${isEven ? "-left-6" : "-right-6"} w-32 h-32 border-b-2 border-l-2 -z-10 hidden md:block transition-transform duration-700 group-hover:translate-x-2 group-hover:translate-y-2`}
                    style={{ borderColor: colors.dorado, transform: isEven ? "none" : "rotate(90deg)" }}
                  />
                </div>

                <div className="w-full lg:w-1/2 flex flex-col justify-center">
                  <span className="text-xs uppercase tracking-[0.5em] font-bold mb-4" style={{ color: colors.naranja }}>
                    0{i + 1} — {item.label}
                  </span>
                  <h3 className="text-4xl md:text-5xl font-serif italic mb-6 tracking-tight leading-tight" style={{ color: colors.cafe }}>
                    {item.caption}
                  </h3>
                  <p className="text-lg md:text-xl leading-relaxed font-light" style={{ color: colors.cafeClaro }}>
                    {item.story}
                  </p>

                  <div className="mt-10">
                    <button
                      onClick={() => openLightbox(i)}
                      className="cursor-pointer text-sm uppercase tracking-widest border-b-2 pb-1 transition-colors"
                      style={{ color: colors.vino, borderColor: `${colors.vino}40` }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = colors.naranja; e.currentTarget.style.borderColor = colors.naranja }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = colors.vino;   e.currentTarget.style.borderColor = `${colors.vino}40` }}
                    >
                      Ver imagen completa
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {lightbox !== null && activeItem && (
        <div
          className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-12"
          style={{ backgroundColor: `${colors.cafe}F2`, backdropFilter: "blur(12px)" }}
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
        >
          <button
            className="cursor-pointer absolute top-8 right-8 z-110 transition-colors"
            style={{ color: `${colors.cremaDark}80` }}
            onClick={closeLightbox}
            aria-label="Cerrar"
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.naranja }}
            onMouseLeave={(e) => { e.currentTarget.style.color = `${colors.cremaDark}80` }}
          >
            <X size={48} strokeWidth={1.5} />
          </button>

          <button
            className="cursor-pointer absolute left-4 md:left-8 hidden sm:block transition-colors"
            style={{ color: `${colors.cremaDark}80` }}
            onClick={(e) => { e.stopPropagation(); navigate("prev") }}
            aria-label="Anterior"
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.naranja }}
            onMouseLeave={(e) => { e.currentTarget.style.color = `${colors.cremaDark}80` }}
          >
            <ChevronLeft size={70} strokeWidth={1} />
          </button>

          <button
            className="cursor-pointer absolute right-4 md:right-8 hidden sm:block transition-colors"
            style={{ color: `${colors.cremaDark}80` }}
            onClick={(e) => { e.stopPropagation(); navigate("next") }}
            aria-label="Siguiente"
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.naranja }}
            onMouseLeave={(e) => { e.currentTarget.style.color = `${colors.cremaDark}80` }}
          >
            <ChevronRight size={70} strokeWidth={1} />
          </button>

          <div
            className={`relative max-w-7xl w-full flex flex-col items-center transition-all duration-500 ${animating ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeItem.image}
              alt={activeItem.label}
              className="max-h-[75vh] w-auto border shadow-2xl"
              style={{ borderColor: `${colors.cremaDark}20` }}
            />

            <div className="mt-8 text-center max-w-2xl px-4">
              <span className="text-xs uppercase tracking-[0.6em] block mb-2 font-bold" style={{ color: colors.amarillo }}>
                {activeItem.label}
              </span>
              <h3 className="font-serif italic text-3xl md:text-5xl tracking-tight mb-4" style={{ color: colors.crema }}>
                {activeItem.caption}
              </h3>
              <p className="text-sm md:text-base leading-relaxed" style={{ color: colors.cremaDark }}>
                {activeItem.story}
              </p>
              <div className="mt-6 font-mono text-xs tracking-[0.3em]" style={{ color: `${colors.cremaDark}80` }}>
                {String((lightbox ?? 0) + 1).padStart(2, "0")} / {String(group.items.length).padStart(2, "0")}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
