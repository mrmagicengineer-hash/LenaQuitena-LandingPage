import { useState } from "react"
import { useLanguage } from "@/context/LanguageContext"
import { useRestaurant, type RestaurantKey } from "@/context/RestaurantContext"
import { logoSanMarcos, logoLaRonda } from "@/assets/logo"

const RESTAURANT_CARDS: {
  key: RestaurantKey
  logo: string
  logoAlt: string
  nameKey: string
  zoneName: string
}[] = [
    {
      key: "san-marcos",
      logo: logoSanMarcos,
      logoAlt: "Logo San Marcos",
      nameKey: "hero.local.san_marcos",
      zoneName: "San Marcos",
    },
    {
      key: "la-ronda",
      logo: logoLaRonda,
      logoAlt: "Logo La Ronda",
      nameKey: "hero.local.la_ronda",
      zoneName: "La Ronda",
    },
  ]

const HeroContent = () => {
  const { t } = useLanguage()
  const { selectedRestaurant, selectRestaurant } = useRestaurant()
  const [launching, setLaunching] = useState<RestaurantKey | null>(null)

  const handleSelect = (key: RestaurantKey) => {
    if (launching) return
    selectRestaurant(key)
    setLaunching(key)

    setTimeout(() => {
      const section = document.getElementById("historia")
      if (section) {
        const navbarHeight = 72
        const top = section.getBoundingClientRect().top + window.scrollY - navbarHeight
        window.scrollTo({ top, behavior: "smooth" })
      }
      setTimeout(() => setLaunching(null), 500)
    }, 220)
  }

  return (
    <div className="hero-content padding-x w-full -mt-16 md:-mt-24 pt-20">
      <div className="hero-content-inner flex flex-col items-center text-center mx-auto">

        {/* Título principal */}
        <h1
          className="hero-title"
          style={{ animationDelay: "0.5s" }}
        >
          <span className="hero-title-leña">{t("hero.title.line1")}</span>
          <span className="hero-title-quiteña">{t("hero.title.line2")}</span>
        </h1>

        <p
          className="hero-tagline hero-fade-up mt-2 md:mt-3"
          style={{ animationDelay: "0.4s" }}
        >
          {t("hero.tagline")}
        </p>

        <div
          className="hero-fade-up mt-8 md:mt-10 flex flex-col items-center w-full"
          style={{ animationDelay: "0.6s" }}
        >
          <h2 className="text-[#D1B894] text-base md:text-[15px] uppercase tracking-[0.2em] mb-6 font-sans font-light">
            Elige un Restaurante
          </h2>

          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-10 w-full max-w-3xl">

            {RESTAURANT_CARDS.map((card, idx) => {
              const isSelected = selectedRestaurant === card.key
              const isLaunching = launching === card.key

              return (
                <div key={card.key} className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
                  {idx === 1 && (
                    <div className="hidden md:block h-48 w-px bg-linear-to-b from-transparent via-[#F5EDD8]/10 to-transparent" />
                  )}

                  <button
                    type="button"
                    onClick={() => handleSelect(card.key)}
                    aria-label={`Seleccionar Leña Quiteña ${card.zoneName}`}
                    aria-pressed={isSelected}
                    disabled={!!launching}
                    className={[
                      "group relative flex flex-col items-center justify-between",
                      "w-52 md:w-60 h-50 sm:h-60 md:h-70 p-4 md:p-6 rounded-none cursor-pointer",
                      "backdrop-blur-md outline-none",
                      "transition-all duration-500 ease-out",
                      isLaunching
                        ? "bg-[#1A0A06]/80 -translate-y-5 scale-[1.03] ring-2 ring-[#D1B894] shadow-[0_28px_70px_rgba(209,184,148,0.4)]"
                        : isSelected
                          ? "bg-[#1A0A06]/70 -translate-y-3 ring-2 ring-[#D1B894]/70 shadow-[0_20px_60px_rgba(209,184,148,0.25)]"
                          : "bg-[#1A0A06]/40 shadow-[0_10px_40px_rgba(0,0,0,0.5)] hover:-translate-y-3 hover:bg-[#1A0A06]/60 hover:shadow-[0_20px_50px_rgba(209,184,148,0.1)] focus-visible:ring-2 focus-visible:ring-[#D1B894]/70",
                    ].join(" ")}
                  >
                    {/* Ripple Effect (Bordes rectos) */}
                    {isLaunching && (
                      <span
                        className="absolute inset-0 rounded-none animate-ping"
                        style={{ backgroundColor: "rgba(209,184,148,0.12)" }}
                      />
                    )}

                    {/* 🗑️ ELIMINADO: Indicador cuadrado de selección 🗑️ */}
                    {/* isSelected && !isLaunching && (
    <span className="absolute top-3 right-3 h-2 w-2 rounded-none bg-[#D1B894] animate-pulse" />
  ) */}

                    {/* Logo Container (Bordes rectos) */}
                    <div className="flex-1 flex items-center justify-center w-full mt-2">
                      <div
                        className={[
                          "flex h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 items-center justify-center overflow-hidden rounded-none bg-white p-2 shadow-inner",
                          "transition-transform duration-500",
                          isLaunching ? "scale-115" : isSelected ? "scale-110" : "group-hover:scale-105",
                        ].join(" ")}
                      >
                        <img src={card.logo} alt={card.logoAlt} className="h-full w-full object-contain" />
                      </div>
                    </div>

                    {/* Textos */}
                    <div className="w-full flex flex-col items-center gap-1 mb-1 text-[#F5EDD8]">
                      <span className="text-lg md:text-[1.1rem] uppercase tracking-widest font-sans leading-tight text-center">
                        Leña<br />Quiteña
                      </span>
                      <span className={[
                        "text-xs uppercase tracking-[0.25em] transition-colors duration-300 mt-1",
                        isSelected ? "text-[#F5EDD8]" : "text-[#D1B894]",
                      ].join(" ")}>
                        {card.zoneName}
                      </span>
                      <span className={[
                        "text-[9px] uppercase tracking-[0.2em] mt-1.5 transition-opacity duration-300",
                        isLaunching
                          ? "text-[#D1B894] opacity-100"
                          : isSelected
                            ? "text-[#D1B894] opacity-100"
                            : "text-[#F5EDD8]/40 opacity-0 group-hover:opacity-100",
                      ].join(" ")}>
                        {isLaunching ? "↓ Cargando..." : isSelected ? "✓ Seleccionado" : "Ver restaurante"}
                      </span>
                    </div>
                  </button>
                </div>
              )
            })}

          </div>

          {selectedRestaurant && (
            <p className="mt-6 text-[#D1B894]/60 text-[10px] uppercase tracking-widest animate-pulse">
              Desplázate para ver el contenido
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

export default HeroContent